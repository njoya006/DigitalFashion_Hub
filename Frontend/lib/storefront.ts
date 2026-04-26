import api from '@/lib/api'

export interface ProductSummary {
  product_id: string
  seller_id: string
  seller_name: string | null
  category_id: string | null
  category_name: string | null
  currency_code: string
  product_name: string
  slug: string
  description: string | null
  base_price: string | number | null
  sku: string | null
  brand: string | null
  is_published: boolean
  is_featured: boolean
  tags: string[] | string | null
  meta_json: Record<string, unknown> | null
  created_at: string
  updated_at: string
  primary_image_url?: string | null
  primary_image_alt_text?: string | null
}

export interface ProductImage {
  image_id: string
  product_id: string
  variant_id: string | null
  image_url: string
  alt_text: string | null
  display_order: number | null
  is_primary: boolean | null
}

export interface ProductVariant {
  variant_id: string
  product_id: string
  variant_name: string
  extra_attributes: Record<string, unknown> | null
  price_modifier: string | number | null
  sku: string | null
  is_active: boolean | null
}

export interface ProductDetail extends ProductSummary {
  images: ProductImage[]
  variants: ProductVariant[]
}

export interface Category {
  category_id: string
  parent_category_id: string | null
  category_name: string
  slug: string
  icon_url: string | null
  display_order: number | null
}

export interface CartItem {
  variant_id: string
  quantity: number
  added_at: string
  product_id: string
  variant_name: string
  variant_sku: string | null
  price_modifier: string | number | null
  product_name: string
  slug: string
  base_price: string | number | null
  currency_code: string
  image_url: string
  stock_quantity: number
  warehouse_count: number
}

export interface CartPayload {
  cart_id: string
  customer_id: string | null
  session_id: string | null
  created_at: string
  updated_at: string
  items: CartItem[]
  subtotal: string | number
  item_count: number
}

export interface OrderSummary {
  order_id: string
  order_number: string
  customer_id: string
  currency_code: string
  order_date: string
  total_amount: string | number
  status: string
  payment_status: string
}

export interface OrderDetail extends OrderSummary {
  subtotal: string | number
  discount_amount: string | number
  shipping_cost: string | number
  tax_amount: string | number
  transaction_ref: string | null
  items: Array<{
    line_number: number
    variant_id: string
    warehouse_id: string | null
    quantity: number
    unit_price: string | number
    final_price: string | number
  }>
}

export interface ReviewSummary {
  review_id: string
  product_id: string
  product_name: string
  customer_id: string
  customer_name: string
  order_id: string | null
  rating: number
  title: string | null
  body: string | null
  is_approved: boolean | null
  helpful_votes: number
  created_at: string
}

export interface MeProfile {
  user_id: string
  email: string
  full_name: string
  phone: string | null
  avatar_url: string | null
  is_verified: boolean
  created_at: string
  role_name: string | null
  customer_profile?: {
    preferred_currency: string
    loyalty_points: number
    lifetime_value: string | number
    tier_name: string
    discount_percentage: string | number
  }
  seller_profile?: {
    store_name: string
    store_logo_url: string | null
    store_description: string | null
    commission_rate: string | number
    is_approved: boolean
    rating: string | number
    total_sales: string | number
  }
}

export interface CreateProductPayload {
  product_name: string
  base_price: number | string
  currency_code: string
  sku?: string
  category_id?: number | string | null
  description?: string
  brand?: string
  is_published?: boolean
  is_featured?: boolean
  tags?: string[]
  meta_json?: Record<string, unknown> | null
  image_url?: string
  alt_text?: string
}

export interface ProductSalesSummary {
  product_id: string
  product_name: string
  slug: string
  currency_code: string
  base_price: string | number | null
  is_published: boolean
  is_featured: boolean
  primary_image_url: string | null
  total_units_sold: number
  gross_sales: string | number
  order_count: number
}

export interface PlaceOrderPayload {
  currency_code: string
  shipping_address_id: string
  items: Array<{ variant_id: string; quantity: number }>
  coupon_code?: string
  shipping_cost?: number
  tax_rate?: number
}

function toQuery(params?: Record<string, string | number | boolean | undefined>): Record<string, string> | undefined {
  if (!params) return undefined
  const query: Record<string, string> = {}
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query[key] = String(value)
  })
  return Object.keys(query).length ? query : undefined
}

export function normalizeTags(tags: string[] | string | null): string[] {
  if (!tags) return []
  if (Array.isArray(tags)) return tags.filter(Boolean)

  try {
    const parsed = JSON.parse(tags)
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [tags]
  } catch {
    return tags
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
}

export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value
  if (value === null || value === undefined || value === '') return 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function getPrimaryImage(product: ProductSummary | ProductDetail): string {
  return product.primary_image_url || ('images' in product && product.images?.[0]?.image_url) || ''
}

export function getProductVariantLabel(variant: ProductVariant | undefined): string {
  if (!variant) return 'Default'
  return variant.variant_name || variant.sku || 'Variant'
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await api.get<{ success: boolean; data: Category[] }>('/products/categories/')
  return response.data
}

export async function fetchProducts(params?: Record<string, string | number | boolean | undefined>): Promise<ProductSummary[]> {
  const response = await api.get<{ success: boolean; data: ProductSummary[] }>('/products/', toQuery(params))
  return response.data
}

export async function fetchProduct(productId: string, includeUnpublished = false): Promise<ProductDetail> {
  const query = includeUnpublished ? { include_unpublished: 'true' } : undefined
  const response = await api.get<{ success: boolean; data: ProductDetail }>(`/products/${productId}/`, query)
  return response.data
}

export async function fetchReviews(params?: Record<string, string | number | boolean | undefined>): Promise<ReviewSummary[]> {
  const response = await api.get<{ success: boolean; data: ReviewSummary[] }>('/reviews/', toQuery(params))
  return response.data
}

export async function fetchCart(): Promise<CartPayload> {
  const response = await api.get<{ success: boolean; data: CartPayload }>('/cart/')
  return response.data
}

export async function addToCart(variantId: string, quantity = 1) {
  return api.post<{ success: boolean; data: unknown }>('/cart/items/', { variant_id: variantId, quantity })
}

export async function updateCartItem(variantId: string, quantity: number) {
  return api.put<{ success: boolean; data: unknown }>(`/cart/items/${variantId}/`, { quantity })
}

export async function removeCartItem(variantId: string) {
  return api.del<{ success: boolean; data: unknown }>(`/cart/items/${variantId}/`)
}

export async function fetchOrders(): Promise<OrderSummary[]> {
  const response = await api.get<{ success: boolean; data: OrderSummary[] }>('/orders/')
  return response.data
}

export async function fetchOrder(orderId: string): Promise<OrderDetail> {
  const response = await api.get<{ success: boolean; data: OrderDetail }>(`/orders/${orderId}/`)
  return response.data
}

export async function fetchMe(): Promise<MeProfile> {
  const response = await api.get<{ success: boolean; data: MeProfile }>('/auth/me/')
  return response.data
}

export async function placeOrder(payload: PlaceOrderPayload) {
  return api.post<{ success: boolean; data: { order_id?: string; order_number?: string; [key: string]: unknown } }>('/orders/place/', payload)
}

export async function createProduct(payload: CreateProductPayload) {
  return api.post<{ success: boolean; message?: string; data: { product_id: string; [key: string]: unknown } }>('/products/', payload)
}

export async function fetchProductSales(params?: Record<string, string | number | boolean | undefined>): Promise<ProductSalesSummary[]> {
  const response = await api.get<{ success: boolean; data: ProductSalesSummary[] }>('/products/sales/', toQuery(params))
  return response.data
}
