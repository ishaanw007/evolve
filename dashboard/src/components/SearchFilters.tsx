import { useState } from "react"
import { cn } from "@/lib/utils"

export interface SearchFilters {
  category?: string
  brand?: string
  min_price?: number
  max_price?: number
}

interface FacetEntry {
  value: string
  count: number
}

interface SearchFiltersProps {
  facets: {
    category: FacetEntry[]
    brand: FacetEntry[]
  }
  filters: SearchFilters
  onFilterChange: (filters: SearchFilters) => void
}

export function SearchFiltersPanel({
  facets,
  filters,
  onFilterChange,
}: SearchFiltersProps) {
  const [minPrice, setMinPrice] = useState<string>(
    filters.min_price?.toString() ?? ""
  )
  const [maxPrice, setMaxPrice] = useState<string>(
    filters.max_price?.toString() ?? ""
  )

  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.brand ? 1 : 0) +
    (filters.min_price !== undefined ? 1 : 0) +
    (filters.max_price !== undefined ? 1 : 0)

  function handleCategoryClick(value: string) {
    onFilterChange({
      ...filters,
      category: filters.category === value ? undefined : value,
    })
  }

  function handleBrandClick(value: string) {
    onFilterChange({
      ...filters,
      brand: filters.brand === value ? undefined : value,
    })
  }

  function handlePriceApply() {
    const min = minPrice ? parseFloat(minPrice) : undefined
    const max = maxPrice ? parseFloat(maxPrice) : undefined

    onFilterChange({
      ...filters,
      min_price: min && !isNaN(min) ? min : undefined,
      max_price: max && !isNaN(max) ? max : undefined,
    })
  }

  function handleClearAll() {
    setMinPrice("")
    setMaxPrice("")
    onFilterChange({})
  }

  function handleClearFilter(key: keyof SearchFilters) {
    const updated = { ...filters }
    delete updated[key]

    if (key === "min_price") setMinPrice("")
    if (key === "max_price") setMaxPrice("")

    onFilterChange(updated)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Active Filters */}
      {activeFilterCount > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Active Filters
            </span>
            <button
              onClick={handleClearAll}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {filters.category && (
              <FilterTag
                label={`Category: ${filters.category}`}
                onClear={() => handleClearFilter("category")}
              />
            )}
            {filters.brand && (
              <FilterTag
                label={`Brand: ${filters.brand}`}
                onClear={() => handleClearFilter("brand")}
              />
            )}
            {filters.min_price !== undefined && (
              <FilterTag
                label={`Min: $${filters.min_price}`}
                onClear={() => handleClearFilter("min_price")}
              />
            )}
            {filters.max_price !== undefined && (
              <FilterTag
                label={`Max: $${filters.max_price}`}
                onClear={() => handleClearFilter("max_price")}
              />
            )}
          </div>
        </div>
      )}

      {/* Category Facet */}
      {facets.category.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Category
          </span>
          <ul className="flex flex-col gap-0.5">
            {facets.category.map((facet) => (
              <li key={facet.value}>
                <button
                  onClick={() => handleCategoryClick(facet.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                    filters.category === facet.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="truncate">{facet.value}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {facet.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brand Facet */}
      {facets.brand.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Brand
          </span>
          <ul className="flex flex-col gap-0.5">
            {facets.brand.map((facet) => (
              <li key={facet.value}>
                <button
                  onClick={() => handleBrandClick(facet.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
                    filters.brand === facet.value
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <span className="truncate">{facet.value}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {facet.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price Range */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Price Range
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            min={0.01}
            step={0.01}
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePriceApply()}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            min={0.01}
            step={0.01}
          />
        </div>
        <button
          onClick={handlePriceApply}
          className="h-7 w-full rounded-lg bg-primary text-primary-foreground text-xs font-medium transition-colors hover:bg-primary/80"
        >
          Apply Price
        </button>
      </div>
    </div>
  )
}

function FilterTag({
  label,
  onClear,
}: {
  label: string
  onClear: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-foreground">
      <span className="truncate max-w-[150px]">{label}</span>
      <button
        onClick={onClear}
        className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        ×
      </button>
    </span>
  )
}
