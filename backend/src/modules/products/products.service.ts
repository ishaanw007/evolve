import { prisma } from "../../config/db.js"
import { AppError } from "../../middleware/index.js"
import {
  indexProduct,
  updateProduct as syncUpdateProduct,
  removeProduct as syncRemoveProduct,
} from "../search/sync.service.js"
import type {
  CreateProductInput,
  UpdateProductInput,
  QueryProductsInput,
} from "./products.validation.js"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function list(query: QueryProductsInput) {
  const { page, limit, search, category, brand, minPrice, maxPrice, sort, order } = query
  const skip = (page - 1) * limit

  const where = {
    isActive: true,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { casNumber: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(category && { category }),
    ...(brand && { brand: { name: brand } }),
    ...((minPrice !== undefined || maxPrice !== undefined) && {
      price: {
        ...(minPrice !== undefined && { gte: minPrice }),
        ...(maxPrice !== undefined && { lte: maxPrice }),
      },
    }),
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug }, include: { brand: true } })

  if (!product) {
    throw new AppError(404, "Product not found")
  }

  return product
}

export async function getById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } })

  if (!product) {
    throw new AppError(404, "Product not found")
  }

  return product
}

export async function create(input: CreateProductInput) {
  const slug = slugify(input.name)

  const existing = await prisma.product.findUnique({ where: { slug } })
  if (existing) {
    throw new AppError(409, "A product with this name already exists")
  }

  const { brand: brandName, ...productData } = input
  const product = await prisma.product.create({
    data: {
      ...productData,
      slug,
      ...(brandName && { brand: { connect: { name: brandName } } }),
    },
    include: { brand: true },
  })

  indexProduct(product.id).catch(() => {})

  return product
}

export async function update(id: string, input: UpdateProductInput) {
  await getById(id)

  const { brand: brandName, ...restInput } = input
  const data: Record<string, unknown> = { ...restInput }
  if (input.name) {
    data.slug = slugify(input.name)
  }
  if (brandName !== undefined) {
    data.brand = { connect: { name: brandName } }
  }

  const product = await prisma.product.update({
    where: { id },
    data,
    include: { brand: true },
  })

  if ((input as Record<string, unknown>).isActive === false) {
    // Soft-delete via update
    syncRemoveProduct(id).catch(() => {})
  } else if ((input as Record<string, unknown>).isActive === true) {
    // Reactivation
    indexProduct(product.id).catch(() => {})
  } else {
    syncUpdateProduct(product.id).catch(() => {})
  }

  return product
}

export async function remove(id: string) {
  await getById(id)

  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  })

  syncRemoveProduct(id).catch(() => {})

  return product
}
