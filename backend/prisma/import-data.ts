import { PrismaClient } from "@prisma/client"
import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const prisma = new PrismaClient()

const MIGRATION_DIR = join(import.meta.dirname, "../../migration-data")
const BRANDS_FILE = join(MIGRATION_DIR, "brands/brands.json")
const BATCH_SIZE = 500

function slugify(text: string): string {
  if (!text) return ""
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

function parsePrice(priceStr: string | undefined | null): { amount: number; currency: string } {
  if (!priceStr || priceStr.trim() === "") return { amount: 0, currency: "INR" }

  if (priceStr.toLowerCase().includes("por")) {
    return { amount: 0, currency: "INR" }
  }

  let currency = "INR"
  if (priceStr.includes("$")) currency = "USD"
  else if (priceStr.includes("₹")) currency = "INR"
  else if (priceStr.includes("€")) currency = "EUR"

  const cleaned = priceStr.replace(/[^0-9.]/g, "")
  const num = parseFloat(cleaned)
  return { amount: isNaN(num) ? 0 : num, currency }
}

async function importBrands(): Promise<Map<string, string>> {
  console.log("📦 Importing brands...")

  const raw = JSON.parse(readFileSync(BRANDS_FILE, "utf-8"))
  const brands: { name: string; slug?: string; description?: string; logo_url?: string; founded?: string; headquarters?: string; tagline?: string; is_partner?: boolean; is_featured?: boolean }[] = raw.brands

  const brandMap = new Map<string, string>() // name -> id

  for (const b of brands) {
    const slug = b.slug || slugify(b.name)

    // Skip brands with base64 logos (too large), store null instead
    let logoUrl = b.logo_url || null
    if (logoUrl && logoUrl.startsWith("data:")) {
      logoUrl = null
    }

    const brand = await prisma.brand.upsert({
      where: { name: b.name },
      update: {},
      create: {
        name: b.name,
        slug,
        description: b.description || null,
        logoUrl,
        founded: b.founded || null,
        headquarters: b.headquarters || null,
        tagline: b.tagline || null,
        isPartner: b.is_partner ?? false,
        isFeatured: b.is_featured ?? false,
      },
    })

    brandMap.set(b.name.toLowerCase(), brand.id)
    brandMap.set(slug, brand.id)
  }

  console.log(`   ✅ ${brandMap.size / 2} brands imported`)
  return brandMap
}

async function importProducts(brandMap: Map<string, string>) {
  console.log("📦 Importing products...")

  const files = readdirSync(MIGRATION_DIR).filter(
    (f) => f.endsWith(".json") && f !== "error.html"
  )

  let totalImported = 0
  let totalSkipped = 0

  for (const file of files) {
    const filePath = join(MIGRATION_DIR, file)
    let raw: { products?: unknown[] }

    try {
      raw = JSON.parse(readFileSync(filePath, "utf-8"))
    } catch {
      console.log(`   ⚠️  Skipping ${file} (invalid JSON)`)
      continue
    }

    if (!raw.products || !Array.isArray(raw.products)) {
      continue
    }

    const products = raw.products as {
      id?: string
      name: string
      brand?: string
      catalog_number?: string
      cas_number?: string
      category?: string
      pack_size?: string
      price?: string
      currency?: string
      short_description?: string
      product_url?: string
      image_url?: string
      is_partner?: boolean
    }[]

    console.log(`   📄 ${file}: ${products.length} products`)

    // Process in batches
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE)

      // Resolve brand IDs for this batch (create missing brands)
      const data = []
      for (const p of batch) {
        // Skip products without a name
        if (!p.name) continue

        const brandName = p.brand?.trim() || ""
        let brandId: string | null = null

        if (brandName) {
          const key = brandName.toLowerCase()
          brandId = brandMap.get(key) || brandMap.get(slugify(key)) || null

          // If brand not found, create it
          if (!brandId) {
            const slug = slugify(brandName)
            const newBrand = await prisma.brand.upsert({
              where: { slug },
              update: {},
              create: { name: brandName, slug },
            })
            brandId = newBrand.id
            brandMap.set(key, brandId)
            brandMap.set(slug, brandId)
          }
        }

        const baseSlug = slugify(p.name)
        const slug = p.catalog_number
          ? `${baseSlug}-${slugify(p.catalog_number)}`
          : `${baseSlug}-${(p.id || Math.random().toString(36).slice(2, 8)).slice(0, 8)}`

        const { amount, currency } = parsePrice(p.price)

        data.push({
          name: p.name,
          slug: slug.slice(0, 500),
          description: p.short_description || null,
          catalogNumber: p.catalog_number || null,
          casNumber: p.cas_number || null,
          category: p.category || null,
          packSize: p.pack_size || null,
          price: amount,
          currency,
          imageUrl: p.image_url || null,
          productUrl: p.product_url || null,
          isPartner: p.is_partner ?? false,
          brandId,
        })
      }

      try {
        const result = await prisma.product.createMany({
          data,
          skipDuplicates: true,
        })
        totalImported += result.count
        totalSkipped += batch.length - result.count
      } catch (err) {
        console.error(`   ❌ Error in batch ${i}-${i + BATCH_SIZE} of ${file}:`, (err as Error).message)
        totalSkipped += batch.length
      }
    }
  }

  console.log(`\n✅ Import complete: ${totalImported} products imported, ${totalSkipped} skipped (duplicates/errors)`)
}

async function main() {
  console.log("🚀 Starting data import...\n")

  const brandMap = await importBrands()
  await importProducts(brandMap)

  console.log("\n🎉 Done!")
}

main()
  .catch((e) => {
    console.error("❌ Import failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
