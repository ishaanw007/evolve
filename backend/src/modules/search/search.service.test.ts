import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { searchProducts, SearchUnavailableError } from "./search.service"

// Mock the typesense client module
vi.mock("./typesense.client.js", () => ({
  getTypesenseClient: vi.fn(),
  PRODUCTS_COLLECTION_NAME: "products",
}))

// Mock the filter builder
vi.mock("./filter.builder.js", () => ({
  buildFilterString: vi.fn(() => ""),
}))

import { getTypesenseClient } from "./typesense.client.js"
import { buildFilterString } from "./filter.builder.js"

const mockSearch = vi.fn()
const mockDocuments = vi.fn(() => ({ search: mockSearch }))
const mockCollections = vi.fn(() => ({ documents: mockDocuments }))
const mockClient = { collections: mockCollections }

describe("searchProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getTypesenseClient).mockReturnValue(mockClient as any)
    vi.mocked(buildFilterString).mockReturnValue("")
    mockSearch.mockResolvedValue({
      found: 0,
      hits: [],
      page: 1,
      search_time_ms: 5,
      facet_counts: [],
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("throws SearchUnavailableError when client is null", async () => {
    vi.mocked(getTypesenseClient).mockReturnValue(null)

    await expect(
      searchProducts({ q: "acetone", page: 1, per_page: 20 })
    ).rejects.toThrow(SearchUnavailableError)
  })

  it("uses wildcard query when q is empty", async () => {
    await searchProducts({ q: "", page: 1, per_page: 20 })

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: "*", sort_by: "stock:desc" }),
      expect.any(Object)
    )
  })

  it("uses wildcard query when q is whitespace only", async () => {
    await searchProducts({ q: "   ", page: 1, per_page: 20 })

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ q: "*", sort_by: "stock:desc" }),
      expect.any(Object)
    )
  })

  it("searches across all specified fields with typo tolerance", async () => {
    await searchProducts({ q: "acetone", page: 1, per_page: 20 })

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        q: "acetone",
        query_by: "name,description,cas_number,catalog_number,brand_name",
        num_typos: 2,
      }),
      expect.any(Object)
    )
  })

  it("requests facets for category and brand_name", async () => {
    await searchProducts({ q: "acid", page: 1, per_page: 10 })

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({
        facet_by: "category,brand_name",
      }),
      expect.any(Object)
    )
  })

  it("passes page and per_page to Typesense", async () => {
    await searchProducts({ q: "test", page: 3, per_page: 50 })

    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ page: 3, per_page: 50 }),
      expect.any(Object)
    )
  })

  it("applies filter_by when filters are provided", async () => {
    vi.mocked(buildFilterString).mockReturnValue("category:=Solvents")

    await searchProducts({
      q: "ethanol",
      page: 1,
      per_page: 20,
      category: "Solvents",
    })

    expect(buildFilterString).toHaveBeenCalledWith({
      category: "Solvents",
      brand: undefined,
      min_price: undefined,
      max_price: undefined,
    })
    expect(mockSearch).toHaveBeenCalledWith(
      expect.objectContaining({ filter_by: "category:=Solvents" }),
      expect.any(Object)
    )
  })

  it("does not include filter_by when no filters active", async () => {
    vi.mocked(buildFilterString).mockReturnValue("")

    await searchProducts({ q: "test", page: 1, per_page: 20 })

    const searchParams = mockSearch.mock.calls[0][0]
    expect(searchParams.filter_by).toBeUndefined()
  })

  it("does not set sort_by for non-empty queries", async () => {
    await searchProducts({ q: "acetone", page: 1, per_page: 20 })

    const searchParams = mockSearch.mock.calls[0][0]
    expect(searchParams.sort_by).toBeUndefined()
  })

  it("throws SearchUnavailableError on connection error", async () => {
    mockSearch.mockRejectedValue(new Error("ECONNREFUSED"))

    await expect(
      searchProducts({ q: "test", page: 1, per_page: 20 })
    ).rejects.toThrow(SearchUnavailableError)
  })

  it("throws SearchUnavailableError on timeout", async () => {
    const timeoutError = new Error("The operation was aborted")
    timeoutError.name = "TimeoutError"
    mockSearch.mockRejectedValue(timeoutError)

    await expect(
      searchProducts({ q: "test", page: 1, per_page: 20 })
    ).rejects.toThrow(SearchUnavailableError)
  })

  it("throws SearchUnavailableError on abort", async () => {
    const abortError = new Error("aborted")
    abortError.name = "AbortError"
    mockSearch.mockRejectedValue(abortError)

    await expect(
      searchProducts({ q: "test", page: 1, per_page: 20 })
    ).rejects.toThrow(SearchUnavailableError)
  })

  it("re-throws non-connection errors", async () => {
    mockSearch.mockRejectedValue(new Error("Schema mismatch"))

    await expect(
      searchProducts({ q: "test", page: 1, per_page: 20 })
    ).rejects.toThrow("Schema mismatch")
  })

  it("passes abortSignal in search options", async () => {
    await searchProducts({ q: "test", page: 1, per_page: 20 })

    const searchOptions = mockSearch.mock.calls[0][1]
    expect(searchOptions).toHaveProperty("abortSignal")
    expect(searchOptions.abortSignal).toBeInstanceOf(AbortSignal)
  })

  it("returns raw Typesense search result", async () => {
    const mockResult = {
      found: 5,
      hits: [{ document: { id: "1", name: "Acetone" } }],
      page: 1,
      search_time_ms: 12,
      facet_counts: [],
    }
    mockSearch.mockResolvedValue(mockResult)

    const result = await searchProducts({ q: "acetone", page: 1, per_page: 20 })
    expect(result).toEqual(mockResult)
  })
})
