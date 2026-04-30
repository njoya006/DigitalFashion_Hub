-- ================================================================
-- DIGITALFASHION HUB — Seed Data
-- File: database/seeds/004_seed_data.sql
-- ICT 3212: Advanced Database Systems
-- ICT University, Cameroon — 2026
-- ================================================================
-- WARNING: Development seed data only. Never run in production.
-- All passwords are bcrypt hash of "password123"
-- ================================================================
-- Sections:
--   1.  Currencies (12)         2.  Exchange_Rates (22)
--   3.  Roles (3)               4.  Customer_Tiers (3)
--   5.  Warehouses (5)          6.  Categories (14)
--   7.  Attributes (10)         8.  Users (8)
--   9.  Sellers (3)            10.  Customers (4)
--  11.  Addresses (4)          12.  Products (6)
--  13.  Product_Attributes     14.  Product_Variants (12)
--  15.  Product_Images (12)    16.  Inventory (~18)
--  17.  Coupons (4)            18.  Sample Orders (3)
--  19.  Order_Items            20.  Reviews (3)
--  21.  Notifications (3)
-- ================================================================

BEGIN;

-- ----------------------------------------------------------------
-- SECTION 1: Currencies (12 rows)
-- ----------------------------------------------------------------
INSERT INTO Currencies (currency_code, currency_name, symbol, is_active) VALUES
    ('USD', 'US Dollar',           '$',    TRUE),
    ('EUR', 'Euro',                '€',    TRUE),
    ('GBP', 'British Pound',       '£',    TRUE),
    ('JPY', 'Japanese Yen',        '¥',    TRUE),
    ('XAF', 'CFA Franc BEAC',      'FCFA', TRUE),
    ('CAD', 'Canadian Dollar',     'C$',   TRUE),
    ('AUD', 'Australian Dollar',   'A$',   TRUE),
    ('CHF', 'Swiss Franc',         'Fr',   TRUE),
    ('CNY', 'Chinese Yuan',        '¥',    TRUE),
    ('NGN', 'Nigerian Naira',      '₦',    TRUE),
    ('ZAR', 'South African Rand',  'R',    TRUE),
    ('MAD', 'Moroccan Dirham',     'MAD',  TRUE);

-- ----------------------------------------------------------------
-- SECTION 2: Exchange_Rates (22 rows — effective 2026-01-15)
-- ----------------------------------------------------------------
INSERT INTO Exchange_Rates (from_currency, to_currency, rate, effective_date, source) VALUES
    ('USD', 'EUR',   0.921800,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'GBP',   0.789400,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'JPY', 149.420000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'XAF', 605.320000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'CAD',   1.361200,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'AUD',   1.532000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'CHF',   0.883100,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'CNY',   7.241000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'NGN', 1580.000000,  '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'ZAR',  18.640000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('USD', 'MAD',   9.980000,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('EUR', 'USD',   1.084900,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('GBP', 'USD',   1.266600,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('JPY', 'USD',   0.006693,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('XAF', 'USD',   0.001652,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('CAD', 'USD',   0.734600,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('AUD', 'USD',   0.652800,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('CHF', 'USD',   1.132400,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('CNY', 'USD',   0.138100,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('NGN', 'USD',   0.000633,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('ZAR', 'USD',   0.053600,   '2026-01-15 00:00:00', 'OpenExchangeRates'),
    ('MAD', 'USD',   0.100200,   '2026-01-15 00:00:00', 'OpenExchangeRates');

-- ----------------------------------------------------------------
-- SECTION 3: Roles (3 rows)
-- ----------------------------------------------------------------
INSERT INTO Roles (role_id, role_name, description) VALUES
    (1, 'ADMIN',    'Full platform access and management'),
    (2, 'SELLER',   'Can list products and manage their store'),
    (3, 'CUSTOMER', 'Can browse, purchase, and review products');

-- ----------------------------------------------------------------
-- SECTION 4: Customer_Tiers (3 rows)
-- ----------------------------------------------------------------
INSERT INTO Customer_Tiers (tier_id, tier_name, discount_percentage, min_lifetime_value, perks, badge_color) VALUES
    (1, 'Standard', 5.00,  0.00,    '5% discount, access to seasonal sales',                         '#C0C0C0'),
    (2, 'Premium',  10.00, 500.00,  '10% discount, free shipping, early access to new collections',  '#FFD700'),
    (3, 'VIP',      15.00, 2000.00, '15% discount, personal concierge, same-day shipping',           '#E5E4E2');

-- ----------------------------------------------------------------
-- SECTION 5: Warehouses (5 rows)
-- ----------------------------------------------------------------
INSERT INTO Warehouses (warehouse_id, location, city, country, capacity, manager_name, contact_email, is_active) VALUES
    (1, '123 Commerce Ave',   'New York', 'United States', 50000, 'James Richardson', 'ny.warehouse@dfhub.com',     TRUE),
    (2, '45 Rue du Commerce', 'Paris',    'France',        35000, 'Marie Dubois',     'paris.warehouse@dfhub.com',  TRUE),
    (3, '12 Rue de la Joie',  'Douala',   'Cameroon',      20000, 'Samuel Mbarga',    'douala.warehouse@dfhub.com', TRUE),
    (4, '8-1 Shibuya',        'Tokyo',    'Japan',         40000, 'Yuki Tanaka',      'tokyo.warehouse@dfhub.com',  TRUE),
    (5, '22 Harbour Street',  'Sydney',   'Australia',     25000, 'Emma Clarke',      'sydney.warehouse@dfhub.com', TRUE);

-- ----------------------------------------------------------------
-- SECTION 6: Categories (14 rows — 5 parent + 9 child)
-- ----------------------------------------------------------------
-- Parent categories
INSERT INTO Categories (category_id, parent_category_id, category_name, slug, display_order) VALUES
    (1,  NULL, 'Women''s Fashion',  'womens-fashion',  1),
    (2,  NULL, 'Men''s Fashion',    'mens-fashion',    2),
    (3,  NULL, 'Accessories',       'accessories',     3),
    (4,  NULL, 'Shoes',             'shoes',           4),
    (5,  NULL, 'Beauty & Wellness', 'beauty-wellness', 5);

-- Child categories
INSERT INTO Categories (category_id, parent_category_id, category_name, slug, display_order) VALUES
    (6,  1, 'Dresses',         'womens-dresses', 1),
    (7,  1, 'Tops & Blouses',  'womens-tops',    2),
    (8,  1, 'Coats & Jackets', 'womens-coats',   3),
    (9,  2, 'Suits & Blazers', 'mens-suits',     1),
    (10, 2, 'Casual Wear',     'mens-casual',    2),
    (11, 3, 'Handbags',        'handbags',       1),
    (12, 3, 'Jewelry',         'jewelry',        2),
    (13, 4, 'Women''s Shoes',  'womens-shoes',   1),
    (14, 4, 'Men''s Shoes',    'mens-shoes',     2);

-- ----------------------------------------------------------------
-- SECTION 7: Attributes (10 rows)
-- ----------------------------------------------------------------
INSERT INTO Attributes (attribute_id, attribute_name, data_type, unit) VALUES
    (1,  'Color',       'list',   NULL),
    (2,  'Size',        'list',   NULL),
    (3,  'Material',    'text',   NULL),
    (4,  'Weight',      'number', 'kg'),
    (5,  'Brand',       'text',   NULL),
    (6,  'Season',      'list',   NULL),
    (7,  'Care',        'text',   NULL),
    (8,  'Origin',      'text',   NULL),
    (9,  'Heel Height', 'number', 'cm'),
    (10, 'Fit',         'list',   NULL);

-- ----------------------------------------------------------------
-- SECTION 8: Users (8 rows — 1 admin + 3 sellers + 4 customers)
-- ----------------------------------------------------------------
INSERT INTO Users (user_id, email, password_hash, role_id, full_name, phone, is_verified, is_active, created_at) VALUES
    -- Admin
    ('00000000-0000-0000-0000-000000000001', 'admin@digitalfashionhub.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 1, 'Platform Admin',  '+1-000-000-0001', TRUE, TRUE, '2026-01-01 00:00:00'),
    -- Sellers
    ('00000000-0000-0000-0000-000000000002', 'seller1@dfhub.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 2, 'Amara Diallo',    '+33-600-000-002', TRUE, TRUE, '2026-01-02 09:00:00'),
    ('00000000-0000-0000-0000-000000000003', 'seller2@dfhub.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 2, 'Sophie Laurent',  '+33-600-000-003', TRUE, TRUE, '2026-01-02 10:00:00'),
    ('00000000-0000-0000-0000-000000000004', 'seller3@dfhub.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 2, 'Kenji Watanabe',  '+81-900-000-004', TRUE, TRUE, '2026-01-02 11:00:00'),
    -- Customers
    ('00000000-0000-0000-0000-000000000005', 'alice@email.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 3, 'Alice Johnson',   '+1-212-000-0005', TRUE, TRUE, '2026-01-05 08:30:00'),
    ('00000000-0000-0000-0000-000000000006', 'bob@email.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 3, 'Bob Martinez',    '+33-600-000-006', TRUE, TRUE, '2026-01-05 09:00:00'),
    ('00000000-0000-0000-0000-000000000007', 'claire@email.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 3, 'Claire Nguyen',   '+44-700-000-007', TRUE, TRUE, '2026-01-05 09:30:00'),
    ('00000000-0000-0000-0000-000000000008', 'david@email.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMR', 3, 'David Osei',      '+237-690-000-08', TRUE, TRUE, '2026-01-05 10:00:00');

-- ----------------------------------------------------------------
-- SECTION 9: Sellers (3 rows)
-- ----------------------------------------------------------------
INSERT INTO Sellers (seller_id, store_name, store_description, commission_rate, is_approved, rating, total_sales) VALUES
    ('00000000-0000-0000-0000-000000000002',
     'Maison Élite',   'Curated luxury womenswear from West Africa''s finest designers.',  8.00, TRUE, 4.80, 42500.00),
    ('00000000-0000-0000-0000-000000000003',
     'Lumière Paris',  'Parisian haute couture and accessories for the discerning buyer.', 10.00, TRUE, 4.65, 38900.00),
    ('00000000-0000-0000-0000-000000000004',
     'Studio Kenzo',   'Contemporary menswear with Japanese precision and craftsmanship.', 9.00, TRUE, 4.72, 35200.00);

-- ----------------------------------------------------------------
-- SECTION 10: Customers (4 rows)
-- ----------------------------------------------------------------
INSERT INTO Customers (customer_id, tier_id, preferred_currency, loyalty_points, lifetime_value, registered_date) VALUES
    ('00000000-0000-0000-0000-000000000005', 1, 'USD',  120,  120.00,  '2026-01-05'),
    ('00000000-0000-0000-0000-000000000006', 2, 'EUR',  650,  650.00,  '2026-01-05'),
    ('00000000-0000-0000-0000-000000000007', 3, 'GBP', 2400, 2400.00,  '2026-01-05'),
    ('00000000-0000-0000-0000-000000000008', 1, 'XAF',   80,   80.00,  '2026-01-05');

-- ----------------------------------------------------------------
-- SECTION 11: Addresses (4 rows — one per customer)
-- ----------------------------------------------------------------
INSERT INTO Addresses (address_id, user_id, label, street, city, state, postal_code, country, is_default) VALUES
    (1, '00000000-0000-0000-0000-000000000005', 'Home', '45 Oak Street',        'New York', 'NY',      '10001', 'United States',  TRUE),
    (2, '00000000-0000-0000-0000-000000000006', 'Home', '12 Rue de Rivoli',     'Paris',    NULL,      '75001', 'France',         TRUE),
    (3, '00000000-0000-0000-0000-000000000007', 'Home', '8 King''s Road',       'London',   'England', 'SW3 5UZ','United Kingdom', TRUE),
    (4, '00000000-0000-0000-0000-000000000008', 'Home', '22 Rue des Bamileke',  'Yaoundé',  'Centre',  NULL,    'Cameroon',       TRUE);

-- ----------------------------------------------------------------
-- SECTION 12: Products (6 rows)
-- ----------------------------------------------------------------
INSERT INTO Products (product_id, seller_id, category_id, currency_code, product_name, slug, description,
                      base_price, sku, brand, is_published, is_featured,
                      tags, meta_json, created_at, updated_at) VALUES
    -- Maison Élite
    ('aaaaaaaa-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002', 8, 'USD',
     'Oversize Wool Coat', 'oversize-wool-coat-maison-elite',
     'A beautifully crafted oversize coat in 100% Merino wool. Timeless silhouette for the modern woman.',
     420.00, 'ME-COAT-001', 'Maison Élite', TRUE, TRUE,
     ARRAY['luxury','winter','wool','oversize','women'],
     '{"seo_title":"Oversize Wool Coat — Maison Élite","seo_description":"Luxury Merino wool coat"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

    ('aaaaaaaa-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000002', 7, 'USD',
     'Cashmere Turtleneck', 'cashmere-turtleneck-maison-elite',
     'Pure cashmere turtleneck. Incredibly soft, naturally warm, a wardrobe essential.',
     320.00, 'ME-KNITWEAR-001', 'Maison Élite', TRUE, TRUE,
     ARRAY['cashmere','knitwear','luxury','winter','women'],
     '{"seo_title":"Pure Cashmere Turtleneck","seo_description":"Cashmere knitwear by Maison Élite"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

    -- Lumière Paris
    ('aaaaaaaa-0000-0000-0000-000000000003',
     '00000000-0000-0000-0000-000000000003', 6, 'EUR',
     'Silk Evening Dress', 'silk-evening-dress-lumiere-paris',
     'Floor-length silk dress with a bias cut drape. The epitome of Parisian evening elegance.',
     580.00, 'LP-DRESS-001', 'Lumière Paris', TRUE, TRUE,
     ARRAY['silk','dress','evening','luxury','women','paris'],
     '{"seo_title":"Silk Evening Dress — Lumière Paris","seo_description":"Luxury silk evening gown"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

    ('aaaaaaaa-0000-0000-0000-000000000004',
     '00000000-0000-0000-0000-000000000003', 11, 'EUR',
     'Structured Tote Bag', 'structured-tote-bag-lumiere-paris',
     'Full-grain Italian leather tote with gold-tone hardware. Spacious and supremely structured.',
     680.00, 'LP-BAG-001', 'Lumière Paris', TRUE, FALSE,
     ARRAY['leather','bag','tote','luxury','accessories','italy'],
     '{"seo_title":"Structured Leather Tote — Lumière Paris","seo_description":"Italian leather tote bag"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

    -- Studio Kenzo
    ('aaaaaaaa-0000-0000-0000-000000000005',
     '00000000-0000-0000-0000-000000000004', 9, 'USD',
     'Tailored Slim Blazer', 'tailored-slim-blazer-studio-kenzo',
     'Precision-tailored slim blazer in Italian wool blend. Clean lines, exceptional fit.',
     550.00, 'SK-BLAZER-001', 'Studio Kenzo', TRUE, FALSE,
     ARRAY['blazer','men','tailored','italian','suit','wool'],
     '{"seo_title":"Tailored Slim Blazer — Studio Kenzo","seo_description":"Italian wool blazer for men"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00'),

    ('aaaaaaaa-0000-0000-0000-000000000006',
     '00000000-0000-0000-0000-000000000004', 14, 'GBP',
     'Heritage Leather Oxford', 'heritage-leather-oxford-studio-kenzo',
     'Hand-stitched Oxford in calf leather. Classic English heritage reinterpreted for the modern man.',
     285.00, 'SK-SHOES-001', 'Studio Kenzo', TRUE, FALSE,
     ARRAY['shoes','oxford','leather','men','england','heritage'],
     '{"seo_title":"Heritage Leather Oxford — Studio Kenzo","seo_description":"English calf leather Oxford shoes"}',
     '2026-01-10 09:00:00', '2026-01-10 09:00:00');

-- ----------------------------------------------------------------
-- SECTION 13: Product_Attributes (18 rows — 3 per product)
-- ----------------------------------------------------------------
INSERT INTO Product_Attributes (product_id, attribute_id, value) VALUES
    -- Oversize Wool Coat (product 1): Color, Material, Fit
    ('aaaaaaaa-0000-0000-0000-000000000001', 1,  'Camel'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 3,  '100% Merino Wool'),
    ('aaaaaaaa-0000-0000-0000-000000000001', 10, 'Oversize'),
    -- Cashmere Turtleneck (product 2): Color, Material, Size
    ('aaaaaaaa-0000-0000-0000-000000000002', 1, 'Black'),
    ('aaaaaaaa-0000-0000-0000-000000000002', 3, 'Pure Cashmere'),
    ('aaaaaaaa-0000-0000-0000-000000000002', 2, 'M'),
    -- Silk Evening Dress (product 3): Color, Material, Season
    ('aaaaaaaa-0000-0000-0000-000000000003', 1, 'Midnight Blue'),
    ('aaaaaaaa-0000-0000-0000-000000000003', 3, '100% Silk'),
    ('aaaaaaaa-0000-0000-0000-000000000003', 6, 'AW2026'),
    -- Structured Tote Bag (product 4): Color, Material, Origin
    ('aaaaaaaa-0000-0000-0000-000000000004', 1, 'Tan'),
    ('aaaaaaaa-0000-0000-0000-000000000004', 3, 'Full-Grain Leather'),
    ('aaaaaaaa-0000-0000-0000-000000000004', 8, 'Italy'),
    -- Tailored Slim Blazer (product 5): Color, Material, Fit
    ('aaaaaaaa-0000-0000-0000-000000000005', 1,  'Charcoal'),
    ('aaaaaaaa-0000-0000-0000-000000000005', 3,  'Italian Wool Blend'),
    ('aaaaaaaa-0000-0000-0000-000000000005', 10, 'Slim'),
    -- Heritage Leather Oxford (product 6): Color, Material, Origin
    ('aaaaaaaa-0000-0000-0000-000000000006', 1, 'Burgundy'),
    ('aaaaaaaa-0000-0000-0000-000000000006', 3, 'Calf Leather'),
    ('aaaaaaaa-0000-0000-0000-000000000006', 8, 'England');

-- ----------------------------------------------------------------
-- SECTION 14: Product_Variants (12 rows — 2 per product)
-- ----------------------------------------------------------------
INSERT INTO Product_Variants (variant_id, product_id, variant_name, sku, price_modifier, extra_attributes, is_active) VALUES
    -- Oversize Wool Coat
    ('bbbbbbbb-0000-0000-0000-000000000001',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'S / Camel', 'ME-COAT-001-S-CAM', 0.00,
     '{"closure":"double-breasted button","lining":"100% silk","belt":"detachable"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000002',
     'aaaaaaaa-0000-0000-0000-000000000001',
     'L / Camel', 'ME-COAT-001-L-CAM', 20.00,
     '{"closure":"double-breasted button","lining":"100% silk","belt":"detachable"}', TRUE),

    -- Cashmere Turtleneck
    ('bbbbbbbb-0000-0000-0000-000000000003',
     'aaaaaaaa-0000-0000-0000-000000000002',
     'S / Black', 'ME-KW-001-S-BLK', 0.00,
     '{"knit":"fine gauge","neckline":"ribbed turtleneck","finish":"hand-finished"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000004',
     'aaaaaaaa-0000-0000-0000-000000000002',
     'M / Black', 'ME-KW-001-M-BLK', 0.00,
     '{"knit":"fine gauge","neckline":"ribbed turtleneck","finish":"hand-finished"}', TRUE),

    -- Silk Evening Dress
    ('bbbbbbbb-0000-0000-0000-000000000005',
     'aaaaaaaa-0000-0000-0000-000000000003',
     'XS / Midnight Blue', 'LP-DRESS-001-XS', 0.00,
     '{"cut":"bias cut","length":"floor-length","closure":"invisible zip","lining":"silk"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000006',
     'aaaaaaaa-0000-0000-0000-000000000003',
     'M / Midnight Blue', 'LP-DRESS-001-M', 30.00,
     '{"cut":"bias cut","length":"floor-length","closure":"invisible zip","lining":"silk"}', TRUE),

    -- Structured Tote Bag
    ('bbbbbbbb-0000-0000-0000-000000000007',
     'aaaaaaaa-0000-0000-0000-000000000004',
     'One Size / Tan', 'LP-BAG-001-TAN', 0.00,
     '{"hardware":"gold-tone","compartments":3,"strap":"detachable shoulder strap","dimensions":"38x28x14cm"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000008',
     'aaaaaaaa-0000-0000-0000-000000000004',
     'One Size / Black', 'LP-BAG-001-BLK', 50.00,
     '{"hardware":"silver-tone","compartments":3,"strap":"detachable shoulder strap","dimensions":"38x28x14cm"}', TRUE),

    -- Tailored Slim Blazer
    ('bbbbbbbb-0000-0000-0000-000000000009',
     'aaaaaaaa-0000-0000-0000-000000000005',
     'M / Charcoal', 'SK-BLZ-001-M-CHR', 0.00,
     '{"lining":"bemberg","buttons":2,"vent":"double","lapel":"notch"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000010',
     'aaaaaaaa-0000-0000-0000-000000000005',
     'L / Charcoal', 'SK-BLZ-001-L-CHR', 0.00,
     '{"lining":"bemberg","buttons":2,"vent":"double","lapel":"notch"}', TRUE),

    -- Heritage Leather Oxford
    ('bbbbbbbb-0000-0000-0000-000000000011',
     'aaaaaaaa-0000-0000-0000-000000000006',
     '42 / Burgundy', 'SK-OXF-001-42-BRG', 0.00,
     '{"toe_shape":"round cap-toe","sole":"leather","construction":"goodyear welt","last":"heritage"}', TRUE),

    ('bbbbbbbb-0000-0000-0000-000000000012',
     'aaaaaaaa-0000-0000-0000-000000000006',
     '44 / Burgundy', 'SK-OXF-001-44-BRG', 15.00,
     '{"toe_shape":"round cap-toe","sole":"leather","construction":"goodyear welt","last":"heritage"}', TRUE);

-- ----------------------------------------------------------------
-- SECTION 15: Product_Images (12 rows — 2 per product)
-- ----------------------------------------------------------------
INSERT INTO Product_Images (product_id, variant_id, image_url, alt_text, display_order, is_primary) VALUES
    -- Oversize Wool Coat
    ('aaaaaaaa-0000-0000-0000-000000000001', NULL,
     'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&fit=crop',
     'Maison Elite oversize wool coat primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000001', NULL,
     'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80&fit=crop',
     'Maison Elite oversize wool coat detail image', 1, FALSE),

    -- Cashmere Turtleneck
    ('aaaaaaaa-0000-0000-0000-000000000002', NULL,
     'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80&fit=crop',
     'Maison Elite cashmere turtleneck primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000002', NULL,
     'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80&fit=crop',
     'Maison Elite cashmere turtleneck lifestyle image', 1, FALSE),

    -- Silk Evening Dress
    ('aaaaaaaa-0000-0000-0000-000000000003', NULL,
     'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200&q=80&fit=crop',
     'Lumiere Paris silk evening dress primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000003', NULL,
     'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80&fit=crop',
     'Lumiere Paris silk evening dress runway image', 1, FALSE),

    -- Structured Tote Bag
    ('aaaaaaaa-0000-0000-0000-000000000004', NULL,
     'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80&fit=crop',
     'Lumiere Paris structured tote bag primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000004', NULL,
     'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=1200&q=80&fit=crop',
     'Lumiere Paris structured tote bag side view', 1, FALSE),

    -- Tailored Slim Blazer
    ('aaaaaaaa-0000-0000-0000-000000000005', NULL,
     'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&q=80&fit=crop',
     'Studio Kenzo tailored slim blazer primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000005', NULL,
     'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1200&q=80&fit=crop',
     'Studio Kenzo tailored slim blazer detail image', 1, FALSE),

    -- Heritage Leather Oxford
    ('aaaaaaaa-0000-0000-0000-000000000006', NULL,
     'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&q=80&fit=crop',
     'Studio Kenzo heritage leather oxford primary image', 0, TRUE),
    ('aaaaaaaa-0000-0000-0000-000000000006', NULL,
     'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=1200&q=80&fit=crop',
     'Studio Kenzo heritage leather oxford top view', 1, FALSE);

-- ----------------------------------------------------------------
-- SECTION 16: Inventory (~18 rows, distributed across warehouses)
-- Note: variant bbbbbbbb-...0007 at warehouse 2 has qty=3 (below
--       threshold=10) to demonstrate trg_inventory_reorder on update.
-- ----------------------------------------------------------------
INSERT INTO Inventory (variant_id, warehouse_id, quantity_on_hand, reorder_threshold, reorder_quantity, last_restocked) VALUES
    -- Oversize Wool Coat: New York (wh1) + Paris (wh2)
    ('bbbbbbbb-0000-0000-0000-000000000001', 1, 35, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000001', 2, 20, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 1, 40, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000002', 2, 25, 10, 50, '2026-01-10 08:00:00'),

    -- Cashmere Turtleneck: New York (wh1) + Douala (wh3)
    ('bbbbbbbb-0000-0000-0000-000000000003', 1, 50, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000003', 3, 30, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000004', 1, 45, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000004', 3, 28, 10, 50, '2026-01-10 08:00:00'),

    -- Silk Evening Dress: Paris (wh2) only
    ('bbbbbbbb-0000-0000-0000-000000000005', 2, 18, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000006', 2, 22, 10, 50, '2026-01-10 08:00:00'),

    -- Structured Tote Bag: Paris (wh2) + Tokyo (wh4)
    -- ↓ qty=3: BELOW threshold — update this row to trigger auto-reorder
    ('bbbbbbbb-0000-0000-0000-000000000007', 2,  3, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000007', 4, 60, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000008', 2, 15, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000008', 4, 55, 10, 50, '2026-01-10 08:00:00'),

    -- Tailored Slim Blazer: New York (wh1) + Tokyo (wh4)
    ('bbbbbbbb-0000-0000-0000-000000000009', 1, 38, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000009', 4, 42, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000010', 1, 33, 10, 50, '2026-01-10 08:00:00'),

    -- Heritage Leather Oxford: New York (wh1) + Sydney (wh5)
    ('bbbbbbbb-0000-0000-0000-000000000011', 1, 25, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000011', 5, 30, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000012', 1, 20, 10, 50, '2026-01-10 08:00:00'),
    ('bbbbbbbb-0000-0000-0000-000000000012', 5, 18, 10, 50, '2026-01-10 08:00:00');

-- ----------------------------------------------------------------
-- SECTION 17: Coupons (4 rows)
-- ----------------------------------------------------------------
INSERT INTO Coupons (coupon_id, code, discount_type, discount_value, min_order_value, max_uses, used_count, valid_from, valid_until, is_active) VALUES
    (1, 'WELCOME10', 'PERCENT', 10.00,  50.00, 500, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
    (2, 'FLAT50',    'FIXED',   50.00, 200.00, 100, 0, '2026-01-01 00:00:00', '2026-06-30 23:59:59', TRUE),
    (3, 'VIP20',     'PERCENT', 20.00, 100.00,  50, 0, '2026-01-01 00:00:00', '2026-12-31 23:59:59', TRUE),
    (4, 'EXPIRED',   'PERCENT', 15.00,   0.00,  10, 0, '2025-01-01 00:00:00', '2025-12-31 23:59:59', TRUE);

-- ----------------------------------------------------------------
-- SECTION 18: Sample Orders (3 delivered orders — seeded directly
--             to provide valid order_id FK for Reviews)
-- ----------------------------------------------------------------

-- Order 1: Claire (VIP) bought Oversize Wool Coat S/Camel from wh1
INSERT INTO Orders (order_id, order_number, customer_id, coupon_id, shipping_address_id,
                    currency_code, exchange_rate_used, subtotal, discount_amount,
                    shipping_cost, tax_amount, total_amount, total_amount_usd,
                    status, order_date, updated_at)
VALUES (
    'cccccccc-0000-0000-0000-000000000001',
    'DF-0001',
    '00000000-0000-0000-0000-000000000007',  -- Claire (VIP)
    NULL, 3,
    'GBP', 1.266600,
    357.00, 63.00, 0.00, 0.00, 357.00, 452.05,
    'DELIVERED', '2026-01-12 14:00:00', '2026-01-12 14:00:00'
);

-- Order 2: Bob (Premium) bought Silk Evening Dress XS from wh2
INSERT INTO Orders (order_id, order_number, customer_id, coupon_id, shipping_address_id,
                    currency_code, exchange_rate_used, subtotal, discount_amount,
                    shipping_cost, tax_amount, total_amount, total_amount_usd,
                    status, order_date, updated_at)
VALUES (
    'cccccccc-0000-0000-0000-000000000002',
    'DF-0002',
    '00000000-0000-0000-0000-000000000006',  -- Bob (Premium)
    NULL, 2,
    'EUR', 1.084900,
    522.00, 58.00, 0.00, 0.00, 522.00, 566.32,
    'DELIVERED', '2026-01-13 11:00:00', '2026-01-13 11:00:00'
);

-- Order 3: Alice (Standard) bought Tailored Slim Blazer M from wh1
INSERT INTO Orders (order_id, order_number, customer_id, coupon_id, shipping_address_id,
                    currency_code, exchange_rate_used, subtotal, discount_amount,
                    shipping_cost, tax_amount, total_amount, total_amount_usd,
                    status, order_date, updated_at)
VALUES (
    'cccccccc-0000-0000-0000-000000000003',
    'DF-0003',
    '00000000-0000-0000-0000-000000000005',  -- Alice (Standard)
    NULL, 1,
    'USD', 1.000000,
    522.50, 27.50, 0.00, 0.00, 522.50, 522.50,
    'DELIVERED', '2026-01-14 16:00:00', '2026-01-14 16:00:00'
);

-- ----------------------------------------------------------------
-- SECTION 19: Order_Items (1 line per order)
-- ----------------------------------------------------------------
INSERT INTO Order_Items (order_id, line_number, variant_id, warehouse_id,
                         quantity, unit_price, tier_discount_applied, final_price) VALUES
    -- Order 1: Claire bought coat S/Camel × 1 (15% VIP discount applied)
    ('cccccccc-0000-0000-0000-000000000001', 1,
     'bbbbbbbb-0000-0000-0000-000000000001', 1,
     1, 420.00, 15.00, 357.00),

    -- Order 2: Bob bought silk dress XS × 1 (10% Premium discount; price in EUR)
    ('cccccccc-0000-0000-0000-000000000002', 1,
     'bbbbbbbb-0000-0000-0000-000000000005', 2,
     1, 580.00, 10.00, 522.00),

    -- Order 3: Alice bought blazer M × 1 (5% Standard discount)
    ('cccccccc-0000-0000-0000-000000000003', 1,
     'bbbbbbbb-0000-0000-0000-000000000009', 1,
     1, 550.00, 5.00, 522.50);

-- ----------------------------------------------------------------
-- SECTION 20: Reviews (3 approved reviews)
-- Each review references a unique customer+product+order combination
-- ----------------------------------------------------------------
INSERT INTO Reviews (review_id, product_id, customer_id, order_id,
                     rating, title, body, is_approved, helpful_votes, created_at) VALUES
    (1,
     'aaaaaaaa-0000-0000-0000-000000000001',  -- Oversize Wool Coat
     '00000000-0000-0000-0000-000000000007',  -- Claire
     'cccccccc-0000-0000-0000-000000000001',
     5, 'Absolutely stunning!',
     'The quality is exceptional. The wool is incredibly soft and the cut is perfect. Worth every penny.',
     TRUE, 12, '2026-01-18 10:30:00'),

    (2,
     'aaaaaaaa-0000-0000-0000-000000000003',  -- Silk Evening Dress
     '00000000-0000-0000-0000-000000000006',  -- Bob
     'cccccccc-0000-0000-0000-000000000002',
     4, 'Beautiful craftsmanship',
     'The silk is incredibly smooth and the cut is flattering. Arrived beautifully packaged. True to size.',
     TRUE, 8, '2026-01-19 09:00:00'),

    (3,
     'aaaaaaaa-0000-0000-0000-000000000005',  -- Tailored Slim Blazer
     '00000000-0000-0000-0000-000000000005',  -- Alice
     'cccccccc-0000-0000-0000-000000000003',
     5, 'Perfect fit',
     'Tailoring is impeccable. The Italian wool has a wonderful drape. Fast delivery too. Highly recommend.',
     TRUE, 15, '2026-01-20 14:00:00');

-- ----------------------------------------------------------------
-- SECTION 21: Notifications (3 sample rows)
-- ----------------------------------------------------------------
INSERT INTO Notifications (user_id, type, message, is_read, created_at) VALUES
    ('00000000-0000-0000-0000-000000000007',
     'ORDER_UPDATE',
     'Your order DF-0001 has been delivered. Enjoy your purchase!',
     TRUE,  '2026-01-16 10:00:00'),

    ('00000000-0000-0000-0000-000000000006',
     'TIER_UPGRADE',
     'Congratulations! You have been upgraded to Premium tier. Enjoy 10% off all future orders!',
     FALSE, '2026-01-13 12:00:00'),

    ('00000000-0000-0000-0000-000000000005',
     'PROMO',
     'Flash sale! Use code WELCOME10 for 10% off your next order. Limited time only!',
     FALSE, '2026-01-15 08:00:00');

COMMIT;

-- ================================================================
-- SEED COMPLETE
-- Run health check:
-- SELECT 'Currencies'    AS tbl, COUNT(*) AS rows FROM Currencies
-- UNION ALL SELECT 'Exchange_Rates', COUNT(*) FROM Exchange_Rates
-- UNION ALL SELECT 'Users',          COUNT(*) FROM Users
-- UNION ALL SELECT 'Products',       COUNT(*) FROM Products
-- UNION ALL SELECT 'Inventory',      COUNT(*) FROM Inventory
-- UNION ALL SELECT 'Coupons',        COUNT(*) FROM Coupons
-- UNION ALL SELECT 'Reviews',        COUNT(*) FROM Reviews;
-- ================================================================
-- TEST fn_place_order after seeding:
-- SELECT * FROM fn_place_order(
--     '00000000-0000-0000-0000-000000000005',  -- Alice (Standard tier)
--     'USD',
--     1,
--     '[{"variant_id":"bbbbbbbb-0000-0000-0000-000000000003","quantity":1,"warehouse_id":1}]'::JSONB,
--     'WELCOME10',
--     0, 0
-- );
-- Expected: order created, 5% tier discount + 10% coupon applied
-- Final price: 320.00 * 0.95 (tier) = 304.00 subtotal
--              304.00 * 0.90 (coupon) = 273.60 total
--
-- TEST fn_convert_price:
-- SELECT fn_convert_price(100.00, 'USD', 'XAF');  -- expected: ~60532
-- SELECT fn_convert_price(580.00, 'EUR', 'GBP');  -- via USD bridge
--
-- TEST fn_get_product_with_attributes:
-- SELECT * FROM fn_get_product_with_attributes('aaaaaaaa-0000-0000-0000-000000000001');
--
-- TEST fn_cancel_order:
-- SELECT * FROM fn_cancel_order('cccccccc-0000-0000-0000-000000000003');
-- (Will fail — DELIVERED status cannot be cancelled — expected behaviour)
--
-- TEST auto-reorder trigger (variant 007 at wh2 already has qty=3):
-- UPDATE Inventory SET quantity_on_hand = 2
-- WHERE variant_id = 'bbbbbbbb-0000-0000-0000-000000000007' AND warehouse_id = 2;
-- SELECT * FROM Reorder_Requests ORDER BY created_at DESC LIMIT 1;
-- ================================================================
-- END OF SEED DATA
-- ================================================================
