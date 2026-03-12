-- psql -U postgres -p 5433 -d digitalfashion_hub -f 003_stored_procedures.sql
-- ================================================================
-- DIGITALFASHION HUB — Stored Procedures
-- File: database/procedures/003_stored_procedures.sql
-- ICT 3212: Advanced Database Systems
-- ICT University, Cameroon — 2026
-- ================================================================
-- Procedures in this file:
--   1. fn_place_order()                 — Full atomic order placement
--   2. fn_cancel_order()                — Order cancellation with inventory restore
--   3. fn_convert_price()               — Multi-currency price conversion
--   4. fn_get_product_with_attributes() — Product detail with EAV + variants
--   5. fn_process_reorder()             — Fulfil a reorder request
-- ================================================================
-- NOTE: fn_place_order calls fn_convert_price. PostgreSQL PL/pgSQL
-- resolves function references at call time (not at CREATE time), so
-- the declaration order in this file does not matter. All 5 functions
-- will be available by the time any of them is first invoked.
-- ================================================================


-- ================================================================
-- PROCEDURE 1: fn_place_order
-- Table(s): Orders, Order_Items, Inventory, Coupons, Customers,
--           Notifications  |  Event: Called by application layer
-- Purpose:  Full atomic order — validates stock, applies discounts,
--           creates order rows, deducts inventory in one transaction
-- ================================================================

CREATE OR REPLACE FUNCTION fn_place_order(
    p_customer_id   UUID,
    p_currency_code CHAR(3),
    p_address_id    INT,
    p_items         JSONB,
    p_coupon_code   VARCHAR       DEFAULT NULL,
    p_shipping_cost DECIMAL(12,2) DEFAULT 0,
    p_tax_rate      DECIMAL(7,6)  DEFAULT 0
)
RETURNS TABLE(
    order_id     UUID,
    order_number VARCHAR,
    total_amount DECIMAL(12,2),
    currency     CHAR(3),
    status       VARCHAR,
    message      TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    -- Customer / tier
    v_tier_discount     DECIMAL(5,2)  := 0;

    -- Exchange rate snapshot
    v_exchange_rate     DECIMAL(18,6) := 1.000000;

    -- Coupon
    v_coupon_id         INT           := NULL;
    v_coupon_type       VARCHAR(10);
    v_coupon_value      DECIMAL(10,2);
    v_coupon_min        DECIMAL(10,2) := 0;
    v_coupon_discount   DECIMAL(12,2) := 0;

    -- Order totals
    v_subtotal          DECIMAL(12,2) := 0;
    v_tax_amount        DECIMAL(12,2) := 0;
    v_total             DECIMAL(12,2) := 0;
    v_total_usd         DECIMAL(12,2) := 0;

    -- Output
    v_order_id          UUID;
    v_order_number      VARCHAR(20);

    -- Item-loop variables
    v_raw_item          RECORD;
    v_stored_item       RECORD;
    v_variant_id        UUID;
    v_warehouse_id      INT;
    v_quantity          INT;
    v_base_price        DECIMAL(12,2);
    v_price_modifier    DECIMAL(10,2);
    v_product_currency  CHAR(3);
    v_unit_price        DECIMAL(12,2);
    v_discounted_price  DECIMAL(12,2);
    v_line_total        DECIMAL(12,2);
    v_stock             INT;
    v_line_number       INT           := 1;
    v_items_validated   JSONB         := '[]'::JSONB;
    v_item_entry        JSONB;
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Validate customer, lock row, resolve tier discount
    -- -------------------------------------------------------
    SELECT COALESCE(ct.discount_percentage, 0)
    INTO   v_tier_discount
    FROM   Customers c
    LEFT JOIN Customer_Tiers ct ON c.tier_id = ct.tier_id
    WHERE  c.customer_id = p_customer_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Customer not found: %', p_customer_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Snapshot live exchange rate to USD
    -- -------------------------------------------------------
    IF p_currency_code <> 'USD' THEN
        SELECT rate INTO v_exchange_rate
        FROM   Exchange_Rates
        WHERE  from_currency = p_currency_code
          AND  to_currency   = 'USD'
          AND  effective_date = (
              SELECT MAX(effective_date)
              FROM   Exchange_Rates
              WHERE  from_currency = p_currency_code
                AND  to_currency   = 'USD'
          );

        IF NOT FOUND THEN
            RAISE EXCEPTION 'No exchange rate found for currency: %', p_currency_code;
        END IF;
    END IF;

    -- -------------------------------------------------------
    -- STEP 3: Validate and lock coupon (if supplied)
    -- -------------------------------------------------------
    IF p_coupon_code IS NOT NULL THEN
        SELECT coupon_id,
               discount_type,
               discount_value,
               COALESCE(min_order_value, 0)
        INTO   v_coupon_id, v_coupon_type, v_coupon_value, v_coupon_min
        FROM   Coupons
        WHERE  code        = p_coupon_code
          AND  is_active   = TRUE
          AND  (valid_from  IS NULL OR valid_from  <= NOW())
          AND  (valid_until IS NULL OR valid_until >= NOW())
          AND  (max_uses    IS NULL OR used_count   < max_uses)
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid or expired coupon code: %', p_coupon_code;
        END IF;
    END IF;

    -- -------------------------------------------------------
    -- STEP 4: Validate every item, lock inventory, build subtotal
    -- -------------------------------------------------------
    FOR v_raw_item IN
        SELECT value FROM jsonb_array_elements(p_items) AS t(value)
    LOOP
        v_variant_id   := (v_raw_item.value->>'variant_id')::UUID;
        v_quantity     := (v_raw_item.value->>'quantity')::INT;
        v_warehouse_id := (v_raw_item.value->>'warehouse_id')::INT;

        -- Variant + product details
        SELECT p.base_price, pv.price_modifier, p.currency_code
        INTO   v_base_price, v_price_modifier, v_product_currency
        FROM   Product_Variants pv
        JOIN   Products p ON pv.product_id = p.product_id
        WHERE  pv.variant_id  = v_variant_id
          AND  pv.is_active   = TRUE
          AND  p.is_published = TRUE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Variant not found or unavailable: %', v_variant_id;
        END IF;

        -- Lock inventory row and verify stock
        SELECT quantity_on_hand INTO v_stock
        FROM   Inventory
        WHERE  variant_id   = v_variant_id
          AND  warehouse_id = v_warehouse_id
        FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'No inventory record for variant % at warehouse %',
                v_variant_id, v_warehouse_id;
        END IF;

        IF v_stock < v_quantity THEN
            RAISE EXCEPTION
                'Insufficient stock for variant % at warehouse %. Available: %, Requested: %',
                v_variant_id, v_warehouse_id, v_stock, v_quantity;
        END IF;

        -- Unit price — convert to order currency when product is priced differently
        v_unit_price := v_base_price + v_price_modifier;
        IF v_product_currency <> p_currency_code THEN
            v_unit_price := ROUND(
                fn_convert_price(v_unit_price, v_product_currency, p_currency_code)::NUMERIC,
                2
            );
        END IF;

        -- Apply customer tier discount
        v_discounted_price := ROUND(v_unit_price * (1 - v_tier_discount / 100), 2);
        v_line_total       := ROUND(v_discounted_price * v_quantity, 2);
        v_subtotal         := v_subtotal + v_line_total;

        -- Stash validated item for the insertion pass
        v_item_entry := jsonb_build_object(
            'variant_id',    v_variant_id,
            'warehouse_id',  v_warehouse_id,
            'quantity',      v_quantity,
            'unit_price',    v_unit_price,
            'tier_discount', v_tier_discount,
            'final_price',   v_line_total
        );
        v_items_validated := v_items_validated || jsonb_build_array(v_item_entry);
    END LOOP;

    -- -------------------------------------------------------
    -- STEP 5: Apply coupon discount
    -- -------------------------------------------------------
    IF v_coupon_id IS NOT NULL THEN
        IF v_subtotal < v_coupon_min THEN
            RAISE EXCEPTION
                'Order total % does not meet minimum order value % for this coupon',
                v_subtotal, v_coupon_min;
        END IF;

        IF v_coupon_type = 'PERCENT' THEN
            v_coupon_discount := ROUND(v_subtotal * (v_coupon_value / 100), 2);
        ELSE  -- FIXED
            v_coupon_discount := LEAST(v_coupon_value, v_subtotal);
        END IF;
    END IF;

    -- -------------------------------------------------------
    -- STEP 6: Final financial totals
    -- -------------------------------------------------------
    v_tax_amount := ROUND((v_subtotal - v_coupon_discount) * p_tax_rate, 2);
    v_total      := ROUND(v_subtotal - v_coupon_discount + p_shipping_cost + v_tax_amount, 2);
    v_total_usd  := ROUND(v_total * v_exchange_rate, 2);

    -- -------------------------------------------------------
    -- STEP 7: Create the Order row
    -- -------------------------------------------------------
    INSERT INTO Orders(
        customer_id, coupon_id, shipping_address_id, currency_code,
        exchange_rate_used, subtotal, discount_amount, shipping_cost,
        tax_amount, total_amount, total_amount_usd, status
    ) VALUES (
        p_customer_id, v_coupon_id, p_address_id, p_currency_code,
        v_exchange_rate, v_subtotal, v_coupon_discount, p_shipping_cost,
        v_tax_amount, v_total, v_total_usd, 'CONFIRMED'
    )
    RETURNING order_id, order_number
    INTO v_order_id, v_order_number;

    -- -------------------------------------------------------
    -- STEP 8: Insert Order_Items and deduct Inventory
    --   trg_prevent_negative_inv  → blocks if stock goes < 0
    --   trg_inventory_reorder     → auto-creates reorder request if below threshold
    -- -------------------------------------------------------
    FOR v_stored_item IN
        SELECT value FROM jsonb_array_elements(v_items_validated) AS t(value)
    LOOP
        INSERT INTO Order_Items(
            order_id, line_number, variant_id, warehouse_id,
            quantity, unit_price, tier_discount_applied, final_price
        ) VALUES (
            v_order_id,
            v_line_number,
            (v_stored_item.value->>'variant_id')::UUID,
            (v_stored_item.value->>'warehouse_id')::INT,
            (v_stored_item.value->>'quantity')::INT,
            (v_stored_item.value->>'unit_price')::DECIMAL(12,2),
            (v_stored_item.value->>'tier_discount')::DECIMAL(5,2),
            (v_stored_item.value->>'final_price')::DECIMAL(12,2)
        );

        UPDATE Inventory
        SET    quantity_on_hand = quantity_on_hand
                                - (v_stored_item.value->>'quantity')::INT
        WHERE  variant_id   = (v_stored_item.value->>'variant_id')::UUID
          AND  warehouse_id = (v_stored_item.value->>'warehouse_id')::INT;

        v_line_number := v_line_number + 1;
    END LOOP;

    -- -------------------------------------------------------
    -- STEP 9: Increment coupon usage counter
    -- -------------------------------------------------------
    IF v_coupon_id IS NOT NULL THEN
        UPDATE Coupons
        SET    used_count = used_count + 1
        WHERE  coupon_id  = v_coupon_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 10: Update customer lifetime_value + loyalty_points
    --   trg_customer_tier_upgrade fires automatically here
    -- -------------------------------------------------------
    UPDATE Customers
    SET    lifetime_value = lifetime_value + v_total_usd,
           loyalty_points = loyalty_points + FLOOR(v_total_usd)::INT
    WHERE  customer_id = p_customer_id;

    -- -------------------------------------------------------
    -- STEP 11: Order confirmation notification
    -- -------------------------------------------------------
    INSERT INTO Notifications(user_id, type, message)
    VALUES (
        p_customer_id,
        'ORDER_UPDATE',
        'Your order ' || v_order_number || ' has been confirmed. Total: '
            || p_currency_code || ' ' || v_total::TEXT
    );

    -- -------------------------------------------------------
    -- STEP 12: Return result
    -- -------------------------------------------------------
    RETURN QUERY
        SELECT v_order_id,
               v_order_number::VARCHAR,
               v_total,
               p_currency_code,
               'CONFIRMED'::VARCHAR,
               'Order placed successfully'::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Order failed: %', SQLERRM;
END;
$$;


-- ================================================================
-- PROCEDURE 2: fn_cancel_order
-- Table(s): Orders, Order_Items, Inventory, Coupons, Customers,
--           Payments, Notifications  |  Event: Called by application
-- Purpose:  Cancel an order and cleanly reverse all side-effects
-- ================================================================

CREATE OR REPLACE FUNCTION fn_cancel_order(
    p_order_id UUID,
    p_reason   TEXT DEFAULT 'Cancelled by customer'
)
RETURNS TABLE(
    success      BOOLEAN,
    order_number VARCHAR,
    message      TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_order_number     VARCHAR(20);
    v_status           VARCHAR(20);
    v_customer_id      UUID;
    v_coupon_id        INT;
    v_total_amount_usd DECIMAL(12,2);
    v_item             RECORD;
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Get and validate order, lock row
    -- -------------------------------------------------------
    SELECT o.order_number,
           o.status,
           o.customer_id,
           o.coupon_id,
           o.total_amount_usd
    INTO   v_order_number, v_status, v_customer_id, v_coupon_id, v_total_amount_usd
    FROM   Orders o
    WHERE  o.order_id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found: %', p_order_id;
    END IF;

    IF v_status IN ('DELIVERED', 'CANCELLED', 'REFUNDED') THEN
        RAISE EXCEPTION 'Cannot cancel order % with status: %',
            p_order_id, v_status;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Restore inventory for each line item
    -- -------------------------------------------------------
    FOR v_item IN
        SELECT variant_id, warehouse_id, quantity
        FROM   Order_Items
        WHERE  order_id = p_order_id
    LOOP
        UPDATE Inventory
        SET    quantity_on_hand = quantity_on_hand + v_item.quantity
        WHERE  variant_id   = v_item.variant_id
          AND  warehouse_id = v_item.warehouse_id;
    END LOOP;

    -- -------------------------------------------------------
    -- STEP 3: Restore coupon usage if one was applied
    -- -------------------------------------------------------
    IF v_coupon_id IS NOT NULL THEN
        UPDATE Coupons
        SET    used_count = GREATEST(0, used_count - 1)
        WHERE  coupon_id = v_coupon_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 4: Reverse customer lifetime_value and loyalty_points
    --   Note: trg_customer_tier_upgrade fires but never downgrades
    -- -------------------------------------------------------
    UPDATE Customers
    SET    lifetime_value = GREATEST(0,
                                lifetime_value - COALESCE(v_total_amount_usd, 0)),
           loyalty_points = GREATEST(0,
                                loyalty_points
                                - FLOOR(COALESCE(v_total_amount_usd, 0))::INT)
    WHERE  customer_id = v_customer_id;

    -- -------------------------------------------------------
    -- STEP 5: Update order status and append cancellation reason
    -- -------------------------------------------------------
    UPDATE Orders
    SET    status = 'CANCELLED',
           notes  = COALESCE(notes || ' | ', '') || 'Cancelled: ' || p_reason
    WHERE  order_id = p_order_id;

    -- -------------------------------------------------------
    -- STEP 6: Mark successful payment as REFUNDED
    -- -------------------------------------------------------
    UPDATE Payments
    SET    status = 'REFUNDED'
    WHERE  order_id = p_order_id
      AND  status   = 'SUCCESS';

    -- -------------------------------------------------------
    -- STEP 7: Cancellation notification to customer
    -- -------------------------------------------------------
    INSERT INTO Notifications(user_id, type, message)
    VALUES (
        v_customer_id,
        'ORDER_UPDATE',
        'Your order ' || v_order_number || ' has been cancelled. ' || p_reason
    );

    -- -------------------------------------------------------
    -- STEP 8: Return result
    -- -------------------------------------------------------
    RETURN QUERY
        SELECT TRUE, v_order_number::VARCHAR, 'Order cancelled successfully'::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Cancel failed: %', SQLERRM;
END;
$$;


-- ================================================================
-- PROCEDURE 3: fn_convert_price
-- Table(s): Exchange_Rates  |  Event: Called inline by fn_place_order
--           and directly by the API layer
-- Purpose:  Convert an amount between any two currencies using the
--           most recent rate. Falls back to inverse rate, then USD bridge.
-- ================================================================

CREATE OR REPLACE FUNCTION fn_convert_price(
    p_amount        DECIMAL(12,2),
    p_from_currency CHAR(3),
    p_to_currency   CHAR(3),
    p_date          TIMESTAMP DEFAULT NOW()
)
RETURNS DECIMAL(12,6)
LANGUAGE plpgsql
AS $$
DECLARE
    v_rate          DECIMAL(18,6);
    v_rate_to_usd   DECIMAL(18,6);
    v_rate_from_usd DECIMAL(18,6);
BEGIN
    -- Same currency — nothing to convert
    IF p_from_currency = p_to_currency THEN
        RETURN p_amount::DECIMAL(12,6);
    END IF;

    -- 1st attempt: direct rate  (from → to)
    SELECT rate INTO v_rate
    FROM   Exchange_Rates
    WHERE  from_currency  = p_from_currency
      AND  to_currency    = p_to_currency
      AND  effective_date <= p_date
    ORDER  BY effective_date DESC
    LIMIT  1;

    IF FOUND THEN
        RETURN ROUND((p_amount * v_rate)::NUMERIC, 6);
    END IF;

    -- 2nd attempt: inverse rate  (to → from, then divide)
    SELECT rate INTO v_rate
    FROM   Exchange_Rates
    WHERE  from_currency  = p_to_currency
      AND  to_currency    = p_from_currency
      AND  effective_date <= p_date
    ORDER  BY effective_date DESC
    LIMIT  1;

    IF FOUND THEN
        RETURN ROUND((p_amount / v_rate)::NUMERIC, 6);
    END IF;

    -- 3rd attempt: USD bridge  (from → USD → to)
    SELECT rate INTO v_rate_to_usd
    FROM   Exchange_Rates
    WHERE  from_currency  = p_from_currency
      AND  to_currency    = 'USD'
      AND  effective_date <= p_date
    ORDER  BY effective_date DESC
    LIMIT  1;

    SELECT rate INTO v_rate_from_usd
    FROM   Exchange_Rates
    WHERE  from_currency  = 'USD'
      AND  to_currency    = p_to_currency
      AND  effective_date <= p_date
    ORDER  BY effective_date DESC
    LIMIT  1;

    IF v_rate_to_usd IS NOT NULL AND v_rate_from_usd IS NOT NULL THEN
        RETURN ROUND((p_amount * v_rate_to_usd * v_rate_from_usd)::NUMERIC, 6);
    END IF;

    RAISE EXCEPTION 'No exchange rate found between % and %',
        p_from_currency, p_to_currency;
END;
$$;


-- ================================================================
-- PROCEDURE 4: fn_get_product_with_attributes
-- Table(s): Products, Sellers, Categories, Product_Attributes,
--           Attributes, Product_Variants, Reviews  |  Read-only
-- Purpose:  Return full product record with all EAV attributes
--           aggregated into JSONB and variants as a JSONB array
-- ================================================================

CREATE OR REPLACE FUNCTION fn_get_product_with_attributes(
    p_product_id UUID
)
RETURNS TABLE(
    product_id   UUID,
    product_name VARCHAR,
    base_price   DECIMAL(12,2),
    currency     CHAR(3),
    seller_name  VARCHAR,
    category     VARCHAR,
    brand        VARCHAR,
    attributes   JSONB,
    variants     JSONB,
    avg_rating   NUMERIC,
    review_count BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
BEGIN
    RETURN QUERY
    SELECT
        p.product_id,
        p.product_name,
        p.base_price,
        p.currency_code,
        s.store_name,
        c.category_name,
        p.brand,

        -- All EAV attributes collapsed into one JSONB object
        (
            SELECT COALESCE(
                       jsonb_object_agg(a.attribute_name, pa.value),
                       '{}'::JSONB
                   )
            FROM   Product_Attributes pa
            JOIN   Attributes a ON pa.attribute_id = a.attribute_id
            WHERE  pa.product_id = p.product_id
        ) AS attributes,

        -- All active variants as a JSONB array
        (
            SELECT COALESCE(
                       jsonb_agg(
                           jsonb_build_object(
                               'variant_id',   pv.variant_id,
                               'variant_name', pv.variant_name,
                               'sku',          pv.sku,
                               'price',        p.base_price + pv.price_modifier,
                               'extra',        pv.extra_attributes
                           )
                       ),
                       '[]'::JSONB
                   )
            FROM   Product_Variants pv
            WHERE  pv.product_id = p.product_id
              AND  pv.is_active  = TRUE
        ) AS variants,

        -- Average rating across approved reviews
        ROUND(
            (
                SELECT AVG(r.rating)
                FROM   Reviews r
                WHERE  r.product_id  = p.product_id
                  AND  r.is_approved = TRUE
            )::NUMERIC,
            2
        ) AS avg_rating,

        -- Review count
        (
            SELECT COUNT(r.review_id)
            FROM   Reviews r
            WHERE  r.product_id  = p.product_id
              AND  r.is_approved = TRUE
        ) AS review_count

    FROM   Products p
    LEFT JOIN Sellers    s ON p.seller_id   = s.seller_id
    LEFT JOIN Categories c ON p.category_id = c.category_id
    WHERE  p.product_id = p_product_id;
END;
$$;


-- ================================================================
-- PROCEDURE 5: fn_process_reorder
-- Table(s): Reorder_Requests, Inventory  |  Event: Called by warehouse
-- Purpose:  Mark a PENDING reorder request as FULFILLED and restock
--           the inventory to the fulfilled quantity
-- ================================================================

CREATE OR REPLACE FUNCTION fn_process_reorder(
    p_request_id         INT,
    p_fulfilled_quantity INT DEFAULT NULL
)
RETURNS TABLE(
    success      BOOLEAN,
    message      TEXT,
    new_quantity INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_inventory_id       INT;
    v_requested_quantity INT;
    v_current_qty        INT;
    v_qty_to_add         INT;
BEGIN
    -- -------------------------------------------------------
    -- STEP 1: Fetch and lock the pending reorder request
    -- -------------------------------------------------------
    SELECT rr.inventory_id,
           rr.requested_quantity,
           i.quantity_on_hand
    INTO   v_inventory_id, v_requested_quantity, v_current_qty
    FROM   Reorder_Requests rr
    JOIN   Inventory i ON rr.inventory_id = i.inventory_id
    WHERE  rr.request_id = p_request_id
      AND  rr.status     = 'PENDING'
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reorder request % not found or already processed',
            p_request_id;
    END IF;

    -- -------------------------------------------------------
    -- STEP 2: Determine restock quantity
    -- -------------------------------------------------------
    v_qty_to_add := COALESCE(p_fulfilled_quantity, v_requested_quantity);

    -- -------------------------------------------------------
    -- STEP 3: Restock inventory
    -- -------------------------------------------------------
    UPDATE Inventory
    SET    quantity_on_hand = quantity_on_hand + v_qty_to_add,
           last_restocked   = NOW()
    WHERE  inventory_id = v_inventory_id;

    -- -------------------------------------------------------
    -- STEP 4: Mark request as FULFILLED
    -- -------------------------------------------------------
    UPDATE Reorder_Requests
    SET    status       = 'FULFILLED',
           fulfilled_at = NOW()
    WHERE  request_id = p_request_id;

    -- -------------------------------------------------------
    -- STEP 5: Return result
    -- -------------------------------------------------------
    RETURN QUERY
        SELECT
            TRUE,
            ('Restocked ' || v_qty_to_add
                || ' units. New quantity: '
                || (v_current_qty + v_qty_to_add)::TEXT
            )::TEXT,
            (v_current_qty + v_qty_to_add)::INT;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Reorder processing failed: %', SQLERRM;
END;
$$;


-- ================================================================
-- TEST QUERIES (run after seeding data)
-- ================================================================
-- Test price conversion:
-- SELECT fn_convert_price(100.00, 'USD', 'EUR');
-- SELECT fn_convert_price(100.00, 'USD', 'XAF');
--
-- Test product attributes:
-- SELECT * FROM fn_get_product_with_attributes('your-product-uuid-here');
--
-- Test place_order (after seeding):
-- SELECT * FROM fn_place_order(
--     'customer-uuid',
--     'USD',
--     1,
--     '[{"variant_id": "variant-uuid", "quantity": 1, "warehouse_id": 1}]'::JSONB
-- );
-- -- With coupon:
-- SELECT * FROM fn_place_order(
--     'customer-uuid',
--     'USD',
--     1,
--     '[{"variant_id": "variant-uuid", "quantity": 1, "warehouse_id": 1}]'::JSONB,
--     'SUMMER10'
-- );
--
-- Test cancel_order:
-- SELECT * FROM fn_cancel_order('order-uuid', 'Changed my mind');
--
-- Test process_reorder:
-- SELECT * FROM fn_process_reorder(1);
-- SELECT * FROM fn_process_reorder(2, 200);  -- override fulfilled quantity
--
-- Verify all 5 functions are registered:
-- SELECT routine_name, routine_type
-- FROM   information_schema.routines
-- WHERE  routine_schema = 'public'
--   AND  routine_name   LIKE 'fn_%'
-- ORDER  BY routine_name;
-- ================================================================
-- END OF PROCEDURES: 5 functions registered
-- ================================================================
