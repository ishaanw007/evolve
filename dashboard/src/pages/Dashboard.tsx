import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/AuthProvider"
import { Button } from "@/components/ui/button"
import SearchBar from "@/components/SearchBar"

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleLogout() {
    logout()
    navigate("/login")
  }

  function handleSearchNavigate(slug: string) {
    navigate(`/products/${slug}`)
  }

  return (
    <div className="flex min-h-svh flex-col items-center bg-background p-4">
      <header className="flex w-full max-w-4xl items-center justify-between gap-4 py-4">
        <h1 className="text-xl font-bold tracking-tight">Evolve</h1>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            {user?.email}
          </p>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Sign out
          </Button>
        </div>
      </header>

      <main className="flex w-full max-w-4xl flex-col items-center gap-6 py-8">
        <SearchBar onNavigate={handleSearchNavigate} />
      </main>
    </div>
  )
}
