import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  User,
  Mail,
  Shield,
  Package,
  ShoppingCart,
  LogOut,
  Loader2,
  ArrowRight,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | Evolve Life Sciences" },
      { name: "description", content: "View and manage your Evolve Life Sciences account." },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login", search: { returnTo: "/account", error: undefined } });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const displayName = user.name?.trim() || "User";
  const initial = (user.name || user.email || "U").charAt(0).toUpperCase();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Account</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Account
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your profile details and quick links to orders and cart.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-background shadow-sm">
        <div className="flex items-center gap-4 border-b border-border/50 bg-accent/30 px-5 py-6 sm:px-7">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-lg font-semibold text-primary-foreground shadow-sm">
            {initial}
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">{displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <dl className="divide-y divide-border/50">
          <div className="flex items-start gap-3 px-5 py-4 sm:px-7">
            <User className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Full name
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{displayName}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-5 py-4 sm:px-7">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </dt>
              <dd className="mt-0.5 text-sm font-medium text-foreground">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3 px-5 py-4 sm:px-7">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </dt>
              <dd className="mt-0.5">
                <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
                  {user.role || "user"}
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          to="/orders"
          className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background px-5 py-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/40"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
              <Package className="h-5 w-5 text-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">My Orders</p>
              <p className="text-xs text-muted-foreground">Quotes and order history</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          to="/cart"
          className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background px-5 py-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-accent/40"
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent">
              <ShoppingCart className="h-5 w-5 text-foreground" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">Cart</p>
              <p className="text-xs text-muted-foreground">Review items before quoting</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          variant="outline"
          className="rounded-full px-5"
          onClick={() => {
            signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
        <Button asChild variant="ghost" className="rounded-full px-5">
          <Link to="/products" search={{ q: undefined }}>
            Browse products
          </Link>
        </Button>
      </div>
    </div>
  );
}
