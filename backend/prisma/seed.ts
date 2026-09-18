import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

async function main() {
  // Bootstrap admin only — does not seed products/catalog data.
  const passwordHash = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@evolve.com" },
    update: {},
    create: {
      email: "admin@evolve.com",
      passwordHash,
      name: "Admin",
      role: "admin",
    },
  })

  await prisma.cart.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  })

  console.log("✅ Seed complete (admin + cart only)")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
