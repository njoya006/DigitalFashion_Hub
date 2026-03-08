'use client'
// FILE: components/sections/TierSection.tsx

import Link from 'next/link'
import { useScrollReveal } from '@/hooks/useScrollReveal'

const tiers = [
  {
    name: 'Standard',
    emoji: '🥈',
    discount: 5,
    threshold: '$0+',
    perks: [
      '5% discount on all orders',
      'Access to seasonal sales',
      'Standard delivery speed',
      'Basic wishlist (up to 20 items)',
    ],
    featured: false,
  },
  {
    name: 'Premium',
    emoji: '🥇',
    discount: 10,
    threshold: '$500+',
    perks: [
      '10% discount on all orders',
      'Early access to new arrivals',
      'Priority customer support',
      'Free shipping on all orders',
      'Unlimited wishlist',
    ],
    featured: true,
  },
  {
    name: 'VIP',
    emoji: '👑',
    discount: 15,
    threshold: '$2,000+',
    perks: [
      '15% discount on all orders',
      'Exclusive VIP-only collections',
      'Personal style concierge',
      'Same-day global shipping',
      'Invitation to private sales',
      'Dedicated account manager',
    ],
    featured: false,
  },
]

export default function TierSection() {
  const headerRef = useScrollReveal(0.1)

  return (
    <section
      style={{
        backgroundColor: 'var(--surface)',
        padding: '100px 60px',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 64 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span className="gold-line" />
          <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
            Loyalty Programme
          </span>
          <span className="gold-line" style={{ marginRight: 0, marginLeft: 16 }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 300, color: 'var(--white)', marginBottom: 16 }}>
          Your Tier, Your Benefits
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7, fontFamily: 'var(--font-dm)' }}>
          Every purchase brings you closer to exclusive discounts, priority access, and premium services.
        </p>
      </div>

      {/* Tier cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
        {tiers.map((tier, i) => (
          <TierCard key={tier.name} tier={tier} delay={i * 120} />
        ))}
      </div>
    </section>
  )
}

function TierCard({ tier, delay }: { tier: typeof tiers[0]; delay: number }) {
  const cardRef = useScrollReveal<HTMLDivElement>(0.1, delay)
  return (
            <div
              ref={cardRef}
              style={{
                position: 'relative',
                backgroundColor: tier.featured ? 'var(--surface2)' : 'var(--black)',
                border: `1px solid ${tier.featured ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                overflow: 'hidden',
                padding: tier.featured ? '0 32px 36px' : '32px',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              {/* Most Popular banner */}
              {tier.featured && (
                <div
                  style={{
                    backgroundColor: 'var(--gold)',
                    color: 'var(--black)',
                    textAlign: 'center',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    padding: '8px',
                    fontFamily: 'var(--font-dm)',
                    margin: '0 -32px 32px',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Emoji + name */}
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{tier.emoji}</span>
                <p style={{ fontFamily: 'var(--font-dm)', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                  {tier.name}
                </p>
              </div>

              {/* Discount number */}
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    fontSize: 40,
                    fontWeight: 300,
                    color: 'var(--gold)',
                    lineHeight: 1,
                  }}
                >
                  {tier.discount}%
                </span>
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 6, fontFamily: 'var(--font-dm)' }}>discount</span>
              </div>

              {/* Threshold */}
              <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-dm)', marginBottom: 24, letterSpacing: '0.05em' }}>
                Spend {tier.threshold} lifetime
              </p>

              {/* Divider */}
              <div style={{ height: 1, backgroundColor: 'var(--border)', marginBottom: 24 }} />

              {/* Perks */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {tier.perks.map((perk) => (
                  <li key={perk} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="8" cy="8" r="6" stroke="#c9a84c" strokeWidth="1" />
                      <path d="M5 8l2 2 4-4" stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'var(--font-dm)', lineHeight: 1.5 }}>{perk}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/customer/tier"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px',
                  backgroundColor: tier.featured ? 'var(--gold)' : 'transparent',
                  color: tier.featured ? 'var(--black)' : 'var(--white)',
                  border: tier.featured ? 'none' : '1px solid var(--border)',
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-dm)',
                  borderRadius: 'var(--radius)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  marginTop: 'auto',
                }}
              >
                {tier.featured ? 'Get Premium' : 'Learn More'}
              </Link>
            </div>
  )
}
