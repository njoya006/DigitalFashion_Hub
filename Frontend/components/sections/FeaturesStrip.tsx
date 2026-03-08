'use client'
// FILE: components/sections/FeaturesStrip.tsx

import { useScrollReveal } from '@/hooks/useScrollReveal'

const FEATURES = [
  {
    title: 'Same-Day Dispatch',
    desc: 'Orders confirmed before 2 PM ship the same day from our global warehouses.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.2">
        <path d="M4 16L16 4L28 16" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8 12v12a2 2 0 002 2h12a2 2 0 002-2V12" strokeLinecap="round" />
        <path d="M13 26V18h6v8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Authenticity Guaranteed',
    desc: 'Every product verified by our expert authentication team before listing.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.2">
        <path d="M16 3L20 10L28 11L22 17L23.5 25L16 21.5L8.5 25L10 17L4 11L12 10Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 16l3 3 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: 'Multi-Currency Checkout',
    desc: 'Pay in USD, EUR, GBP, JPY, XAF, CAD and more — live exchange rates always applied.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.2">
        <circle cx="16" cy="16" r="12" />
        <path d="M16 8v16M12 12h6a2 2 0 010 4h-4a2 2 0 010 4h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: 'Loyalty Rewards',
    desc: 'Earn tier status with every purchase. VIP members unlock 15% off and exclusive drops.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#c9a84c" strokeWidth="1.2">
        <path d="M16 6l2.5 7H26l-6 4.5 2 7L16 20l-6 4.5 2-7L6 13h7.5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function FeaturesStrip() {
  const ref = useScrollReveal(0.1)

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        backgroundColor: 'var(--surface)',
      }}
    >
      {FEATURES.map((feature, i) => (
        <div
          key={feature.title}
          style={{
            padding: '40px 36px',
            borderRight: i < FEATURES.length - 1 ? '1px solid var(--border)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {feature.icon}
          <p
            style={{
              fontFamily: 'var(--font-cormorant)',
              fontSize: 18,
              fontWeight: 400,
              color: 'var(--white)',
              lineHeight: 1.2,
            }}
          >
            {feature.title}
          </p>
          <p
            style={{
              fontSize: 12,
              color: 'var(--muted)',
              lineHeight: 1.7,
              fontFamily: 'var(--font-dm)',
            }}
          >
            {feature.desc}
          </p>
        </div>
      ))}
    </div>
  )
}
