# Requirements Document

## Introduction

This document defines the requirements for Evolve Life Sciences' B2B e-commerce platform for reselling laboratory chemicals, reagents, instruments, and consumables. The platform serves research institutions, universities, pharmaceutical companies, diagnostic labs, and CROs across India. It enables product discovery, quotation requests, order placement, GST-compliant invoicing, vendor management, and cold-chain logistics coordination.

## Glossary

- **Platform**: The Evolve Life Sciences e-commerce web application comprising the React/Next.js frontend, Supabase backend services, and the Spring Boot/Node.js API layer.
- **Buyer**: An authenticated user representing a research institution, university, pharmaceutical company, hospital, diagnostic lab, or CRO who browses, quotes, and orders products.
- **Admin**: An internal Evolve Life Sciences staff member with elevated privileges to manage products, vendors, orders, pricing, and platform configuration.
- **Seller**: Evolve Life Sciences — the sole operator and reseller on the Platform, sourcing products from manufacturers (e.g., Thermo Fisher, Sigma-Aldrich, HiMedia) and selling to Buyers.
- **Product_Catalog**: The service responsible for storing, indexing, and serving product information including chemicals, reagents, instruments, and consumables.
- **Cart_Service**: The service managing a Buyer's selected items, quantities, and pack sizes prior to order placement.
- **Order_Service**: The service responsible for creating, tracking, and managing purchase orders through their lifecycle.
- **Pricing_Engine**: The service that calculates product prices including bulk discounts, rate-contract pricing, and institutional pricing tiers.
- **Invoice_Service**: The service that generates GST-compliant tax invoices and related financial documents.
- **Payment_Gateway**: The external service integration that processes online payments (UPI, NEFT, credit/debit cards).
- **Shipping_Service**: The service coordinating logistics, cold-chain dispatch, and delivery tracking.
- **Manufacturer**: An external company (e.g., Thermo Fisher, Sigma-Aldrich, HiMedia) from whom the Seller procures products for resale.
- **Auth_Service**: The Supabase-based authentication and authorisation service managing user sessions and role-based access.
- **Notification_Service**: The service dispatching transactional emails, SMS alerts, and in-app notifications to Buyers and Admins.
- **Quote_Service**: The service handling formal quotation requests, generation, and approval workflows.
- **Inventory_Service**: The service tracking real-time stock levels, reorder points, and availability status per product and pack size.
- **Search_Service**: The service providing full-text search, faceted filtering, and autocomplete across the product catalogue.
- **CoA**: Certificate of Analysis — batch-specific quality documentation accompanying chemical shipments.
- **MSDS**: Material Safety Data Sheet — hazard and handling documentation for chemical products.
- **GST**: Goods and Services Tax — Indian indirect tax applied to product sales.
- **HSN_Code**: Harmonised System Nomenclature code used for GST classification of products.
- **GeM**: Government e-Marketplace — Indian government procurement portal.
- **Rate_Contract**: A pre-negotiated annual pricing agreement between Evolve and an institutional Buyer.
- **Cold_Chain**: Temperature-controlled logistics for sensitive products like FBS, enzymes, and antibodies.

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a Buyer, I want to register and authenticate on the Platform, so that I can access institutional pricing and place orders.

#### Acceptance Criteria

1. WHEN a Buyer submits a registration form with organisation name, GST number, email, phone, and password, THE Auth_Service SHALL create a new account and send an email verification link.
2. WHEN a Buyer clicks the email verification link within 24 hours, THE Auth_Service SHALL activate the account and redirect the Buyer to the login page.
3. IF a Buyer submits a registration form with an already-registered email, THEN THE Auth_Service SHALL display an error message indicating the email is already in use.
4. WHEN a Buyer submits valid credentials on the login form, THE Auth_Service SHALL authenticate the Buyer and establish a session with a JWT token.
5. IF a Buyer submits invalid credentials three consecutive times, THEN THE Auth_Service SHALL lock the account for 15 minutes and notify the Buyer via email.
6. WHEN a Buyer requests a password reset, THE Auth_Service SHALL send a reset link valid for 1 hour to the registered email.
7. THE Auth_Service SHALL support role-based access control with at minimum the roles: Buyer and Admin.

### Requirement 2: Product Catalogue Management

**User Story:** As an Admin, I want to manage the product catalogue, so that Buyers can discover and order available laboratory products.

#### Acceptance Criteria

1. THE Product_Catalog SHALL store for each product: name, CAS number (where applicable), catalogue number, brand, category, grade/purity, pack sizes, unit price per pack size, HSN code, storage conditions, and availability status.
2. WHEN an Admin creates or updates a product, THE Product_Catalog SHALL validate that all mandatory fields are populated before saving.
3. WHEN an Admin uploads a CoA or MSDS document for a product batch, THE Product_Catalog SHALL associate the document with the specific product and batch number.
4. THE Product_Catalog SHALL organise products into the categories: Laboratory Chemicals, Organic Chemicals, Inorganic Chemicals, Analytical Reagents, Cell Culture Media, Antibodies, Fetal Bovine Serum, ELISA Kits, Molecular Biology Reagents, Proteins and Enzymes, Laboratory Glassware, Laboratory Instruments, and Scientific Consumables.
5. WHEN an Admin marks a product as discontinued, THE Product_Catalog SHALL remove the product from search results and display a "Discontinued" label on the product detail page.

### Requirement 3: Product Search and Discovery

**User Story:** As a Buyer, I want to search and filter the product catalogue, so that I can find the specific chemicals and reagents I need.

#### Acceptance Criteria

1. WHEN a Buyer enters a search query, THE Search_Service SHALL return matching products ranked by relevance within 500 milliseconds.
2. THE Search_Service SHALL support search by product name, CAS number, catalogue number, brand name, and category.
3. WHEN a Buyer applies faceted filters (category, brand, grade, price range, availability), THE Search_Service SHALL return only products matching all active filters.
4. WHEN a Buyer types at least 3 characters in the search box, THE Search_Service SHALL display autocomplete suggestions within 300 milliseconds.
5. IF a search query returns zero results, THEN THE Search_Service SHALL suggest alternative search terms or related categories.

### Requirement 4: Product Detail Display

**User Story:** As a Buyer, I want to view complete product details, so that I can verify specifications before ordering.

#### Acceptance Criteria

1. WHEN a Buyer navigates to a product detail page, THE Platform SHALL display: product name, brand, catalogue number, CAS number, grade/purity, molecular formula (where applicable), available pack sizes with prices, storage conditions, and availability status.
2. WHEN a CoA or MSDS document exists for a product, THE Platform SHALL provide a download link for each available document.
3. WHEN a product requires cold-chain shipping, THE Platform SHALL display a visible cold-chain indicator on the product detail page.
4. THE Platform SHALL display the GST rate and HSN code applicable to the product.

### Requirement 5: Shopping Cart Management

**User Story:** As a Buyer, I want to manage a shopping cart, so that I can collect multiple items before placing an order.

#### Acceptance Criteria

1. WHEN a Buyer adds a product with a selected pack size and quantity to the cart, THE Cart_Service SHALL store the item and update the cart total.
2. WHEN a Buyer modifies the quantity of a cart item, THE Cart_Service SHALL recalculate the line-item subtotal and cart total within 1 second.
3. WHEN a Buyer removes an item from the cart, THE Cart_Service SHALL remove the item and recalculate the cart total.
4. THE Cart_Service SHALL persist cart contents across sessions for authenticated Buyers.
5. WHEN a Buyer views the cart, THE Cart_Service SHALL display current unit price, quantity, line-item subtotal, applicable GST, and grand total.
6. IF a product in the cart becomes unavailable, THEN THE Cart_Service SHALL flag the item with an "Out of Stock" indicator and exclude the item from the cart total.

### Requirement 6: Quotation Workflow

**User Story:** As a Buyer, I want to request formal quotations, so that I can obtain institutional pricing and support procurement processes.

#### Acceptance Criteria

1. WHEN a Buyer submits a quotation request specifying products, quantities, and delivery address, THE Quote_Service SHALL create a quote request and notify the Admin.
2. WHEN an Admin generates a quotation, THE Quote_Service SHALL produce a PDF document containing: quote number, validity period, itemised products with prices, applicable GST, delivery terms, and payment terms.
3. THE Quote_Service SHALL assign a validity period of 30 days to each generated quotation unless the Admin specifies a different period.
4. WHEN a Buyer accepts a quotation, THE Quote_Service SHALL convert the quotation into a pre-filled order for the Buyer to confirm.
5. IF a quotation expires without acceptance, THEN THE Quote_Service SHALL mark the quotation as expired and notify the Buyer.

### Requirement 7: Order Placement and Management

**User Story:** As a Buyer, I want to place and track orders, so that I can procure laboratory supplies reliably.

#### Acceptance Criteria

1. WHEN a Buyer confirms an order from the cart or an accepted quotation, THE Order_Service SHALL create an order with a unique order number and status "Confirmed".
2. THE Order_Service SHALL support the order lifecycle statuses: Confirmed, Processing, Dispatched, In Transit, Delivered, and Cancelled.
3. WHEN the status of an order changes, THE Notification_Service SHALL send an email and SMS notification to the Buyer with the updated status.
4. WHEN a Buyer views the order history page, THE Order_Service SHALL display all past orders with order number, date, status, total amount, and a link to order details.
5. WHEN a Buyer requests cancellation of an order with status "Confirmed" or "Processing", THE Order_Service SHALL cancel the order and initiate a refund if payment has been received.
6. IF a Buyer requests cancellation of an order with status "Dispatched" or "In Transit", THEN THE Order_Service SHALL reject the cancellation request and display a message explaining the order has already shipped.

### Requirement 8: Pricing and Discounts

**User Story:** As a Buyer, I want to see accurate pricing including volume discounts and institutional rates, so that I can make informed purchasing decisions.

#### Acceptance Criteria

1. THE Pricing_Engine SHALL calculate product prices based on: base price, applicable volume discount tier, and institutional rate-contract pricing (if active for the Buyer).
2. WHEN a Buyer's cart quantity for a product meets a volume discount threshold, THE Pricing_Engine SHALL apply the corresponding discount and display the savings.
3. WHILE a Rate_Contract is active for a Buyer, THE Pricing_Engine SHALL apply the contract-negotiated prices for all products covered by the contract.
4. THE Pricing_Engine SHALL add GST at the applicable rate based on the product HSN code to each line item.
5. WHEN an Admin updates a product base price, THE Pricing_Engine SHALL reflect the new price on the product detail page and in all active carts within 5 minutes.

### Requirement 9: Payment Processing

**User Story:** As a Buyer, I want to pay for orders through secure payment methods, so that I can complete procurement transactions.

#### Acceptance Criteria

1. THE Platform SHALL support payment methods: UPI, NEFT/RTGS bank transfer, credit card, debit card, and purchase order (for approved institutional accounts).
2. WHEN a Buyer selects an online payment method, THE Payment_Gateway SHALL process the payment and return a success or failure status within 60 seconds.
3. WHEN a payment is successful, THE Order_Service SHALL update the order payment status to "Paid" and trigger order processing.
4. IF a payment fails, THEN THE Platform SHALL display a clear error message and allow the Buyer to retry or select an alternative payment method.
5. WHEN a Buyer's institution has an approved credit account, THE Platform SHALL allow order placement against a purchase order number with payment due within the agreed credit period.
6. THE Payment_Gateway SHALL comply with PCI-DSS standards for card payment data handling.

### Requirement 10: GST-Compliant Invoicing

**User Story:** As a Buyer, I want to receive GST-compliant invoices, so that I can claim input tax credit and maintain accounting records.

#### Acceptance Criteria

1. WHEN an order is dispatched, THE Invoice_Service SHALL generate a GST-compliant tax invoice containing: invoice number, date, Seller GSTIN, Buyer GSTIN, HSN codes, taxable value, CGST, SGST, IGST (as applicable), and total.
2. THE Invoice_Service SHALL determine whether to apply CGST+SGST or IGST based on the Seller and Buyer state codes.
3. WHEN a Buyer downloads an invoice, THE Invoice_Service SHALL provide the invoice as a PDF document.
4. THE Invoice_Service SHALL generate sequential invoice numbers without gaps within a financial year.
5. WHEN an order is partially shipped, THE Invoice_Service SHALL generate a separate invoice for each shipment containing only the dispatched items.

### Requirement 11: Inventory Management

**User Story:** As an Admin, I want to track inventory levels, so that I can ensure product availability and timely restocking.

#### Acceptance Criteria

1. THE Inventory_Service SHALL maintain real-time stock quantities for each product and pack size combination.
2. WHEN an order is confirmed, THE Inventory_Service SHALL decrement the available stock by the ordered quantity.
3. WHEN stock for a product falls below the configured reorder point, THE Inventory_Service SHALL generate a restock alert and notify the Admin.
4. WHEN an Admin updates stock levels (receiving new inventory), THE Inventory_Service SHALL record the stock addition with batch number, expiry date, and quantity.
5. IF a Buyer attempts to add a quantity exceeding available stock to the cart, THEN THE Cart_Service SHALL limit the quantity to available stock and display a notification.

### Requirement 12: Supplier Procurement Tracking

**User Story:** As an Admin, I want to track procurement from manufacturers, so that I can manage purchasing and maintain supply continuity.

#### Acceptance Criteria

1. THE Platform SHALL store for each Manufacturer: company name, contact person, email, phone, product categories supplied, typical lead times, and payment terms.
2. WHEN an Admin creates a purchase order for a Manufacturer, THE Platform SHALL generate a PO document with itemised products, quantities, agreed prices, and expected delivery date.
3. WHEN an Admin receives stock from a Manufacturer, THE Platform SHALL record the goods receipt with batch details, expiry dates, and quantities against the purchase order.
4. THE Platform SHALL track procurement metrics per Manufacturer: on-time delivery rate and average lead time.

### Requirement 13: Shipping and Logistics

**User Story:** As a Buyer, I want reliable shipping with tracking, so that I can receive products safely and on time.

#### Acceptance Criteria

1. WHEN an order is dispatched, THE Shipping_Service SHALL generate a tracking number and provide it to the Buyer via email and on the order detail page.
2. WHEN a product requires cold-chain shipping, THE Shipping_Service SHALL assign a cold-chain logistics partner and include temperature monitoring documentation.
3. THE Shipping_Service SHALL calculate shipping charges based on: destination pincode, total weight, package dimensions, and cold-chain requirement.
4. WHEN a Buyer views shipment tracking, THE Shipping_Service SHALL display current shipment location, estimated delivery date, and delivery status history.
5. IF a shipment is delayed beyond the estimated delivery date, THEN THE Notification_Service SHALL alert the Buyer with an updated estimated delivery date.

### Requirement 14: Notifications and Communications

**User Story:** As a Buyer, I want to receive timely notifications about my orders and account, so that I stay informed throughout the procurement process.

#### Acceptance Criteria

1. THE Notification_Service SHALL send transactional notifications via email for: registration confirmation, order confirmation, payment receipt, dispatch confirmation, delivery confirmation, and invoice availability.
2. THE Notification_Service SHALL send SMS notifications for: order dispatch, out-for-delivery status, and delivery confirmation.
3. WHEN a Buyer configures notification preferences, THE Notification_Service SHALL respect the preferences for optional notifications while maintaining mandatory transactional notifications.
4. THE Notification_Service SHALL send all email notifications within 2 minutes of the triggering event.

### Requirement 15: Admin Dashboard and Reporting

**User Story:** As an Admin, I want a dashboard with analytics and reports, so that I can monitor business performance and make informed decisions.

#### Acceptance Criteria

1. THE Platform SHALL display an Admin dashboard showing: total orders today, revenue today, pending orders, low-stock alerts, and pending quotation requests.
2. WHEN an Admin requests a sales report for a date range, THE Platform SHALL generate a report containing: total revenue, order count, top-selling products, and revenue by category.
3. WHEN an Admin requests a GST report for a tax period, THE Platform SHALL generate a report containing: CGST collected, SGST collected, IGST collected, and HSN-wise summary.
4. THE Platform SHALL provide an inventory report showing: current stock levels, products below reorder point, batch expiry dates within 90 days, and slow-moving items.

### Requirement 16: Regulatory and Compliance

**User Story:** As a platform operator, I want to ensure regulatory compliance, so that the business operates within Indian legal requirements.

#### Acceptance Criteria

1. THE Platform SHALL restrict the sale of regulated chemicals to Buyers who have uploaded valid permits or licences as required by Indian regulations.
2. WHEN a Buyer orders a product classified as a hazardous substance, THE Platform SHALL include MSDS documentation and comply with applicable hazardous goods shipping regulations.
3. THE Platform SHALL maintain an audit trail of all order, payment, and inventory transactions with timestamps and user identifiers, retained for a minimum of 8 financial years.
4. THE Platform SHALL display terms and conditions, privacy policy, and return/refund policy accessible from every page.
