import {
  getTypesenseClient,
  PRODUCTS_COLLECTION_NAME,
  type ProductDocument,
} from "./typesense.client.js"
import { buildFilterString } from "./filter.builder.js"
import type { SearchQuery } from "./search.validation.js"

/**
 * Search fields that Typesense will search across for product queries.
 * Covers name, description, cas_number, catalog_number, and brand_name
 * as specified in Requirement 3.3.
 */
const SEARCH_FIELDS = "name,description,cas_number,catalog_number,brand_name"

/**
 * Facet fields requested in every search query.
 * Returns counts for category and brand_name (Requirement 4.1).
 */
const FACET_FIELDS = "category,brand_name"

/**
 * Maximum time in milliseconds to wait for a Typesense response.
 * If exceeded, we throw SearchUnavailableError (Requirement 3.6).
 */
const SEARCH_TIMEOUT_MS = 3000

/**
 * Number of allowed typos for typo-tolerant search (Requirement 3.2).
 */
const NUM_TYPOS = 2

/**
 * Custom error class indicating Typesense is unreachable.
 * The controller layer should catch this and respond with 503.
 */
export class SearchUnavailableError extends Error {
  constructor(message = "Search is temporarily unavailable") {
    super(message)
    this.name = "SearchUnavailableError"
  }
}

/**
 * Determines if an error indicates that Typesense is unreachable.
 */
function isConnectionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("ECONNREFUSED") ||
      error.message.includes("ECONNRESET") ||
      error.message.includes("ETIMEDOUT") ||
      error.message.includes("ENOTFOUND") ||
      error.message.includes("Request failed") ||
      error.message.includes("connect EHOSTUNREACH"))
  )
}

/**
 * Searches products in Typesense based on validated search parameters.
 *
 * Behavior:
 * - If `q` is empty or whitespace-only, returns all products sorted by
 *   stock descending (uses wildcard query with default sort).
 * - Otherwise, performs a full-text search across name, description,
 *   cas_number, catalog_number, and brand_name with typo tolerance (2 typos).
 * - Applies category, brand, and price filters via filter_by string.
 * - Requests facet counts for category and brand_name.
 * - Times out after 3 seconds; throws SearchUnavailableError if Typesense
 *   is unreachable.
 *
 * @param params - Validated SearchQuery parameters
 * @returns Raw Typesense search response
 * @throws SearchUnavailableError if Typesense is not configured or unreachable
 */
export async function searchProducts(params: SearchQuery) {
  const client = getTypesenseClient()
  if (!client) {
    throw new SearchUnavailableError()
  }

  const isEmptyQuery = !params.q || params.q.trim().length === 0

  // Build filter string from category, brand, and price params
  const filterBy = buildFilterString({
    category: params.category,
    brand: params.brand,
    min_price: params.min_price,
    max_price: params.max_price,
  })

  // Construct the search parameters
  const searchParameters: {
    q: string
    query_by: string
    facet_by: string
    page: number
    per_page: number
    num_typos: number
    sort_by?: string
    filter_by?: string
  } = {
    q: isEmptyQuery ? "*" : params.q,
    query_by: SEARCH_FIELDS,
    facet_by: FACET_FIELDS,
    page: params.page,
    per_page: params.per_page,
    num_typos: NUM_TYPOS,
  }

  // For empty queries, sort by stock descending (default sorting field).
  // Typesense uses default_sorting_field for wildcard queries automatically.
  if (isEmptyQuery) {
    searchParameters.sort_by = "stock:desc"
  }

  // Apply filters if any are provided
  if (filterBy) {
    searchParameters.filter_by = filterBy
  }

  try {
    const result = await client
      .collections<ProductDocument>(PRODUCTS_COLLECTION_NAME)
      .documents()
      .search(searchParameters, {
        abortSignal: AbortSignal.timeout(SEARCH_TIMEOUT_MS),
      })

    return result
  } catch (error: unknown) {
    if (isConnectionError(error)) {
      throw new SearchUnavailableError()
    }

    // Timeout errors (from AbortSignal.timeout)
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" ||
        error.name === "AbortError" ||
        error.message.includes("timed out") ||
        error.message.includes("aborted"))
    ) {
      throw new SearchUnavailableError()
    }

    throw error
  }
}
