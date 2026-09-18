import { Router } from "express"
import { authenticate, validate, asyncHandler } from "../../middleware/index.js"
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validation.js"
import * as authController from "./auth.controller.js"
import passport from "../../config/passport.js"

const router = Router()

// Email/password
router.post("/register", validate(registerSchema), asyncHandler(authController.register))
router.post("/login", validate(loginSchema), asyncHandler(authController.login))
router.get("/me", authenticate, asyncHandler(authController.me))

// Password reset
router.post("/forgot-password", validate(forgotPasswordSchema), asyncHandler(authController.forgotPassword))
router.post("/reset-password", validate(resetPasswordSchema), asyncHandler(authController.resetPassword))

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"], session: false })
)

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  authController.googleCallback
)

export default router
