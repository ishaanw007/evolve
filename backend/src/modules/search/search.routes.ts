import { Router } from "express"
import { authenticate, authorize, asyncHandler } from "../../middleware/index.js"
import { rateLimit } from "../../middleware/rateLimit.js"
import * as searchController from "./search.controller.js"

const router = Router()

/**
 * GET /search
 * Public endpoint with rate limiting (60 requests/min per IP).
 * Searches products with optional filters and facets.
 */
router.get("/", rateLimit(), asyncHandler(searchController.search))

/**
 * POST /search/reindex
 * Admin-only endpoint to trigger a full re-index.
 * Requires Bearer token authentication and admin role.
 */
router.post("/reindex", authenticate, authorize("admin"), asyncHandler(searchController.reindex))

export default router
