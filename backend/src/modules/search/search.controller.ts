import type { Request, Response, NextFunction } from "express"
import { searchProducts, SearchUnavailableError } from "./search.service.js"
import { searchQuerySchema } from "./search.validation.js"
import { transformHits, transformFacets, transformMeta } from "./transformers.js"
import { fullReindex } from "./sync.service.js"

/**
 * Handles product search requests.
 *
 * Validates query parameters, executes the search against Typesense,
 * transforms the raw response into the standardized SearchResponse format,
 * and returns it with 200 status.
 *
 * Error responses:
 * - 400: Validation errors (invalid params, price min > max, query too long)
 * - 503: Typesense is unreachable
 */
export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Validate query parameters
    const parseResult = searchQuerySchema.safeParse(req.query)

    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }))

      res.status(400).json({
        message: "Invalid search parameters",
        errors,
      })
      return
    }

    const params = parseResult.data

    // Execute search
    const rawResponse = await searchProducts(params)

    // Handle empty/null response
    if (!rawResponse || !rawResponse.hits) {
      res.status(200).json({
        results: [],
        facets: { category: [], brand: [] },
        meta: {
          total: 0,
          page: params.page,
          total_pages: 0,
          processing_time_ms: rawResponse?.search_time_ms ?? 0,
        },
      })
      return
    }

    // Transform the response
    const results = transformHits(rawResponse.hits, params.page, params.per_page)
    const facets = transformFacets(rawResponse.facet_counts || [])
    const meta = transformMeta(
      rawResponse.found ?? 0,
      params.page,
      params.per_page,
      rawResponse.search_time_ms ?? 0
    )

    res.status(200).json({ results, facets, meta })
  } catch (error: unknown) {
    if (error instanceof SearchUnavailableError) {
      res.status(503).json({ message: error.message })
      return
    }

    next(error)
  }
}

/**
 * Handles full re-index requests.
 *
 * Triggers a full re-index of all active products from PostgreSQL
 * into a new Typesense collection, then swaps the alias.
 * Returns 200 on success, passes errors to the error handler.
 */
export async function reindex(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await fullReindex()
    res.status(200).json({ message: "Re-index completed successfully" })
  } catch (error: unknown) {
    next(error)
  }
}
