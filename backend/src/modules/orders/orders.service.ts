import { prisma } from "../../config/db.js"
import { AppError } from "../../middleware/index.js"
import type {
  CreateOrderInput,
  CreateQuoteInput,
  UpdateOrderStatusInput,
} from "./orders.validation.js"

export async function createQuote(userId: string, input: CreateQuoteInput) {
  const productIds = input.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  })

  if (products.length !== productIds.length) {
    throw new AppError(400, "One or more products not found")
  }

  // Record indicative prices for reference, but do not deduct stock.
  let total = 0
  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!
    total += Number(product.price) * item.quantity
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    }
  })

  const order = await prisma.order.create({
    data: {
      userId,
      status: "pending",
      total,
      items: { create: orderItems },
    },
    include: { items: { include: { product: true } } },
  })

  return order
}

export async function create(userId: string, input: CreateOrderInput) {
  // Fetch all products and validate stock
  const productIds = input.items.map((i) => i.productId)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
  })

  if (products.length !== productIds.length) {
    throw new AppError(400, "One or more products not found")
  }

  // Validate stock and calculate total
  let total = 0
  const orderItems = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!

    if (product.stock < item.quantity) {
      throw new AppError(400, `Insufficient stock for ${product.name}`)
    }

    const lineTotal = Number(product.price) * item.quantity
    total += lineTotal

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    }
  })

  // Create order + deduct stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        total,
        shippingAddress: input.shippingAddress,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    })

    // Deduct stock
    for (const item of input.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    return order
  })

  return order
}

export async function listByUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function listAll() {
  return prisma.order.findMany({
    include: {
      user: { select: { id: true, email: true, name: true } },
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getById(id: string, userId?: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  })

  if (!order) {
    throw new AppError(404, "Order not found")
  }

  if (userId && order.userId !== userId) {
    throw new AppError(403, "Access denied")
  }

  return order
}

export async function updateStatus(id: string, input: UpdateOrderStatusInput) {
  const order = await prisma.order.findUnique({ where: { id } })

  if (!order) {
    throw new AppError(404, "Order not found")
  }

  return prisma.order.update({
    where: { id },
    data: { status: input.status },
  })
}
