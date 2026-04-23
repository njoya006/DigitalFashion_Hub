export interface WishlistItem {
  productId: string
  productName: string
  slug: string
  sellerName: string
  categoryName: string
  currencyCode: string
  price: number
  imageUrl: string
  addedAt: string
}

const STORAGE_KEY = 'digitalfashion_wishlist'

function readWishlist(): WishlistItem[] {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value ? (JSON.parse(value) as WishlistItem[]) : []
  } catch {
    return []
  }
}

function writeWishlist(items: WishlistItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function getWishlistItems(): WishlistItem[] {
  return readWishlist()
}

export function isWishlisted(productId: string): boolean {
  return readWishlist().some((item) => item.productId === productId)
}

export function toggleWishlistItem(item: Omit<WishlistItem, 'addedAt'>): WishlistItem[] {
  const current = readWishlist()
  const exists = current.some((wishlistItem) => wishlistItem.productId === item.productId)

  const next = exists
    ? current.filter((wishlistItem) => wishlistItem.productId !== item.productId)
    : [{ ...item, addedAt: new Date().toISOString() }, ...current]

  writeWishlist(next)
  return next
}

export function removeWishlistItem(productId: string): WishlistItem[] {
  const next = readWishlist().filter((item) => item.productId !== productId)
  writeWishlist(next)
  return next
}
