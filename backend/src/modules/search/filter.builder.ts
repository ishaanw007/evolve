export interface FilterParams {
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
}

/**
 * Builds a Typesense `filter_by` string from the given filter parameters.
 * - Exact match for category: `category:=value`
 * - Exact match for brand: `brand_name:=value`
 * - Numeric range for price: `price:>=min && price:<=max`
 * - Multiple filters joined with ` && ` (AND logic)
 * Returns empty string if no filters are provided.
 */
export function buildFilterString(params: FilterParams): string {
  const clauses: string[] = []

  if (params.category) {
    clauses.push(`category:=${params.category}`)
  }

  if (params.brand) {
    clauses.push(`brand_name:=${params.brand}`)
  }

  if (params.min_price !== undefined && params.max_price !== undefined) {
    clauses.push(`price:>=${params.min_price} && price:<=${params.max_price}`)
  } else if (params.min_price !== undefined) {
    clauses.push(`price:>=${params.min_price}`)
  } else if (params.max_price !== undefined) {
    clauses.push(`price:<=${params.max_price}`)
  }

  return clauses.join(" && ")
}
