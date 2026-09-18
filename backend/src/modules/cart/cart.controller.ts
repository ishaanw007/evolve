import type { Request, Response } from "express"
import * as cartService from "./cart.service.js"

export async function getMine(req: Request, res: Response) {
  const cart = await cartService.getCart(req.user!.id)
  res.json(cart)
}

export async function addItem(req: Request, res: Response) {
  const cart = await cartService.addItem(req.user!.id, req.body)
  res.status(200).json(cart)
}

export async function updateItem(req: Request, res: Response) {
  const cart = await cartService.updateItem(req.user!.id, req.params.productId, req.body)
  res.json(cart)
}

export async function removeItem(req: Request, res: Response) {
  const cart = await cartService.removeItem(req.user!.id, req.params.productId)
  res.json(cart)
}

export async function clear(req: Request, res: Response) {
  const cart = await cartService.clearCart(req.user!.id)
  res.json(cart)
}

export async function merge(req: Request, res: Response) {
  const cart = await cartService.mergeCart(req.user!.id, req.body)
  res.json(cart)
}
