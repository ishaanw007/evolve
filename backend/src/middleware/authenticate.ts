import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import { AppError } from "./errorHandler.js"

export interface JwtPayload {
  id: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization

  if (!header?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required")
  }

  const token = header.slice(7)

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = payload
    next()
  } catch {
    throw new AppError(401, "Invalid or expired token")
  }
}
