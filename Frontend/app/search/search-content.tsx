'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { fetchCategories, fetchProducts, getPrimaryImage, normalizeTags, toNumber, type Category, type ProductSummary } from '@/lib/storefront'
import { formatPrice, truncate } from '@/lib/utils'

export default function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category_id') ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [results, setResults] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
    setActiveCategory(searchParams.get('category_id') ?? '')
  }, [searchParams])

  useEffect(() => {
    let mounted = true

    async function loadResults() {
      setLoading(true)
      setError('')

      try {
        const [categoryData, productData] = await Promise.all([
          fetchCategories(),
          fetchProducts({ search: searchParams.get('q') ?? undefined, category_id: searchParams.get('category_id') ?? undefined }),
        ])

        if (!mounted) return
        setCategories(categoryData)
        setResults(productData)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to search catalog.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadResults()

    return () => {
      mounted = false
    }
  }, [searchParams])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (activeCategory) params.set('category_id', activeCategory)
    router.push(`/search${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Search</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Find products fast</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 28 }}>Search pulls live results from the backend, so category filters and keyword matches stay in sync with the catalog.</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 220px 120px', gap: 12, marginBottom: 20 }}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, brand, or description" style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
          <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)} style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.category_id} value={category.category_id}>{category.category_name}</option>)}
          </select>
          <button className="btn-primary" type="submit">Search</button>
        </form>

        {error ? <div style={{ border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div> : null}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {Array.from({ length: 4 }).map((_, index) => <div key={index} style={{ minHeight: 360, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />)}
          </div>
        ) : results.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {results.map((product) => {
              const image = getPrimaryImage(product)
              return (
                <article key={product.product_id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
                  <Link href={`/products/${product.product_id}`}>
                    <div style={{ aspectRatio: '3 / 4', background: 'rgba(255,255,255,0.03)' }}>
                      {image ? <img src={image} alt={product.primary_image_alt_text || product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
                    </div>
                  </Link>
                  <div style={{ padding: 16 }}>
                    <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{product.brand || product.seller_name || 'Digital Fashion Hub'}</p>
                    <h3 style={{ fontSize: 22, marginTop: 6 }}>{product.product_name}</h3>
                    <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{truncate(product.description || '', 100)}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'end', marginTop: 14 }}>
                      <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', fontSize: 22 }}>{formatPrice(toNumber(product.base_price), product.currency_code)}</div>
                      <div style={{ color: 'var(--muted)', fontSize: 11 }}>{normalizeTags(product.tags).slice(0, 1).join(' • ')}</div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No matches yet</h2>
            <p style={{ color: 'var(--muted)' }}>Try another search term or category filter.</p>
          </div>
        )}
      </section>
    </main>
  )
}
