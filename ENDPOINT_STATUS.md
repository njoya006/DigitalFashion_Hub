# API Endpoint Status & Frontend Integration Guide

**Last Updated**: 2026-04-30  
**Swagger Available At**: `http://localhost:8000/api/docs/` (local) or `https://your-render-url/api/docs/` (production)

---

## 1. SHIPPING ADDRESS PROBLEM SOLUTION

### Current Issue
Users must input a `shipping_address_id` (integer) during checkout, but:
- They don't know what IDs exist
- No UI to create/manage addresses
- No way to enter location as a human-readable string

### Solution Required
We need to create a **Addresses Management System**:

1. **Backend Changes** (Create new `apps/addresses` app):
   - `POST /api/v1/addresses/` - Create new address
   - `GET /api/v1/addresses/` - List user's addresses
   - `PUT /api/v1/addresses/{id}/` - Update address
   - `DELETE /api/v1/addresses/{id}/` - Delete address

2. **Frontend Changes**:
   - Add "Manage Addresses" page in customer dashboard
   - Show address picker on checkout page (dropdown)
   - Allow adding new address inline during checkout
   - Show user's saved addresses with ability to mark as default

3. **Address Data Fields**:
   ```json
   {
     "address_id": 1,
     "street": "123 Main St",
     "city": "Douala",
     "state": "Littoral",
     "postal_code": "2700",
     "country": "Cameroon",
     "phone": "+237123456789",
     "is_default": true,
     "recipient_name": "John Doe"
   }
   ```

---

## 2. WORKING ENDPOINTS (Tested & Swagger-Ready) ✅

### Authentication
- `POST /api/v1/auth/login/` - User login
- `POST /api/v1/auth/register/` - Customer registration
- `POST /api/v1/auth/register/seller/` - Seller registration
- `GET /api/v1/auth/me/` - Get current user profile
- `POST /api/v1/auth/logout/` - User logout
- `POST /api/v1/auth/token/refresh/` - Refresh JWT token

### Products
- `GET /api/v1/products/` - List products (with filters: search, category, featured, published)
- `POST /api/v1/products/` - Create product (seller only)
- `GET /api/v1/products/categories/` - List all categories
- `GET /api/v1/products/{product_id}/` - Get product detail
- `GET /api/v1/products/sales/` - Get seller's product sales (seller only)
- `GET /api/v1/products/top-ordered/` - Get top 10 products by order count

### Orders
- `GET /api/v1/orders/` - List user's orders
- `POST /api/v1/orders/place/` - Place new order
- `GET /api/v1/orders/{order_id}/` - Get order detail
- `POST /api/v1/orders/{order_id}/cancel/` - Cancel order

### Cart
- `GET /api/v1/cart/` - Get user's cart
- `POST /api/v1/cart/items/` - Add item to cart
- `PUT /api/v1/cart/items/{variant_id}/` - Update cart item quantity
- `DELETE /api/v1/cart/items/{variant_id}/` - Remove item from cart

### Currencies
- `GET /api/v1/currencies/` - List all currencies
- `GET /api/v1/currencies/rates/` - Get current exchange rates
- `POST /api/v1/currencies/convert/` - Convert price between currencies
- `POST /api/v1/currencies/refresh/` - Refresh rates (admin only)

### Reviews
- `GET /api/v1/reviews/` - List reviews
- `POST /api/v1/reviews/` - Create review (customer only)

### Notifications
- `GET /api/v1/notifications/` - Get user's notifications
- `POST /api/v1/notifications/{id}/read/` - Mark notification as read
- `POST /api/v1/notifications/mark-all-read/` - Mark all as read

### Inventory
- `GET /api/v1/inventory/` - List inventory items
- `GET /api/v1/inventory/{inventory_id}/` - Get inventory detail

---

## 3. NON-WORKING/MISSING ENDPOINTS (Need Frontend Integration) ⚠️

### Email & Password Management (Partially Working)
- `POST /api/v1/auth/request-verify/` - Request email verification
- `POST /api/v1/auth/confirm-verify/` - Confirm email verification
- `POST /api/v1/auth/request-reset/` - Request password reset
- `POST /api/v1/auth/confirm-reset/` - Confirm password reset
- **Status**: Endpoints exist but frontend pages exist without full integration
- **Frontend Impact**: Verify email page partially works, password reset needs testing

### Addresses Management (COMPLETELY MISSING) ❌
- `GET /api/v1/addresses/` - List user's addresses
- `POST /api/v1/addresses/` - Create new address
- `PUT /api/v1/addresses/{address_id}/` - Update address
- `DELETE /api/v1/addresses/{address_id}/` - Delete address
- **Status**: Backend endpoints don't exist
- **Frontend Impact**: Checkout page hardcodes address entry - MUST BUILD THIS FIRST

### Payment Webhook (Stub Only)
- `POST /api/v1/orders/payments/webhook/` - Payment webhook handler
- **Status**: Endpoint exists but doesn't validate/process real payments
- **Frontend Impact**: No payment integration UI (Stripe, PayPal, etc. needed)

### Admin Dashboard (Incomplete)
- `GET /api/v1/auth/admin/dashboard/` - Admin stats/analytics
- **Status**: Backend returns basic stats but needs expansion
- **Frontend Impact**: Admin analytics page shows mock data

---

## 4. PRIORITY INTEGRATION ROADMAP

### Phase 1 (URGENT - Block Checkout)
**Issue**: Users can't enter shipping addresses

1. **Create Addresses API** (Backend)
   - Time: 2-3 hours
   - Create `apps/addresses/` Django app
   - Models: Address
   - Views: CRUD + list by user
   - Serializers: AddressSerializer
   - URLs: Include in main config

2. **Build Address UI** (Frontend)
   - Time: 3-4 hours
   - New page: `/customer/addresses`
   - Add/Edit/Delete address forms
   - Checkout page: Replace text input with address dropdown + "Add New" button
   - Mark default address
   - Files to create:
     - `Frontend/app/customer/addresses/page.tsx`
     - Update `Frontend/app/checkout/page.tsx`
     - Add API helpers in `Frontend/lib/storefront.ts`

### Phase 2 (Important - Email/Password)
**Issue**: User account security workflows incomplete

1. **Email Verification** (Frontend Integration)
   - Time: 1-2 hours
   - Update `/verify-email` page to call `POST /api/v1/auth/confirm-verify/`
   - Update `/register` to show "Check your email" message
   - Test the flow end-to-end

2. **Password Reset** (Frontend Integration)
   - Time: 1-2 hours
   - Update `/forgot-password` to call `POST /api/v1/auth/request-reset/`
   - Update `/reset-password` to call `POST /api/v1/auth/confirm-reset/`
   - Validate token in URL

### Phase 3 (Nice to Have - Payments)
**Issue**: Payment integration is missing

1. **Integrate Payment Gateway** (Stripe/PayPal)
   - Time: 4-6 hours
   - Add payment provider SDK
   - Create payment UI during checkout
   - Update order model with payment_method field
   - Hook webhook endpoint

### Phase 4 (Polish - Admin)
**Issue**: Admin dashboard is placeholder

1. **Expand Admin Analytics**
   - Time: 2-3 hours
   - Fetch real data from backend `/auth/admin/dashboard/`
   - Build admin dashboard UI
   - Add charts/graphs

---

## 5. ENDPOINT TESTING ON SWAGGER

### Accessing Swagger UI
- **Local**: `http://localhost:8000/api/docs/`
- **Production**: `https://your-render-domain.com/api/docs/`

### Testing a Protected Endpoint
1. Go to Swagger UI
2. Scroll to **POST /api/v1/auth/login/**
3. Click "Try it out"
4. Enter credentials:
   ```json
   {
     "email": "customer@test.com",
     "password": "password123"
   }
   ```
5. Execute and copy the `access` token
6. Click the **lock icon** (authorize button) at top right
7. Paste: `Bearer <access_token>`
8. Now all protected endpoints will include the token

### Testing File Upload Endpoints
1. POST `/api/v1/products/` (product creation with image file)
   - Prepare multipart form data
   - Base64 encode image and send as `image_file`

---

## 6. QUICK REFERENCE: ALL 30+ ENDPOINTS

| Method | Endpoint | Status | Auth | Notes |
|--------|----------|--------|------|-------|
| POST | /auth/login/ | ✅ | None | Returns JWT tokens |
| POST | /auth/register/ | ✅ | None | Create customer account |
| POST | /auth/register/seller/ | ✅ | None | Create seller account |
| GET | /auth/me/ | ✅ | JWT | Get profile + roles |
| POST | /auth/logout/ | ✅ | JWT | Blacklist token |
| POST | /auth/token/refresh/ | ✅ | JWT | Get new access token |
| POST | /auth/request-verify/ | ✅ | JWT | Send verification email |
| POST | /auth/confirm-verify/ | ✅ | None | Confirm email |
| POST | /auth/request-reset/ | ✅ | None | Send reset email |
| POST | /auth/confirm-reset/ | ✅ | None | Reset password |
| GET | /auth/admin/dashboard/ | ⚠️ | JWT+Admin | Needs expansion |
| GET | /products/ | ✅ | None | List with filters |
| POST | /products/ | ✅ | JWT+Seller | Create product |
| GET | /products/{id}/ | ✅ | None | Get product detail |
| GET | /products/categories/ | ✅ | None | List categories |
| GET | /products/sales/ | ✅ | JWT+Seller | Seller sales |
| GET | /products/top-ordered/ | ✅ | None | Top 10 products |
| GET | /cart/ | ✅ | JWT | Get user cart |
| POST | /cart/items/ | ✅ | JWT | Add to cart |
| PUT | /cart/items/{id}/ | ✅ | JWT | Update qty |
| DELETE | /cart/items/{id}/ | ✅ | JWT | Remove from cart |
| GET | /orders/ | ✅ | JWT | List orders |
| POST | /orders/place/ | ✅ | JWT | Create order |
| GET | /orders/{id}/ | ✅ | JWT | Get order detail |
| POST | /orders/{id}/cancel/ | ✅ | JWT | Cancel order |
| POST | /orders/payments/webhook/ | ⚠️ | None | Payment webhook (stub) |
| GET | /reviews/ | ✅ | None | List reviews |
| POST | /reviews/ | ✅ | JWT | Create review |
| GET | /notifications/ | ✅ | JWT | Get notifications |
| POST | /notifications/{id}/read/ | ✅ | JWT | Mark read |
| POST | /notifications/mark-all-read/ | ✅ | JWT | Mark all read |
| GET | /currencies/ | ✅ | None | List currencies |
| GET | /currencies/rates/ | ✅ | None | Exchange rates |
| POST | /currencies/convert/ | ✅ | None | Convert price |
| POST | /currencies/refresh/ | ✅ | JWT+Admin | Refresh rates |
| GET | /inventory/ | ✅ | None | List inventory |
| GET | /inventory/{id}/ | ✅ | None | Get inventory |
| **GET** | **/addresses/** | ❌ | JWT | **MISSING - CREATE** |
| **POST** | **/addresses/** | ❌ | JWT | **MISSING - CREATE** |
| **PUT** | **/addresses/{id}/** | ❌ | JWT | **MISSING - CREATE** |
| **DELETE** | **/addresses/{id}/** | ❌ | JWT | **MISSING - CREATE** |

---

## 7. ACTION ITEMS FOR THIS SPRINT

**Everyone should do**:
1. [ ] Verify Swagger is accessible: `http://localhost:8000/api/docs/`
2. [ ] Test a protected endpoint using Bearer token auth
3. [ ] Review the endpoint list above

**Backend Developer**:
1. [ ] Create `apps/addresses/` app (models, views, serializers, URLs)
2. [ ] Test addresses CRUD endpoints in Swagger
3. [ ] Expand admin dashboard endpoint with real queries

**Frontend Developer**:
1. [ ] Build `/customer/addresses` page (CRUD UI)
2. [ ] Update checkout page to use addresses dropdown instead of text input
3. [ ] Integrate email verification endpoints
4. [ ] Integrate password reset endpoints
5. [ ] Update `lib/storefront.ts` with address API calls

---

## Summary

**Swagger Status**: ✅ Working and accessible at `/api/docs/`

**Critical Blocker**: 🚨 No addresses management system - checkout cannot proceed without it

**Quick Wins** (1-2 hours each):
- Email verification integration
- Password reset integration
- User profile editing (if backend supports)

**Major Work** (2-4 hours each):
- Addresses system (full stack)
- Payment integration (requires external service)
