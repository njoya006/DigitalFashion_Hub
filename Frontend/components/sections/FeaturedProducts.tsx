'use client'
// FILE: components/sections/FeaturedProducts.tsx

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const products = [
  { id: 1, name: 'Oversize Wool Coat', seller: 'Maison Élite', price: '$420', originalPrice: '$580', currency: 'USD', badge: 'New Arrival', badgeColor: 'gold', rating: 4.8, reviews: 124, image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80&fit=crop' },
  { id: 2, name: 'Structured Tote Bag', seller: 'Atelier Noir', price: '€680', currency: 'EUR', badge: 'VIP Pick', badgeColor: 'gold-light', rating: 4.6, reviews: 89, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80&fit=crop' },
  { id: 3, name: 'Heritage Sneakers', seller: 'Studio Kenzo', price: '£195', originalPrice: '£240', currency: 'GBP', badge: 'Limited', badgeColor: 'gold', rating: 4.9, reviews: 212, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&fit=crop' },
  { id: 4, name: 'Silk Evening Dress', seller: 'Lumière Paris', price: '¥58,000', currency: 'JPY', badge: 'Bestseller', badgeColor: 'gold', rating: 4.7, reviews: 178, image: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80&fit=crop' },
]

function ProductCardItem({ product, delay }: { product: typeof products[0]; delay: number }) {
  const ref = useScrollReveal<HTMLDivElement>(0.1, delay)
  const [hovered, setHovered] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        cursor: 'none',
      }}
    >
      {/* Image area */}
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
        {/* Product image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ objectFit: 'cover', objectPosition: 'top center' }}
          />
        </div>

        {/* Dark overlay on hover */}
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
          <button
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
            }}
          >
            Quick Add
          </button>
        </div>

        {/* Badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            fontSize: 9,
            color: product.badgeColor === 'gold-light' ? 'var(--gold-light)' : 'var(--gold)',
            background: product.badgeColor === 'gold-light' ? 'rgba(232,201,122,0.15)' : 'var(--gold-dim)',
            padding: '3px 10px',
            borderRadius: 'var(--radius)',
            fontFamily: 'var(--font-dm)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {product.badge}
        </div>

        {/* Wishlist heart */}
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

      {/* Info */}
      <div style={{ padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 10, color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)', marginBottom: 6 }}>
          {product.seller}
        </p>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--white)', marginBottom: 8, lineHeight: 1.2 }}>
          {product.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 17, color: 'var(--gold)' }}>{product.price}</span>
          {product.originalPrice && (
            <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: 'var(--muted)', textDecoration: 'line-through' }}>
              {product.originalPrice}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: 1 }}>
            {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
          </span>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-dm)' }}>
            {product.rating} ({product.reviews})
          </span>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedProducts() {
  const headerRef = useScrollReveal(0.1)

  return (
    <section style={{ padding: '100px 60px', backgroundColor: 'var(--black)' }}>
      {/* Header */}
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 56,
        }}
      >
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

      {/* Product grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
        }}
      >
        {products.map((product, i) => (
          <ProductCardItem key={product.id} product={product} delay={i * 100} />
        ))}
      </div>
    </section>
  )
}
