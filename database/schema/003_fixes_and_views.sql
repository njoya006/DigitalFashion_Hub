-- ================================================================
-- DIGITALFASHION HUB — Schema Fixes, Views & Health Checks
-- ICT 3212: Advanced Database Systems
-- ICT University, Cameroon — 2026
-- ================================================================
-- Run this script AFTER 001_create_tables.sql
-- ================================================================


-- ----------------------------------------------------------------
-- FIX 1: Customers.phone removed at source in 001_create_tables.sql
-- Phone number is inherited from Users.phone — no duplication needed.
-- If you ran the old schema, execute:
--   ALTER TABLE Customers DROP COLUMN IF EXISTS phone;
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- FIX 2: auto-update updated_at on Products and Orders
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON Products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON Orders
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ================================================================
-- VIEWS
-- ================================================================

-- Customer profiles — joins Users + Customers + Customer_Tiers
CREATE OR REPLACE VIEW Customer_Profiles AS
    SELECT
        c.customer_id,
        u.full_name          AS name,
        u.email,
        u.phone,
        u.avatar_url,
        ct.tier_name,
        ct.discount_percentage,
        ct.badge_color,
        c.lifetime_value,
        c.loyalty_points,
        c.preferred_currency,
        c.registered_date
    FROM Customers c
    JOIN Users           u  ON c.customer_id = u.user_id
    LEFT JOIN Customer_Tiers ct ON c.tier_id = ct.tier_id;


-- Published product catalog with seller and category details
CREATE OR REPLACE VIEW Product_Catalog AS
    SELECT
        p.product_id,
        p.product_name,
        p.slug,
        p.base_price,
        p.currency_code,
        p.brand,
        p.is_featured,
        p.tags,
        p.created_at,
        c.category_name,
        s.store_name         AS seller_name,
        s.rating             AS seller_rating
    FROM Products p
    LEFT JOIN Categories c ON p.category_id = c.category_id
    LEFT JOIN Sellers    s ON p.seller_id    = s.seller_id
    WHERE p.is_published = TRUE;


-- Variants that are below their reorder threshold, sorted by urgency
CREATE OR REPLACE VIEW Inventory_Alerts AS
    SELECT
        i.inventory_id,
        pv.sku               AS variant_sku,
        pv.variant_name,
        p.product_name,
        w.city               AS warehouse_city,
        w.country            AS warehouse_country,
        i.quantity_on_hand,
        i.reorder_threshold,
        i.reorder_quantity,
        (i.reorder_threshold - i.quantity_on_hand) AS units_short
    FROM Inventory i
    JOIN Product_Variants pv ON i.variant_id   = pv.variant_id
    JOIN Products         p  ON pv.product_id  = p.product_id
    JOIN Warehouses       w  ON i.warehouse_id = w.warehouse_id
    WHERE i.quantity_on_hand < i.reorder_threshold
    ORDER BY units_short DESC;


-- Full order dashboard joining customer, payment, and shipment status
CREATE OR REPLACE VIEW Order_Status_Dashboard AS
    SELECT
        o.order_id,
        o.order_number,
        u.full_name          AS customer_name,
        u.email              AS customer_email,
        ct.tier_name,
        o.total_amount,
        o.currency_code,
        o.total_amount_usd,
        o.status,
        o.order_date,
        p.status             AS payment_status,
        s.status             AS shipment_status,
        s.tracking_number
    FROM Orders o
    JOIN Customers       c  ON o.customer_id = c.customer_id
    JOIN Users           u  ON c.customer_id = u.user_id
    LEFT JOIN Customer_Tiers ct ON c.tier_id = ct.tier_id
    LEFT JOIN Payments   p  ON o.order_id    = p.order_id
    LEFT JOIN Shipments  s  ON o.order_id    = s.order_id;


-- Customer tier overview with progress toward next tier
CREATE OR REPLACE VIEW Customer_Tier_Overview AS
    SELECT
        u.full_name,
        u.email,
        ct.tier_name                                            AS current_tier,
        ct.discount_percentage,
        c.lifetime_value,
        c.loyalty_points,
        next_tier.tier_name                                     AS next_tier,
        next_tier.min_lifetime_value                            AS next_tier_threshold,
        GREATEST(0, next_tier.min_lifetime_value
                    - c.lifetime_value)                         AS amount_to_next_tier
    FROM Customers c
    JOIN Users           u        ON c.customer_id = u.user_id
    LEFT JOIN Customer_Tiers ct       ON c.tier_id     = ct.tier_id
    LEFT JOIN Customer_Tiers next_tier
           ON next_tier.min_lifetime_value = (
               SELECT MIN(t.min_lifetime_value)
               FROM Customer_Tiers t
               WHERE t.min_lifetime_value > COALESCE(ct.min_lifetime_value, 0)
           );


-- ================================================================
-- MATERIALIZED VIEW
-- ================================================================

-- Aggregated product sales summary — refresh periodically via Celery/pg_cron
CREATE MATERIALIZED VIEW Product_Sales_Summary AS
    SELECT
        p.product_id,
        p.product_name,
        p.brand,
        COUNT(DISTINCT oi.order_id)   AS total_orders,
        COALESCE(SUM(oi.quantity), 0) AS total_units_sold,
        COALESCE(SUM(oi.final_price), 0) AS total_revenue_usd,
        ROUND(AVG(r.rating), 2)       AS avg_rating,
        COUNT(r.review_id)            AS review_count
    FROM Products p
    LEFT JOIN Product_Variants pv ON p.product_id  = pv.product_id
    LEFT JOIN Order_Items      oi ON pv.variant_id = oi.variant_id
    LEFT JOIN Orders            o ON oi.order_id   = o.order_id
        AND o.status NOT IN ('CANCELLED', 'REFUNDED')
    LEFT JOIN Reviews           r ON p.product_id  = r.product_id
        AND r.is_approved = TRUE
    GROUP BY p.product_id, p.product_name, p.brand
WITH DATA;

CREATE INDEX idx_sales_summary_product ON Product_Sales_Summary(product_id);
CREATE INDEX idx_sales_summary_revenue ON Product_Sales_Summary(total_revenue_usd DESC);

-- Refresh command (run daily via Celery task or pg_cron):
-- REFRESH MATERIALIZED VIEW CONCURRENTLY Product_Sales_Summary;


-- ================================================================
-- NEXT STEPS — Triggers (database/triggers/)
-- ================================================================
-- 1. trg_inventory_reorder
--    AFTER UPDATE ON Inventory
--    When quantity_on_hand < reorder_threshold
--    → INSERT into Reorder_Requests automatically
--
-- 2. trg_customer_tier_upgrade
--    AFTER UPDATE ON Customers (lifetime_value)
--    → Promote Standard → Premium → VIP automatically
--    → INSERT into Notifications (type: 'TIER_UPGRADE')
--
-- 3. trg_audit_log
--    AFTER INSERT OR UPDATE OR DELETE ON Products, Orders, Inventory
--    → INSERT into Audit_Log with old/new JSONB snapshots
--
-- 4. trg_update_seller_rating
--    AFTER INSERT OR UPDATE ON Reviews
--    → Recalculate Sellers.rating as AVG of approved reviews


-- ================================================================
-- SCHEMA HEALTH CHECK QUERIES
-- Run these after executing both schema scripts to verify setup.
-- ================================================================

-- 1. All 28 base tables:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 28 rows

-- 2. All indexes:
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
-- Expected: 50+ indexes

-- 3. All views (regular + materialized):
SELECT table_name, 'VIEW' AS type
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
SELECT matviewname, 'MATERIALIZED VIEW'
FROM pg_matviews
WHERE schemaname = 'public'
ORDER BY type, table_name;
-- Expected: Customer_Profiles, Product_Catalog, Inventory_Alerts,
--           Order_Status_Dashboard, Customer_Tier_Overview,
--           Product_Sales_Summary (materialized)

-- 4. All sequences:
SELECT sequence_name
FROM information_schema.sequences
WHERE sequence_schema = 'public'
ORDER BY sequence_name;
-- Expected: order_seq + SERIAL auto-sequences
