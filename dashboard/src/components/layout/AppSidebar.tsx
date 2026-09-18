import { NavLink } from "react-router-dom"
import {
  Home,
  Package,
  ShoppingCart,
  FileText,
  Receipt,
  Users,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/orders", label: "Orders", icon: ShoppingCart },
  { to: "/products", label: "Products", icon: Package },
  { to: "/quotations", label: "Quotations", icon: FileText },
  { to: "/bills", label: "Bills", icon: Receipt },
  { to: "/users", label: "Users", icon: Users },
]

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
          E
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            Evolve Admin
          </p>
          <p className="truncate text-[11px] text-muted-foreground">Dashboard</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
