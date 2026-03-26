-- ================================================================
-- DIGITALFASHION HUB — Triggers
-- File: database/triggers/002_triggers.sql
-- ICT 3212: Advanced Database Systems
-- ICT University, Cameroon — 2026
-- ================================================================
-- Triggers in this file:
--   1. trg_inventory_reorder       — Auto reorder request on low stock
--   2. trg_customer_tier_upgrade   — Auto tier promotion on lifetime_value change
--   3. trg_audit_products          — Audit log for Products table
--   4. trg_audit_orders            — Audit log for Orders table
--   5. trg_audit_inventory         — Audit log for Inventory table
--   6. trg_seller_rating_update    — Recalculate seller rating on review approval
--   7. trg_prevent_negative_inv    — Block negative inventory (ACID Consistency)
-- ================================================================


-- ============================================================
-- TRIGGER 1: Auto Reorder Request
-- Table: Inventory  |  Event: AFTER UPDATE
-- Purpose: Insert a Reorder_Request and Notification when stock
--          drops below reorder_threshold (no duplicate PENDING requests)
-- ============================================================

CREATE OR REPLACE FUNCTION fn_inventory_reorder()
RETURNS TRIGGER AS $$
DECLARE
    v_sku           VARCHAR(100);
    v_city          VARCHAR(100);
    v_pending_count INT;
    v_message       TEXT;
BEGIN
    -- Only act when quantity_on_hand actually changed
    IF NEW.quantity_on_hand = OLD.quantity_on_hand THEN
        RETURN NEW;
    END IF;

    -- Only act when below threshold
    IF NEW.quantity_on_hand >= NEW.reorder_threshold THEN
        RETURN NEW;
    END IF;

    -- Prevent duplicate PENDING requests
    SELECT COUNT(*) INTO v_pending_count
    FROM Reorder_Requests
    WHERE inventory_id = NEW.inventory_id
      AND status = 'PENDING';

    IF v_pending_count > 0 THEN
        RETURN NEW;
    END IF;

    -- Fetch variant SKU and warehouse city for the message
    SELECT pv.sku INTO v_sku
    FROM Product_Variants pv
    WHERE pv.variant_id = NEW.variant_id;

    SELECT w.city INTO v_city
    FROM Warehouses w
    WHERE w.warehouse_id = NEW.warehouse_id;

    -- Build notification message
    v_message := FORMAT(
        'Low stock alert: variant %s at warehouse %s — %s units remaining. Reorder of %s units requested.',
        COALESCE(v_sku,  NEW.variant_id::TEXT),
        COALESCE(v_city, NEW.warehouse_id::TEXT),
        NEW.quantity_on_hand,
        NEW.reorder_quantity
    );

    -- Create the reorder request
    INSERT INTO Reorder_Requests (inventory_id, requested_quantity, status, created_at)
    VALUES (NEW.inventory_id, NEW.reorder_quantity, 'PENDING', NOW());

    -- Notify warehouse manager (user_id = NULL until app layer sets it)
    INSERT INTO Notifications (user_id, type, message, is_read, created_at)
    VALUES (NULL, 'REORDER', v_message, FALSE, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_inventory_reorder
    AFTER UPDATE ON Inventory
    FOR EACH ROW
    EXECUTE FUNCTION fn_inventory_reorder();


-- ============================================================
-- TRIGGER 2: Customer Tier Auto-Upgrade
-- Table: Customers  |  Event: AFTER UPDATE
-- Purpose: Promote customer to higher tier when lifetime_value
--          crosses a tier threshold; send upgrade notification
-- ============================================================

CREATE OR REPLACE FUNCTION fn_customer_tier_upgrade()
RETURNS TRIGGER AS $$
DECLARE
    v_new_tier_id           INT;
    v_new_tier_name         VARCHAR(50);
    v_new_discount          NUMERIC(5,2);
    v_current_min_value     NUMERIC(12,2);
    v_new_min_value         NUMERIC(12,2);
    v_message               TEXT;
BEGIN
    -- Only act when lifetime_value actually changed
    IF NEW.lifetime_value = OLD.lifetime_value THEN
        RETURN NEW;
    END IF;

    -- Find the highest tier the customer now qualifies for
    SELECT t.tier_id, t.tier_name, t.discount_percentage, t.min_lifetime_value
    INTO v_new_tier_id, v_new_tier_name, v_new_discount, v_new_min_value
    FROM Customer_Tiers t
    WHERE t.min_lifetime_value <= NEW.lifetime_value
    ORDER BY t.min_lifetime_value DESC
    LIMIT 1;

    -- Nothing to do if no tier found
    IF v_new_tier_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Get current tier's min_lifetime_value for comparison (never downgrade)
    SELECT COALESCE(t.min_lifetime_value, 0)
    INTO v_current_min_value
    FROM Customer_Tiers t
    WHERE t.tier_id = OLD.tier_id;

    -- Only upgrade, never downgrade
    IF v_new_min_value <= COALESCE(v_current_min_value, 0) THEN
        RETURN NEW;
    END IF;

    -- Apply the new tier
    UPDATE Customers
    SET tier_id = v_new_tier_id
    WHERE customer_id = NEW.customer_id;

    -- Notify the customer (customer_id = user_id, Customers extends Users)
    v_message := FORMAT(
        'Congratulations! You have been upgraded to %s tier. Enjoy %s%% off all future orders!',
        v_new_tier_name,
        v_new_discount
    );

    INSERT INTO Notifications (user_id, type, message, is_read, created_at)
    VALUES (NEW.customer_id, 'TIER_UPGRADE', v_message, FALSE, NOW());

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_customer_tier_upgrade
    AFTER UPDATE ON Customers
    FOR EACH ROW
    EXECUTE FUNCTION fn_customer_tier_upgrade();


-- ============================================================
-- TRIGGER 3/4/5: Generic Audit Log
-- Tables: Products, Orders, Inventory  |  Event: AFTER INSERT OR UPDATE OR DELETE
-- Purpose: Capture full before/after JSONB snapshots in Audit_Log
-- ============================================================

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id  TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    -- Resolve primary key and values based on operation
    IF TG_OP = 'INSERT' THEN
        v_old_values := NULL;
        v_new_values := row_to_json(NEW)::JSONB;

        IF TG_TABLE_NAME = 'products' THEN
            v_record_id := NEW.product_id::TEXT;
        ELSIF TG_TABLE_NAME = 'orders' THEN
            v_record_id := NEW.order_id::TEXT;
        ELSIF TG_TABLE_NAME = 'inventory' THEN
            v_record_id := NEW.inventory_id::TEXT;
        END IF;

    ELSIF TG_OP = 'UPDATE' THEN
        v_old_values := row_to_json(OLD)::JSONB;
        v_new_values := row_to_json(NEW)::JSONB;

        IF TG_TABLE_NAME = 'products' THEN
            v_record_id := NEW.product_id::TEXT;
        ELSIF TG_TABLE_NAME = 'orders' THEN
            v_record_id := NEW.order_id::TEXT;
        ELSIF TG_TABLE_NAME = 'inventory' THEN
            v_record_id := NEW.inventory_id::TEXT;
        END IF;

    ELSIF TG_OP = 'DELETE' THEN
        v_old_values := row_to_json(OLD)::JSONB;
        v_new_values := NULL;

        IF TG_TABLE_NAME = 'products' THEN
            v_record_id := OLD.product_id::TEXT;
        ELSIF TG_TABLE_NAME = 'orders' THEN
            v_record_id := OLD.order_id::TEXT;
        ELSIF TG_TABLE_NAME = 'inventory' THEN
            v_record_id := OLD.inventory_id::TEXT;
        END IF;
    END IF;

    INSERT INTO Audit_Log (
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        created_at
    ) VALUES (
        NULL,                    -- set by application layer in future
        TG_OP,
        TG_TABLE_NAME,
        v_record_id,
        v_old_values,
        v_new_values,
        NULL,                    -- ip_address set by application layer
        NOW()
    );

    -- For DELETE return OLD, otherwise NEW
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_products
    AFTER INSERT OR UPDATE OR DELETE ON Products
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_orders
    AFTER INSERT OR UPDATE OR DELETE ON Orders
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_inventory
    AFTER INSERT OR UPDATE OR DELETE ON Inventory
    FOR EACH ROW
    EXECUTE FUNCTION fn_audit_log();


-- ============================================================
-- TRIGGER 6: Seller Rating Auto-Update
-- Table: Reviews  |  Event: AFTER INSERT OR UPDATE
-- Purpose: Recalculate Sellers.rating when a review is approved
-- ============================================================

CREATE OR REPLACE FUNCTION fn_seller_rating_update()
RETURNS TRIGGER AS $$
DECLARE
    v_seller_id  UUID;
    v_avg_rating NUMERIC(3,2);
BEGIN
    -- Only act when review is approved
    IF NEW.is_approved IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    -- Only act on UPDATE when is_approved changed to TRUE
    IF TG_OP = 'UPDATE' AND OLD.is_approved = TRUE THEN
        -- Already approved, only recalculate if rating itself changed
        IF NEW.rating = OLD.rating THEN
            RETURN NEW;
        END IF;
    END IF;

    -- Get the seller responsible for this product
    SELECT p.seller_id INTO v_seller_id
    FROM Products p
    WHERE p.product_id = NEW.product_id;

    IF v_seller_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Recalculate average across all approved reviews for this seller
    SELECT ROUND(AVG(r.rating)::NUMERIC, 2) INTO v_avg_rating
    FROM Reviews r
    JOIN Products p ON r.product_id = p.product_id
    WHERE p.seller_id = v_seller_id
      AND r.is_approved = TRUE;

    UPDATE Sellers
    SET rating = v_avg_rating
    WHERE seller_id = v_seller_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_seller_rating_update
    AFTER INSERT OR UPDATE ON Reviews
    FOR EACH ROW
    EXECUTE FUNCTION fn_seller_rating_update();


-- ============================================================
-- TRIGGER 7: Prevent Negative Inventory
-- Table: Inventory  |  Event: BEFORE UPDATE
-- Purpose: ACID Consistency — block any update that would set
--          quantity_on_hand below zero
-- ============================================================

CREATE OR REPLACE FUNCTION fn_prevent_negative_inv()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity_on_hand < 0 THEN
        RAISE EXCEPTION
            'Inventory cannot go negative for variant % at warehouse %',
            NEW.variant_id,
            NEW.warehouse_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_negative_inv
    BEFORE UPDATE ON Inventory
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_negative_inv();


-- ================================================================
-- END OF TRIGGERS: 7 triggers registered across 5 tables
-- To verify: SELECT trigger_name, event_object_table, event_manipulation
--            FROM information_schema.triggers
--            WHERE trigger_schema = 'public'
--            ORDER BY event_object_table, trigger_name;
-- ================================================================

-- Expected output:
--
--  trigger_name              | event_object_table | event_manipulation
-- ---------------------------+--------------------+--------------------
--  trg_audit_inventory       | inventory          | DELETE
--  trg_audit_inventory       | inventory          | INSERT
--  trg_audit_inventory       | inventory          | UPDATE
--  trg_inventory_reorder     | inventory          | UPDATE
--  trg_prevent_negative_inv  | inventory          | UPDATE
--  trg_audit_orders          | orders             | DELETE
--  trg_audit_orders          | orders             | INSERT
--  trg_audit_orders          | orders             | UPDATE
--  trg_audit_products        | products           | DELETE
--  trg_audit_products        | products           | INSERT
--  trg_audit_products        | products           | UPDATE
--  trg_customer_tier_upgrade | customers          | UPDATE
--  trg_seller_rating_update  | reviews            | INSERT
--  trg_seller_rating_update  | reviews            | UPDATE
--
-- Note: trg_products_updated_at and trg_orders_updated_at are
--       already registered from 003_fixes_and_views.sql
