'use client'
// FILE: components/sections/CurrencySection.tsx

import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const rates = [
  { code: 'USD', name: 'US Dollar', rate: '1.00', change: 'Base', trend: 'neutral' as const },
  { code: 'EUR', name: 'Euro', rate: '0.9218', change: '+0.3%', trend: 'up' as const },
  { code: 'GBP', name: 'British Pound', rate: '0.7894', change: '−0.1%', trend: 'down' as const },
  { code: 'JPY', name: 'Japanese Yen', rate: '149.42', change: '+0.8%', trend: 'up' as const },
  { code: 'XAF', name: 'CFA Franc', rate: '605.32', change: '+0.2%', trend: 'up' as const },
  { code: 'CAD', name: 'Canadian Dollar', rate: '1.3612', change: '−0.4%', trend: 'down' as const },
]

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'neutral' }) {
  if (trend === 'neutral') {
    return <span style={{ color: 'var(--muted)', fontSize: 11 }}>—</span>
  }
  const color = trend === 'up' ? '#4ade80' : '#f87171'
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      {trend === 'up' ? (
        <path d="M6 10V2M2 6l4-4 4 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M6 2v8M2 6l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

export default function CurrencySection() {
  const leftRef = useScrollReveal(0.1)
  const rightRef = useScrollReveal(0.1, 150)

  return (
    <section style={{ padding: '100px 60px', backgroundColor: 'var(--black)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        {/* Left */}
        <div ref={leftRef}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <span className="gold-line" />
            <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
              Global Commerce
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 300, color: 'var(--white)', lineHeight: 1.05, marginBottom: 24 }}>
            Shop in Your
            <br />
            <em style={{ color: 'var(--gold)' }}>Currency</em>
          </h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.8, maxWidth: 380, marginBottom: 36, fontFamily: 'var(--font-dm)' }}>
            DigitalFashion Hub supports live exchange rates across 12 global currencies.
            No hidden fees — the price you see is the price you pay, always updated in real time.
          </p>
          <Link href="/products" className="btn-ghost">
            Start Shopping
          </Link>
        </div>

        {/* Right — currency grid */}
        <div
          ref={rightRef}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          {rates.map((rate) => (
            <div
              key={rate.code}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--gold-dim)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              <div>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 20, color: 'var(--gold)', lineHeight: 1, marginBottom: 4 }}>
                  {rate.code}
                </p>
                <p style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-dm)', letterSpacing: '0.05em' }}>{rate.name}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: 'var(--white)', marginBottom: 4 }}>{rate.rate}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  <TrendArrow trend={rate.trend} />
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: 'var(--font-dm)',
                      color: rate.trend === 'up' ? '#4ade80' : rate.trend === 'down' ? '#f87171' : 'var(--muted)',
                    }}
                  >
                    {rate.change}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
