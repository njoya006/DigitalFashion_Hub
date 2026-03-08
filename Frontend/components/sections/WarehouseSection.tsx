'use client'
// FILE: components/sections/WarehouseSection.tsx

import { useScrollReveal } from '@/hooks/useScrollReveal'

const warehouses = [
  { flag: '🇺🇸', city: 'New York', country: 'United States', capacity: 82, skus: '12,400' },
  { flag: '🇫🇷', city: 'Paris', country: 'France', capacity: 65, skus: '9,800' },
  { flag: '🇨🇲', city: 'Douala', country: 'Cameroon', capacity: 45, skus: '5,200' },
  { flag: '🇯🇵', city: 'Tokyo', country: 'Japan', capacity: 71, skus: '8,100' },
  { flag: '🇦🇺', city: 'Sydney', country: 'Australia', capacity: 38, skus: '4,600' },
]

function WarehouseCard({ warehouse, delay }: { warehouse: typeof warehouses[0]; delay: number }) {
  const ref = useScrollReveal<HTMLDivElement>(0.1, delay)

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: 'var(--black)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-4px)'
        el.style.borderColor = 'rgba(201,168,76,0.4)'
        el.style.boxShadow = '0 0 20px rgba(201,168,76,0.08)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.borderColor = 'var(--border)'
        el.style.boxShadow = 'none'
      }}
    >
      {/* Flag */}
      <span style={{ fontSize: 32 }}>{warehouse.flag}</span>

      {/* City + Country */}
      <div>
        <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 18, color: 'var(--white)', marginBottom: 4, lineHeight: 1 }}>
          {warehouse.city}
        </p>
        <p style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
          {warehouse.country}
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-dm)' }}>Capacity</span>
          <span style={{ fontSize: 10, color: 'var(--gold)', fontFamily: 'var(--font-dm)' }}>{warehouse.capacity}%</span>
        </div>
        <div style={{ height: 2, backgroundColor: 'var(--surface2)', borderRadius: 1 }}>
          <div
            style={{
              height: '100%',
              width: `${warehouse.capacity}%`,
              backgroundColor: 'var(--gold)',
              borderRadius: 1,
              transition: 'width 1s ease',
            }}
          />
        </div>
      </div>

      {/* SKU count */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'var(--font-dm)', letterSpacing: '0.1em' }}>SKUs: </span>
        <span style={{ fontFamily: 'var(--font-cormorant)', fontSize: 16, color: 'var(--white)' }}>{warehouse.skus}</span>
      </div>
    </div>
  )
}

export default function WarehouseSection() {
  const headerRef = useScrollReveal(0.1)

  return (
    <section
      style={{
        backgroundColor: 'var(--surface)',
        padding: '100px 60px',
        borderTop: '1px solid var(--border)',
      }}
    >
      {/* Header */}
      <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <span className="gold-line" />
          <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
            Global Infrastructure
          </span>
          <span className="gold-line" style={{ marginRight: 0, marginLeft: 16 }} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-cormorant)', fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 300, color: 'var(--white)', marginBottom: 16 }}>
          Warehouses on 5 Continents
        </h2>
        <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7, fontFamily: 'var(--font-dm)' }}>
          Strategically located fulfillment centers ensure your order reaches you as fast as possible, wherever you are in the world.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {warehouses.map((w, i) => (
          <WarehouseCard key={w.city} warehouse={w} delay={i * 80} />
        ))}
      </div>
    </section>
  )
}
