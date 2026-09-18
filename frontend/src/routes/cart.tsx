import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  CheckCircle2,
  LogIn,
  Loader2,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

const API_URL =
  (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleRequestQuote = async () => {
    // Not logged in — send to login and come back to the cart.
    if (!user) {
      navigate({ to: "/login", search: { returnTo: "/cart", error: undefined } });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/orders/quote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });

      if (res.status === 401) {
        toast.error("Your session expired. Please sign in again.");
        navigate({ to: "/login", search: { returnTo: "/cart", error: undefined } });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.message ?? "Couldn't submit your quote request. Please try again.");
        return;
      }

      clearCart();
      setSubmitted(true);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Success confirmation
  if (submitted) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-green-500/10">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Quote request submitted
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Thanks! Our team will review your list and get back to you with pricing,
          availability and lead time within one business day.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full px-6">
            <Link to="/products" search={{ q: undefined }}>Browse more products</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-6">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="grid h-20 w-20 place-items-center rounded-full bg-accent">
          <ShoppingCart className="h-9 w-9 text-muted-foreground/60" />
        </div>
        <h1 className="mt-6 text-xl font-bold tracking-tight text-foreground">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse our catalogue and add products to get started.
        </p>
        <Button asChild className="mt-6 rounded-full px-6">
          <Link to="/products" search={{ q: undefined }}>Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Continue shopping
        </Link>
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Your Quote List
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? "s" : ""} added</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Cart items */}
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
            >
              {/* Product image */}
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-white sm:h-24 sm:w-24">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="max-h-full max-w-full object-contain p-1" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground/40" />
                )}
              </div>

              {/* Product details */}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  {item.slug ? (
                    <Link
                      to="/products/$slug"
                      params={{ slug: item.slug }}
                      search={{} as never}
                      className="text-sm font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-base"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
                      {item.name}
                    </h3>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {[item.brand, item.catalogNumber, item.packSize].filter(Boolean).join(" · ")}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity controls */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      aria-label="Decrease quantity"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    aria-label="Remove item"
                    className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quote summary */}
        <div className="h-fit rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-base font-semibold text-foreground">Request a Quote</h2>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our products are supplied on request. Submit your list and we'll respond
            with pricing, availability and lead time within one business day.
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-accent/40 px-4 py-3 text-sm">
            <span className="text-muted-foreground">Items in list</span>
            <span className="font-semibold text-foreground">{itemCount}</span>
          </div>

          {!user && (
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <LogIn className="h-3.5 w-3.5 shrink-0" />
              You'll be asked to sign in before submitting.
            </p>
          )}

          <Button
            onClick={handleRequestQuote}
            disabled={submitting}
            className="mt-6 h-12 w-full rounded-xl text-sm font-medium shadow-sm transition-all hover:shadow-md"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : user ? (
              "Request a Quote"
            ) : (
              "Sign in to Request a Quote"
            )}
          </Button>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            No payment required. A specialist will contact you with a formal quotation.
          </p>
        </div>
      </div>
    </div>
  );
}
