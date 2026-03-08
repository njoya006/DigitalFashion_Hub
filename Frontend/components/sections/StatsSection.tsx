'use client'
// FILE: components/sections/StatsSection.tsx

import { useCounter } from '@/hooks/useCounter'

const stats = [
  { target: 28000, label: 'Active Products', suffix: '+' },
  { target: 142, label: 'Verified Sellers', suffix: '+' },
  { target: 58, label: 'Countries Served', suffix: '' },
  { target: 12, label: 'Currencies Supported', suffix: '' },
]

function StatItem({ target, label, suffix }: { target: number; label: string; suffix: string }) {
  const { ref, count } = useCounter(target)

  const formatted = count >= 1000
    ? `${(count / 1000).toFixed(count % 1000 === 0 ? 0 : 1)}K${suffix}`
    : `${count}${suffix}`

  return (
    <div
      ref={ref}
      style={{
        textAlign: 'center',
        padding: '60px 40px',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-cormorant)',
          fontSize: 'clamp(48px, 5vw, 72px)',
          fontWeight: 300,
          color: 'var(--gold)',
          lineHeight: 1,
        }}
      >
        {formatted}
      </span>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--muted)',
          fontFamily: 'var(--font-dm)',
        }}
      >
        {label}
      </span>
    </div>
  )
}

export default function StatsSection() {
  return (
    <section
      style={{
        backgroundColor: 'var(--black)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Eyebrow */}
      <div style={{ textAlign: 'center', padding: '40px 0 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
          <span className="gold-line" style={{ marginRight: 0 }} />
          <span style={{ fontSize: 9, color: 'var(--gold)', letterSpacing: '0.35em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
            Platform Scale
          </span>
          <span className="gold-line" style={{ marginRight: 0 }} />
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <StatItem target={stat.target} label={stat.label} suffix={stat.suffix} />
          </div>
        ))}
      </div>
    </section>
  )
}
