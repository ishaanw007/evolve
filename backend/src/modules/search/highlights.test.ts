import { describe, it, expect } from "vitest"
import { truncateWithTags, transformHighlights, SearchHighlight } from "./highlights.js"

describe("truncateWithTags", () => {
  it("returns text unchanged when within maxLength", () => {
    const text = "hello world"
    expect(truncateWithTags(text, 200)).toBe(text)
  })

  it("returns text unchanged when exactly at maxLength", () => {
    const text = "a".repeat(200)
    expect(truncateWithTags(text, 200)).toBe(text)
  })

  it("truncates plain text without tags", () => {
    const text = "a".repeat(250)
    const result = truncateWithTags(text, 200)
    expect(result.length).toBeLessThanOrEqual(200)
  })

  it("preserves complete <em> tag pairs when truncating", () => {
    const text = "Some text with <em>highlighted</em> content that goes on and on " + "x".repeat(200)
    const result = truncateWithTags(text, 200)
    expect(result.length).toBeLessThanOrEqual(200)
    // Count open and close tags — they should be balanced
    const openCount = (result.match(/<em>/g) || []).length
    const closeCount = (result.match(/<\/em>/g) || []).length
    expect(openCount).toBe(closeCount)
  })

  it("does not split inside an <em> tag", () => {
    // Place an <em> tag right at the truncation boundary
    const prefix = "x".repeat(197)
    const text = prefix + "<em>word</em>"
    const result = truncateWithTags(text, 200)
    expect(result).not.toContain("<e")
    expect(result).not.toMatch(/<em$/)
    expect(result).not.toMatch(/<$/)
  })

  it("does not split inside a </em> tag", () => {
    const prefix = "x".repeat(190)
    const text = prefix + "<em>hi</em>more text after"
    const result = truncateWithTags(text, 198)
    expect(result.length).toBeLessThanOrEqual(198)
    const openCount = (result.match(/<em>/g) || []).length
    const closeCount = (result.match(/<\/em>/g) || []).length
    expect(openCount).toBe(closeCount)
  })

  it("removes unclosed <em> tags at the end", () => {
    // The <em> starts but truncation cuts before </em>
    const prefix = "x".repeat(190)
    const text = prefix + "<em>" + "y".repeat(50) + "</em>"
    const result = truncateWithTags(text, 200)
    expect(result.length).toBeLessThanOrEqual(200)
    const openCount = (result.match(/<em>/g) || []).length
    const closeCount = (result.match(/<\/em>/g) || []).length
    expect(openCount).toBe(closeCount)
  })

  it("handles multiple <em> tags correctly", () => {
    const text = "<em>first</em> middle <em>second</em> end " + "z".repeat(200)
    const result = truncateWithTags(text, 200)
    expect(result.length).toBeLessThanOrEqual(200)
    const openCount = (result.match(/<em>/g) || []).length
    const closeCount = (result.match(/<\/em>/g) || []).length
    expect(openCount).toBe(closeCount)
  })

  it("handles empty string", () => {
    expect(truncateWithTags("", 200)).toBe("")
  })

  it("handles text with only tags", () => {
    const text = "<em>short</em>"
    expect(truncateWithTags(text, 200)).toBe(text)
  })
})

describe("transformHighlights", () => {
  it("extracts name highlight", () => {
    const highlights = [{ field: "name", snippet: "Sodium <em>Chloride</em>" }]
    const result = transformHighlights(highlights)
    expect(result.name).toBe("Sodium <em>Chloride</em>")
    expect(result.description).toBeUndefined()
    expect(result.cas_number).toBeUndefined()
  })

  it("extracts description highlight", () => {
    const highlights = [{ field: "description", snippet: "A <em>chemical</em> compound" }]
    const result = transformHighlights(highlights)
    expect(result.description).toBe("A <em>chemical</em> compound")
  })

  it("extracts cas_number highlight", () => {
    const highlights = [{ field: "cas_number", snippet: "<em>7647-14-5</em>" }]
    const result = transformHighlights(highlights)
    expect(result.cas_number).toBe("<em>7647-14-5</em>")
  })

  it("extracts multiple fields at once", () => {
    const highlights = [
      { field: "name", snippet: "<em>Sodium</em> Chloride" },
      { field: "description", snippet: "Common <em>salt</em>" },
      { field: "cas_number", snippet: "<em>7647</em>-14-5" },
    ]
    const result = transformHighlights(highlights)
    expect(result.name).toBe("<em>Sodium</em> Chloride")
    expect(result.description).toBe("Common <em>salt</em>")
    expect(result.cas_number).toBe("<em>7647</em>-14-5")
  })

  it("ignores non-highlight fields", () => {
    const highlights = [
      { field: "catalog_number", snippet: "<em>ABC</em>-123" },
      { field: "brand_name", snippet: "<em>Sigma</em>" },
    ]
    const result = transformHighlights(highlights)
    expect(result.name).toBeUndefined()
    expect(result.description).toBeUndefined()
    expect(result.cas_number).toBeUndefined()
  })

  it("returns empty object for null/undefined highlights", () => {
    expect(transformHighlights(null as any)).toEqual({})
    expect(transformHighlights(undefined as any)).toEqual({})
  })

  it("returns empty object for empty array", () => {
    expect(transformHighlights([])).toEqual({})
  })

  it("truncates long highlight snippets to 200 characters", () => {
    const longSnippet = "<em>match</em>" + "x".repeat(300)
    const highlights = [{ field: "name", snippet: longSnippet }]
    const result = transformHighlights(highlights)
    expect(result.name).toBeDefined()
    expect(result.name!.length).toBeLessThanOrEqual(200)
  })

  it("handles highlights with value field instead of snippet", () => {
    const highlights = [{ field: "name", value: "<em>Acetone</em>" }]
    const result = transformHighlights(highlights)
    expect(result.name).toBe("<em>Acetone</em>")
  })

  it("skips entries with missing snippet and value", () => {
    const highlights = [{ field: "name" }]
    const result = transformHighlights(highlights)
    expect(result.name).toBeUndefined()
  })

  it("skips entries with non-string snippet", () => {
    const highlights = [{ field: "name", snippet: 123 }]
    const result = transformHighlights(highlights)
    expect(result.name).toBeUndefined()
  })
})
