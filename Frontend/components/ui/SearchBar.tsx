'use client'
// FILE: components/ui/SearchBar.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FILTERS = ['All', 'Women', 'Men', 'Shoes', 'Bags']

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&category=${activeFilter}`)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '20px 60px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, position: 'relative' }}>
        {/* Search icon */}
        <div
          style={{
            position: 'absolute',
            left: 18,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--muted)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L22 22" strokeLinecap="round" />
          </svg>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for brands, styles, or products..."
          style={{
            width: '100%',
            padding: '14px 20px 14px 48px',
            backgroundColor: 'var(--black)',
            border: '1px solid var(--border)',
            color: 'var(--white)',
            fontSize: 13,
            fontFamily: 'var(--font-dm)',
            outline: 'none',
            borderRadius: 'var(--radius)',
            transition: 'border-color 0.2s ease',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--gold)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
      </form>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 8 }}>
        {FILTERS.map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              style={{
                padding: '5px 16px',
                fontSize: 11,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-dm)',
                backgroundColor: 'transparent',
                color: isActive ? 'var(--gold)' : 'var(--muted)',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 'var(--radius)',
                cursor: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}
