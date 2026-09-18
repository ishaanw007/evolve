import { Router } from "express"
import { authenticate, authorize, validate, asyncHandler } from "../../middleware/index.js"
import { createOrderSchema, createQuoteSchema, updateOrderStatusSchema } from "./orders.validation.js"
import * as ordersController from "./orders.controller.js"

const router = Router()

// User routes
router.post("/quote", authenticate, validate(createQuoteSchema), asyncHandler(ordersController.createQuote))
router.post("/", authenticate, validate(createOrderSchema), asyncHandler(ordersController.create))
router.get("/mine", authenticate, asyncHandler(ordersController.listMine))
router.get("/:id", authenticate, asyncHandler(ordersController.getById))

// Admin routes
router.get("/", authenticate, authorize("admin"), asyncHandler(ordersController.listAll))
router.patch("/:id/status", authenticate, authorize("admin"), validate(updateOrderStatusSchema), asyncHandler(ordersController.updateStatus))

export default router
