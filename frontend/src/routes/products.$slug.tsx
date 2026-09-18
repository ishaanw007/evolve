import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  FlaskConical,
  Tag,
  Package,
  Layers,
  Building2,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/Reveal";
import { useCart } from "@/hooks/useCart";

const API_URL =
  (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  catalogNumber: string | null;
  casNumber: string | null;
  category: string | null;
  packSize: string | null;
  price: number;
  currency: string;
  stock: number;
  unit: string;
  imageUrl: string | null;
  productUrl: string | null;
  isActive: boolean;
  brandId: string | null;
  brand?: { id: string; name: string; slug: string; logoUrl: string | null } | null;
}

async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_URL}/products/${slug}`);
  if (!res.ok) {
    throw new Error(res.status === 404 ? "Product not found" : "Failed to load product");
  }
  return res.json();
}

export const Route = createFileRoute("/products/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Evolve Life Sciences` },
      { name: "description", content: `Product details for ${params.slug.replace(/-/g, " ")}` },
    ],
  }),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => fetchProduct(slug),
  });

  const handleAddToCart = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name: product.name,
        brand: product.brand?.name ?? null,
        catalogNumber: product.catalogNumber,
        packSize: product.packSize,
        price: product.price,
        currency: product.currency,
        imageUrl: product.imageUrl,
      },
      quantity,
    );
    toast.success("Added to cart", {
      description: `${quantity} × ${product.name}`,
    });
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-48 rounded bg-muted" />
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-muted" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-20 w-full rounded bg-muted" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-semibold text-foreground">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/products" search={{ q: undefined }}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
      {/* Breadcrumb */}
      <Reveal>
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">Home</Link>
          <span>/</span>
          <Link to="/products" search={{ q: undefined }} className="transition-colors hover:text-foreground">Products</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to="/products" search={{ q: product.category }} className="transition-colors hover:text-foreground">
                {product.category}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="truncate text-foreground">{product.name}</span>
        </nav>
      </Reveal>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Image */}
        <Reveal>
          <div className="flex aspect-square items-center justify-center rounded-3xl border border-border/70 bg-white p-8 shadow-[var(--shadow-soft)]">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <FlaskConical className="h-24 w-24 text-muted-foreground/30" />
            )}
          </div>
        </Reveal>

        {/* Details */}
        <div className="flex flex-col">
          <Reveal delay={50}>
            {product.brand && (
              <p className="mb-2 text-sm font-medium text-secondary">{product.brand.name}</p>
            )}
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>
          </Reveal>

          {/* Key identifiers */}
          <Reveal delay={100}>
            <div className="mt-5 flex flex-wrap gap-3">
              {product.casNumber && (
                <InfoBadge icon={FlaskConical} label="CAS" value={product.casNumber} />
              )}
              {product.catalogNumber && (
                <InfoBadge icon={Tag} label="Cat#" value={product.catalogNumber} />
              )}
              {product.category && (
                <InfoBadge icon={Layers} label="Category" value={product.category} />
              )}
              {product.packSize && (
                <InfoBadge icon={Package} label="Pack Size" value={product.packSize} />
              )}
              {product.brand && (
                <InfoBadge icon={Building2} label="Brand" value={product.brand.name} />
              )}
            </div>
          </Reveal>

          {/* Description */}
          {product.description && (
            <Reveal delay={150}>
              <div className="mt-6 rounded-2xl border border-border/60 bg-accent/30 p-5">
                <h2 className="mb-2 text-sm font-semibold text-foreground">Description</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>
            </Reveal>
          )}

          {/* Quote notice */}
          <Reveal delay={200}>
            <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-sm text-muted-foreground">
                Add items to your cart, then request a quote to receive pricing,
                availability and lead time within one business day.
              </p>
            </div>
          </Reveal>

          {/* Actions */}
          <Reveal delay={250}>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-foreground">Quantity</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="rounded-full px-8" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                {product.productUrl && (
                  <Button asChild variant="ghost" size="lg" className="rounded-full px-6">
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
                      View on Manufacturer Site
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

function InfoBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  );
}
