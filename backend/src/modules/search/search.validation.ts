import { z } from "zod"

export const searchQuerySchema = z
  .object({
    q: z.string().max(256, "Search query must not exceed 256 characters").default(""),
    page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
    per_page: z.coerce
      .number()
      .int()
      .min(1, "Per page must be at least 1")
      .max(100, "Per page must not exceed 100")
      .default(20),
    category: z.string().optional(),
    brand: z.string().optional(),
    min_price: z.coerce.number().min(0.01, "Minimum price must be at least 0.01").optional(),
    max_price: z.coerce
      .number()
      .max(99_999_999.99, "Maximum price must not exceed 99,999,999.99")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.min_price !== undefined && data.max_price !== undefined) {
        return data.min_price <= data.max_price
      }
      return true
    },
    {
      message: "Minimum price must not exceed maximum price",
      path: ["min_price"],
    }
  )

export type SearchQuery = z.infer<typeof searchQuerySchema>
