import { describe, it, expect, vi, beforeEach } from "vitest"
import type { Request, Response, NextFunction } from "express"
import { search, reindex } from "./search.controller.js"
import { SearchUnavailableError } from "./search.service.js"

// Mock dependencies
vi.mock("./search.service.js", () => ({
  searchProducts: vi.fn(),
  SearchUnavailableError: class SearchUnavailableError extends Error {
    constructor(message = "Search is temporarily unavailable") {
      super(message)
      this.name = "SearchUnavailableError"
    }
  },
}))

vi.mock("./sync.service.js", () => ({
  fullReindex: vi.fn(),
}))

// We don't mock transformers/validation — they use real logic

import { searchProducts } from "./search.service.js"
import { fullReindex } from "./sync.service.js"

function mockReq(query: Record<string, unknown> = {}): Request {
  return { query } as unknown as Request
}

function mockRes(): Response {
  const res: Partial<Response> = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res as Response
}

function mockNext(): NextFunction {
  return vi.fn() as unknown as NextFunction
}

describe("search controller", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("search handler", () => {
    it("returns 200 with transformed results for valid query", async () => {
      const mockResponse = {
        hits: [
          {
            document: {
              id: "1",
              name: "Sodium Chloride",
              slug: "sodium-chloride",
              description: "Lab grade NaCl",
              category: "Chemicals",
              brand_name: "Sigma",
              price: 25.99,
              pack_size: "500g",
              stock: 100,
            },
            highlights: [{ field: "name", snippet: "<em>Sodium</em> Chloride" }],
          },
        ],
        facet_counts: [
          { field_name: "category", counts: [{ value: "Chemicals", count: 5 }] },
          { field_name: "brand_name", counts: [{ value: "Sigma", count: 3 }] },
        ],
        found: 1,
        search_time_ms: 12,
      }

      vi.mocked(searchProducts).mockResolvedValue(mockResponse as any)

      const req = mockReq({ q: "sodium" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: expect.arrayContaining([
            expect.objectContaining({
              id: "1",
              name: "Sodium Chloride",
              price: 25.99,
            }),
          ]),
          facets: expect.objectContaining({
            category: [{ value: "Chemicals", count: 5 }],
            brand: [{ value: "Sigma", count: 3 }],
          }),
          meta: expect.objectContaining({
            total: 1,
            page: 1,
            total_pages: 1,
            processing_time_ms: 12,
          }),
        })
      )
    })

    it("returns 200 with empty results when no hits", async () => {
      vi.mocked(searchProducts).mockResolvedValue({
        hits: [],
        facet_counts: [],
        found: 0,
        search_time_ms: 5,
      } as any)

      const req = mockReq({ q: "nonexistent" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        results: [],
        facets: { category: [], brand: [] },
        meta: { total: 0, page: 1, total_pages: 0, processing_time_ms: 5 },
      })
    })

    it("returns 400 when query exceeds 256 chars", async () => {
      const req = mockReq({ q: "a".repeat(257) })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid search parameters",
          errors: expect.arrayContaining([
            expect.objectContaining({ field: "q" }),
          ]),
        })
      )
    })

    it("returns 400 when min_price > max_price", async () => {
      const req = mockReq({ min_price: "100", max_price: "50" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid search parameters",
          errors: expect.any(Array),
        })
      )
    })

    it("returns 503 when SearchUnavailableError is thrown", async () => {
      const { SearchUnavailableError: MockError } = await import("./search.service.js")
      vi.mocked(searchProducts).mockRejectedValue(new MockError())

      const req = mockReq({ q: "test" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(503)
      expect(res.json).toHaveBeenCalledWith({
        message: "Search is temporarily unavailable",
      })
    })

    it("passes unexpected errors to next()", async () => {
      const error = new Error("Something went wrong")
      vi.mocked(searchProducts).mockRejectedValue(error)

      const req = mockReq({ q: "test" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })

    it("returns 200 with empty results when response has no hits property", async () => {
      vi.mocked(searchProducts).mockResolvedValue({
        found: 0,
        search_time_ms: 2,
      } as any)

      const req = mockReq({ q: "test" })
      const res = mockRes()
      const next = mockNext()

      await search(req, res, next)

      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          results: [],
          meta: expect.objectContaining({ total: 0 }),
        })
      )
    })
  })

  describe("reindex handler", () => {
    it("returns 200 with success message on completion", async () => {
      vi.mocked(fullReindex).mockResolvedValue(undefined)

      const req = mockReq()
      const res = mockRes()
      const next = mockNext()

      await reindex(req, res, next)

      expect(fullReindex).toHaveBeenCalled()
      expect(res.status).toHaveBeenCalledWith(200)
      expect(res.json).toHaveBeenCalledWith({
        message: "Re-index completed successfully",
      })
    })

    it("passes errors to next() on failure", async () => {
      const error = new Error("Reindex failed")
      vi.mocked(fullReindex).mockRejectedValue(error)

      const req = mockReq()
      const res = mockRes()
      const next = mockNext()

      await reindex(req, res, next)

      expect(next).toHaveBeenCalledWith(error)
    })
  })
})
