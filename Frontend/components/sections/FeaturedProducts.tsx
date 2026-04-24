"use client"

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { fetchProducts, getPrimaryImage, toNumber, type ProductSummary } from '@/lib/storefront'
import { formatPrice, truncate } from '@/lib/utils'
import { useScrollReveal } from '@/hooks/useScrollReveal'

function ProductCardItem({ product, delay }: { product: ProductSummary; delay: number }) {
  const ref = useScrollReveal<HTMLDivElement>(0.1, delay)
  const [hovered, setHovered] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)
  const image = getPrimaryImage(product)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', flexDirection: 'column', cursor: 'none' }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '3/4',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          marginBottom: 0,
          borderRadius: 'var(--radius)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        >
          {image ? (
            <Image
              src={image}
              alt={product.primary_image_alt_text || product.product_name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{ objectFit: 'cover', objectPosition: 'top center' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--muted)',
                fontSize: 12,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              No image
            </div>
          )}
        </div>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <Link
            href={`/products/${product.product_id}`}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--gold)',
              color: 'var(--black)',
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'none',
              fontFamily: 'var(--font-dm)',
              transform: hovered ? 'translateY(0)' : 'translateY(10px)',
              transition: 'transform 0.3s ease',
              textAlign: 'center',
              textDecoration: 'none',
            }}
          >
            View Product
          </Link>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 9,
            color: 'var(--gold)',
            background: 'var(--gold-dim)',
            padding: '3px 10px',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-dm)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {product.is_featured ? 'Featured' : 'New Arrival'}
        </div>

        <button
          onClick={() => setWishlisted(!wishlisted)}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 32,
            height: 32,
            background: 'rgba(0,0,0,0.55)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'none',
            transition: 'border-color 0.2s ease',
          }}
          aria-label="Add to wishlist"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? 'var(--gold)' : 'none'} stroke="var(--gold)" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', marginBottom: 6 }}>
          {product.brand || product.seller_name || 'Digital Fashion Hub'}
        </p>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--white)', marginBottom: 8, lineHeight: 1.2 }}>
          {product.product_name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, color: 'var(--gold)' }}>{formatPrice(toNumber(product.base_price), product.currency_code)}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1 }}>{product.is_published ? 'Published' : 'Draft'}</span>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 8 }}>{truncate(product.description || 'Curated luxury piece available through the live storefront.', 110)}</p>
      </div>
    </div>
  )
}

export default function FeaturedProducts() {
  const headerRef = useScrollReveal(0.1)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const data = await fetchProducts({ featured: true, limit: 4 })
        if (!mounted) return
        setProducts(data)
      } catch {
        if (!mounted) return
        setProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section style={{ padding: '100px 60px', backgroundColor: 'var(--black)' }}>
      <div ref={headerRef} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 56 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
            <span className="gold-line" />
            <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
              Curated Selection
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 300, color: 'var(--white)', lineHeight: 1 }}>
            Featured Pieces
          </h2>
        </div>
        <Link
          href="/products"
          style={{
            fontSize: 11,
            color: 'var(--gold)',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-dm)',
            borderBottom: '1px solid var(--gold-dim)',
            paddingBottom: 2,
            transition: 'border-color 0.2s ease',
          }}
        >
          View All →
        </Link>
      </div>

      {loading ? (
        <div style={{ minHeight: 320, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
      ) : products.length ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {products.map((product, i) => (
            <ProductCardItem key={product.product_id} product={product} delay={i * 100} />
          ))}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ marginBottom: 8 }}>No featured products yet</h3>
          <p style={{ color: 'var(--muted)' }}>Published products will appear here once sellers mark them as featured.</p>
        </div>
      )}
    </section>
  )
}
