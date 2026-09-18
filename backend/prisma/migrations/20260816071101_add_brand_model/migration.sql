/*
  Warnings:

  - You are about to drop the column `brand` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX IF EXISTS "products_brand_idx";

-- AlterTable
ALTER TABLE "products" DROP COLUMN IF EXISTS "brand";
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_id" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "catalog_number" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "is_partner" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "pack_size" TEXT;
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_url" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "logo_url" TEXT,
    "founded" TEXT,
    "headquarters" TEXT,
    "tagline" TEXT,
    "is_partner" BOOLEAN NOT NULL DEFAULT false,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "brands_slug_idx" ON "brands"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "brands_is_partner_idx" ON "brands"("is_partner");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_brand_id_idx" ON "products"("brand_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "products_catalog_number_idx" ON "products"("catalog_number");

-- AddForeignKey (skip if already present)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_brand_id_fkey'
  ) THEN
    ALTER TABLE "products"
      ADD CONSTRAINT "products_brand_id_fkey"
      FOREIGN KEY ("brand_id") REFERENCES "brands"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
