"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchProducts, getPrimaryImage, type ProductSummary } from '@/lib/storefront'
import { getWishlistItems, removeWishlistItem, type WishlistItem } from '@/lib/wishlist'
import { formatPrice } from '@/lib/utils'

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [catalog, setCatalog] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadWishlist() {
      setLoading(true)
      const stored = getWishlistItems()
      const catalogData = await fetchProducts({ limit: 50 })
      if (!mounted) return
      setItems(stored)
      setCatalog(catalogData)
      setLoading(false)
    }

    loadWishlist().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  function handleRemove(productId: string) {
    const next = removeWishlistItem(productId)
    setItems(next)
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Wishlist</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Saved for later</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>Wishlist is stored locally in the browser, while the product snapshots still point back to live backend product detail pages.</p>

        {loading ? (
          <div style={{ minHeight: 280, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : items.length ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {items.map((item) => {
              const liveMatch = catalog.find((product) => product.product_id === item.productId)
              const image = liveMatch ? getPrimaryImage(liveMatch) : item.imageUrl
              return (
                <article key={item.productId} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)' }}>
                    {image ? <img src={image} alt={item.productName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
                  </div>
                  <div>
                    <Link href={`/products/${item.productId}`} style={{ display: 'block', color: 'var(--white)', fontSize: 24, marginBottom: 8 }}>{item.productName}</Link>
                    <p style={{ color: 'var(--muted)', marginBottom: 8 }}>{item.sellerName} · {item.categoryName}</p>
                    <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', fontSize: 22 }}>{formatPrice(item.price, item.currencyCode)}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'end', gap: 12 }}>
                    <button className="btn-ghost" type="button" onClick={() => handleRemove(item.productId)}>Remove</button>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}>Saved {new Date(item.addedAt).toLocaleDateString()}</span>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No saved items yet</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>Use the wishlist button on a product detail page to save pieces here.</p>
            <Link href="/products" className="btn-primary">Browse products</Link>
          </div>
        )}
      </section>
    </main>
  )
}

