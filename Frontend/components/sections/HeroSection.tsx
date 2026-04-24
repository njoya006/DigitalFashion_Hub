'use client'
// FILE: components/sections/HeroSection.tsx

import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        backgroundColor: '#000000',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── LEFT SIDE ────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '140px 60px 100px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            marginBottom: 32,
            animation: 'fadeUp 0.8s ease forwards',
            animationDelay: '0.1s',
            opacity: 0,
          }}
        >
          <span className="gold-line" />
          <span
            style={{
              fontSize: 10,
              color: 'var(--gold)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              fontFamily: 'var(--font-dm)',
              fontWeight: 500,
            }}
          >
            2026 Collection
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 'clamp(56px, 6vw, 96px)',
            fontWeight: 300,
            lineHeight: 0.95,
            color: 'var(--white)',
            marginBottom: 32,
            animation: 'fadeUp 0.8s ease forwards',
            animationDelay: '0.25s',
            opacity: 0,
          }}
        >
          Where Style
          <br />
          Meets{' '}
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Global</em>
          <br />
          Commerce
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 14,
            color: 'var(--muted)',
            maxWidth: 340,
            lineHeight: 1.8,
            fontFamily: 'var(--font-dm)',
            marginBottom: 44,
            animation: 'fadeUp 0.8s ease forwards',
            animationDelay: '0.4s',
            opacity: 0,
          }}
        >
          Discover curated luxury fashion from verified sellers across 58 countries.
          Shop in your currency, delivered from our global warehouses.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            animation: 'fadeUp 0.8s ease forwards',
            animationDelay: '0.55s',
            opacity: 0,
          }}
        >
          <Link href="/products" className="btn-primary">
            Explore Collection →
          </Link>
          <Link href="/seller-register" className="btn-ghost">
            Become a Seller
          </Link>
        </div>

        {/* Vertical divider */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '15%',
            bottom: '15%',
            width: 1,
            backgroundColor: 'var(--border)',
          }}
        />
      </div>

      {/* ── RIGHT SIDE ───────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#030303',
          overflow: 'hidden',
        }}
      >
        {/* Background editorial image */}
        <Image
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80&fit=crop"
          alt="Fashion editorial"
          fill
          priority
          sizes="50vw"
          style={{ objectFit: 'cover', objectPosition: 'center 15%', opacity: 0.3 }}
        />

        {/* Dark vignette overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.45) 100%)',
            zIndex: 1,
          }}
        />

        {/* Gold radial glow */}
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)',
            animation: 'glowPulse 4s ease-in-out infinite',
            zIndex: 2,
          }}
        />

        {/* Concentric rings */}
        {[340, 260, 180].map((size, i) => (
          <div
            key={size}
            style={{
              position: 'absolute',
              width: size,
              height: size,
              borderRadius: '50%',
              border: `1px solid rgba(201,168,76,${0.08 + i * 0.04})`,
              animation: `${i % 2 === 0 ? 'spin' : 'spinReverse'} ${30 + i * 15}s linear infinite`,
              zIndex: 2,
            }}
          />
        ))}

        {/* Central fashion silhouette SVG */}
        <svg
          width="160"
          height="220"
          viewBox="0 0 160 220"
          fill="none"
          style={{ position: 'relative', zIndex: 2, opacity: 0.5 }}
        >
          {/* Abstract dress silhouette */}
          <path
            d="M80 20 C80 20, 60 30, 55 50 L40 90 C35 100, 30 110, 28 130 L20 200 L140 200 L132 130 C130 110, 125 100, 120 90 L105 50 C100 30, 80 20, 80 20Z"
            stroke="#c9a84c"
            strokeWidth="1"
            fill="none"
          />
          {/* Collar */}
          <path d="M65 50 C72 70, 88 70, 95 50" stroke="#c9a84c" strokeWidth="0.8" fill="none" />
          {/* Belt */}
          <line x1="32" y1="120" x2="128" y2="120" stroke="#c9a84c" strokeWidth="0.6" opacity="0.6" />
          {/* Shoulders */}
          <path d="M55 50 C45 44, 32 46, 25 55" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M105 50 C115 44, 128 46, 135 55" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.7" />
          {/* Head oval */}
          <ellipse cx="80" cy="12" rx="10" ry="12" stroke="#c9a84c" strokeWidth="0.8" fill="none" />
        </svg>

        {/* Floating card 1 — bottom-left */}
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '8%',
            background: 'rgba(12,10,8,0.72)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            animation: 'floatCard 4s ease-in-out infinite',
            animationDelay: '0.3s',
            zIndex: 3,
            minWidth: 180,
          }}
        >
          {/* Product placeholder */}
          <div
            style={{
              width: 48,
              height: 64,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&fit=crop"
              alt="Luxury Blazer"
              fill
              sizes="48px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>Luxury Blazer</p>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', marginBottom: 4 }}>$289 USD</p>
            <span
              style={{
                fontSize: 9,
                background: 'var(--gold-dim)',
                color: 'var(--gold)',
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-dm)',
                letterSpacing: '0.1em',
              }}
            >
              VIP −15%
            </span>
          </div>
        </div>

        {/* Floating card 2 — top-right */}
        <div
          style={{
            position: 'absolute',
            top: '22%',
            right: '8%',
            background: 'rgba(12,10,8,0.72)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: 'var(--radius)',
            padding: '14px 18px',
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            animation: 'floatCard 4s ease-in-out infinite',
            animationDelay: '1.5s',
            zIndex: 3,
            minWidth: 180,
          }}
        >
          <div
            style={{
              width: 48,
              height: 64,
              borderRadius: 'var(--radius)',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Image
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=120&q=80&fit=crop"
              alt="Designer Bag"
              fill
              sizes="48px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 14, color: 'var(--white)', marginBottom: 2 }}>Designer Bag</p>
            <p style={{ fontSize: 13, color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', marginBottom: 4 }}>€450 EUR</p>
            <span
              style={{
                fontSize: 9,
                background: 'rgba(232,201,122,0.15)',
                color: 'var(--gold-light)',
                padding: '2px 8px',
                borderRadius: 'var(--radius)',
                fontFamily: 'var(--font-dm)',
                letterSpacing: '0.1em',
              }}
            >
              Premium −10%
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
