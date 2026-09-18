# Implementation Plan: Typesense Search Integration

## Overview

This plan implements Typesense as the search engine for the Evolve platform, replacing PostgreSQL `LIKE`-based search. The implementation follows the existing modular architecture pattern and is broken into: connection configuration, collection schema, data synchronization, search query execution with faceting, rate limiting, API wiring, and a frontend search UI component.

## Tasks

- [x] 1. Set up Typesense client configuration and environment validation
  - [x] 1.1 Add Typesense environment variables to config and validation
    - Add `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY` to `src/config/env.ts` with Zod validation (port: integer 1-65535, protocol: "http" | "https")
    - Update `.env.example` with new Typesense variables
    - Log specific error messages identifying each missing/invalid variable and prevent search module initialization on failure
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 1.2 Create Typesense client singleton module
    - Create `src/modules/search/typesense.client.ts` with lazy-initialized singleton Typesense client
    - Define `TypesenseConfig` interface and `ProductDocument` interface
    - Use single-node configuration reading from validated environment variables
    - Handle connection loss by logging warning and attempting reconnect on next request
    - _Requirements: 8.4, 8.5_

  - [ ]* 1.3 Write property test for environment variable validation (Property 11)
    - **Property 11: Environment variable validation**
    - Test that TYPESENSE_PORT is accepted only in [1, 65535], TYPESENSE_PROTOCOL only "http"/"https", missing vars are reported, and initialization is prevented on failure
    - **Validates: Requirements 8.2, 8.3**

- [x] 2. Implement Typesense collection schema and initialization
  - [x] 2.1 Define collection schema and initialization logic
    - Create collection schema definition in `typesense.client.ts` with fields: id (string), name (string), description (string), category (string, facet), brand_name (string, facet), cas_number (string), catalog_number (string), price (float), pack_size (string), stock (int32), default_sorting_field: "stock"
    - Implement `ensureCollection()` function that creates the collection if it doesn't exist, logs and skips if it does
    - Implement retry logic: 3 retries with 2-second fixed delay on connection failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property test for product-to-document mapping (Property 1)
    - **Property 1: Product-to-document mapping preserves all fields**
    - Generate arbitrary Product records with null/non-null optional fields and brand relations, verify transform produces correct document with id match, price as Number(), stock match, nullable strings defaulting to empty string
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [x] 3. Implement data synchronization service
  - [x] 3.1 Create sync service with CRUD operations
    - Create `src/modules/search/sync.service.ts` implementing `indexProduct`, `updateProduct`, `removeProduct` functions
    - Implement PostgreSQL-to-Typesense field mapping (null → empty string for strings, `Number(price)` for Decimal, join brand.name via relation)
    - Implement retry logic: 3 retries with exponential backoff (1s → 2s → 4s) on Typesense unreachable
    - Log error with product ID and skip operation after all retries exhausted without blocking subsequent ops
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 2.7_

  - [x] 3.2 Implement full re-index with alias swap
    - Implement `fullReindex()` function that reads all active products from PostgreSQL, creates a new timestamped collection, bulk-imports documents, then swaps the alias to the new collection
    - Ensure existing collection remains available for search during re-index
    - _Requirements: 2.5_

  - [x] 3.3 Add post-write hooks to existing products service
    - Modify `src/modules/products/products.service.ts` to call sync service after create, update, and remove operations
    - On create: call `indexProduct`; on update: call `updateProduct`; on soft-delete: call `removeProduct`; on reactivation: call `indexProduct`
    - Sync failures must not block the primary CRUD response
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 3.4 Write unit tests for sync service retry logic
    - Mock Typesense client to simulate failures
    - Verify retry count (3), exponential backoff timing (1s, 2s, 4s)
    - Verify error logging with product ID after exhausted retries
    - Verify subsequent operations not blocked
    - _Requirements: 2.6, 2.7_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement search query execution and validation
  - [x] 5.1 Create search validation schemas
    - Create `src/modules/search/search.validation.ts` with Zod schemas for `SearchQuery`: q (string 0-256 chars), page (int >= 1, default 1), per_page (int 1-100, default 20), category (optional string), brand (optional string), min_price (optional >= 0.01), max_price (optional <= 99,999,999.99)
    - Add validation that min_price must not exceed max_price
    - _Requirements: 3.1, 3.5, 4.4, 4.5_

  - [ ]* 5.2 Write property tests for query and pagination validation (Properties 2, 3)
    - **Property 2: Search query length validation**
    - Test strings 1-256 chars accepted, >256 chars rejected
    - **Property 3: Pagination parameter validation**
    - Test per_page accepted in [1, 100], rejected outside, default 20; page accepted >= 1, rejected < 1
    - **Validates: Requirements 3.1, 3.5**

  - [x] 5.3 Implement search service with Typesense query construction
    - Create `src/modules/search/search.service.ts` with `searchProducts()` function
    - Build Typesense multi-search query: search across name, description, cas_number, catalog_number, brand_name fields
    - Enable typo tolerance (num_typos: 2)
    - Handle empty query (q is empty/whitespace): return products sorted by creation date descending
    - Request facets for category and brand_name
    - Set query timeout to 3 seconds; return 503 if Typesense unreachable
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

  - [x] 5.4 Implement filter string builder
    - Create filter builder utility that constructs Typesense `filter_by` string
    - Exact match for category (`category:=value`), brand (`brand_name:=value`), numeric range for price (`price:>=min && price:<=max`)
    - Join multiple filters with ` && ` operator for AND logic
    - _Requirements: 4.2, 4.3, 4.4, 4.6_

  - [ ]* 5.5 Write property tests for filter construction (Properties 5, 6)
    - **Property 5: Filter string construction**
    - Generate arbitrary valid category, brand, price range values; verify syntactically valid filter_by string
    - **Property 6: Combined filter AND logic**
    - Generate 0-3 active filters; verify clauses joined with ` && `
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.6**

- [x] 6. Implement response transformation and formatting
  - [x] 6.1 Implement result and facet response transformers
    - Create response transformer that maps Typesense hits to `SearchResult` objects with all required keys (id, name, slug, description, category, brand_name, price, currency, pack_size, image_url, stock, highlights); missing fields set to null
    - Create facet transformer that maps Typesense `facet_counts` to `{ category: FacetEntry[], brand: FacetEntry[] }`
    - Create metadata transformer mapping `found` → `total`, page, `ceil(found/per_page)` → `total_pages`, `search_time_ms` → `processing_time_ms`
    - _Requirements: 5.1, 5.3, 5.4, 5.5, 4.1, 4.7_

  - [x] 6.2 Implement highlight snippet transformer
    - Extract highlights from Typesense response for name, description, cas_number fields
    - Truncate to maximum 200 characters per field, preserving complete `<em>` tag pairs
    - Wrap matched portions in `<em>` tags
    - _Requirements: 5.2_

  - [ ]* 6.3 Write property tests for response transformers (Properties 4, 7, 8, 9)
    - **Property 4: Facet response transformation**
    - Generate arbitrary facet_counts arrays; verify output preserves all entries with value/count
    - **Property 7: Result transformation completeness**
    - Generate arbitrary hit documents; verify output has exactly required keys with null for missing
    - **Property 8: Highlight snippet truncation**
    - Generate arbitrary highlight strings; verify output ≤ 200 chars with preserved `<em>` tag pairs
    - **Property 9: Response metadata mapping**
    - Generate arbitrary found/page/search_time_ms; verify correct total, page, total_pages, processing_time_ms
    - **Validates: Requirements 4.1, 5.1, 5.2, 5.3, 5.5**

- [x] 7. Implement rate limiting middleware
  - [x] 7.1 Create IP-based sliding window rate limiter
    - Create `src/middleware/rateLimit.ts` with in-memory Map-based sliding window implementation
    - Configure: 60 requests per 60-second window per IP
    - On limit exceeded: return 429 with `Retry-After` header (seconds until window reset) and error message
    - Clean up expired entries periodically to prevent memory leaks
    - _Requirements: 7.3_

  - [ ]* 7.2 Write property test for rate limiter (Property 10)
    - **Property 10: Rate limiter sliding window**
    - Generate arbitrary sequences of request timestamps from single IP; verify allows when < 60 in window, rejects with 429 when >= 60
    - **Validates: Requirements 7.3**

- [x] 8. Wire up search routes and controller
  - [x] 8.1 Create search controller
    - Create `src/modules/search/search.controller.ts` with `search` and `reindex` handler functions
    - `search`: validate params, call search service, return formatted response with 200
    - `reindex`: call fullReindex, return 200 on success
    - Handle empty results: return empty array with total 0 and 200 status
    - Handle validation errors: return 400 with error details
    - _Requirements: 3.4, 4.5, 4.7, 5.4_

  - [x] 8.2 Create search routes with middleware
    - Create `src/modules/search/search.routes.ts` with:
      - `GET /search` — public, rate limited, validation middleware
      - `POST /search/reindex` — authenticate + authorize(admin) middleware
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 8.3 Register search module in app.ts
    - Import and mount search routes in `src/app.ts` as `app.use("/search", searchRoutes)`
    - Trigger `ensureCollection()` on module initialization
    - _Requirements: 1.1, 1.2_

  - [ ]* 8.4 Write unit tests for search controller
    - Test 200 response with correct shape for valid queries
    - Test 400 for invalid params (price min > max, query too long)
    - Test 503 when Typesense unavailable
    - Test 401/403 on re-index endpoint
    - _Requirements: 3.6, 4.5, 7.4, 7.5_

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement frontend search UI component
  - [x] 10.1 Create SearchBar component with debounced input
    - Create `src/components/SearchBar.tsx` in the dashboard project
    - Implement text input with placeholder "Search chemicals by name, CAS number..."
    - Implement 300ms debounce on input before sending search request
    - Display loading indicator while awaiting results
    - Display result list with product name, brand, category, price
    - Navigate to product detail page on result selection
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 10.2 Implement facet filter panel
    - Add filter controls for category, brand, and price range
    - Update results without full page reload when filters applied
    - Send filter parameters to search API and re-render results
    - _Requirements: 6.6_

  - [x] 10.3 Integrate SearchBar into application layout
    - Import and render SearchBar in the main app layout/header
    - Connect navigation handler to react-router-dom
    - _Requirements: 6.4_

- [x] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using `fast-check` with `vitest`
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout (backend and frontend)
- Install `typesense` npm package in backend before starting implementation
- Install `vitest` and `fast-check` as dev dependencies for testing

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3"] },
    { "id": 2, "tasks": ["2.1", "5.1"] },
    { "id": 3, "tasks": ["2.2", "3.1", "5.2", "5.4"] },
    { "id": 4, "tasks": ["3.2", "3.3", "5.3", "5.5", "7.1"] },
    { "id": 5, "tasks": ["3.4", "6.1", "6.2", "7.2"] },
    { "id": 6, "tasks": ["6.3", "8.1"] },
    { "id": 7, "tasks": ["8.2"] },
    { "id": 8, "tasks": ["8.3", "8.4"] },
    { "id": 9, "tasks": ["10.1"] },
    { "id": 10, "tasks": ["10.2"] },
    { "id": 11, "tasks": ["10.3"] }
  ]
}
```
