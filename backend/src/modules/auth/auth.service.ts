import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../../config/db.js"
import { env } from "../../config/env.js"
import { AppError } from "../../middleware/index.js"
import type { LoginInput, RegisterInput, ForgotPasswordInput, ResetPasswordInput } from "./auth.validation.js"
import { ensureCart } from "../cart/cart.service.js"

const SALT_ROUNDS = 12

function signToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  )
}

export async function register(input: RegisterInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } })

  if (existing) {
    throw new AppError(409, "Email already registered")
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
    },
    select: { id: true, email: true, name: true, role: true },
  })

  await ensureCart(user.id)

  const token = signToken(user)

  return { user, token }
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })

  if (!user) {
    throw new AppError(401, "Invalid email or password")
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)

  if (!valid) {
    throw new AppError(401, "Invalid email or password")
  }

  // Backfill cart for older accounts
  await ensureCart(user.id)

  const token = signToken({ id: user.id, email: user.email, role: user.role })

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  }
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })

  // Always return success to prevent email enumeration
  if (!user) {
    return { message: "If that email exists, a reset link has been sent." }
  }

  // Generate a short-lived reset token
  const resetToken = jwt.sign(
    { id: user.id, email: user.email, purpose: "reset" },
    env.JWT_SECRET,
    { expiresIn: "15m" } as jwt.SignOptions
  )

  // TODO: Send email with reset link: ${env.CLIENT_URL}/auth/reset-password?token=${resetToken}
  console.log(`[DEV] Password reset link: ${env.CLIENT_URL}/auth/reset-password?token=${resetToken}`)

  return { message: "If that email exists, a reset link has been sent." }
}

export async function resetPassword(input: ResetPasswordInput) {
  let payload: { id: string; purpose: string }

  try {
    payload = jwt.verify(input.token, env.JWT_SECRET) as { id: string; purpose: string }
  } catch {
    throw new AppError(400, "Invalid or expired reset token")
  }

  if (payload.purpose !== "reset") {
    throw new AppError(400, "Invalid token")
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS)

  await prisma.user.update({
    where: { id: payload.id },
    data: { passwordHash },
  })

  return { message: "Password updated successfully" }
}
