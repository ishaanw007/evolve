/**
 * Response transformers for mapping Typesense search results
 * to the standardized SearchResponse format.
 */

/**
 * Highlight snippets for matched fields in search results.
 */
export interface SearchHighlight {
  name?: string
  description?: string
  cas_number?: string
}

/**
 * A single search result representing a product hit.
 */
export interface SearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  brand_name: string | null
  cas_number: string | null
  catalog_number: string | null
  price: number
  currency: string
  pack_size: string | null
  image_url: string | null
  product_url: string | null
  stock: number
  highlights: SearchHighlight
}

/**
 * A facet entry with a filter value and its count of matching products.
 */
export interface FacetEntry {
  value: string
  count: number
}

/**
 * Metadata about the search response.
 */
export interface SearchMeta {
  total: number
  page: number
  total_pages: number
  processing_time_ms: number
}

/**
 * The complete search response structure returned by the API.
 */
export interface SearchResponse {
  results: SearchResult[]
  facets: {
    category: FacetEntry[]
    brand: FacetEntry[]
  }
  meta: SearchMeta
}

/**
 * Transforms an array of Typesense hits into SearchResult objects.
 * Missing optional fields are set to null. The `currency` field defaults to "USD".
 */
export function transformHits(hits: any[], page: number, perPage: number): SearchResult[] {
  return hits.map((hit) => {
    const doc = hit.document || {}
    const highlights = extractHighlights(hit.highlights || hit.highlight || [])

    return {
      id: doc.id ?? null,
      name: doc.name ?? null,
      slug: doc.slug ?? null,
      description: doc.description || null,
      category: doc.category || null,
      brand_name: doc.brand_name || null,
      cas_number: doc.cas_number || null,
      catalog_number: doc.catalog_number || null,
      price: doc.price != null ? Number(doc.price) : 0,
      currency: doc.currency || "USD",
      pack_size: doc.pack_size || null,
      image_url: doc.image_url || null,
      product_url: doc.product_url || null,
      stock: doc.stock != null ? Number(doc.stock) : 0,
      highlights,
    }
  })
}

/**
 * Extracts highlight snippets from Typesense highlight data.
 * Supports both array format (from search responses) and object format.
 */
function extractHighlights(highlightData: any): SearchHighlight {
  const result: SearchHighlight = {}

  if (Array.isArray(highlightData)) {
    for (const entry of highlightData) {
      const field = entry.field as string
      const snippet = entry.snippet || entry.value || ""
      if (field === "name" && snippet) {
        result.name = snippet
      } else if (field === "description" && snippet) {
        result.description = snippet
      } else if (field === "cas_number" && snippet) {
        result.cas_number = snippet
      }
    }
  }

  return result
}

/**
 * Transforms Typesense facet_counts into the standardized facets structure.
 * Returns category and brand arrays, each containing value/count pairs.
 */
export function transformFacets(facetCounts: any[]): { category: FacetEntry[]; brand: FacetEntry[] } {
  const result: { category: FacetEntry[]; brand: FacetEntry[] } = {
    category: [],
    brand: [],
  }

  if (!Array.isArray(facetCounts)) {
    return result
  }

  for (const facet of facetCounts) {
    const fieldName = facet.field_name as string
    const counts: FacetEntry[] = (facet.counts || []).map((entry: any) => ({
      value: entry.value as string,
      count: entry.count as number,
    }))

    if (fieldName === "category") {
      result.category = counts
    } else if (fieldName === "brand_name") {
      result.brand = counts
    }
  }

  return result
}

/**
 * Transforms raw Typesense response metadata into the standardized SearchMeta format.
 * - found → total
 * - page is passed through
 * - ceil(found / perPage) → total_pages
 * - searchTimeMs → processing_time_ms
 */
export function transformMeta(
  found: number,
  page: number,
  perPage: number,
  searchTimeMs: number
): SearchMeta {
  return {
    total: found,
    page,
    total_pages: Math.ceil(found / perPage),
    processing_time_ms: searchTimeMs,
  }
}
