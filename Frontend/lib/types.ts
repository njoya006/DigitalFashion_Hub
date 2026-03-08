// FILE: lib/types.ts
// All TypeScript interfaces for DigitalFashion Hub

// ── Product ──────────────────────────────────────────
export interface ProductImage {
  id: number
  url: string
  altText: string
  isPrimary: boolean
  sortOrder: number
}

export interface ProductAttribute {
  id: number
  name: string
  value: string
}

export interface ProductVariant {
  id: number
  sku: string
  size?: string
  color?: string
  stock: number
  price: number
  compareAtPrice?: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice?: number
  currency: string
  category: string
  subcategory?: string
  tags: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  sellerId: number
  sellerName: string
  warehouseId?: number
  stock: number
  rating: number
  reviewCount: number
  badge?: string
  badgeColor?: 'gold' | 'gold-light'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ── Customer / Auth ───────────────────────────────────
export type CustomerTier = 'standard' | 'premium' | 'vip'

export interface Customer {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatar?: string
  tier: CustomerTier
  totalSpent: number
  loyaltyPoints: number
  createdAt: string
  addresses: Address[]
}

export interface Address {
  id: number
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  isDefault: boolean
}

// ── Seller ────────────────────────────────────────────
export interface Seller {
  id: number
  businessName: string
  slug: string
  email: string
  logo?: string
  bio?: string
  rating: number
  verified: boolean
  productsCount: number
  joinedAt: string
  warehouseIds: number[]
}

// ── Order ─────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productImage: string
  variantId?: number
  variantLabel?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
  discountApplied: number
}

export interface Order {
  id: number
  orderNumber: string
  customerId: number
  status: OrderStatus
  items: OrderItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  currency: string
  shippingAddress: Address
  paymentMethod: string
  notes?: string
  createdAt: string
  updatedAt: string
  estimatedDelivery?: string
}

// ── Cart ──────────────────────────────────────────────
export interface CartItem {
  id: number
  productId: number
  productName: string
  productImage: string
  variantId?: number
  variantLabel?: string
  quantity: number
  unitPrice: number
  currency: string
  sellerId: number
}

export interface Cart {
  id: string
  customerId?: number
  items: CartItem[]
  subtotal: number
  currency: string
  itemCount: number
  updatedAt: string
}

// ── Currency ──────────────────────────────────────────
export interface Currency {
  code: string
  name: string
  symbol: string
  flag?: string
}

export interface ExchangeRate {
  base: string
  target: string
  rate: number
  change: string
  trend: 'up' | 'down' | 'neutral'
  updatedAt: string
}

// ── Warehouse ─────────────────────────────────────────
export interface Warehouse {
  id: number
  name: string
  city: string
  country: string
  countryCode: string
  flag: string
  capacity: number
  usedCapacity: number
  skuCount: string
  isActive: boolean
}

export interface Inventory {
  id: number
  productId: number
  variantId?: number
  warehouseId: number
  quantity: number
  reserved: number
  available: number
}

// ── Review ────────────────────────────────────────────
export interface Review {
  id: number
  productId: number
  customerId: number
  customerName: string
  customerAvatar?: string
  rating: number
  title?: string
  body: string
  helpful: number
  verified: boolean
  createdAt: string
}

// ── Notification ──────────────────────────────────────
export interface Notification {
  id: number
  userId: number
  type: 'order' | 'promo' | 'system' | 'wishlist'
  title: string
  message: string
  isRead: boolean
  link?: string
  createdAt: string
}

// ── API Responses ─────────────────────────────────────
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
