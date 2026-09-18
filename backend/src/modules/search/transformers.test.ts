import { describe, it, expect } from "vitest"
import {
  transformHits,
  transformFacets,
  transformMeta,
  type SearchResult,
  type FacetEntry,
  type SearchMeta,
} from "./transformers.js"

describe("transformHits", () => {
  it("maps a complete hit document to SearchResult with all fields", () => {
    const hits = [
      {
        document: {
          id: "abc-123",
          name: "Sodium Chloride",
          slug: "sodium-chloride",
          description: "Lab grade NaCl",
          category: "Inorganic Salts",
          brand_name: "Sigma-Aldrich",
          price: 25.99,
          currency: "USD",
          pack_size: "500g",
          image_url: "https://example.com/nacl.jpg",
          stock: 100,
        },
        highlights: [
          { field: "name", snippet: "<em>Sodium</em> Chloride" },
        ],
      },
    ]

    const results = transformHits(hits, 1, 20)

    expect(results).toHaveLength(1)
    expect(results[0]).toEqual({
      id: "abc-123",
      name: "Sodium Chloride",
      slug: "sodium-chloride",
      description: "Lab grade NaCl",
      category: "Inorganic Salts",
      brand_name: "Sigma-Aldrich",
      price: 25.99,
      currency: "USD",
      pack_size: "500g",
      image_url: "https://example.com/nacl.jpg",
      stock: 100,
      highlights: { name: "<em>Sodium</em> Chloride" },
    })
  })

  it("sets missing optional fields to null", () => {
    const hits = [
      {
        document: {
          id: "xyz-456",
          name: "Unknown Chemical",
          price: 10,
          stock: 5,
        },
        highlights: [],
      },
    ]

    const results = transformHits(hits, 1, 20)

    expect(results[0].description).toBeNull()
    expect(results[0].category).toBeNull()
    expect(results[0].brand_name).toBeNull()
    expect(results[0].pack_size).toBeNull()
    expect(results[0].image_url).toBeNull()
    expect(results[0].slug).toBeNull()
  })

  it("defaults currency to USD when not present in document", () => {
    const hits = [
      {
        document: { id: "1", name: "Test", price: 5, stock: 0 },
        highlights: [],
      },
    ]

    const results = transformHits(hits, 1, 20)
    expect(results[0].currency).toBe("USD")
  })

  it("returns empty array for empty hits", () => {
    expect(transformHits([], 1, 20)).toEqual([])
  })

  it("extracts multiple highlight fields", () => {
    const hits = [
      {
        document: { id: "1", name: "Acetic Acid", price: 12, stock: 10 },
        highlights: [
          { field: "name", snippet: "<em>Acetic</em> Acid" },
          { field: "description", snippet: "A <em>weak</em> acid" },
          { field: "cas_number", snippet: "<em>64-19-7</em>" },
        ],
      },
    ]

    const results = transformHits(hits, 1, 20)
    expect(results[0].highlights).toEqual({
      name: "<em>Acetic</em> Acid",
      description: "A <em>weak</em> acid",
      cas_number: "<em>64-19-7</em>",
    })
  })
})

describe("transformFacets", () => {
  it("maps facet_counts to category and brand arrays", () => {
    const facetCounts = [
      {
        field_name: "category",
        counts: [
          { value: "Organic", count: 42 },
          { value: "Inorganic", count: 18 },
        ],
      },
      {
        field_name: "brand_name",
        counts: [
          { value: "Sigma-Aldrich", count: 30 },
          { value: "Merck", count: 25 },
        ],
      },
    ]

    const facets = transformFacets(facetCounts)

    expect(facets.category).toEqual([
      { value: "Organic", count: 42 },
      { value: "Inorganic", count: 18 },
    ])
    expect(facets.brand).toEqual([
      { value: "Sigma-Aldrich", count: 30 },
      { value: "Merck", count: 25 },
    ])
  })

  it("returns empty arrays when no facet data matches", () => {
    const facets = transformFacets([])
    expect(facets.category).toEqual([])
    expect(facets.brand).toEqual([])
  })

  it("handles missing facet gracefully", () => {
    const facetCounts = [
      {
        field_name: "category",
        counts: [{ value: "Solvents", count: 5 }],
      },
    ]

    const facets = transformFacets(facetCounts)
    expect(facets.category).toEqual([{ value: "Solvents", count: 5 }])
    expect(facets.brand).toEqual([])
  })

  it("returns empty arrays for non-array input", () => {
    const facets = transformFacets(null as any)
    expect(facets.category).toEqual([])
    expect(facets.brand).toEqual([])
  })
})

describe("transformMeta", () => {
  it("maps found, page, perPage, searchTimeMs to meta object", () => {
    const meta = transformMeta(150, 2, 20, 12)

    expect(meta).toEqual({
      total: 150,
      page: 2,
      total_pages: 8,
      processing_time_ms: 12,
    })
  })

  it("calculates total_pages with ceiling division", () => {
    // 101 results / 20 per page = 5.05 → 6 pages
    const meta = transformMeta(101, 1, 20, 5)
    expect(meta.total_pages).toBe(6)
  })

  it("handles single result correctly", () => {
    const meta = transformMeta(1, 1, 20, 3)
    expect(meta.total_pages).toBe(1)
  })

  it("handles zero results", () => {
    const meta = transformMeta(0, 1, 20, 1)
    expect(meta.total).toBe(0)
    expect(meta.total_pages).toBe(0)
  })

  it("handles exact page boundary", () => {
    const meta = transformMeta(100, 1, 20, 10)
    expect(meta.total_pages).toBe(5)
  })
})
