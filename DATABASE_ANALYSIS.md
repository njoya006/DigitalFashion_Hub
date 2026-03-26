# 📊 Database Analysis & ER Diagram Breakdown
> DigitalFashion Hub | Database Architecture Explained Simply

---

## 🎯 Quick Reference: What Each Table Does

| Table Name | Purpose | Real-World Example | Number of Rows (Current) |
|------------|---------|-------------------|-------------------------|
| **USERS** | Core login accounts | "alice@example.com" account | 8 |
| **ROLES** | User types | Admin, Seller, Customer | 3 |
| **CUSTOMERS** | Customer-specific data | Alice's loyalty tier: VIP | 5 |
| **SELLERS** | Store owners | "TechShop" store account | 3 |
| **ADDRESSES** | Shipping/billing | "123 Main St, Lagos" | 12 |
| **CATEGORIES** | Product types | "Fashion", "Electronics" | 15 |
| **PRODUCTS** | What you can buy | "Winter Jacket by TechShop" | 50+ |
| **ATTRIBUTES** | Product properties | Size (S, M, L), Color | 12 |
| **PRODUCT_ATTRIBUTES** | Link products to attributes | "Winter Jacket" has "Size" attribute | 60+ |
| **PRODUCT_VARIANTS** | Specific combinations | "Winter Jacket Size M Blue" | 200+ |
| **PRODUCT_IMAGES** | Photos | "jacket_front.jpg" | 150+ |
| **CURRENCIES** | Money types | USD, XAF, NGN, GHS | 12 |
| **EXCHANGE_RATES** | Currency conversion | 1 USD = 650 XAF | 100+ |
| **CUSTOMER_TIERS** | Loyalty levels | Standard, Premium, VIP | 3 |
| **WAREHOUSES** | Storage locations | "Lagos Warehouse" | 5 |
| **INVENTORY** | Stock levels | "Winter Jacket has 45 in Lagos warehouse" | 500+ |
| **REORDER_REQUESTS** | Low stock alerts | "Winter Jacket below 10 units" | 5 |
| **CART** | Shopping baskets | "Alice's current shopping session" | 3 |
| **CART_ITEMS** | Items in cart | "Alice added 2 Winter Jackets to cart" | 8 |
| **WISHLIST** | Items to buy later | "Alice saved 'Summer Dress' to wishlist" | 15 |
| **COUPONS** | Discount codes | "SAVE20 = 20% off" | 8 |
| **ORDERS** | Completed purchases | "Alice's order #ORD-001 for $250" | 20+ |
| **ORDER_ITEMS** | Products in an order | "Order #ORD-001 contains 2 Winter Jackets" | 40+ |
| **PAYMENTS** | Payment records | "Paid $250 via Stripe on Mar 25" | 20+ |
| **SHIPMENTS** | Delivery tracking | "Order #ORD-001 shipped from Lagos to Accra" | 20+ |
| **REVIEWS** | Customer feedback | "Winter Jacket: 5 stars - Great quality!" | 30+ |
| **NOTIFICATIONS** | Alert messages | "Your order shipped!" | 100+ |
| **AUDIT_LOG** | Change history | "ProductPrice changed $50→$45 by admin1" | 500+ |

---

## 🔗 Table Relationships (Who Connects to Whom)

### **User Flow** (How user data is organized)
```
ROLES (3 types)
  ↓
USERS (email, password, name)
  ├─→ CUSTOMERS (loyalty tier, points)   [extends Users]
  ├─→ SELLERS (store name, rating)       [extends Users]
  └─→ ADDRESSES (multiple per user)
```

**In Plain English:**
- When someone creates an account, they get a USERS record
- System asks: Are you a CUSTOMER or SELLER?
- If CUSTOMER → Also create CUSTOMERS record (tier, loyalty points)
- If SELLER → Also create SELLERS record (store name, commission)
- Both can have ADDRESSES (home, office, etc)

---

### **Product Flow** (How products are organized)
```
SELLERS
  ↓ (owns)
PRODUCTS (name, price, description)
  ├─→ CATEGORIES (Fashion, Electronics)
  ├─→ ATTRIBUTES (Size, Color, Material)
  │   ├─→ PRODUCT_ATTRIBUTES (link to product)
  ├─→ PRODUCT_VARIANTS (specific combinations)
  ├─→ PRODUCT_IMAGES (photos)
  └─→ INVENTORY (stock in each warehouse)
```

**In Plain English:**
- Each SELLER can list multiple PRODUCTS
- Each PRODUCT belongs to a CATEGORY
- Each PRODUCT has ATTRIBUTES (like "Size")
- PRODUCT_ATTRIBUTES links specific products to attributes
- PRODUCT_VARIANTS are specific combinations (Size M + Color Blue)
- PRODUCT_IMAGES stores photos
- INVENTORY tracks how many units in each WAREHOUSE

**Real Example:**
```
SELLERS
└─ "TechShop"
   └─ PRODUCTS
      └─ "Winter Jacket"
         ├─ Category: "Fashion"
         ├─ Attributes: [Size, Color, Material]
         ├─ PRODUCT_VARIANTS:
         │  ├─ "M / Blue / Cotton"
         │  ├─ "L / Blue / Cotton"
         │  └─ "XL / Red / Wool"
         ├─ PRODUCT_IMAGES:
         │  ├─ front.jpg
         │  ├─ back.jpg
         │  └─ detail.jpg
         └─ INVENTORY (in each warehouse):
            ├─ Lagos: 45 units
            ├─ Accra: 23 units
            └─ Douala: 10 units
```

---

### **Shopping Flow** (How purchases happen)
```
Customer starts shopping:
  ↓
CART → CART_ITEMS (add products)
  ↓
Customer clicks checkout
  ↓
ORDERS created
  ├─→ ORDER_ITEMS (each product in order)
  ├─→ PAYMENTS (payment info)
  ├─→ SHIPMENTS (delivery tracking)
  └─→ INVENTORY reduced (stock decreases)
  ↓
Later, customer can leave REVIEWS
```

**In Plain English:**
```
=== Session: Shopping ===
Customer: Alice

Step 1: Browse & Add to Cart
- Adds "Winter Jacket" to CART
- CART_ITEMS record created: quantity=2

Step 2: View Checkout Page
- System shows CART_ITEMS
- Shows price from PRODUCTS

Step 3: Apply Discount
- Alice has code "SAVE20"
- System looks up COUPONS
- Discount amount calculated

Step 4: Place Order
- Click "Buy Now"
- Creates ORDER record
- Creates ORDER_ITEMS (links to products)
- Creates PAYMENT record (amount, method)
- Creates SHIPMENT record (address from ADDRESSES)
- INVENTORY reduced for each product
- CART_ITEMS deleted

Step 5: After Delivery
- SHIPMENT.status = "delivered"
- Alice can now leave REVIEWS
- REVIEWS linked to ORDER_ITEMS
- (Only verified purchasers can review)
```

---

### **Currency Flow** (How multi-currency works)
```
CUSTOMERS
  ├─ has preferred_currency → "XAF"
  ↓
PRODUCTS
  ├─ has currency_code → "USD"
  ↓
Customer views product
  ↓
System needs to convert:
  - Finds CURRENCIES (USD, XAF)
  - Looks up EXCHANGE_RATES
  - Reads 1 USD = 650 XAF (from today's rate)
  - Calculates: Product $50 × 650 = 32,500 XAF
  - Shows customer: "32,500 XAF"
  ↓
When order placed:
  - ORDERS records exchange_rate_used
  - (So later: we know exactly what rate was used)
  - Seller still gets paid in USD equivalent
```

---

### **Loyalty Tier Flow** (How customers get rewards)
```
CUSTOMERS.lifetime_value starts at 0

Customer 1 buys: $100 → lifetime_value = $100
  ├─ Tier stays "Standard" (need $500 for Premium)
  └─ No automatic action

Customer 2 buys: $500 total → lifetime_value = $500
  ├─ TRIGGER FIRES (database automatically detects)
  ├─ Sets tier = "Premium"
  ├─ Gives 5% discount
  └─ Customer notified automatically

Customer 2 buys more: $2000 total → lifetime_value = $2000
  ├─ TRIGGER FIRES AGAIN
  ├─ Sets tier = "VIP"
  ├─ Gives 10% discount
  └─ Customer notified automatically

=== This is completely automatic - no admin intervention ===
```

**Database Trigger Code:**
```
WHEN CUSTOMERS.lifetime_value is updated
  IF lifetime_value >= 2000 THEN
    Set tier_id = "VIP" (10% discount)
  ELSE IF lifetime_value >= 500 THEN
    Set tier_id = "Premium" (5% discount)
  ELSE
    Set tier_id = "Standard" (0% discount)
  END IF
END TRIGGER
```

---

## 🔄 Complex Table Interactions

### **Scenario 1: Place an Order (What Happens Behind the Scenes)**

```
User: Alice
Product: Winter Jacket (in USD, seller is TechShop)
Alice Currency: XAF
Alice Tier: Premium (5% discount)

========== THE MAGIC HAPPENS HERE ==========

Step A: Validate Stock
  SELECT * FROM INVENTORY
  WHERE product_id = "winter-jacket"
    AND warehouse_id = "lagos"
  → Result: 45 units available ✓

Step B: Get Product Info
  SELECT base_price, currency_code FROM PRODUCTS
  WHERE product_id = "winter-jacket"
  → Result: $50 USD

Step C: Convert Price
  SELECT rate FROM EXCHANGE_RATES
  WHERE from_currency = "USD"
    AND to_currency = "XAF"
    AND effective_date = TODAY
  → Result: 1 USD = 650 XAF
  
  Price in XAF = $50 × 650 = 32,500 XAF

Step D: Apply Tier Discount
  Alice is Premium tier → 5% discount
  Discounted price = 32,500 × (1 - 0.05) = 30,875 XAF

Step E: Create Order
  INSERT INTO ORDERS:
    - customer_id = Alice
    - total_amount = 30,875 XAF
    - currency_code = XAF
    - exchange_rate_used = 650
    - status = "pending_payment"

Step F: Create Order Items
  INSERT INTO ORDER_ITEMS:
    - order_id = new_order
    - product_id = winter-jacket
    - quantity = 1
    - price_at_purchase = 30,875 XAF

Step G: Reduce Inventory
  UPDATE INVENTORY:
    - SET quantity = quantity - 1
    - WHERE product_id = winter-jacket
  → New quantity: 44 units

Step H: Check Reorder Threshold
  IF quantity < 10 THEN
    Auto-create REORDER_REQUEST ← (TRIGGER)

Step I: Create Shipment
  INSERT INTO SHIPMENTS:
    - order_id = new_order
    - warehouse_id = lagos (closest to customer)
    - tracking_number = auto-generated
    - status = "processing"

Step J: Record Payment
  INSERT INTO PAYMENTS:
    - order_id = new_order
    - amount = 30,875 XAF
    - status = "pending"
    - method = "stripe"

Step K: Log the Action
  INSERT INTO AUDIT_LOG:  ← (TRIGGER)
    - table_name = "ORDERS"
    - action = "INSERT"
    - user_id = Alice
    - timestamp = NOW()

========== ALL 11 STEPS GUARANTEED TO SUCCEED OR ALL FAIL ==========
(If payment fails, entire order is rolled back - no partial orders)
```

---

### **Scenario 2: What Happens If Stock is Low?**

```
INVENTORY Update Trigger:

BEFORE: Jacket quantity = 12

Admin tries to sell 5 more
  UPDATE INVENTORY SET quantity = 12 - 5 = 7

Trigger checks:
  IF 7 < 10 THEN
    INSERT REORDER_REQUESTS (automatic!)
      - product_id = jacket
      - requested_quantity = 50
      - status = "pending"
    END IF

Result:
✓ Sale goes through
✓ Inventory reduced
✓ Reorder request auto-created
✓ Warehouse manager gets notified
✓ No manual work needed!
```

---

### **Scenario 3: What if Customer Returns an Order?**

```
Order: #ORD-001 (customer bought 3 Winter Jackets)

Customer requests return...

cancel_order() Stored Procedure runs:

Step 1: Find INVENTORY for this product
  warehouse_id = (from SHIPMENT)
  product_id = (from ORDER_ITEMS)

Step 2: Restore Stock
  UPDATE INVENTORY:
    ADD 3 units back
  (quantity was 7, now 10)

Step 3: Reverse Payment
  UPDATE PAYMENTS:
    status = "refunded"
    refund_amount = order_total

Step 4: Update Customer Tier
  CUSTOMERS.lifetime_value -= order_total
  --- Might drop tier! ---
  (If was $2000, now $1900: VIP → Premium)

Step 5: Create AUDIT_LOG entry
  "Order ORD-001 cancelled and refunded"

Step 6: Update ORDER Status
  UPDATE ORDERS:
    status = "cancelled"

========== ENTIRE RETURN PROCESS IN 1 DATABASE CALL ==========
```

---

## 📈 Data Flow Diagram

```
                    ┌─────────────────┐
                    │   WEB BROWSER   │
                    │   (Customer)    │
                    └────────┬────────┘
                             │ User clicks "Buy"
                             ↓
               ┌─────────────────────────────┐
               │  NEXT.JS FRONTEND           │
               │  (login/product/checkout)   │
               └────────────┬────────────────┘
                            │ API Call
                            ↓
         ┌──────────────────────────────────────────┐
         │     DJANGO REST API                      │
         │  (JWT validates user, calls database)    │
         └────────────────┬─────────────────────────┘
                          │
                          ↓
         ┌──────────────────────────────────────────┐
         │  POSTGRESQL DATABASE                     │
         │                                          │
         │  1. Check INVENTORY (is stock available) │
         │  2. Look up EXCHANGE_RATES (convert $)   │
         │  3. Create ORDERS + ORDER_ITEMS          │
         │  4. Update INVENTORY (reduce stock)      │
         │  5. Trigger REORDER_REQUESTS (if needed) │
         │  6. Create SHIPMENTS                     │
         │  7. Create AUDIT_LOG (record action)     │
         │  8. Update CUSTOMER tier (if spending $) │
         │                                          │
         │  [TRIGGERS auto-execute steps 5,8]       │
         │  [STORED PROCEDURE does steps 1-8]       │
         └────────────────┬─────────────────────────┘
                          │ Returns: Order ID
                          ↓
         ┌──────────────────────────────────────────┐
         │  DJANGO BACKEND                          │
         │  (Formats response)                      │
         └────────────────┬─────────────────────────┘
                          │ JSON Response
                          ↓
         ┌──────────────────────────────────────────┐
         │  NEXT.JS FRONTEND                        │
         │  (Shows "Order Confirmed!")              │
         └──────────────────────────────────────────┘
```

---

## 🔍 How the Database Prevents Problems

### **Problem 1: Overselling (selling more stock than exists)**

```
❌ Without Triggers:
Customer A buys last jacket
  → Inventory = 0
Customer B also buys (somehow)
  → Inventory = -1 (PROBLEM!)

✅ With Database Constraints:
BEFORE inserting into ORDERS:
  CHECK: SELECT quantity FROM INVENTORY
    WHERE product_id = X
  IF quantity < quantity_requested THEN
    REJECT order
  END IF
```

---

### **Problem 2: Inconsistent Customer Tier**

```
❌ Without Triggers:
Customer spends $2000
Admin must manually:
  1. Check spending total
  2. Update tier
  3. Notify customer
  (Someone forgets step 3!)

✅ With Triggers:
Customer spends $2000
TRIGGER automatically:
  1. Detects spending change
  2. Updates tier
  3. Records in AUDIT_LOG
  (All 3 steps guaranteed!)
```

---

### **Problem 3: Lost Information During Order**

```
❌ Without Stored Procedures:
System tries to:
  1. Check inventory ✓
  2. Reduce stock ✓
  3. Create order ✓
  4. Process payment ✗ FAILS!
  
  Result: Inventory reduced but no order created!

✅ With Stored Procedures:
System tries ENTIRE SEQUENCE:
  1. Check inventory ✓
  2. Reduce stock ✓
  3. Create order ✓
  4. Process payment ✗ FAILS!
  
  Result: ENTIRE OPERATION ROLLED BACK
  (All changes undone - clean state)
```

---

## 📊 Index Strategy (Making Queries Fast)

```
Indexes Created On:

1. USERS.email
   ├─ Reason: Login requires find-by-email
   ├─ Query: SELECT * FROM USERS WHERE email = "alice@..."
   └─ Speed: Instant (0.001 seconds) even with 1M users

2. PRODUCTS.category_id
   ├─ Reason: Browse by category is common
   ├─ Query: SELECT * FROM PRODUCTS WHERE category_id = 5
   └─ Speed: Shows 50 products immediately

3. ORDERS.customer_id
   ├─ Reason: "Show my orders" is common
   ├─ Query: SELECT * FROM ORDERS WHERE customer_id = X
   └─ Speed: Finds 100 orders in 0.01 seconds

4. INVENTORY.warehouse_id
   ├─ Reason: Check stock in warehouse
   ├─ Query: SELECT quantity FROM INVENTORY WHERE warehouse_id = "lagos"
   └─ Speed: Shows real-time stock levels

5. EXCHANGE_RATES.effective_date
   ├─ Reason: Get today's currency rates
   ├─ Query: SELECT rate WHERE effective_date = TODAY
   └─ Speed: Finds current rates instantly

6. CART_ITEMS.cart_id
   ├─ Reason: Show items in shopping cart
   ├─ Query: SELECT * FROM CART_ITEMS WHERE cart_id = users_cart
   └─ Speed: Shows 50 items in cart instantly
```

---

## 💾 Estimated Storage

```
Table                Rows      Size
────────────────────────────────────
USERS               8          ~2 KB
ROLES               3          ~1 KB
CUSTOMERS           5          ~2 KB
SELLERS             3          ~1 KB
ADDRESSES           12         ~5 KB
CATEGORIES          15         ~5 KB
PRODUCTS            50         ~25 KB
ATTRIBUTES          12         ~3 KB
PRODUCT_ATTRIBUTES  60         ~10 KB
PRODUCT_VARIANTS    200        ~50 KB
PRODUCT_IMAGES      150        ~30 KB
CURRENCIES          12         ~2 KB
EXCHANGE_RATES      100        ~10 KB
CUSTOMER_TIERS      3          ~1 KB
WAREHOUSES          5          ~2 KB
INVENTORY           500        ~100 KB
REORDER_REQUESTS    5          ~2 KB
CART                3          ~1 KB
CART_ITEMS          8          ~2 KB
WISHLIST            15         ~3 KB
COUPONS             8          ~3 KB
ORDERS              20         ~10 KB
ORDER_ITEMS         40         ~10 KB
PAYMENTS            20         ~5 KB
SHIPMENTS           20         ~5 KB
REVIEWS             30         ~10 KB
NOTIFICATIONS       100        ~20 KB
AUDIT_LOG           500        ~100 KB
────────────────────────────────────
TOTAL              ~1,700     ~5 MB
────────────────────────────────────

With 1 year of real orders:
├─ ORDERS:        1,000,000 (1M orders)
├─ ORDER_ITEMS:   5,000,000 (5M items)
├─ AUDIT_LOG:     10,000,000 (10M audit entries)
├─ INVENTORY:     (historical tracking) 20M rows
└─ Total Size:    ~10-15 GB

(Still manageable - PostgreSQL standards are 100+ GB)
```

---

## ✅ Validation Rules

```
Field                    Validation Rule                  Prevents
────────────────────────────────────────────────────────────────────
USERS.email             Must match email regex           Fake emails
USERS.email             UNIQUE                           Duplicate accounts
PRODUCTS.base_price     >= 0                             Negative prices
INVENTORY.quantity      >= 0                             Negative stock
EXCHANGE_RATES.rate     > 0                              Bad conversions
CUSTOMER_TIERS.         between 0-100%                   Invalid discounts
discount_percentage     
ORDERS.total_amount     >= 0                             Negative totals
REVIEWS.rating          between 1-5                      Invalid ratings
COUPONS.discount_value  >= 0                             Negative discounts
────────────────────────────────────────────────────────────────────

Database enforces all validations:
✓ Invalid data CANNOT be inserted
✓ Frontend can't sneak bad data around API
✓ Backend can't bypass database constraints
```

---

## 🎯 Key Takeaways

### **Why This Database Design is Good:**

1. **No Data Inconsistency** — Triggers keep everything in sync
2. **Fast Queries** — Indexes make searches instant
3. **Safe Transactions** — Orders all-or-nothing
4. **Audit Trail** — Every change recorded
5. **Scalable** — Can handle millions of products/orders
6. **Flexible Schema** — JSONB allows extra attributes
7. **Business Logic in DB** — Stored procedures prevent bugs

### **Real Benefits:**

- ✅ No inventory overselling
- ✅ Customers auto-upgraded at right time
- ✅ Exchange rates captured with every order
- ✅ Complete history for support/audits
- ✅ Can answer questions like: "Which products are selling best?" instantly
- ✅ Can detect fraud: "Same customer, different address pattern"

---

## 📚 References

- **ER Diagram:** See `DigitalFashionHub_ERD.png` in project root
- **DDL SQL:** See `database/schema/001_create_tables.sql`
- **Indexes:** See `database/schema/002_indexes.sql`
- **Views & Procedures:** See `database/schema/003_fixes_and_views.sql`

---

**Document Version:** 1.0  
**Last Updated:** March 26, 2026  
**For Questions:** Refer to README.md or contact NJOYA MEDIN
