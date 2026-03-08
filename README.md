# DigitalFashion Hub 🛍️

> A premium, full-featured general e-commerce marketplace built on Next.js, Django REST Framework, and PostgreSQL — designed for scale, consistency, and an exceptional user experience.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Django](https://img.shields.io/badge/Django-5.x-green?logo=django)](https://djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)](https://postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Advanced Features](#advanced-features)
- [Database Schema](#database-schema)
- [Team & Task Distribution](#team--task-distribution)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Milestones & Timeline](#milestones--timeline)
- [Deployment](#deployment)

---

## Project Overview

**DigitalFashion Hub** is a sophisticated general marketplace platform inspired by Amazon, purpose-built for the ICT 3212 Advanced Database Systems course at ICT University, Cameroon. It demonstrates mastery of:

- Complex relational database design (28 entities)
- Advanced PostgreSQL features (triggers, stored procedures, views, transactions)
- Multi-currency commerce with live exchange rate support
- Tiered customer loyalty (Standard / Premium / VIP) with automated upgrades
- Multi-warehouse inventory management with auto-reorder triggers
- Hybrid product attribute storage (EAV + JSONB)

**Target Users:** Customers, Sellers, and Admins across multiple countries and currencies.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│              Next.js 15 (App Router)                    │
│     Customer UI │ Seller Dashboard │ Admin Panel        │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API (JWT Auth)
┌──────────────────────────▼──────────────────────────────┐
│                    API LAYER                             │
│              Django REST Framework                      │
│   Auth │ Products │ Orders │ Inventory │ Analytics      │
└──────────────────────────┬──────────────────────────────┘
                           │ ORM + Raw SQL + Stored Procs
┌──────────────────────────▼──────────────────────────────┐
│                  DATABASE LAYER                          │
│                  PostgreSQL 16                          │
│  Triggers │ Stored Procs │ Views │ Indexes │ JSONB      │
└─────────────────────────────────────────────────────────┘
```

---

## Advanced Features

| Feature | Description | DB Mechanism |
|---|---|---|
| 🌍 **Multi-Currency** | Prices in any currency, live rates | `Exchange_Rates` table + rate snapshot on order |
| 👑 **Customer Tiers** | Standard / Premium / VIP with discounts | Trigger auto-upgrades tier on `lifetime_value` change |
| 📦 **Multi-Warehouse** | Inventory tracked per warehouse | `Inventory` table + fulfillment routing |
| 🔄 **Auto-Reorder** | Triggers reorder when stock falls below threshold | `AFTER UPDATE` trigger on `Inventory` |
| 🏷️ **Dynamic Attributes** | EAV for structured + JSONB for flexible attrs | `Product_Attributes` + `Product_Variants.extra_attributes` |
| 🔐 **ACID Transactions** | Safe concurrent order processing | Isolation levels + row-level locking |
| 📊 **Audit Logging** | Every critical action logged automatically | `Audit_Log` filled by triggers |
| 🎟️ **Coupon Engine** | Percent & fixed discounts with usage limits | `Coupons` table with constraint checks |
| ⭐ **Reviews System** | Verified purchase reviews only | FK to `Orders` ensures authenticity |
| 🔔 **Notifications** | Real-time alerts for users | `Notifications` table |

---

## Database Schema

See [`ERD.md`](ERD.md) for the full entity-relationship diagram with all 28 entities.

### Core Entity Groups

```
Auth & Users          → Users, Roles, Customers, Sellers, Addresses
Product Catalog       → Categories, Products, Attributes, Product_Attributes,
                        Product_Variants, Product_Images
Inventory             → Warehouses, Inventory, Reorder_Requests
Commerce              → Cart, Cart_Items, Wishlist, Coupons
Orders                → Orders, Order_Items, Payments, Shipments
Loyalty               → Customer_Tiers (+ trigger-based auto-upgrade)
Currency              → Currencies, Exchange_Rates
Engagement            → Reviews, Notifications
Observability         → Audit_Log
```

---

## Team & Task Distribution

> **Team: DigitalFashion Hub** — 4 members, tasks assigned based on individual skill levels.
> The strongest member leads architecture and mentors others throughout the semester.

---

### 🔥 NJOYA MEDIN — Full-Stack Lead & Database Architect
**Skill Level: Full-Stack (Strong)**
**Role: Technical Lead — owns the hardest, most critical parts of the project**

NJOYA carries the database foundation and the most complex backend logic. As team lead, he also reviews and integrates everyone else's work.

#### Database (owns entire schema)
- [ ] Design and implement the full PostgreSQL schema — all 28 tables, complete DDL scripts
- [ ] Write all `CREATE INDEX` statements (FKs, email, slug, status, effective_date)
- [ ] Implement the **auto-reorder trigger** on `Inventory` (AFTER UPDATE, when qty < threshold)
- [ ] Implement the **tier-upgrade trigger** on `Customers.lifetime_value` (auto-promotes Standard → Premium → VIP)
- [ ] Implement the **audit logging trigger** for `Products`, `Orders`, `Inventory` tables
- [ ] Write stored procedure: `place_order()` — full atomic transaction (check stock → deduct → apply discount → snapshot exchange rate → create order)
- [ ] Write stored procedure: `cancel_order()` — with full inventory rollback
- [ ] Write stored procedure: `convert_price(amount, from, to, date)`
- [ ] Create materialized view: `ProductSalesSummary`
- [ ] Create view: `CustomerTierOverview`, `InventoryAlertView`, `OrderStatusDashboard`
- [ ] Write all seed data (currencies, tiers, warehouses, categories, sample products)

#### Backend (Django)
- [ ] Set up Django project, PostgreSQL connection, environment config
- [ ] Implement JWT authentication (register, login, refresh, logout)
- [ ] Build `Users`, `Roles`, `Customers`, `Sellers` models, serializers, and views
- [ ] Implement role-based permission classes (`IsAdmin`, `IsSeller`, `IsCustomer`)
- [ ] Build `Orders` API — calls `place_order()` stored procedure
- [ ] Build `Payments` handler (Stripe / MTN MoMo webhook integration)
- [ ] Build Admin analytics API (revenue by currency, top products, user growth)
- [ ] Set up Celery + scheduled task for hourly exchange rate refresh (OpenExchangeRates API)

#### Frontend (Next.js)
- [ ] Project setup (Next.js 15 App Router, Tailwind CSS, Google Fonts)
- [ ] Homepage (`app/page.tsx`) — full luxury dark UI
- [ ] Authentication pages (Login, Register, Email Verification)
- [ ] Protected route middleware and role-based routing
- [ ] Admin Dashboard — full panel (users, sellers, inventory, revenue charts)
- [ ] Currency switcher component (global state, persisted)
- [ ] CI/CD pipeline (GitHub Actions → Vercel + Railway)

**Files owned:**
```
database/schema/, database/triggers/, database/procedures/, database/views/, database/seeds/
backend/config/, backend/apps/users/, backend/apps/orders/, backend/apps/payments/
backend/tasks/
frontend/app/(auth)/, frontend/app/admin/, frontend/app/page.tsx
frontend/components/CurrencySwitcher/
.github/workflows/
```

---

### 🌱 CHE BRIGHT — Frontend Developer (Guided)
**Skill Level: Basic HTML/CSS + Git + Basic SQL**
**Role: Frontend pages + Git repository manager**

Che handles frontend pages that follow an existing design pattern (set by NJOYA). His Git knowledge makes him the team's repository manager. SQL tasks are limited to writing simple queries with guidance.

#### Git & Project Management
- [ ] Create and maintain the GitHub repository
- [ ] Set up branch structure: `main`, `dev`, `feature/member-name`
- [ ] Write and enforce the pull request rules (no direct push to main)
- [ ] Manage merges and resolve basic conflicts
- [ ] Keep the README updated with progress

#### Frontend (Next.js — follows patterns set by NJOYA)
- [ ] Product listing page (`app/products/page.tsx`) — grid layout with filter sidebar
- [ ] Product detail page (`app/products/[id]/page.tsx`) — image gallery, variant selector, add to cart
- [ ] Search results page (`app/search/page.tsx`) — faceted filters
- [ ] Cart page (`app/cart/page.tsx`) — items list, quantity update, remove, totals
- [ ] Wishlist page (`app/wishlist/page.tsx`)
- [ ] Build reusable components: `ProductCard`, `FilterSidebar`, `PriceTag`, `TierBadge`

#### Database (guided, simple tasks)
- [ ] Write the seed SQL for: 20 sample products with variants and attributes
- [ ] Write the seed SQL for: 10 sample customers across different tiers
- [ ] Document what each table does in a `DATABASE_NOTES.md` file (1 paragraph per table)

> 💡 **Mentor note for Che:** NJOYA will provide component templates and design tokens. Your job is to implement pages by following the existing patterns. When stuck on SQL, refer to `database/seeds/001_seed_data.sql` as a reference. Ask before writing complex queries.

**Files owned:**
```
frontend/app/products/
frontend/app/search/
frontend/app/cart/
frontend/app/wishlist/
frontend/components/ProductCard/
frontend/components/FilterSidebar/
database/seeds/002_products_seed.sql
database/seeds/003_customers_seed.sql
docs/DATABASE_NOTES.md
```

---

### 🌱 ABOSI BLESSING — Documentation, Testing & Basic SQL
**Skill Level: Basic SQL + Total beginner in code**
**Role: Project documentation lead + SQL data entry + manual testing**

Blessing does not write application code but plays a critical role in keeping the project documented, tested, and presentable. Her basic SQL knowledge is used for data tasks.

#### Documentation (primary responsibility)
- [ ] Write the full `docs/USER_MANUAL.md` — how to use the app as a customer, seller, and admin (with screenshots once pages are built)
- [ ] Write `docs/API_GUIDE.md` — describe every API endpoint in plain English (NJOYA provides the list)
- [ ] Write `docs/DATABASE_DESIGN.md` — explain the ERD in plain English (what each entity is, why it exists)
- [ ] Write `docs/SETUP_GUIDE.md` — step-by-step instructions for running the project locally
- [ ] Maintain the project's `CHANGELOG.md` — log every feature completed each week
- [ ] Prepare the final presentation slides (PowerPoint / Google Slides) for demo day

#### SQL Data Tasks (guided)
- [ ] Write seed SQL for: currencies (all 12 supported), warehouses (all 5 locations)
- [ ] Write seed SQL for: customer tiers (Standard, Premium, VIP with correct values)
- [ ] Write seed SQL for: 5 coupon codes with different discount types
- [ ] Use pgAdmin (GUI tool) to verify seed data was inserted correctly — take screenshots for docs

#### Testing (manual)
- [ ] Create a `docs/TEST_CASES.md` file — write 30 manual test cases (feature, steps, expected result, pass/fail)
- [ ] Test every page once it is built by CHE or NJOYA — report bugs in GitHub Issues
- [ ] Test checkout flow end-to-end with different currencies
- [ ] Test tier upgrade by manually updating `lifetime_value` in pgAdmin and checking if trigger fires

> 💡 **Mentor note for Blessing:** You don't need to write JavaScript or Python. Focus on being the team's quality and knowledge manager. Use pgAdmin (a visual tool) for all SQL tasks — you don't need to use the terminal. NJOYA will give you the SQL templates to fill in. Your documentation is what makes the project look professional.

**Files owned:**
```
docs/USER_MANUAL.md
docs/API_GUIDE.md
docs/DATABASE_DESIGN.md
docs/SETUP_GUIDE.md
docs/TEST_CASES.md
CHANGELOG.md
database/seeds/001_currencies_warehouses_tiers_seed.sql
database/seeds/004_coupons_seed.sql
presentation/ (slides)
```

---

### 🌱 OBEMO EMMANUEL — Backend Junior & Seller Dashboard
**Skill Level: Basic HTML/CSS + Basic Python**
**Role: Supporting backend developer + Seller-facing frontend**

Emmanuel knows Python and basic HTML/CSS which makes him suitable for simple Django views and the Seller dashboard frontend. He will work on backend tasks that don't require deep SQL knowledge, and frontend pages that follow set patterns.

#### Backend (Django — simple views with guidance)
- [ ] Build `Products` CRUD API (`apps/products/`) — list, create, update, delete (NJOYA sets up models)
- [ ] Build `Categories` API — hierarchical listing
- [ ] Build `Reviews` API — submit review, list reviews for a product
- [ ] Build `Cart` API — add item, remove item, update quantity, clear cart
- [ ] Build `Wishlist` API — add, remove, list
- [ ] Build `Shipments` tracking API — update status, get tracking info
- [ ] Build `Notifications` API — list notifications, mark as read
- [ ] Build `Warehouses` & basic `Inventory` listing API (read-only)

#### Frontend (Next.js — Seller Dashboard)
- [ ] Seller Dashboard layout (`app/seller/layout.tsx`) — sidebar, header
- [ ] Seller Dashboard home (`app/seller/page.tsx`) — stats overview (total sales, orders, top products)
- [ ] Seller product management (`app/seller/products/`) — list, add new product, edit, toggle publish
- [ ] Seller orders view (`app/seller/orders/`) — view orders containing their products
- [ ] Customer Dashboard layout and home (`app/customer/`) — order history, tier status, loyalty points
- [ ] Order tracking page (`app/orders/[id]/page.tsx`) — status timeline, shipment info

> 💡 **Mentor note for Emmanuel:** For the backend, NJOYA will set up all the Django models and database connections. Your job is to write the API views (functions that receive requests and return responses). Study the pattern of one completed view (NJOYA will show you one), then repeat that pattern for your assigned endpoints. For frontend, follow the component templates CHE is using. When Python is confusing, read the Django REST Framework quickstart guide first.

**Files owned:**
```
backend/apps/products/
backend/apps/reviews/
backend/apps/cart/
backend/apps/inventory/ (read-only endpoints)
backend/apps/notifications/
frontend/app/seller/
frontend/app/customer/
frontend/app/orders/[id]/
```

---

## Skill Growth Plan

| Member | Current Level | Target by End of Semester | How |
|---|---|---|---|
| NJOYA MEDIN | Full-Stack | Advanced DB + System Design | Lead and implement the hardest features |
| CHE BRIGHT | Basic Frontend + Git | Intermediate Frontend + SQL | Build 6+ real pages; write seed SQL |
| ABOSI BLESSING | Basic SQL | SQL Data + Technical Writing | pgAdmin practice; document everything |
| OBEMO EMMANUEL | Basic Python + HTML | Junior Full-Stack | Build real Django APIs + dashboard pages |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16
- Redis (for Celery)
- pgAdmin 4 (GUI for database — recommended for Blessing)

### 1. Clone the Repository

```bash
git clone https://github.com/your-team/digitalfashion-hub.git
cd digitalfashion-hub
```

### 2. Database Setup

```bash
createdb digitalfashion_hub
psql digitalfashion_hub < database/schema/001_create_tables.sql
psql digitalfashion_hub < database/schema/002_indexes.sql
psql digitalfashion_hub < database/triggers/001_inventory_reorder.sql
psql digitalfashion_hub < database/triggers/002_tier_upgrade.sql
psql digitalfashion_hub < database/triggers/003_audit_log.sql
psql digitalfashion_hub < database/seeds/001_currencies_warehouses_tiers_seed.sql
psql digitalfashion_hub < database/seeds/002_products_seed.sql
psql digitalfashion_hub < database/seeds/003_customers_seed.sql
psql digitalfashion_hub < database/seeds/004_coupons_seed.sql
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your credentials
python manage.py migrate
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

App: `http://localhost:3000` | API: `http://localhost:8000/api/`

---

## Project Structure

```
digitalfashion-hub/
│
├── database/
│   ├── schema/              # DDL — owned by NJOYA
│   ├── triggers/            # Triggers — owned by NJOYA
│   ├── procedures/          # Stored procedures — owned by NJOYA
│   ├── views/               # Views — owned by NJOYA
│   └── seeds/               # Seed data — split across team
│
├── backend/                 # Django REST Framework
│   ├── config/              # NJOYA
│   ├── apps/
│   │   ├── users/           # NJOYA
│   │   ├── products/        # EMMANUEL
│   │   ├── orders/          # NJOYA
│   │   ├── cart/            # EMMANUEL
│   │   ├── payments/        # NJOYA
│   │   ├── inventory/       # EMMANUEL (read) / NJOYA (writes)
│   │   ├── reviews/         # EMMANUEL
│   │   └── notifications/   # EMMANUEL
│   └── tasks/               # NJOYA
│
├── frontend/                # Next.js 15
│   ├── app/
│   │   ├── page.tsx         # NJOYA — homepage
│   │   ├── (auth)/          # NJOYA
│   │   ├── products/        # CHE
│   │   ├── search/          # CHE
│   │   ├── cart/            # CHE
│   │   ├── wishlist/        # CHE
│   │   ├── checkout/        # NJOYA
│   │   ├── orders/[id]/     # EMMANUEL
│   │   ├── customer/        # EMMANUEL
│   │   ├── seller/          # EMMANUEL
│   │   └── admin/           # NJOYA
│   └── components/
│       ├── ProductCard/     # CHE
│       ├── FilterSidebar/   # CHE
│       └── CurrencySwitcher/# NJOYA
│
├── docs/                    # BLESSING
│   ├── USER_MANUAL.md
│   ├── API_GUIDE.md
│   ├── DATABASE_DESIGN.md
│   ├── SETUP_GUIDE.md
│   └── TEST_CASES.md
│
├── CHANGELOG.md             # BLESSING
├── ERD.md                   # NJOYA
└── README.md                # CHE (updates) / NJOYA (structure)
```

---

## API Documentation

Base URL: `http://localhost:8000/api/v1/`

| Method | Endpoint | Description | Owner | Auth |
|---|---|---|---|---|
| POST | `/auth/register/` | Register new user | NJOYA | Public |
| POST | `/auth/login/` | Get JWT tokens | NJOYA | Public |
| GET | `/products/` | List & filter products | EMMANUEL | Public |
| POST | `/products/` | Create product | EMMANUEL | Seller |
| GET | `/products/:id/` | Product detail | EMMANUEL | Public |
| POST | `/cart/items/` | Add to cart | EMMANUEL | Customer |
| DELETE | `/cart/items/:id/` | Remove from cart | EMMANUEL | Customer |
| POST | `/orders/place/` | Place order (stored proc) | NJOYA | Customer |
| GET | `/orders/` | Order history | NJOYA | Customer |
| GET | `/currencies/rates/` | Latest exchange rates | NJOYA | Public |
| GET | `/inventory/alerts/` | Low stock alerts | EMMANUEL | Admin/Seller |
| GET | `/admin/analytics/` | Revenue dashboard | NJOYA | Admin |

Full Swagger docs at: `http://localhost:8000/api/docs/`

---

## Milestones & Timeline

| Milestone | Deliverable | Owner(s) | Due |
|---|---|---|---|
| **M1** | Team formation, app idea, ERD sketch | ALL | Week 1 |
| **M2** | Full DDL schema + triggers + seed data | NJOYA + BLESSING | Week 3 |
| **M3** | Core API endpoints (auth, products, orders) | NJOYA + EMMANUEL | Week 5 |
| **M4** | Frontend pages (home, listing, cart, checkout) | NJOYA + CHE | Week 7 |
| **M5** | Seller + Customer dashboards | EMMANUEL | Week 9 |
| **M6** | Advanced features (multi-currency, tiers, reorder) | NJOYA | Week 11 |
| **M7** | Documentation, test cases, deployment | ALL + BLESSING leads | Week 13 |
| **Final** | Demo + full project report | ALL | Week 14 |

---

## Deployment

| Service | Platform | Free Tier | Owner |
|---|---|---|---|
| Next.js Frontend | **Vercel** | ✅ Free | NJOYA |
| Django API | **Railway** | ✅ $5 credit/month | NJOYA |
| PostgreSQL | **Railway** (bundled) | ✅ Included | NJOYA |
| Redis (Celery) | **Upstash** | ✅ Free tier | NJOYA |
| Media Storage | **Cloudinary** | ✅ Free tier | NJOYA |
| Exchange Rates | **Open Exchange Rates API** | ✅ Free tier | NJOYA |

---

## Team

| Member | Role | Skill Level | GitHub |
|---|---|---|---|
| **NJOYA MEDIN** | Full-Stack Lead & DB Architect | ⭐⭐⭐⭐⭐ Full-Stack | @njoya-medin |
| **CHE BRIGHT** | Frontend Developer & Git Manager | ⭐⭐ Basic Frontend | @che-bright |
| **ABOSI BLESSING** | Documentation & SQL Data Lead | ⭐ Basic SQL | @abosi-blessing |
| **OBEMO EMMANUEL** | Backend Junior & Seller Dashboard | ⭐⭐ Basic Python/HTML | @obemo-emmanuel |

---

*ICT 3212 — Advanced Database Systems | ICT University, Cameroon Campus, Yaoundé | 2026*