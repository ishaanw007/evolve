import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"

interface SearchResult {
  id: string
  name: string
  slug: string
  description: string | null
  category: string | null
  brand_name: string | null
  price: number
  currency: string
  pack_size: string | null
  image_url: string | null
  stock: number
  highlights: {
    name?: string
    description?: string
    cas_number?: string
  }
}

interface FacetEntry {
  value: string
  count: number
}

interface SearchResponse {
  results: SearchResult[]
  facets: {
    category: FacetEntry[]
    brand: FacetEntry[]
  }
  meta: {
    total: number
    page: number
    total_pages: number
    processing_time_ms: number
  }
}

interface SearchBarProps {
  onNavigate?: (slug: string) => void
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"

export default function SearchBar({ onNavigate }: SearchBarProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ q, per_page: "8" })
      const res = await fetch(`${API_URL}/search?${params}`)
      if (!res.ok) throw new Error("Search failed")
      const data: SearchResponse = await res.json()
      setResults(data.results)
      setShowDropdown(data.results.length > 0)
    } catch {
      setResults([])
      setShowDropdown(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      search(query)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query, search])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(result: SearchResult) {
    setShowDropdown(false)
    setQuery("")
    if (onNavigate) {
      onNavigate(result.slug)
    } else {
      navigate(`/products/${result.slug}`)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search chemicals by name, CAS number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          className="w-full"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ul className="max-h-80 overflow-y-auto py-1">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-accent"
                  onClick={() => handleSelect(result)}
                >
                  <span className="text-sm font-medium">{result.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {[result.brand_name, result.category]
                      .filter(Boolean)
                      .join(" · ")}
                    {result.price != null && ` · $${result.price.toFixed(2)}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
