'use client'
// FILE: components/ui/CurrencySwitcher.tsx

import { useState } from 'react'

const CURRENCIES = ['🌍 USD', '🌍 EUR', '🌍 GBP', '🌍 JPY', '🌍 XAF']

export default function CurrencySwitcher() {
  const [index, setIndex] = useState(0)

  const cycle = () => setIndex((prev) => (prev + 1) % CURRENCIES.length)

  return (
    <button
      onClick={cycle}
      style={{
        fontSize: 10,
        color: 'var(--gold)',
        border: '1px solid var(--gold-dim)',
        padding: '5px 12px',
        background: 'transparent',
        letterSpacing: '0.08em',
        cursor: 'none',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-dm)',
        transition: 'border-color 0.2s ease, color 0.2s ease',
        whiteSpace: 'nowrap',
      }}
      aria-label="Switch currency"
    >
      {CURRENCIES[index]}
    </button>
  )
}
