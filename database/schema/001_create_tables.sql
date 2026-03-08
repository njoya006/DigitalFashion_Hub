-- ================================================================
-- DIGITALFASHION HUB — Complete Database Schema
-- ICT 3212: Advanced Database Systems
-- ICT University, Cameroon — 2026
-- Built on GlobalMart template by Engr. Daniel MOUNE
-- ================================================================

-- ----------------------------------------------------------------
-- SECTION 1: Database Creation
-- ----------------------------------------------------------------
CREATE DATABASE digitalfashion_hub;
\c digitalfashion_hub;

-- ----------------------------------------------------------------
-- SECTION 2: Extensions
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";  -- enables gen_random_uuid()

-- ================================================================
-- SECTION 3: Currencies & Exchange Rates
-- ================================================================

-- Supported currencies on the platform
CREATE TABLE Currencies (
    currency_code CHAR(3)      PRIMARY KEY,
    currency_name VARCHAR(50)  NOT NULL,
    symbol        VARCHAR(10),
    is_active     BOOLEAN      DEFAULT TRUE
);

-- Historical and current exchange rates (all rates relative to USD base)
CREATE TABLE Exchange_Rates (
    rate_id        SERIAL        PRIMARY KEY,
    from_currency  CHAR(3)       NOT NULL REFERENCES Currencies(currency_code) ON DELETE RESTRICT,
    to_currency    CHAR(3)       NOT NULL REFERENCES Currencies(currency_code) ON DELETE RESTRICT,
    rate           DECIMAL(18,6) NOT NULL CHECK (rate > 0),
    effective_date TIMESTAMP     NOT NULL DEFAULT NOW(),
    source         VARCHAR(50)   DEFAULT 'OpenExchangeRates',
    UNIQUE (from_currency, to_currency, effective_date),
    CHECK  (from_currency <> to_currency)
);

-- ================================================================
-- SECTION 4: Roles & Users
-- ================================================================

-- User roles for platform access control
CREATE TABLE Roles (
    role_id     SERIAL      PRIMARY KEY,
    role_name   VARCHAR(20) UNIQUE NOT NULL,  -- 'ADMIN', 'SELLER', 'CUSTOMER'
    description TEXT
);

-- Unified authentication table for all user types
CREATE TABLE Users (
    user_id       UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id       INT          REFERENCES Roles(role_id) ON DELETE RESTRICT,
    full_name     VARCHAR(150) NOT NULL,
    phone         VARCHAR(20),
    avatar_url    TEXT,
    is_verified   BOOLEAN      DEFAULT FALSE,
    is_active     BOOLEAN      DEFAULT TRUE,
    created_at    TIMESTAMP    DEFAULT NOW(),
    last_login    TIMESTAMP,
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- ================================================================
-- SECTION 5: Customer Tiers & Customers
-- ================================================================

-- Loyalty tier definitions (Standard / Premium / VIP)
CREATE TABLE Customer_Tiers (
    tier_id             INT          PRIMARY KEY,
    tier_name           VARCHAR(20)  NOT NULL,
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage BETWEEN 0 AND 100),
    min_lifetime_value  DECIMAL(12,2) DEFAULT 0,
    perks               TEXT,        -- human-readable description of tier benefits
    badge_color         VARCHAR(20)  -- e.g. '#C0C0C0' Silver, '#FFD700' Gold, '#E5E4E2' Platinum
);

-- Customer profiles — extends Users with commerce-specific data
CREATE TABLE Customers (
    customer_id        UUID          PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    tier_id            INT           REFERENCES Customer_Tiers(tier_id) ON DELETE SET NULL,
    phone              VARCHAR(20),
    preferred_currency CHAR(3)       REFERENCES Currencies(currency_code) ON DELETE SET NULL,
    loyalty_points     INT           DEFAULT 0    CHECK (loyalty_points >= 0),
    lifetime_value     DECIMAL(12,2) DEFAULT 0.00 CHECK (lifetime_value >= 0),
    date_of_birth      DATE,
    registered_date    DATE          DEFAULT CURRENT_DATE
);

-- ================================================================
-- SECTION 6: Sellers
-- ================================================================

-- Seller/vendor profiles — extends Users with store data
CREATE TABLE Sellers (
    seller_id         UUID          PRIMARY KEY REFERENCES Users(user_id) ON DELETE CASCADE,
    store_name        VARCHAR(150)  UNIQUE NOT NULL,
    store_logo_url    TEXT,
    store_description TEXT,
    commission_rate   DECIMAL(5,2)  DEFAULT 10.00 CHECK (commission_rate BETWEEN 0 AND 100),
    is_approved       BOOLEAN       DEFAULT FALSE,
    rating            DECIMAL(3,2)  DEFAULT 0.00  CHECK (rating BETWEEN 0.00 AND 5.00),
    total_sales       DECIMAL(14,2) DEFAULT 0.00  CHECK (total_sales >= 0)
);

-- ================================================================
-- SECTION 7: Addresses
-- ================================================================

-- Shipping and billing addresses associated with a user account
CREATE TABLE Addresses (
    address_id  SERIAL       PRIMARY KEY,
    user_id     UUID         NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    label       VARCHAR(30)  DEFAULT 'Home',  -- 'Home', 'Office', 'Other'
    street      VARCHAR(200) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    postal_code VARCHAR(20),
    country     VARCHAR(100) NOT NULL,
    is_default  BOOLEAN      DEFAULT FALSE
);

-- ================================================================
-- SECTION 8: Categories
-- ================================================================

-- Hierarchical product categories with unlimited nesting (self-referencing)
CREATE TABLE Categories (
    category_id        SERIAL       PRIMARY KEY,
    parent_category_id INT          REFERENCES Categories(category_id) ON DELETE SET NULL,
    category_name      VARCHAR(100) NOT NULL,
    slug               VARCHAR(120) UNIQUE NOT NULL,
    icon_url           TEXT,
    display_order      INT          DEFAULT 0
);

-- ================================================================
-- SECTION 9: Products & Attributes
-- ================================================================

-- Core product catalog listed by sellers
CREATE TABLE Products (
    product_id    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id     UUID          NOT NULL REFERENCES Sellers(seller_id)    ON DELETE RESTRICT,
    category_id   INT           REFERENCES Categories(category_id)         ON DELETE SET NULL,
    currency_code CHAR(3)       NOT NULL REFERENCES Currencies(currency_code) ON DELETE RESTRICT,
    product_name  VARCHAR(200)  NOT NULL,
    slug          VARCHAR(220)  UNIQUE NOT NULL,
    description   TEXT,
    base_price    DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
    sku           VARCHAR(100)  UNIQUE NOT NULL,
    brand         VARCHAR(100),
    is_published  BOOLEAN       DEFAULT FALSE,
    is_featured   BOOLEAN       DEFAULT FALSE,
    tags          TEXT[],                    -- e.g. ARRAY['luxury','winter','wool']
    meta_json     JSONB,                     -- SEO metadata, extra structured data
    created_at    TIMESTAMP     DEFAULT NOW(),
    updated_at    TIMESTAMP     DEFAULT NOW()
);

-- Reusable attribute definitions for the EAV pattern
CREATE TABLE Attributes (
    attribute_id   SERIAL      PRIMARY KEY,
    attribute_name VARCHAR(50) NOT NULL UNIQUE,
    data_type      VARCHAR(20) DEFAULT 'text' CHECK (data_type IN ('text','number','boolean','list')),
    unit           VARCHAR(20)   -- e.g. 'cm', 'kg', 'L', 'inch'
);

-- EAV junction: stores attribute values per product
CREATE TABLE Product_Attributes (
    product_id   UUID         NOT NULL REFERENCES Products(product_id)   ON DELETE CASCADE,
    attribute_id INT          NOT NULL REFERENCES Attributes(attribute_id) ON DELETE CASCADE,
    value        VARCHAR(100) NOT NULL,
    PRIMARY KEY (product_id, attribute_id)
);

-- ================================================================
-- SECTION 10: Product Variants & Images
-- ================================================================

-- Product variants for size, color, and material combinations
CREATE TABLE Product_Variants (
    variant_id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id       UUID          NOT NULL REFERENCES Products(product_id) ON DELETE CASCADE,
    variant_name     VARCHAR(100)  NOT NULL,       -- e.g. 'L / Navy Blue / Cotton'
    extra_attributes JSONB,                        -- hybrid: flexible variant-specific attrs
    price_modifier   DECIMAL(10,2) DEFAULT 0.00,  -- added to product base_price
    sku              VARCHAR(100)  UNIQUE NOT NULL,
    is_active        BOOLEAN       DEFAULT TRUE
);

-- Product and variant images (multiple per product, one primary)
CREATE TABLE Product_Images (
    image_id      SERIAL      PRIMARY KEY,
    product_id    UUID        NOT NULL REFERENCES Products(product_id)          ON DELETE CASCADE,
    variant_id    UUID        REFERENCES Product_Variants(variant_id)           ON DELETE SET NULL,
    image_url     TEXT        NOT NULL,
    alt_text      VARCHAR(200),
    display_order INT         DEFAULT 0,
    is_primary    BOOLEAN     DEFAULT FALSE
);

-- ================================================================
-- SECTION 11: Warehouses & Inventory
-- ================================================================

-- Global fulfillment warehouse locations
CREATE TABLE Warehouses (
    warehouse_id  INT          PRIMARY KEY,
    location      VARCHAR(100) NOT NULL,
    city          VARCHAR(100),
    country       VARCHAR(100),
    capacity      INT          CHECK (capacity > 0),
    manager_name  VARCHAR(100),
    contact_email VARCHAR(255),
    is_active     BOOLEAN      DEFAULT TRUE
);

-- Inventory tracked at variant + warehouse level (most granular)
CREATE TABLE Inventory (
    inventory_id      SERIAL    PRIMARY KEY,
    variant_id        UUID      NOT NULL REFERENCES Product_Variants(variant_id) ON DELETE CASCADE,
    warehouse_id      INT       NOT NULL REFERENCES Warehouses(warehouse_id)     ON DELETE RESTRICT,
    quantity_on_hand  INT       DEFAULT 0  CHECK (quantity_on_hand >= 0),
    reorder_threshold INT       DEFAULT 10 CHECK (reorder_threshold >= 0),
    reorder_quantity  INT       DEFAULT 50 CHECK (reorder_quantity > 0),
    last_restocked    TIMESTAMP,
    UNIQUE (variant_id, warehouse_id)
);

-- ================================================================
-- SECTION 12: Reorder Requests
-- ================================================================

-- Auto-generated by trigger when inventory falls below reorder_threshold
CREATE TABLE Reorder_Requests (
    request_id         SERIAL      PRIMARY KEY,
    inventory_id       INT         NOT NULL REFERENCES Inventory(inventory_id) ON DELETE CASCADE,
    requested_quantity INT         NOT NULL CHECK (requested_quantity > 0),
    status             VARCHAR(20) DEFAULT 'PENDING'
                                   CHECK (status IN ('PENDING','APPROVED','FULFILLED','CANCELLED')),
    created_at         TIMESTAMP   DEFAULT NOW(),
    fulfilled_at       TIMESTAMP
);

-- ================================================================
-- SECTION 13: Coupons
-- ================================================================

-- Discount codes with percent or fixed value, usage limits, and validity windows
CREATE TABLE Coupons (
    coupon_id       SERIAL        PRIMARY KEY,
    code            VARCHAR(30)   UNIQUE NOT NULL,
    discount_type   VARCHAR(10)   NOT NULL CHECK (discount_type IN ('PERCENT','FIXED')),
    discount_value  DECIMAL(10,2) NOT NULL CHECK (discount_value > 0),
    min_order_value DECIMAL(10,2) DEFAULT 0 CHECK (min_order_value >= 0),
    max_uses        INT,                    -- NULL = unlimited
    used_count      INT           DEFAULT 0 CHECK (used_count >= 0),
    valid_from      TIMESTAMP,
    valid_until     TIMESTAMP,
    is_active       BOOLEAN       DEFAULT TRUE,
    CHECK (max_uses IS NULL OR used_count <= max_uses),
    CHECK (valid_from IS NULL OR valid_until IS NULL OR valid_from < valid_until)
);

-- ================================================================
-- SECTION 14: Orders & Order Items
-- ================================================================

-- Human-readable order number sequence: DF-1000, DF-1001, ...
CREATE SEQUENCE order_seq START 1000;

-- Customer orders with full financial snapshot at time of purchase
CREATE TABLE Orders (
    order_id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number        VARCHAR(20)   UNIQUE DEFAULT ('DF-' || nextval('order_seq')::TEXT),
    customer_id         UUID          NOT NULL REFERENCES Customers(customer_id)  ON DELETE RESTRICT,
    coupon_id           INT           REFERENCES Coupons(coupon_id)               ON DELETE SET NULL,
    shipping_address_id INT           REFERENCES Addresses(address_id)            ON DELETE SET NULL,
    currency_code       CHAR(3)       NOT NULL REFERENCES Currencies(currency_code) ON DELETE RESTRICT,
    exchange_rate_used  DECIMAL(18,6) NOT NULL DEFAULT 1.000000,  -- snapshot at order time
    order_date          TIMESTAMP     DEFAULT NOW(),
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    discount_amount     DECIMAL(12,2) DEFAULT 0           CHECK (discount_amount >= 0),
    shipping_cost       DECIMAL(10,2) DEFAULT 0           CHECK (shipping_cost >= 0),
    tax_amount          DECIMAL(10,2) DEFAULT 0           CHECK (tax_amount >= 0),
    total_amount        DECIMAL(12,2) NOT NULL             CHECK (total_amount >= 0),
    total_amount_usd    DECIMAL(12,2),                    -- base-currency equivalent snapshot
    status              VARCHAR(20)   DEFAULT 'PENDING'
                                      CHECK (status IN ('PENDING','CONFIRMED','PROCESSING',
                                                        'SHIPPED','DELIVERED','CANCELLED','REFUNDED')),
    notes               TEXT,
    updated_at          TIMESTAMP     DEFAULT NOW()
);

-- Individual line items within an order
CREATE TABLE Order_Items (
    order_id              UUID          NOT NULL REFERENCES Orders(order_id)           ON DELETE CASCADE,
    line_number           INT           NOT NULL,
    variant_id            UUID          NOT NULL REFERENCES Product_Variants(variant_id) ON DELETE RESTRICT,
    warehouse_id          INT           REFERENCES Warehouses(warehouse_id)             ON DELETE SET NULL,
    quantity              INT           NOT NULL CHECK (quantity > 0),
    unit_price            DECIMAL(12,2) NOT NULL CHECK (unit_price >= 0),
    tier_discount_applied DECIMAL(5,2)  DEFAULT 0 CHECK (tier_discount_applied BETWEEN 0 AND 100),
    final_price           DECIMAL(12,2) NOT NULL CHECK (final_price >= 0),
    PRIMARY KEY (order_id, line_number)
);

-- ================================================================
-- SECTION 15: Payments & Shipments
-- ================================================================

-- Payment record for each order (one payment per order)
CREATE TABLE Payments (
    payment_id       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id         UUID          UNIQUE NOT NULL REFERENCES Orders(order_id) ON DELETE CASCADE,
    payment_method   VARCHAR(30)   CHECK (payment_method IN ('CARD','MOBILE_MONEY','PAYPAL','CRYPTO','BANK_TRANSFER')),
    payment_provider VARCHAR(50),  -- e.g. 'Stripe', 'MTN MoMo', 'Orange Money', 'PayPal'
    amount           DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    currency_code    CHAR(3)       NOT NULL REFERENCES Currencies(currency_code) ON DELETE RESTRICT,
    transaction_ref  VARCHAR(200)  UNIQUE,
    status           VARCHAR(20)   DEFAULT 'PENDING'
                                   CHECK (status IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
    paid_at          TIMESTAMP
);

-- Shipment tracking (one or more shipments per order for split fulfillment)
CREATE TABLE Shipments (
    shipment_id        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id           UUID        NOT NULL REFERENCES Orders(order_id)      ON DELETE CASCADE,
    warehouse_id       INT         REFERENCES Warehouses(warehouse_id)       ON DELETE SET NULL,
    carrier            VARCHAR(100),
    tracking_number    VARCHAR(150),
    shipped_at         TIMESTAMP,
    estimated_delivery DATE,
    delivered_at       TIMESTAMP,
    status             VARCHAR(20) DEFAULT 'PREPARING'
                                   CHECK (status IN ('PREPARING','SHIPPED','IN_TRANSIT','DELIVERED','RETURNED'))
);

-- ================================================================
-- SECTION 16: Cart & Wishlist
-- ================================================================

-- Persistent shopping cart — supports both logged-in and guest users
CREATE TABLE Cart (
    cart_id     UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID      REFERENCES Customers(customer_id) ON DELETE CASCADE,
    session_id  VARCHAR(100),    -- used for guest carts (no customer_id)
    created_at  TIMESTAMP DEFAULT NOW(),
    updated_at  TIMESTAMP DEFAULT NOW(),
    CHECK (customer_id IS NOT NULL OR session_id IS NOT NULL)
);

-- Items within a shopping cart
CREATE TABLE Cart_Items (
    cart_id    UUID      NOT NULL REFERENCES Cart(cart_id)                   ON DELETE CASCADE,
    variant_id UUID      NOT NULL REFERENCES Product_Variants(variant_id)    ON DELETE CASCADE,
    quantity   INT       DEFAULT 1 CHECK (quantity > 0),
    added_at   TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (cart_id, variant_id)
);

-- Customer wishlist — saved products for future purchase
CREATE TABLE Wishlist (
    wishlist_id SERIAL    PRIMARY KEY,
    customer_id UUID      NOT NULL REFERENCES Customers(customer_id) ON DELETE CASCADE,
    product_id  UUID      NOT NULL REFERENCES Products(product_id)   ON DELETE CASCADE,
    added_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (customer_id, product_id)
);

-- ================================================================
-- SECTION 17: Reviews
-- ================================================================

-- Verified purchase product reviews (tied to an order to prevent fake reviews)
CREATE TABLE Reviews (
    review_id     SERIAL    PRIMARY KEY,
    product_id    UUID      NOT NULL REFERENCES Products(product_id)   ON DELETE CASCADE,
    customer_id   UUID      NOT NULL REFERENCES Customers(customer_id) ON DELETE CASCADE,
    order_id      UUID      NOT NULL REFERENCES Orders(order_id)       ON DELETE CASCADE,
    rating        SMALLINT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title         VARCHAR(150),
    body          TEXT,
    is_approved   BOOLEAN   DEFAULT FALSE,
    helpful_votes INT       DEFAULT 0 CHECK (helpful_votes >= 0),
    created_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE (customer_id, product_id, order_id)  -- one review per verified purchase
);

-- ================================================================
-- SECTION 18: Notifications & Audit Log
-- ================================================================

-- Real-time user notifications for orders, tier upgrades, promotions, etc.
CREATE TABLE Notifications (
    notification_id SERIAL      PRIMARY KEY,
    user_id         UUID        NOT NULL REFERENCES Users(user_id) ON DELETE CASCADE,
    type            VARCHAR(50) CHECK (type IN ('ORDER_UPDATE','REORDER','PROMO',
                                               'TIER_UPGRADE','REVIEW','SHIPMENT')),
    message         TEXT        NOT NULL,
    is_read         BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMP   DEFAULT NOW()
);

-- Immutable audit trail for all critical database changes (filled by triggers)
CREATE TABLE Audit_Log (
    log_id     BIGSERIAL    PRIMARY KEY,
    user_id    UUID         REFERENCES Users(user_id) ON DELETE SET NULL,
    action     VARCHAR(100) NOT NULL,    -- e.g. 'INSERT', 'UPDATE', 'DELETE', 'PLACE_ORDER'
    table_name VARCHAR(100) NOT NULL,
    record_id  TEXT,                     -- stringified PK of the affected row
    old_values JSONB,                    -- full row state before the change
    new_values JSONB,                    -- full row state after the change
    ip_address INET,
    created_at TIMESTAMP    DEFAULT NOW()
);

-- ================================================================
-- SECTION 19: Indexes
-- ================================================================

-- Users
CREATE INDEX idx_users_email            ON Users(email);
CREATE INDEX idx_users_role             ON Users(role_id);

-- Customers
CREATE INDEX idx_customers_tier         ON Customers(tier_id);
CREATE INDEX idx_customers_currency     ON Customers(preferred_currency);

-- Sellers
CREATE INDEX idx_sellers_store_name     ON Sellers(store_name);
CREATE INDEX idx_sellers_approved       ON Sellers(is_approved);

-- Categories
CREATE INDEX idx_categories_parent      ON Categories(parent_category_id);
CREATE INDEX idx_categories_slug        ON Categories(slug);

-- Products (high-frequency query columns)
CREATE INDEX idx_products_seller        ON Products(seller_id);
CREATE INDEX idx_products_category      ON Products(category_id);
CREATE INDEX idx_products_slug          ON Products(slug);
CREATE INDEX idx_products_published     ON Products(is_published);
CREATE INDEX idx_products_featured      ON Products(is_featured);
CREATE INDEX idx_products_currency      ON Products(currency_code);
CREATE INDEX idx_products_tags          ON Products USING GIN(tags);          -- full GIN for array search
CREATE INDEX idx_products_meta          ON Products USING GIN(meta_json);     -- GIN for JSONB queries

-- Product_Attributes (EAV lookups)
CREATE INDEX idx_product_attrs_product  ON Product_Attributes(product_id);
CREATE INDEX idx_product_attrs_attr     ON Product_Attributes(attribute_id);

-- Product_Variants
CREATE INDEX idx_variants_product       ON Product_Variants(product_id);
CREATE INDEX idx_variants_sku           ON Product_Variants(sku);
CREATE INDEX idx_variants_attrs         ON Product_Variants USING GIN(extra_attributes);  -- JSONB GIN

-- Product_Images
CREATE INDEX idx_images_product         ON Product_Images(product_id);
CREATE INDEX idx_images_variant         ON Product_Images(variant_id);

-- Inventory
CREATE INDEX idx_inventory_variant      ON Inventory(variant_id);
CREATE INDEX idx_inventory_warehouse    ON Inventory(warehouse_id);

-- Reorder_Requests
CREATE INDEX idx_reorder_inventory      ON Reorder_Requests(inventory_id);
CREATE INDEX idx_reorder_status         ON Reorder_Requests(status);

-- Coupons
CREATE INDEX idx_coupons_code           ON Coupons(code);
CREATE INDEX idx_coupons_active         ON Coupons(is_active);

-- Orders
CREATE INDEX idx_orders_customer        ON Orders(customer_id);
CREATE INDEX idx_orders_status          ON Orders(status);
CREATE INDEX idx_orders_date            ON Orders(order_date);
CREATE INDEX idx_orders_coupon          ON Orders(coupon_id);

-- Order_Items
CREATE INDEX idx_orderitems_variant     ON Order_Items(variant_id);
CREATE INDEX idx_orderitems_warehouse   ON Order_Items(warehouse_id);

-- Payments
CREATE INDEX idx_payments_order         ON Payments(order_id);
CREATE INDEX idx_payments_status        ON Payments(status);

-- Shipments
CREATE INDEX idx_shipments_order        ON Shipments(order_id);
CREATE INDEX idx_shipments_status       ON Shipments(status);

-- Exchange_Rates
CREATE INDEX idx_rates_currencies       ON Exchange_Rates(from_currency, to_currency);
CREATE INDEX idx_rates_date             ON Exchange_Rates(effective_date);

-- Cart
CREATE INDEX idx_cart_customer          ON Cart(customer_id);
CREATE INDEX idx_cart_session           ON Cart(session_id);

-- Cart_Items
CREATE INDEX idx_cartitems_variant      ON Cart_Items(variant_id);

-- Wishlist
CREATE INDEX idx_wishlist_customer      ON Wishlist(customer_id);
CREATE INDEX idx_wishlist_product       ON Wishlist(product_id);

-- Reviews
CREATE INDEX idx_reviews_product        ON Reviews(product_id);
CREATE INDEX idx_reviews_customer       ON Reviews(customer_id);
CREATE INDEX idx_reviews_approved       ON Reviews(is_approved);

-- Notifications
CREATE INDEX idx_notifications_user     ON Notifications(user_id, is_read);

-- Audit_Log
CREATE INDEX idx_audit_table            ON Audit_Log(table_name);
CREATE INDEX idx_audit_user             ON Audit_Log(user_id);
CREATE INDEX idx_audit_created          ON Audit_Log(created_at);

-- ================================================================
-- SECTION 20: Sequences Summary
-- ================================================================
-- order_seq   BIGINT, starts at 1000
--             Used for human-readable order numbers: DF-1000, DF-1001, ...
--             All SERIAL / BIGSERIAL columns manage their own sequences internally.
-- ================================================================

-- ================================================================
-- END OF SCHEMA: 28 tables created for DigitalFashion Hub
-- ================================================================
-- Tables created:
--   1.  Currencies              2.  Exchange_Rates
--   3.  Roles                   4.  Users
--   5.  Customer_Tiers          6.  Customers
--   7.  Sellers                 8.  Addresses
--   9.  Categories             10.  Products
--  11.  Attributes             12.  Product_Attributes
--  13.  Product_Variants       14.  Product_Images
--  15.  Warehouses             16.  Inventory
--  17.  Reorder_Requests       18.  Coupons
--  19.  Orders                 20.  Order_Items
--  21.  Payments               22.  Shipments
--  23.  Cart                   24.  Cart_Items
--  25.  Wishlist               26.  Reviews
--  27.  Notifications          28.  Audit_Log
-- ================================================================
