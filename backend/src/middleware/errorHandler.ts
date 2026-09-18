import type { Request, Response, NextFunction } from "express"
import { env } from "../config/env.js"

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message })
    return
  }

  console.error("Unhandled error:", err)

  res.status(500).json({
    message: env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message,
  })
}
