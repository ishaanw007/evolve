/**
 * Highlight snippet transformer for Typesense search results.
 *
 * Extracts highlights from a Typesense hit's `highlights` array and returns
 * an object with optional highlight snippets for name, description, and cas_number.
 * Truncates to a maximum of 200 characters per field while preserving complete
 * `<em>` tag pairs.
 */

export interface SearchHighlight {
  name?: string
  description?: string
  cas_number?: string
}

/** Fields we extract highlights for */
const HIGHLIGHT_FIELDS = ["name", "description", "cas_number"] as const

/**
 * Truncates a highlighted string to the specified maximum length while
 * preserving complete `<em>` tag pairs.
 *
 * If the text is already within maxLength, returns it unchanged.
 * If truncation is needed, it finds the longest valid prefix that:
 * - Does not exceed maxLength characters
 * - Does not split inside an `<em>` or `</em>` tag
 * - Contains only complete `<em>`...`</em>` pairs (no unclosed tags)
 */
export function truncateWithTags(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text
  }

  // Find a valid truncation point at or before maxLength
  let truncated = text.slice(0, maxLength)

  // Check if we cut inside a tag (< without matching >)
  // Walk backward to ensure we don't end in the middle of a tag
  const lastOpenAngle = truncated.lastIndexOf("<")
  const lastCloseAngle = truncated.lastIndexOf(">")

  if (lastOpenAngle > lastCloseAngle) {
    // We're inside a tag — truncate before this tag starts
    truncated = truncated.slice(0, lastOpenAngle)
  }

  // Now ensure all <em> tags are properly paired.
  // Count open and close tags in the truncated string.
  const openTags = truncated.match(/<em>/g)
  const closeTags = truncated.match(/<\/em>/g)
  const openCount = openTags ? openTags.length : 0
  const closeCount = closeTags ? closeTags.length : 0

  if (openCount > closeCount) {
    // There are unclosed <em> tags. We have two options:
    // 1. Remove the last unclosed <em> and everything after it
    // 2. Append </em> to close it (but that could exceed maxLength)
    // We'll remove content back to the last unmatched <em> tag
    let result = truncated
    let excess = openCount - closeCount

    while (excess > 0) {
      const lastOpen = result.lastIndexOf("<em>")
      if (lastOpen === -1) break
      // Remove from the last <em> tag to the end
      result = result.slice(0, lastOpen)
      excess--
    }

    truncated = result
  }

  return truncated
}

/**
 * Transforms a Typesense hit's `highlights` array into a SearchHighlight object.
 *
 * @param highlights - The `highlights` array from a Typesense search hit.
 *   Each entry has at minimum `{ field: string, snippet?: string }`.
 * @returns An object with optional highlighted snippets for name, description, cas_number.
 */
export function transformHighlights(highlights: any[]): SearchHighlight {
  const result: SearchHighlight = {}

  if (!highlights || !Array.isArray(highlights)) {
    return result
  }

  for (const highlight of highlights) {
    const field = highlight?.field
    const snippet = highlight?.snippet ?? highlight?.value

    if (!field || !snippet || typeof snippet !== "string") {
      continue
    }

    if (HIGHLIGHT_FIELDS.includes(field as (typeof HIGHLIGHT_FIELDS)[number])) {
      const truncated = truncateWithTags(snippet, 200)
      if (truncated.length > 0) {
        result[field as keyof SearchHighlight] = truncated
      }
    }
  }

  return result
}
