import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Package,
  Loader2,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

const API_URL =
  (import.meta.env as Record<string, string>)["VITE_API_URL"] ?? "http://localhost:3000";

type OrderProduct = {
  id: string;
  name: string;
  slug?: string | null;
  catalogNumber?: string | null;
  imageUrl?: string | null;
};

type OrderItem = {
  id: string;
  quantity: number;
  price: string | number;
  product: OrderProduct;
};

type Order = {
  id: string;
  status: string;
  total: string | number;
  createdAt: string;
  items: OrderItem[];
};

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders | Evolve Life Sciences" },
      { name: "description", content: "View your quote requests and order history." },
    ],
  }),
  component: OrdersPage,
});

function statusStyles(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "shipped":
      return "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400";
    case "delivered":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "cancelled":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    default:
      return "bg-amber-500/10 text-amber-800 dark:text-amber-400";
  }
}

function formatMoney(value: string | number) {
  const n = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/login", search: { returnTo: "/orders", error: undefined } });
    }
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (authLoading || !user) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/orders/mine`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (res.status === 401) {
          navigate({ to: "/login", search: { returnTo: "/orders", error: undefined } });
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.message ?? "Couldn't load your orders.");
        }

        const data = (await res.json()) as Order[];
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Couldn't load your orders.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user, navigate]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Orders</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Quote requests and order history for your account.
          </p>
        </div>
        <Button asChild variant="outline" className="rounded-full px-5">
          <Link to="/account">Back to account</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-background px-6 py-14 text-center shadow-sm">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-red-500/10">
            <AlertCircle className="h-7 w-7 text-red-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">Unable to load orders</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{error}</p>
          <Button
            className="mt-6 rounded-full px-6"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-background px-6 py-16 text-center shadow-sm">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-accent">
            <Package className="h-8 w-8 text-muted-foreground/70" />
          </div>
          <h2 className="mt-5 text-lg font-semibold text-foreground">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            When you request a quote from your cart, it will show up here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild className="rounded-full px-6">
              <Link to="/products" search={{ q: undefined }}>
                Browse products
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-6">
              <Link to="/cart">
                <ShoppingCart className="mr-2 h-4 w-4" />
                View cart
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => {
            const isOpen = !!expanded[order.id];
            const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

            return (
              <li
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))
                  }
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-accent/30 sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${statusStyles(order.status)}`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1.5 truncate font-mono text-xs text-muted-foreground">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      <span className="font-semibold">{formatMoney(order.total)}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        · {itemCount} item{itemCount === 1 ? "" : "s"}
                      </span>
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-border/50 px-5 py-4 sm:px-6">
                    <ul className="space-y-3">
                      {(order.items ?? []).map((item) => (
                        <li key={item.id} className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            {item.product?.slug ? (
                              <Link
                                to="/products/$slug"
                                params={{ slug: item.product.slug }}
                                className="text-sm font-medium text-foreground hover:text-primary"
                              >
                                {item.product.name}
                              </Link>
                            ) : (
                              <p className="text-sm font-medium text-foreground">
                                {item.product?.name ?? "Product"}
                              </p>
                            )}
                            {item.product?.catalogNumber && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                Cat. {item.product.catalogNumber}
                              </p>
                            )}
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Qty {item.quantity} × {formatMoney(item.price)}
                            </p>
                          </div>
                          <p className="shrink-0 text-sm font-medium text-foreground">
                            {formatMoney(Number(item.price) * item.quantity)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
