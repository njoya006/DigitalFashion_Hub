"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchCategories, fetchMe, fetchProducts, createProduct, getPrimaryImage, toNumber, type Category, type MeProfile, type ProductSummary } from '@/lib/storefront'
import { formatPrice, truncate } from '@/lib/utils'

export default function SellerProductsPage() {
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [productName, setProductName] = useState('')
  const [sku, setSku] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [brand, setBrand] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadProducts() {
      const [me, categoryList] = await Promise.all([fetchMe(), fetchCategories()])
      const data = await fetchProducts({ seller_id: me.user_id, include_unpublished: true, limit: 50 })
      if (!mounted) return
      setProfile(me)
      setCategories(categoryList)
      setProducts(data)
      setLoading(false)
    }

    loadProducts().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  async function handleCreateProduct(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const response = await createProduct({
        product_name: productName.trim(),
        sku: sku.trim() || undefined,
        base_price: basePrice,
        currency_code: currencyCode,
        category_id: categoryId ? Number(categoryId) : null,
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        is_published: isPublished,
        is_featured: isFeatured,
        image_url: imageUrl.trim() || undefined,
      })

      setSuccess(response.message || 'Product created successfully.')
      setProductName('')
      setSku('')
      setBasePrice('')
      setDescription('')
      setBrand('')
      setImageUrl('')
      setIsPublished(false)
      setIsFeatured(false)

      const me = profile || (await fetchMe())
      const data = await fetchProducts({ seller_id: me.user_id, include_unpublished: true, limit: 50 })
      setProducts(data)
      if (!profile) setProfile(me)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create product.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Seller</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Your products</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>This page now pulls the seller's catalog from the live products endpoint.</p>

        <form onSubmit={handleCreateProduct} style={{ display: 'grid', gap: 12, marginBottom: 26, padding: 18, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 12 }}>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Product name" required style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }} />
            <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU (optional)" style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }} />
            <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} type="number" min="0" step="0.01" placeholder="Price" required style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
            <select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="XAF">XAF</option>
            </select>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }}>
              <option value="">Category (optional)</option>
              {categories.map((category) => (
                <option key={category.category_id} value={category.category_id}>{category.category_name}</option>
              ))}
            </select>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand (optional)" style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }} />
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Primary image URL (optional)" style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)' }} />
          </div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" rows={4} style={{ padding: 12, border: '1px solid var(--border)', background: 'transparent', color: 'var(--white)', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} /> Publish now</label>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--muted)' }}><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} /> Feature product</label>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create product'}</button>
          </div>
          {error ? <p style={{ color: '#e7a0a0', fontSize: 13 }}>{error}</p> : null}
          {success ? <p style={{ color: '#a6dfad', fontSize: 13 }}>{success}</p> : null}
        </form>

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
