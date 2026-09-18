import { Router } from "express"
import { authenticate, validate, asyncHandler } from "../../middleware/index.js"
import { addCartItemSchema, mergeCartSchema, updateCartItemSchema } from "./cart.validation.js"
import * as cartController from "./cart.controller.js"

const router = Router()

router.use(authenticate)

router.get("/", asyncHandler(cartController.getMine))
router.post("/items", validate(addCartItemSchema), asyncHandler(cartController.addItem))
router.patch(
  "/items/:productId",
  validate(updateCartItemSchema),
  asyncHandler(cartController.updateItem),
)
router.delete("/items/:productId", asyncHandler(cartController.removeItem))
router.delete("/", asyncHandler(cartController.clear))
router.post("/merge", validate(mergeCartSchema), asyncHandler(cartController.merge))

export default router
