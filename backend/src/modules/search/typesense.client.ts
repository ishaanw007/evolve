import { Client } from "typesense"
import { CollectionCreateSchema } from "typesense/lib/Typesense/Collections.js"
import { typesenseEnv, isTypesenseConfigured } from "../../config/env.js"

/**
 * Configuration interface for Typesense connection.
 */
export interface TypesenseConfig {
  host: string
  port: number
  protocol: "http" | "https"
  apiKey: string
}

/**
 * Product document shape stored in the Typesense collection.
 */
export interface ProductDocument {
  id: string
  name: string
  slug: string
  description: string
  category: string
  brand_name: string
  cas_number: string
  catalog_number: string
  price: number
  pack_size: string
  stock: number
  image_url: string
  product_url: string
}

/** Singleton Typesense client instance (lazy-initialized). */
let clientInstance: Client | null = null

/**
 * Returns the Typesense client singleton, creating it on first call.
 * Reads connection config from validated environment variables.
 *
 * If Typesense is not configured (env vars missing/invalid), returns null
 * and logs a warning.
 *
 * On connection loss, the client logs a warning and will attempt to
 * reconnect on the next request (Typesense JS client handles reconnection
 * transparently; we ensure fresh config is applied).
 */
export function getTypesenseClient(): Client | null {
  if (!isTypesenseConfigured || !typesenseEnv) {
    console.warn("⚠️ Typesense is not configured. Search module is unavailable.")
    return null
  }

  if (clientInstance) {
    return clientInstance
  }

  const config: TypesenseConfig = {
    host: typesenseEnv.TYPESENSE_HOST,
    port: typesenseEnv.TYPESENSE_PORT,
    protocol: typesenseEnv.TYPESENSE_PROTOCOL,
    apiKey: typesenseEnv.TYPESENSE_API_KEY,
  }

  clientInstance = new Client({
    nodes: [
      {
        host: config.host,
        port: config.port,
        protocol: config.protocol,
      },
    ],
    apiKey: config.apiKey,
    connectionTimeoutSeconds: 3,
    retryIntervalSeconds: 1,
    healthcheckIntervalSeconds: 15,
    logLevel: "warn",
  })

  return clientInstance
}

/**
 * Resets the client singleton (useful for testing or forced reconnection).
 * On the next call to getTypesenseClient(), a fresh client will be created.
 */
export function resetTypesenseClient(): void {
  clientInstance = null
}

/**
 * Wraps a Typesense operation with connection-loss handling.
 * If the operation fails due to a connection error, logs a warning
 * and resets the client so the next request attempts a fresh connection.
 */
export async function withConnectionHandling<T>(
  operation: (client: Client) => Promise<T>
): Promise<T> {
  const client = getTypesenseClient()
  if (!client) {
    throw new Error("Typesense client is not available. Search module is not configured.")
  }

  try {
    return await operation(client)
  } catch (error: unknown) {
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") ||
        error.message.includes("ECONNRESET") ||
        error.message.includes("ETIMEDOUT") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("Request failed") ||
        error.message.includes("connect EHOSTUNREACH"))

    if (isConnectionError) {
      console.warn(
        "⚠️ Typesense connection lost. Will attempt reconnect on next request.",
        (error as Error).message
      )
      resetTypesenseClient()
    }

    throw error
  }
}

/**
 * Collection name for products in Typesense.
 */
export const PRODUCTS_COLLECTION_NAME = "products"

/**
 * Typesense collection schema for the products collection.
 */
export const productsCollectionSchema: CollectionCreateSchema = {
  name: PRODUCTS_COLLECTION_NAME,
  fields: [
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "slug", type: "string", index: false, optional: true },
    { name: "description", type: "string" },
    { name: "category", type: "string", facet: true },
    { name: "brand_name", type: "string", facet: true },
    { name: "cas_number", type: "string" },
    { name: "catalog_number", type: "string" },
    { name: "price", type: "float" },
    { name: "pack_size", type: "string" },
    { name: "stock", type: "int32" },
    { name: "image_url", type: "string", index: false, optional: true },
    { name: "product_url", type: "string", index: false, optional: true },
  ],
  default_sorting_field: "stock",
}

/**
 * Helper to determine if an error is a connection-related failure.
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
 * Delays execution for the specified number of milliseconds.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Ensures the products collection exists in Typesense.
 *
 * - If the collection already exists, logs an informational message and skips creation.
 * - If the collection doesn't exist, creates it using the defined schema.
 * - On connection failure, retries up to 3 times with a 2-second fixed delay between attempts.
 * - If all retries are exhausted, logs an error and marks initialization as failed.
 */
export async function ensureCollection(): Promise<void> {
  const client = getTypesenseClient()
  if (!client) {
    console.error("❌ Cannot ensure collection: Typesense client is not available.")
    return
  }

  const maxRetries = 3
  const retryDelayMs = 2000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Check if the collection already exists
      await client.collections(PRODUCTS_COLLECTION_NAME).retrieve()
      console.log(
        `ℹ️ Typesense collection "${PRODUCTS_COLLECTION_NAME}" already exists. Skipping creation.`
      )
      return
    } catch (error: unknown) {
      // 404 means collection doesn't exist — proceed to create it
      const isNotFound =
        error instanceof Error &&
        (error.message.includes("Not Found") || error.message.includes("404"))

      if (isNotFound) {
        try {
          await client.collections().create(productsCollectionSchema)
          console.log(`✅ Typesense collection "${PRODUCTS_COLLECTION_NAME}" created successfully.`)
          return
        } catch (createError: unknown) {
          if (isConnectionError(createError)) {
            console.error(
              `❌ Connection failure during collection creation (attempt ${attempt}/${maxRetries}):`,
              (createError as Error).message
            )
            if (attempt < maxRetries) {
              await delay(retryDelayMs)
              continue
            }
            console.error(
              `❌ Failed to create Typesense collection "${PRODUCTS_COLLECTION_NAME}" after ${maxRetries} attempts. Initialization failed.`
            )
            return
          }
          // Non-connection error during creation (e.g., schema conflict)
          throw createError
        }
      }

      // Connection error when trying to retrieve the collection
      if (isConnectionError(error)) {
        console.error(
          `❌ Connection failure while checking collection (attempt ${attempt}/${maxRetries}):`,
          (error as Error).message
        )
        if (attempt < maxRetries) {
          await delay(retryDelayMs)
          continue
        }
        console.error(
          `❌ Failed to ensure Typesense collection "${PRODUCTS_COLLECTION_NAME}" after ${maxRetries} attempts. Initialization failed.`
        )
        return
      }

      // Unknown error
      throw error
    }
  }
}
