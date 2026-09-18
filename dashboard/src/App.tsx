import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/lib/AuthProvider"
import ProtectedRoute from "@/components/ProtectedRoute"
import DashboardLayout from "@/components/layout/DashboardLayout"
import Login from "@/pages/Login"
import HomePage from "@/pages/HomePage"
import OrdersPage from "@/pages/OrdersPage"
import ProductsPage from "@/pages/ProductsPage"
import QuotationsPage from "@/pages/QuotationsPage"
import BillsPage from "@/pages/BillsPage"
import UsersPage from "@/pages/UsersPage"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="quotations" element={<QuotationsPage />} />
            <Route path="bills" element={<BillsPage />} />
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
