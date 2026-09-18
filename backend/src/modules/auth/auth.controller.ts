import type { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../../config/env.js"
import * as authService from "./auth.service.js"

export async function register(req: Request, res: Response) {
  const result = await authService.register(req.body)
  res.status(201).json(result)
}

export async function login(req: Request, res: Response) {
  const result = await authService.login(req.body)
  res.json(result)
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user })
}

export function googleCallback(req: Request, res: Response) {
  const user = req.user as { id: string; email: string; role: string; name?: string }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
  )

  // Redirect to frontend with token
  res.redirect(`${env.CLIENT_URL}/auth/callback?token=${token}`)
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await authService.forgotPassword(req.body)
  res.json(result)
}

export async function resetPassword(req: Request, res: Response) {
  const result = await authService.resetPassword(req.body)
  res.json(result)
}
