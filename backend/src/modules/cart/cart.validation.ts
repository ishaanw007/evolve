import { z } from "zod"

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).optional().default(1),
})

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0),
})

export const mergeCartSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
      }),
    )
    .default([]),
})

export type AddCartItemInput = z.infer<typeof addCartItemSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
export type MergeCartInput = z.infer<typeof mergeCartSchema>
