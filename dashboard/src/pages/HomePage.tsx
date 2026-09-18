import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SearchBar from "@/components/SearchBar"
import { PageHeader } from "@/components/layout/PageHeader"
import { useNavigate } from "react-router-dom"
import { Package, ShoppingCart, FileText, Receipt, Users } from "lucide-react"

const stats = [
  { label: "Orders", value: "—", icon: ShoppingCart, to: "/orders" },
  { label: "Products", value: "—", icon: Package, to: "/products" },
  { label: "Quotations", value: "—", icon: FileText, to: "/quotations" },
  { label: "Bills", value: "—", icon: Receipt, to: "/bills" },
  { label: "Users", value: "—", icon: Users, to: "/users" },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHeader
        title="Home"
        description="Overview of your Evolve Life Sciences admin workspace. Jump into orders, products, quotations, and more."
      />

      <section className="space-y-3">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">Quick links</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => navigate(s.to)}
              className="text-left"
            >
              <Card className="transition-colors hover:bg-accent/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                  <s.icon className="size-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold tracking-tight">{s.value}</div>
                  <CardDescription className="mt-1">Open {s.label.toLowerCase()}</CardDescription>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick product search</CardTitle>
          <CardDescription>Find a product and jump to its details.</CardDescription>
        </CardHeader>
        <CardContent>
          <SearchBar onNavigate={(slug) => navigate(`/products/${slug}`)} />
        </CardContent>
      </Card>
    </div>
  )
}
