import { describe, it, expect } from "vitest"
import { buildFilterString } from "./filter.builder"

describe("buildFilterString", () => {
  it("returns empty string when no filters provided", () => {
    expect(buildFilterString({})).toBe("")
  })

  it("returns empty string when all params are undefined", () => {
    expect(
      buildFilterString({ category: undefined, brand: undefined, min_price: undefined, max_price: undefined })
    ).toBe("")
  })

  it("builds exact match filter for category", () => {
    expect(buildFilterString({ category: "Solvents" })).toBe("category:=Solvents")
  })

  it("builds exact match filter for brand", () => {
    expect(buildFilterString({ brand: "Sigma-Aldrich" })).toBe("brand_name:=Sigma-Aldrich")
  })

  it("builds numeric range filter for price with both min and max", () => {
    expect(buildFilterString({ min_price: 10, max_price: 100 })).toBe("price:>=10 && price:<=100")
  })

  it("builds filter for min_price only", () => {
    expect(buildFilterString({ min_price: 5.5 })).toBe("price:>=5.5")
  })

  it("builds filter for max_price only", () => {
    expect(buildFilterString({ max_price: 999.99 })).toBe("price:<=999.99")
  })

  it("joins category and brand filters with && operator", () => {
    expect(buildFilterString({ category: "Acids", brand: "Merck" })).toBe(
      "category:=Acids && brand_name:=Merck"
    )
  })

  it("joins category, brand, and price range filters with && operator", () => {
    const result = buildFilterString({
      category: "Reagents",
      brand: "Fisher",
      min_price: 20,
      max_price: 500,
    })
    expect(result).toBe("category:=Reagents && brand_name:=Fisher && price:>=20 && price:<=500")
  })

  it("handles category with special characters", () => {
    expect(buildFilterString({ category: "Acids & Bases" })).toBe("category:=Acids & Bases")
  })

  it("ignores empty string category", () => {
    expect(buildFilterString({ category: "" })).toBe("")
  })

  it("ignores empty string brand", () => {
    expect(buildFilterString({ brand: "" })).toBe("")
  })

  it("combines brand with price range when no category", () => {
    const result = buildFilterString({ brand: "TCI", min_price: 0.01, max_price: 99999999.99 })
    expect(result).toBe("brand_name:=TCI && price:>=0.01 && price:<=99999999.99")
  })
})
