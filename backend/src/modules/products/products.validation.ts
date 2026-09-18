import { z } from "zod"

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  casNumber: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0).default(0),
  unit: z.string().default("unit"),
  imageUrl: z.string().url().optional(),
})

export const updateProductSchema = createProductSchema.partial()

export const queryProductsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["name", "price", "createdAt"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type QueryProductsInput = z.infer<typeof queryProductsSchema>
