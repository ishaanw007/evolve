import { prisma } from "../../config/db.js"
import { AppError } from "../../middleware/index.js"
import type { AddCartItemInput, MergeCartInput, UpdateCartItemInput } from "./cart.validation.js"

const cartInclude = {
  items: {
    include: {
      product: {
        include: { brand: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "asc" as const },
  },
}

export function serializeCart(cart: {
  id: string
  userId: string
  items: Array<{
    id: string
    quantity: number
    productId: string
    product: {
      id: string
      name: string
      slug: string
      catalogNumber: string | null
      packSize: string | null
      price: unknown
      currency: string
      imageUrl: string | null
      isActive: boolean
      brand: { name: string } | null
    }
  }>
}) {
  return {
    id: cart.id,
    userId: cart.userId,
    items: cart.items.map((item) => ({
      id: item.product.id,
      cartItemId: item.id,
      slug: item.product.slug,
      name: item.product.name,
      brand: item.product.brand?.name ?? null,
      catalogNumber: item.product.catalogNumber,
      packSize: item.product.packSize,
      price: Number(item.product.price),
      currency: item.product.currency,
      imageUrl: item.product.imageUrl,
      quantity: item.quantity,
      isActive: item.product.isActive,
    })),
  }
}

/** Ensure the user has a cart; create one if missing. */
export async function ensureCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId } })
  if (existing) return existing

  return prisma.cart.create({
    data: { userId },
  })
}

export async function getCart(userId: string) {
  await ensureCart(userId)

  const cart = await prisma.cart.findUniqueOrThrow({
    where: { userId },
    include: cartInclude,
  })

  return serializeCart(cart)
}

export async function addItem(userId: string, input: AddCartItemInput) {
  const product = await prisma.product.findFirst({
    where: { id: input.productId, isActive: true },
  })

  if (!product) {
    throw new AppError(404, "Product not found")
  }

  const cart = await ensureCart(userId)

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: input.productId,
      },
    },
    create: {
      cartId: cart.id,
      productId: input.productId,
      quantity: input.quantity,
    },
    update: {
      quantity: { increment: input.quantity },
    },
  })

  return getCart(userId)
}

export async function updateItem(userId: string, productId: string, input: UpdateCartItemInput) {
  const cart = await ensureCart(userId)

  if (input.quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    })
    return getCart(userId)
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  })

  if (!existing) {
    throw new AppError(404, "Cart item not found")
  }

  await prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: input.quantity },
  })

  return getCart(userId)
}

export async function removeItem(userId: string, productId: string) {
  const cart = await ensureCart(userId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  })

  return getCart(userId)
}

export async function clearCart(userId: string) {
  const cart = await ensureCart(userId)

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  })

  return getCart(userId)
}

/** Merge guest/local items into the user's cart (sum quantities). */
export async function mergeCart(userId: string, input: MergeCartInput) {
  const cart = await ensureCart(userId)

  for (const item of input.items) {
    const product = await prisma.product.findFirst({
      where: { id: item.productId, isActive: true },
    })
    if (!product) continue

    await prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: item.productId,
        },
      },
      create: {
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      },
      update: {
        quantity: { increment: item.quantity },
      },
    })
  }

  return getCart(userId)
}
