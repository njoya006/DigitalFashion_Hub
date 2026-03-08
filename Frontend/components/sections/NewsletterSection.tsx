'use client'
// FILE: components/sections/NewsletterSection.tsx

import { useState } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const ref = useScrollReveal(0.1)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubmitted(true)
      setEmail('')
    }
  }

  return (
    <section
      style={{
        backgroundColor: 'var(--surface)',
        padding: '100px 60px',
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Radial glow */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 720,
          height: 480,
          background: 'radial-gradient(ellipse, rgba(201,168,76,0.13) 0%, rgba(201,168,76,0.04) 45%, transparent 68%)',
          pointerEvents: 'none',
          animation: 'glowPulse 6s ease-in-out infinite',
        }}
      />

      <div ref={ref} style={{ textAlign: 'center', position: 'relative', zIndex: 2, maxWidth: 560, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <span className="gold-line" />
          <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
            Stay Ahead
          </span>
          <span className="gold-line" style={{ marginRight: 0, marginLeft: 16 }} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 300, color: 'var(--white)', marginBottom: 16, lineHeight: 1.1 }}>
          The Edit, Delivered{' '}
          <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Weekly</em>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 40, lineHeight: 1.7, fontFamily: 'var(--font-dm)' }}>
          Curated drops, exclusive access, currency insights, and style intelligence — straight to your inbox every Monday.
        </p>

        {submitted ? (
          <div
            style={{
              padding: '18px 32px',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--gold-dim)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--gold)' }}>
              You&apos;re on the list. Welcome to The Edit.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 0, maxWidth: 480, margin: '0 auto' }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                flex: 1,
                padding: '14px 20px',
                backgroundColor: 'var(--black)',
                border: '1px solid var(--border)',
                borderRight: 'none',
                color: 'var(--white)',
                fontSize: 13,
                fontFamily: 'var(--font-dm)',
                outline: 'none',
                borderRadius: 'var(--radius) 0 0 var(--radius)',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              type="submit"
              style={{
                padding: '14px 28px',
                backgroundColor: 'var(--gold)',
                color: 'var(--black)',
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                border: 'none',
                cursor: 'none',
                fontFamily: 'var(--font-dm)',
                borderRadius: '0 var(--radius) var(--radius) 0',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--gold-light)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--gold)')}
            >
              Subscribe
            </button>
          </form>
        )}

        <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 16, fontFamily: 'var(--font-dm)' }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}
