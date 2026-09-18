import { z } from "zod"

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().min(1),
    })
  ).min(1, "At least one item is required"),
  shippingAddress: z.object({
    name: z.string().min(1),
    address: z.string().min(1),
    city: z.string().min(1),
    state: z.string().min(1),
    pincode: z.string().min(1),
    phone: z.string().min(10),
  }),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(["confirmed", "shipped", "delivered", "cancelled"]),
})

// Quote requests only need the list of items. No shipping address, no stock deduction.
export const createQuoteSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "At least one item is required"),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
