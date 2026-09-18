import type { Request, Response } from "express"
import * as productsService from "./products.service.js"
import { queryProductsSchema } from "./products.validation.js"

export async function list(req: Request, res: Response) {
  const query = queryProductsSchema.parse(req.query)
  const result = await productsService.list(query)
  res.json(result)
}

export async function getBySlug(req: Request, res: Response) {
  const product = await productsService.getBySlug(req.params.slug)
  res.json(product)
}

export async function create(req: Request, res: Response) {
  const product = await productsService.create(req.body)
  res.status(201).json(product)
}

export async function update(req: Request, res: Response) {
  const product = await productsService.update(req.params.id, req.body)
  res.json(product)
}

export async function remove(req: Request, res: Response) {
  await productsService.remove(req.params.id)
  res.status(204).end()
}
