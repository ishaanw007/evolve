import { Client } from "typesense"
import { prisma } from "../../config/db.js"
import {
  getTypesenseClient,
  PRODUCTS_COLLECTION_NAME,
  type ProductDocument,
} from "./typesense.client.js"

/**
 * Maximum number of retry attempts for sync operations.
 */
const MAX_RETRIES = 3

/**
 * Base delay in milliseconds for exponential backoff.
 * Backoff pattern: 1s → 2s → 4s
 */
const BASE_DELAY_MS = 1000

/**
 * Delays execution for the specified number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Computes the backoff delay for a given attempt (1-indexed).
 * Attempt 1 → 1000ms, Attempt 2 → 2000ms, Attempt 3 → 4000ms
 */
export function getBackoffDelay(attempt: number): number {
  return BASE_DELAY_MS * Math.pow(2, attempt - 1)
}

/**
 * Determines if an error is a Typesense connection/unreachable failure.
 */
function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("Request failed") ||
      error.message.includes("connect EHOSTUNREACH"))
  )
}

/**
 * Transforms a Prisma Product (with brand relation) into a Typesense ProductDocument.
 *
 * Field mapping:
 * - Nullable string fields → empty string when null
 * - price (Prisma Decimal) → Number(price)
 * - brand.name → joined via relation, empty string if no brand
 */
export function mapProductToDocument(
  product: Record<string, unknown> & { brand?: { name: string } | null }
): ProductDocument {
  return {
    id: product.id as string,
    name: product.name as string,
    slug: (product.slug as string | null) ?? "",
    description: (product.description as string | null) ?? "",
    category: (product.category as string | null) ?? "",
    brand_name: product.brand?.name ?? "",
    cas_number: (product.casNumber as string | null) ?? "",
    catalog_number: (product.catalogNumber as string | null) ?? "",
    price: Number(product.price),
    pack_size: (product.packSize as string | null) ?? "",
    stock: product.stock as number,
    image_url: (product.imageUrl as string | null) ?? "",
    product_url: (product.productUrl as string | null) ?? "",
  }
}

/**
 * Executes a Typesense operation with retry logic.
 *
 * Retries up to 3 times with exponential backoff (1s → 2s → 4s)
 * on Typesense connection errors. After all retries are exhausted,
 * logs an error with the product ID and skips the operation without
 * blocking subsequent operations.
 */
async function withRetry(
  operation: (client: Client) => Promise<void>,
  context: { operationName: string; productId: string }
): Promise<void> {
  const client = getTypesenseClient()
  if (!client) {
    console.error(
      `❌ [Sync] Cannot ${context.operationName} product ${context.productId}: Typesense client is not available.`
    )
    return
  }

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await operation(client)
      return
    } catch (error: unknown) {
      if (isConnectionError(error) && attempt < MAX_RETRIES) {
        const backoff = getBackoffDelay(attempt)
        console.warn(
          `⚠️ [Sync] ${context.operationName} failed for product ${context.productId} ` +
            `(attempt ${attempt}/${MAX_RETRIES}). Retrying in ${backoff}ms...`
        )
        await delay(backoff)
        continue
      }

      // Final attempt exhausted or non-connection error — log and skip
      console.error(
        `❌ [Sync] Failed to ${context.operationName} product ${context.productId} ` +
          `after ${attempt} attempt(s): ${error instanceof Error ? error.message : String(error)}`
      )
      return
    }
  }
}

/**
 * Indexes a product into the Typesense collection.
 *
 * Fetches the product from PostgreSQL (including brand relation),
 * transforms it to a ProductDocument, and upserts it into the collection.
 * Used after product creation or reactivation.
 */
export async function indexProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true },
  })

  if (!product) {
    console.error(`❌ [Sync] Cannot index product ${productId}: not found in database.`)
    return
  }

  const document = mapProductToDocument(product)

  await withRetry(
    async (client) => {
      await client
        .collections(PRODUCTS_COLLECTION_NAME)
        .documents()
        .upsert(document)
    },
    { operationName: "index", productId }
  )
}

/**
 * Updates a product document in the Typesense collection.
 *
 * Fetches the latest product data from PostgreSQL (including brand relation),
 * transforms it, and upserts into the collection.
 * Used after product field updates.
 */
export async function updateProduct(productId: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { brand: true },
  })

  if (!product) {
    console.error(`❌ [Sync] Cannot update product ${productId}: not found in database.`)
    return
  }

  const document = mapProductToDocument(product)

  await withRetry(
    async (client) => {
      await client
        .collections(PRODUCTS_COLLECTION_NAME)
        .documents()
        .upsert(document)
    },
    { operationName: "update", productId }
  )
}

/**
 * Removes a product document from the Typesense collection.
 *
 * Deletes the document by its ID. If the document doesn't exist
 * in Typesense (404), the operation is treated as a no-op.
 * Used after product soft-delete.
 */
export async function removeProduct(productId: string): Promise<void> {
  await withRetry(
    async (client) => {
      try {
        await client
          .collections(PRODUCTS_COLLECTION_NAME)
          .documents(productId)
          .delete()
      } catch (error: unknown) {
        // Document not found in Typesense — treat as successful removal
        const isNotFound =
          error instanceof Error &&
          (error.message.includes("Not Found") || error.message.includes("404"))
        if (!isNotFound) {
          throw error
        }
      }
    },
    { operationName: "remove", productId }
  )
}

/**
 * Performs a full re-index of all active products from PostgreSQL into Typesense.
 *
 * Creates a new timestamped collection, bulk-imports all active products,
 * then swaps the alias to the new collection. The existing collection
 * remains available for search during the re-index process.
 */
export async function fullReindex(): Promise<void> {
  const client = getTypesenseClient()
  if (!client) {
    throw new Error("Typesense client is not available. Cannot perform re-index.")
  }

  const timestamp = Date.now()
  const newCollectionName = `${PRODUCTS_COLLECTION_NAME}_${timestamp}`

  // Create a new timestamped collection with the same schema
  await client.collections().create({
    name: newCollectionName,
    fields: [
      { name: "id", type: "string" as const },
      { name: "name", type: "string" as const },
      { name: "slug", type: "string" as const, index: false, optional: true },
      { name: "description", type: "string" as const },
      { name: "category", type: "string" as const, facet: true },
      { name: "brand_name", type: "string" as const, facet: true },
      { name: "cas_number", type: "string" as const },
      { name: "catalog_number", type: "string" as const },
      { name: "price", type: "float" as const },
      { name: "pack_size", type: "string" as const },
      { name: "stock", type: "int32" as const },
      { name: "image_url", type: "string" as const, index: false, optional: true },
      { name: "product_url", type: "string" as const, index: false, optional: true },
    ],
    default_sorting_field: "stock",
  })

  // Fetch all active products from PostgreSQL in batches and import
  const BATCH_SIZE = 1000
  let skip = 0
  let totalImported = 0

  while (true) {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { brand: true },
      skip,
      take: BATCH_SIZE,
      orderBy: { createdAt: "asc" },
    })

    if (products.length === 0) break

    const documents = products.map(mapProductToDocument)

    await client
      .collections(newCollectionName)
      .documents()
      .import(documents, { action: "upsert" })

    totalImported += documents.length
    skip += BATCH_SIZE
    console.log(`📦 Imported ${totalImported} documents so far...`)
  }

  // Swap the alias to point to the new collection.
  // First, check if a real collection named "products" exists (not an alias).
  // If so, delete it because an alias cannot share a name with a collection.
  let oldCollectionName: string | null = null
  try {
    const alias = await client.aliases(PRODUCTS_COLLECTION_NAME).retrieve()
    oldCollectionName = alias.collection_name
  } catch (error: unknown) {
    // Alias doesn't exist — check if a real collection with that name exists
    const isNotFound =
      error instanceof Error &&
      (error.message.includes("Not Found") || error.message.includes("404"))
    if (isNotFound) {
      // Check if there's a real collection named "products" blocking the alias
      try {
        await client.collections(PRODUCTS_COLLECTION_NAME).retrieve()
        // Real collection exists — delete it to make room for the alias
        console.log(`🗑️ Deleting existing collection "${PRODUCTS_COLLECTION_NAME}" to switch to alias-based management.`)
        await client.collections(PRODUCTS_COLLECTION_NAME).delete()
      } catch {
        // Collection doesn't exist either — that's fine, first-time setup
      }
    }
  }

  try {
    await client.aliases().upsert(PRODUCTS_COLLECTION_NAME, {
      collection_name: newCollectionName,
    })
  } catch (aliasError) {
    // If alias upsert fails, clean up the new collection
    await client.collections(newCollectionName).delete()
    throw new Error(`Failed to swap alias during re-index: ${aliasError instanceof Error ? aliasError.message : String(aliasError)}`)
  }

  // Delete the old collection the alias previously pointed to
  if (oldCollectionName && oldCollectionName !== newCollectionName) {
    try {
      await client.collections(oldCollectionName).delete()
      console.log(`🗑️ Deleted old collection: ${oldCollectionName}`)
    } catch {
      // Non-critical — old collection cleanup failure
    }
  }

  console.log(
    `✅ Full re-index completed. New collection: ${newCollectionName} (${totalImported} documents)`
  )
}
