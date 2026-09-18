import { Router } from "express"
import { authenticate, authorize, validate, asyncHandler } from "../../middleware/index.js"
import { createProductSchema, updateProductSchema } from "./products.validation.js"
import * as productsController from "./products.controller.js"

const router = Router()

// Public
router.get("/", asyncHandler(productsController.list))
router.get("/:slug", asyncHandler(productsController.getBySlug))

// Admin only
router.post("/", authenticate, authorize("admin"), validate(createProductSchema), asyncHandler(productsController.create))
router.patch("/:id", authenticate, authorize("admin"), validate(updateProductSchema), asyncHandler(productsController.update))
router.delete("/:id", authenticate, authorize("admin"), asyncHandler(productsController.remove))

export default router
