'use client'
// FILE: components/ui/Ticker.tsx

interface TickerProps {
  items?: string[]
  speed?: number
}

const DEFAULT_ITEMS = [
  'Free shipping on VIP orders worldwide',
  'Live exchange rates USD · EUR · GBP · JPY · XAF',
  'New arrivals every Monday',
  'Verified sellers only — trusted marketplace',
  'Multi-warehouse delivery from 5 continents',
]

export default function Ticker({ items = DEFAULT_ITEMS, speed = 30 }: TickerProps) {
  const doubled = [...items, ...items]

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        overflow: 'hidden',
        padding: '12px 0',
      }}
    >
      <div
        style={{
          display: 'flex',
          whiteSpace: 'nowrap',
          animation: `ticker ${speed}s linear infinite`,
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 24,
              paddingRight: 48,
              fontSize: 11,
              color: 'var(--muted)',
              fontFamily: 'var(--font-dm)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            {item}
            <span style={{ color: 'var(--gold)', fontSize: 8 }}>●</span>
          </span>
        ))}
      </div>
    </div>
  )
}
