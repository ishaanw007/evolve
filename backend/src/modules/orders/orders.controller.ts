import type { Request, Response } from "express"
import * as ordersService from "./orders.service.js"

export async function create(req: Request, res: Response) {
  const order = await ordersService.create(req.user!.id, req.body)
  res.status(201).json(order)
}

export async function createQuote(req: Request, res: Response) {
  const order = await ordersService.createQuote(req.user!.id, req.body)
  res.status(201).json(order)
}

export async function listMine(req: Request, res: Response) {
  const orders = await ordersService.listByUser(req.user!.id)
  res.json(orders)
}

export async function listAll(req: Request, res: Response) {
  const orders = await ordersService.listAll()
  res.json(orders)
}

export async function getById(req: Request, res: Response) {
  const order = await ordersService.getById(req.params.id, req.user!.id)
  res.json(order)
}

export async function updateStatus(req: Request, res: Response) {
  const order = await ordersService.updateStatus(req.params.id, req.body)
  res.json(order)
}
