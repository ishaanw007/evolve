import type { Request, Response, NextFunction } from "express"
import { AppError } from "./errorHandler.js"

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(401, "Authentication required")
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "Insufficient permissions")
    }

    next()
  }
}
