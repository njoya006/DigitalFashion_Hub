"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchMe, fetchProducts, getPrimaryImage, toNumber, type MeProfile, type ProductSummary } from '@/lib/storefront'
import { formatPrice, truncate } from '@/lib/utils'

export default function SellerProductsPage() {
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProducts() {
      const me = await fetchMe()
      const data = await fetchProducts({ seller_id: me.user_id, include_unpublished: true, limit: 50 })
      if (!mounted) return
      setProfile(me)
      setProducts(data)
      setLoading(false)
    }

    loadProducts().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Seller</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Your products</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>This page now pulls the seller's catalog from the live products endpoint.</p>

        {loading ? (
          <div style={{ minHeight: 280, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : products.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {products.map((product) => {
              const image = getPrimaryImage(product)
              const sellerLabel = profile?.full_name || product.seller_name || 'Seller'
              return (
                <article key={product.product_id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ aspectRatio: '3 / 4', background: 'rgba(255,255,255,0.03)' }}>
                    {image ? <img src={image} alt={product.primary_image_alt_text || product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
                  </div>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{sellerLabel}</p>
                    <h2 style={{ marginTop: 6 }}>{product.product_name}</h2>
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{truncate(product.description || '', 100)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
                      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', fontSize: 22 }}>{formatPrice(toNumber(product.base_price), product.currency_code)}</div>
                      <span style={{ color: 'var(--muted)', fontSize: 11 }}>{product.is_published ? 'Published' : 'Draft'}</span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No seller products found</h2>
            <p style={{ color: 'var(--muted)' }}>If you are signed in as a seller, backend products for your account will appear here.</p>
          </div>
        )}
      </section>
    </main>
  )
}
