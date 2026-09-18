import { useState, useEffect, useCallback, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Loader2, FlaskConical, X, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL =
  (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

interface SearchResult {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  brand_name: string | null;
  cas_number: string | null;
  catalog_number: string | null;
  price: number;
  currency: string;
  pack_size: string | null;
  image_url: string | null;
  product_url: string | null;
  stock: number;
}

interface FacetEntry {
  value: string;
  count: number;
}

interface SearchResponse {
  results: SearchResult[];
  facets: { category: FacetEntry[]; brand: FacetEntry[] };
  meta: { total: number; page: number; total_pages: number; processing_time_ms: number };
}

const title = "Products | Laboratory Chemicals & Reagents — Evolve Life Sciences";
const description =
  "Search thousands of laboratory chemicals, reagents, antibodies, and instruments from top manufacturers.";

export const Route = createFileRoute("/products/")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = search["q"];
    return { q: typeof raw === "string" && raw ? raw : undefined };
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
  component: Products,
});

function Products() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [term, setTerm] = useState(q ?? "");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string | undefined>();
  const [activeBrand, setActiveBrand] = useState<string | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(
    async (query: string, pageNum: number, category?: string, brand?: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query || "",
          page: String(pageNum),
          per_page: "20",
        });
        if (category) params.set("category", category);
        if (brand) params.set("brand", brand);

        const res = await fetch(`${API_URL}/search?${params}`);
        if (!res.ok) {
          setData(null);
          return;
        }
        const json: SearchResponse = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchResults(q ?? "", page, activeCategory, activeBrand);
  }, [q, page, activeCategory, activeBrand, fetchResults]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveCategory(undefined);
    setActiveBrand(undefined);
    navigate({ to: "/products", search: { q: term.trim() || undefined } });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setActiveCategory(undefined);
      setActiveBrand(undefined);
      navigate({ to: "/products", search: { q: value.trim() || undefined } });
    }, 500);
  };

  const handleCategoryFilter = (cat: string) => {
    setActiveCategory((prev) => (prev === cat ? undefined : cat));
    setPage(1);
  };

  const handleBrandFilter = (brand: string) => {
    setActiveBrand((prev) => (prev === brand ? undefined : brand));
    setPage(1);
  };

  const clearFilters = () => {
    setActiveCategory(undefined);
    setActiveBrand(undefined);
    setPage(1);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const hasFilters = !!activeCategory || !!activeBrand;
  const results = data?.results ?? [];
  const meta = data?.meta;
  const facets = data?.facets;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky search header */}
      <div className="sticky top-0 z-30 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3 sm:px-8">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={term}
              onChange={handleInputChange}
              placeholder="Search by name, CAS number, catalogue number, or brand..."
              aria-label="Search products"
              className="h-10 rounded-full pl-10 pr-4 text-sm"
            />
          </form>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 rounded-full gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {(activeCategory ? 1 : 0) + (activeBrand ? 1 : 0)}
              </span>
            )}
          </Button>
        </div>

        {/* Active filter chips */}
        {hasFilters && (
          <div className="mx-auto flex max-w-7xl items-center gap-2 px-5 pb-3 sm:px-8">
            {activeCategory && (
              <FilterChip label={`Category: ${activeCategory}`} onRemove={() => setActiveCategory(undefined)} />
            )}
            {activeBrand && (
              <FilterChip label={`Brand: ${activeBrand}`} onRemove={() => setActiveBrand(undefined)} />
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8">
        <div className="flex gap-8">
          {/* Sidebar filters */}
          {showFilters && facets && (
            <aside className="hidden w-56 shrink-0 lg:block">
              {facets.category.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </h3>
                  <ul className="space-y-0.5">
                    {facets.category.slice(0, 15).map((f) => (
                      <li key={f.value}>
                        <button
                          onClick={() => handleCategoryFilter(f.value)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            activeCategory === f.value
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="truncate">{f.value}</span>
                          <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{f.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {facets.brand.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Brand
                  </h3>
                  <ul className="space-y-0.5">
                    {facets.brand.slice(0, 15).map((f) => (
                      <li key={f.value}>
                        <button
                          onClick={() => handleBrandFilter(f.value)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                            activeBrand === f.value
                              ? "bg-primary/10 font-medium text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="truncate">{f.value}</span>
                          <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{f.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results info */}
            <div className="mb-5 flex items-center gap-3">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : meta ? (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{meta.total.toLocaleString()}</span>
                  {" "}product{meta.total !== 1 ? "s" : ""}
                  {q ? <> for "<span className="font-medium text-foreground">{q}</span>"</> : ""}
                </p>
              ) : null}
            </div>

            {/* Product grid */}
            {!loading && results.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && results.length === 0 && data && (
              <div className="flex flex-col items-center py-20 text-center">
                <FlaskConical className="h-12 w-12 text-muted-foreground/30" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">No products found</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  {q
                    ? `We couldn't find products matching "${q}". Try a different search or request a quote.`
                    : "Start typing to search our catalogue of 12,000+ products."}
                </p>
                <Button asChild className="mt-6 rounded-full">
                  <Link to="/contact" hash="quote">
                    Request a Quote
                  </Link>
                </Button>
              </div>
            )}

            {/* Initial state — no query */}
            {!loading && !data && !q && (
              <div className="flex flex-col items-center py-20 text-center">
                <Search className="h-12 w-12 text-muted-foreground/30" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">Search our catalogue</h2>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  12,000+ chemicals, reagents, antibodies, and instruments from 50+ brands.
                </p>
              </div>
            )}

            {/* Pagination */}
            {meta && meta.total_pages > 1 && !loading && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {generatePageNumbers(page, meta.total_pages).map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                          page === p
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  disabled={page >= meta.total_pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: SearchResult }) {
  return (
    <Link
      to="/products/$slug"
      params={{ slug: product.slug ?? product.id }}
      search={{} as never}
      className="group flex flex-col rounded-xl border border-border/60 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      {/* Image */}
      <div className="flex h-36 items-center justify-center border-b border-border/40 bg-white p-4 rounded-t-xl">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <FlaskConical className="h-8 w-8 text-muted-foreground/20" />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3.5">
        <h3 className="text-xs font-semibold leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.brand_name && (
          <p className="mt-1.5 text-[11px] font-medium text-muted-foreground">{product.brand_name}</p>
        )}

        <div className="mt-auto flex flex-wrap gap-x-2 gap-y-0.5 pt-2.5">
          {product.catalog_number && (
            <span className="text-[10px] text-muted-foreground">Cat# {product.catalog_number}</span>
          )}
          {product.cas_number && (
            <span className="text-[10px] text-muted-foreground">CAS {product.cas_number}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/50 px-2.5 py-1 text-xs text-foreground">
      <span className="max-w-[150px] truncate">{label}</span>
      <button
        onClick={onRemove}
        className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

function generatePageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
