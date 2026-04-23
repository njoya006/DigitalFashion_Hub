'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchCategories, fetchProducts, getPrimaryImage, normalizeTags, toNumber, type Category, type ProductSummary } from '@/lib/storefront'
import { formatPrice, truncate } from '@/lib/utils'

function ProductCard({ product }: { product: ProductSummary }) {
  const image = getPrimaryImage(product)

  return (
    <article style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
      <Link href={`/products/${product.product_id}`} style={{ display: 'block' }}>
        <div style={{ aspectRatio: '3 / 4', background: 'linear-gradient(180deg, rgba(201,168,76,0.12), rgba(0,0,0,0.65))', position: 'relative' }}>
          {image ? (
            <img src={image} alt={product.primary_image_alt_text || product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              No image
            </div>
          )}
          {product.is_featured ? (
            <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', background: 'rgba(0,0,0,0.55)', border: '1px solid var(--border)', padding: '4px 8px', borderRadius: '999px' }}>
              Featured
            </span>
          ) : null}
        </div>
      </Link>
      <div style={{ padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{product.brand || product.seller_name || 'Digital Fashion Hub'}</p>
            <h3 style={{ fontSize: 22, marginTop: 6 }}>{product.product_name}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', fontSize: 22 }}>{formatPrice(toNumber(product.base_price), product.currency_code)}</div>
            <div style={{ color: 'var(--muted)', fontSize: 11 }}>{product.currency_code}</div>
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, minHeight: 40 }}>{truncate(product.description || 'Curated luxury piece available through the live storefront.', 110)}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--white)', border: '1px solid var(--border)', borderRadius: '999px', padding: '4px 8px' }}>{product.category_name || 'Uncategorized'}</span>
          {normalizeTags(product.tags).slice(0, 2).map((tag) => (
            <span key={tag} style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: '999px', padding: '4px 8px' }}>{tag}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default function ProductsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category_id') ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (activeCategory === '' || product.category_id === activeCategory) &&
          (query === '' || product.product_name.toLowerCase().includes(query.toLowerCase()) || product.description?.toLowerCase().includes(query.toLowerCase())),
      ),
    [products, activeCategory, query],
  )

  useEffect(() => {
    let mounted = true

    async function load() {
      setLoading(true)
      setError('')

      try {
        const [catData, prodData] = await Promise.all([fetchCategories(), fetchProducts({ limit: 100 })])
        if (!mounted) return
        setCategories(catData)
        setProducts(prodData)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to load products.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (activeCategory) params.set('category_id', activeCategory)
    router.push(`/products?${params.toString()}`)
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Storefront</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Shop products</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 32 }}>Browse our curated collection. This page now loads live data from the backend API.</p>

        <form
          onSubmit={handleSearch}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: 12,
            marginBottom: 32,
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 18,
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <input
            type="text"
            placeholder="Search by name or description"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--white)',
              fontFamily: 'inherit',
              fontSize: 14,
            }}
          />
          <select
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              color: 'var(--white)',
              fontFamily: 'inherit',
              fontSize: 14,
              padding: '8px 12px',
              cursor: 'pointer',
            }}
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              background: 'var(--gold)',
              border: 'none',
              color: 'var(--dark)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              padding: '8px 16px',
            }}
          >
            Search
          </button>
        </form>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.02)',
                  minHeight: 400,
                }}
              />
            ))}
          </div>
        ) : error ? (
          <div style={{ border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)' }}>{error}</div>
        ) : filteredProducts.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No products found</h2>
            <p style={{ color: 'var(--muted)' }}>Try adjusting your search or category filter.</p>
          </div>
        )}
      </section>
    </main>
  )
}
