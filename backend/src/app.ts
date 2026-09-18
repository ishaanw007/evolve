import express from "express"
import cors from "cors"
import { env } from "./config/env.js"
import { errorHandler } from "./middleware/index.js"
import passport from "./config/passport.js"
import authRoutes from "./modules/auth/auth.routes.js"
import productsRoutes from "./modules/products/products.routes.js"
import ordersRoutes from "./modules/orders/orders.routes.js"
import searchRoutes from "./modules/search/search.routes.js"
import cartRoutes from "./modules/cart/cart.routes.js"
import { ensureCollection } from "./modules/search/typesense.client.js"

const app = express()

// Global middleware
const allowedOrigins = env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (curl, mobile apps) with no Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`))
      }
    },
    credentials: true,
  }),
)
app.use(express.json())
app.use(passport.initialize())

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// Routes
app.use("/auth", authRoutes)
app.use("/products", productsRoutes)
app.use("/orders", ordersRoutes)
app.use("/search", searchRoutes)
app.use("/cart", cartRoutes)

// Initialize Typesense collection (non-blocking)
ensureCollection().catch((err) =>
  console.error("Failed to initialize Typesense collection:", err)
)

// Error handler (must be last)
app.use(errorHandler)

export default app
