# Requirements Document

## Introduction

This document defines the requirements for integrating Typesense as the search engine for the Evolve lab chemicals e-commerce platform. The feature replaces the current PostgreSQL `LIKE`-based search with a dedicated search engine that provides fast full-text search, typo tolerance, faceted filtering, and relevance-based ranking for the product catalog.

## Glossary

- **Typesense_Server**: The Typesense search engine instance that indexes and serves search queries
- **Search_Service**: The backend module responsible for communicating with Typesense_Server, managing collections, and handling search requests
- **Search_API**: The Express.js REST endpoint that exposes search functionality to the frontend
- **Product_Collection**: The Typesense collection that mirrors the Product model from the PostgreSQL database
- **Sync_Service**: The component responsible for keeping the Product_Collection in sync with the PostgreSQL products table
- **Search_UI**: The React frontend component that provides the search interface to users
- **Facet**: A filterable attribute (e.g., category, brand, price range) that allows users to narrow search results
- **Query**: The text string entered by a user to search for products

## Requirements

### Requirement 1: Typesense Collection Schema

**User Story:** As a system administrator, I want the product data indexed in Typesense with the correct schema, so that search queries can be executed against structured product data.

#### Acceptance Criteria

1. WHEN the Search_Service initializes, THE Search_Service SHALL create a Product_Collection in Typesense_Server with fields: id (string, primary key), name (string), description (string), category (string), brand name (string), CAS number (string), catalog number (string), price (float), pack size (string), stock (integer), and a default sorting field of stock
2. WHEN the Product_Collection already exists during initialization, THE Search_Service SHALL skip collection creation and log an informational message indicating the collection name and that creation was skipped
3. THE Product_Collection SHALL define name, description, category, brand name, CAS number, and catalog number as string fields with indexing enabled for full-text search, and SHALL mark category and brand name as facetable fields
4. THE Product_Collection SHALL define price as a float field and stock as an integer field, both with indexing enabled, to support numeric filtering and sorting
5. IF the Typesense_Server is unreachable during collection creation, THEN THE Search_Service SHALL log an error message indicating the connection failure and retry up to 3 times with a 2-second delay between attempts before marking initialization as failed

### Requirement 2: Data Synchronization

**User Story:** As a system administrator, I want product data synchronized between PostgreSQL and Typesense, so that search results always reflect the current product catalog.

#### Acceptance Criteria

1. WHEN a new product is created in PostgreSQL, THE Sync_Service SHALL index the product document in the Product_Collection within 5 seconds
2. WHEN a product is updated in PostgreSQL, THE Sync_Service SHALL update the corresponding document in the Product_Collection within 5 seconds
3. WHEN a product is soft-deleted (isActive set to false) in PostgreSQL, THE Sync_Service SHALL remove the corresponding document from the Product_Collection within 5 seconds
4. WHEN a product is reactivated (isActive set from false to true) in PostgreSQL, THE Sync_Service SHALL index the product document in the Product_Collection within 5 seconds
5. WHEN the Sync_Service is triggered with a full re-index command, THE Sync_Service SHALL replace all documents in the Product_Collection with the current active products from PostgreSQL while keeping the existing collection available for search queries until the replacement is complete
6. IF the Typesense_Server is unreachable during a sync operation, THEN THE Sync_Service SHALL log the error and retry the operation up to 3 times with exponential backoff starting at a 1-second initial delay
7. IF all 3 retry attempts fail for a sync operation, THEN THE Sync_Service SHALL log an error indicating the failed operation and the affected product identifier, and skip the operation without blocking subsequent sync operations

### Requirement 3: Search Query Execution

**User Story:** As a customer, I want to search for lab chemicals by name, description, CAS number, or catalog number, so that I can quickly find the products I need.

#### Acceptance Criteria

1. WHEN a user submits a Query of 1 to 256 characters, THE Search_API SHALL return matching products ranked by relevance within 200ms for catalogs of up to 100,000 products
2. WHEN a user submits a Query with typographical errors (up to 2 characters different from a known term), THE Search_Service SHALL return results that match the corrected terms using Typesense typo tolerance
3. WHEN a user submits a Query, THE Search_Service SHALL search across the name, description, CAS number, catalog number, and brand name fields
4. WHEN a user submits a Query that is empty (zero-length string or contains only whitespace characters), THE Search_API SHALL return products sorted by creation date in descending order
5. THE Search_API SHALL support pagination with a page size minimum of 1, default of 20, and maximum of 100
6. IF the Typesense_Server is unreachable when a user submits a Query, THEN THE Search_API SHALL return an error response indicating that search is temporarily unavailable within 3 seconds

### Requirement 4: Faceted Filtering

**User Story:** As a customer, I want to filter search results by category, brand, and price range, so that I can narrow down products to my specific needs.

#### Acceptance Criteria

1. WHEN a user performs a search, THE Search_API SHALL return available facet counts for category and brand alongside the search results, where each facet entry includes the filter value and the count of matching products within the current result set
2. WHEN a user applies a category filter, THE Search_API SHALL return only products matching the selected category and SHALL update the brand facet counts to reflect only products within the selected category
3. WHEN a user applies a brand filter, THE Search_API SHALL return only products matching the selected brand and SHALL update the category facet counts to reflect only products within the selected brand
4. WHEN a user applies a price range filter with a minimum value of at least 0.01 and a maximum value of at most 99,999,999.99, THE Search_API SHALL return only products with a price between the specified minimum and maximum values (inclusive)
5. IF a user applies a price range filter where the minimum value exceeds the maximum value, THEN THE Search_API SHALL return an error response indicating that the minimum price must not exceed the maximum price and SHALL not return any product results
6. WHEN a user combines multiple filters across category, brand, and price range, THE Search_API SHALL apply all filters using AND logic and return only products satisfying every active filter simultaneously
7. IF a user applies a category or brand filter value that matches no products, THEN THE Search_API SHALL return an empty product list with zero total count and SHALL continue to return valid facet counts for the remaining available filters

### Requirement 5: Search Result Response Format

**User Story:** As a frontend developer, I want search results in a consistent and complete format, so that I can render product listings with highlights and metadata.

#### Acceptance Criteria

1. THE Search_API SHALL return each result with the product id, name, slug, description, category, brand name, price, currency, pack size, image URL, and stock count, where optional fields that have no value are returned as null
2. WHEN a search query matches text within a product's name, description, or CAS number field, THE Search_API SHALL return highlight snippets of no more than 200 characters per field, with matched portions wrapped in `<em>` tags
3. THE Search_API SHALL return total result count, current page, total pages, and processing time in milliseconds as a numeric value in the response metadata
4. IF a search query produces no results, THEN THE Search_API SHALL return an empty results array with total count of zero and a 200 HTTP status code
5. THE Search_API SHALL return results in a consistent structure where each result object contains the same set of keys regardless of whether values are populated or null

### Requirement 6: Search UI Component

**User Story:** As a customer, I want a search bar with instant results, so that I can find products without waiting for full page reloads.

#### Acceptance Criteria

1. THE Search_UI SHALL provide a text input field with a placeholder indicating search capability (e.g., "Search chemicals by name, CAS number...")
2. WHEN a user types in the search field, THE Search_UI SHALL debounce input and send a search request after 300ms of inactivity
3. WHEN search results are returned, THE Search_UI SHALL display a list of matching products with name, brand, category, and price
4. WHEN a user selects a product from search results, THE Search_UI SHALL navigate to the product detail page
5. WHILE the Search_UI is waiting for search results, THE Search_UI SHALL display a loading indicator
6. WHEN a user applies facet filters, THE Search_UI SHALL update the displayed results without a full page reload

### Requirement 7: Search API Authentication and Rate Limiting

**User Story:** As a system administrator, I want search endpoints properly secured, so that the system is protected from abuse.

#### Acceptance Criteria

1. THE Search_API SHALL be accessible without authentication for product search queries (public endpoint)
2. THE Search_API SHALL require admin authentication (valid Bearer token with admin role) for triggering full re-index operations
3. IF a client identified by IP address exceeds 60 search requests within a 1-minute sliding window, THEN THE Search_API SHALL respond with HTTP 429 status code, a Retry-After header indicating the number of seconds until the client may retry, and a response body containing an error message indicating the rate limit has been exceeded
4. IF a request to the re-index endpoint is made without a valid authentication token, THEN THE Search_API SHALL respond with HTTP 401 status code and an error message indicating authentication is required
5. IF a request to the re-index endpoint is made by an authenticated user without the admin role, THEN THE Search_API SHALL respond with HTTP 403 status code and an error message indicating insufficient permissions

### Requirement 8: Typesense Connection Configuration

**User Story:** As a developer, I want Typesense connection details managed through environment variables, so that the configuration is portable across environments.

#### Acceptance Criteria

1. THE Search_Service SHALL read the Typesense host, port, protocol, and API key from environment variables named TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, and TYPESENSE_API_KEY respectively
2. IF any of the required Typesense environment variables (TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_API_KEY) are missing or invalid at startup, THEN THE Search_Service SHALL log an error message identifying each variable that is missing or invalid and prevent the search module from initializing
3. THE Search_Service SHALL validate that TYPESENSE_PORT is an integer between 1 and 65535 and that TYPESENSE_PROTOCOL is either "http" or "https"
4. THE Search_Service SHALL support connecting to a single-node Typesense_Server configuration
5. IF the Typesense_Server connection is lost during runtime, THEN THE Search_Service SHALL log a warning and attempt to reconnect on the next incoming request
