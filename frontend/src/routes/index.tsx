import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useCallback } from "react";
import { Search, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { brands, productCategories } from "@/components/site/data";
import thermoLogo from "@/assets/thermo.png";
import sigmaLogo from "@/assets/sigma.svg";
import himediaLogo from "@/assets/HiMedia_Logo.png";
import abcamLogo from "@/assets/abcam.svg";
import bioradLogo from "@/assets/bio-rad-logo.svg";
import corningLogo from "@/assets/corning.webp";
import qiagenLogo from "@/assets/qiagen_logo.jpeg";
import gibcoLogo from "@/assets/gibico.png";
import eppendorfLogo from "@/assets/eppendorf.png";
import borosilLogo from "@/assets/borosil.jpeg";
import sartoriusLogo from "@/assets/satorious.png";

const brandLogos: Record<string, string> = {
  thermo: thermoLogo,
  sigma: sigmaLogo,
  himedia: himediaLogo,
  abcam: abcamLogo,
  biorad: bioradLogo,
  corning: corningLogo,
  qiagen: qiagenLogo,
  gibco: gibcoLogo,
  eppendorf: eppendorfLogo,
  borosil: borosilLogo,
  sartorius: sartoriusLogo,
};

const title = "Evolve Life Sciences | Lab Chemicals, Reagents & Instruments";

interface SearchResult {
  id: string;
  name: string;
  slug: string | null;
  category: string | null;
  brand_name: string | null;
  cas_number: string | null;
  catalog_number: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  product_url: string | null;
}
const description =
  "Evolve Life Sciences supplies laboratory chemicals, antibodies, cell culture media, FBS, ELISA kits, molecular biology reagents, glassware and instruments across India.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const API_URL = (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

  const fetchResults = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setShowDropdown(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query, per_page: "8" });
        const res = await fetch(`${API_URL}/search?${params}`);
        if (!res.ok) {
          setResults([]);
          setShowDropdown(false);
          return;
        }
        const data = await res.json();
        setResults(data.results ?? []);
        setShowDropdown((data.results ?? []).length > 0);
      } catch {
        setResults([]);
        setShowDropdown(false);
      } finally {
        setLoading(false);
      }
    },
    [API_URL],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setShowDropdown(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(() => fetchResults(value), 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowDropdown(false);
    if (searchTerm.trim()) {
      navigate({ to: "/products", search: { q: searchTerm.trim() } });
    } else {
      navigate({ to: "/products", search: { q: undefined } });
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setShowDropdown(false);
    setSearchTerm("");
    if (result.slug) {
      navigate({ to: "/products/$slug", params: { slug: result.slug }, search: {} as never });
    } else {
      navigate({ to: "/products", search: { q: result.name } });
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative isolate bg-background">
        {/* Gradient orbs — contained within bounds */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 right-0 -z-10 h-[400px] w-[400px] rounded-full bg-secondary/8 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-0 -z-10 h-[350px] w-[350px] rounded-full bg-primary/4 blur-[80px]"
        />

        {/* Subtle grid pattern */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="mx-auto max-w-5xl px-5 pt-12 pb-16 text-center sm:px-8 sm:pt-20 sm:pb-24">
          {/* Badge */}
          <Reveal>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by 600+ research institutions across India
            </div>
          </Reveal>

          {/* Heading */}
          <Reveal delay={50}>
            <h1 className="mx-auto max-w-3xl text-4xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Everything your{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent">
                lab needs
              </span>
              , delivered.
            </h1>
          </Reveal>

          {/* Search bar */}
          <div className="relative z-50 mt-8">
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div ref={containerRef} className="group relative">
                {/* Glow effect on focus */}
                <div className="absolute -inset-0.5 rounded-[28px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 blur-sm transition-opacity duration-500 group-focus-within:opacity-100" />
                <div className="relative flex items-center rounded-[26px] border border-border/80 bg-background shadow-xl shadow-black/[0.03] transition-shadow duration-300 group-focus-within:shadow-2xl group-focus-within:shadow-primary/[0.04]">
                  <Search className="pointer-events-none ml-5 h-5 w-5 shrink-0 text-muted-foreground/60 sm:ml-6" />
                  <input
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setShowDropdown(true)}
                    placeholder="Search by product, CAS number, catalogue number, or brand..."
                    aria-label="Search products"
                    className="h-14 w-full bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 sm:h-16 sm:text-base"
                  />
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  <Button
                    type="submit"
                    size="lg"
                    className="mr-2 shrink-0 rounded-full bg-primary px-6 font-medium shadow-sm transition-all hover:bg-primary/90 hover:shadow-md sm:px-8"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight className="h-4 w-4 sm:hidden" />
                  </Button>
                </div>

                {/* Search results dropdown */}
                {showDropdown && results.length > 0 && (
                  <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-2xl border border-border/80 bg-background shadow-2xl backdrop-blur-none">
                    <ul className="max-h-72 overflow-y-auto p-2">
                      {results.map((result) => (
                        <li key={result.id}>
                          <button
                            type="button"
                            onClick={() => handleResultClick(result)}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-accent"
                          >
                            {result.image_url && (
                              <img
                                src={result.image_url}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-lg border border-border/50 object-contain bg-white p-0.5"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {result.name}
                              </p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                {result.brand_name && <span>{result.brand_name}</span>}
                                {result.brand_name && result.catalog_number && <span>·</span>}
                                {result.catalog_number && <span>Cat# {result.catalog_number}</span>}
                                {result.cas_number && (
                                  <>
                                    <span>·</span>
                                    <span>CAS {result.cas_number}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-border/50 p-2">
                      <button
                        type="submit"
                        className="w-full rounded-xl px-4 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary/5"
                      >
                        View all results for "{searchTerm}"
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Popular searches */}
          <Reveal delay={150}>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-medium text-muted-foreground/70">Popular:</span>
              {["Fetal Bovine Serum", "ELISA Kits", "Antibodies", "Trypsin", "DMEM", "PCR Kits"].map((t) => (
                <Link
                  key={t}
                  to="/products"
                  search={{ q: t }}
                  className="rounded-full border border-border/50 bg-accent/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/20 hover:bg-primary/5 hover:text-foreground"
                >
                  {t}
                </Link>
              ))}
            </div>
          </Reveal>

          {/* Subtitle */}
          <Reveal delay={200}>
            <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              12,000+ chemicals, reagents, antibodies, and instruments from the world's top manufacturers.
            </p>
          </Reveal>

          {/* Stats */}
          <Reveal delay={250}>
            <div className="mx-auto mt-16 flex max-w-md items-center justify-center divide-x divide-border/60">
              {[
                ["12,000+", "Products"],
                ["50+", "Brands"],
                ["24–48h", "Dispatch"],
              ].map(([v, l]) => (
                <div key={l} className="px-6 text-center sm:px-8">
                  <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{v}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{l}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Browse by Category */}
      <Section
        id="products"
        eyebrow="Shop by Category"
        title="Browse our catalogue"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {productCategories.map((c, i) => (
            <Reveal key={c.name} delay={i * 30}>
              <Link
                to="/products"
                search={{ q: c.name }}
                className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-lift)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-[image:var(--gradient-brand)] group-hover:text-primary-foreground">
                  <c.icon className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold tracking-tight">{c.name}</h3>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.desc}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Brands */}
      <Section muted eyebrow="Our Brands" title="Sourced from leading manufacturers">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {brands.map((b, i) => (
            <Reveal key={b.name} delay={i * 25}>
              <Link
                to="/products"
                search={{ q: b.name }}
                className="grid h-24 place-items-center rounded-2xl border border-border/70 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-[var(--shadow-soft)]"
              >
                {b.logo && brandLogos[b.logo] ? (
                  <img
                    src={brandLogos[b.logo]}
                    alt={`${b.name} logo`}
                    className="h-8 w-auto object-contain"
                  />
                ) : null}
                <span className="mt-1 text-xs font-medium text-muted-foreground">{b.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="rounded-3xl bg-[image:var(--gradient-brand)] p-8 text-center sm:p-12">
          <h2 className="text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
            Can't find what you need?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-primary-foreground/80">
            Share the catalogue number or specification and receive pricing, availability and lead time within one business day.
          </p>
          <Button asChild variant="secondary" size="xl" className="mt-6">
            <Link to="/contact" hash="quote">
              Request a Quote
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}

function Section({
  id,
  eyebrow,
  title,
  sub,
  muted,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  sub?: string;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={muted ? "scroll-mt-20 bg-[image:var(--gradient-surface)]" : "scroll-mt-20"}
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        <Reveal className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.18em] text-secondary uppercase">
            {eyebrow}
          </p>
          <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance sm:text-4xl">
            {title}
          </h2>
          {sub && <p className="mt-4 leading-relaxed text-muted-foreground">{sub}</p>}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
