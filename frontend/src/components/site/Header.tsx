import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, LogIn, LogOut, ShoppingCart, User, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import logoImg from "@/assets/logo.png";

const navLinks = [
  { to: "/products", label: "Products" },
  { to: "/brands", label: "Brands" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-white/80 shadow-[0_1px_3px_rgba(0,0,0,0.05)] backdrop-blur-xl dark:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logoImg}
              alt="Evolve"
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <span className="text-[15px] font-bold tracking-tight text-foreground">
                Evolve
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Nav */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative px-4 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:absolute data-[status=active]:after:inset-x-4 data-[status=active]:after:-bottom-[1.15rem] data-[status=active]:after:h-[2px] data-[status=active]:after:rounded-full data-[status=active]:after:bg-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Cart */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Cart"
          >
            <Link to="/cart">
              <ShoppingCart className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground ring-2 ring-white dark:ring-background">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </Button>

          {/* Auth */}
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-10 items-center gap-2 rounded-full border border-border/50 bg-accent/40 py-1 pr-3.5 pl-1 transition-all hover:border-border hover:bg-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-semibold text-primary-foreground">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden max-w-[90px] truncate text-[13px] font-medium text-foreground sm:inline">
                      {user.name?.split(" ")[0] || "Account"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-xl p-1.5 shadow-lg">
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="mx-1" />
                  <DropdownMenuItem asChild className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                    <Link to="/account">
                      <User className="h-4 w-4 text-muted-foreground" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                    <Link to="/orders">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px]">
                    <Link to="/cart">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                      Cart
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="mx-1" />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-destructive focus:text-destructive"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                size="sm"
                className="hidden h-9 rounded-full bg-primary px-5 text-[13px] font-medium shadow-sm transition-all hover:bg-primary/90 hover:shadow-md lg:inline-flex"
              >
                <Link to="/login" search={{ error: undefined, returnTo: undefined }}>
                  Sign in
                </Link>
              </Button>
            )
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="animate-in slide-in-from-top-2 border-t border-border/40 bg-background px-4 pb-6 pt-2 lg:hidden">
          <nav className="grid gap-1">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mt-3 border-t border-border/40 pt-3">
            {!loading && (
              user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 rounded-xl bg-accent/60 px-4 py-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {user.name || "User"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <button
                      onClick={() => { signOut(); setOpen(false); }}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-background hover:text-destructive"
                      aria-label="Sign out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                  <Link
                    to="/account"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </div>
              ) : (
                <Button
                  asChild
                  className="w-full rounded-xl"
                >
                  <Link to="/login" search={{ error: undefined, returnTo: undefined }} onClick={() => setOpen(false)}>
                    <LogIn className="mr-2 h-4 w-4" />
                    Sign in
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
