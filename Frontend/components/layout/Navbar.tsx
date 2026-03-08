'use client'
// FILE: components/layout/Navbar.tsx

import { useEffect, useState } from 'react'
import Link from 'next/link'
import CurrencySwitcher from '@/components/ui/CurrencySwitcher'

const NAV_LINKS = [
  { href: '/products?filter=new', label: 'New Arrivals' },
  { href: '/products?category=women', label: 'Women' },
  { href: '/products?category=men', label: 'Men' },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/seller', label: 'Sellers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: scrolled ? '18px 60px' : '24px 60px',
        backgroundColor: scrolled ? 'rgba(8,8,8,0.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-cormorant)',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '0.05em',
            color: 'var(--white)',
          }}
        >
          Digital
          <span style={{ color: 'var(--gold)' }}>Fashion</span>
          {' '}Hub
        </span>
      </Link>

      {/* Nav Links (desktop) */}
      <nav
        style={{
          display: 'flex',
          gap: 36,
          alignItems: 'center',
        }}
      >
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--muted)',
              fontFamily: 'var(--font-dm)',
              fontWeight: 400,
              transition: 'color 0.2s ease',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <CurrencySwitcher />

        {/* Search icon */}
        <Link href="/search" aria-label="Search" style={{ color: 'var(--muted)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="M16.5 16.5L22 22" strokeLinecap="round" />
          </svg>
        </Link>

        {/* User icon */}
        <Link href="/customer" aria-label="Account" style={{ color: 'var(--muted)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
          </svg>
        </Link>

        {/* Cart icon with badge */}
        <Link href="/cart" aria-label="Cart" style={{ position: 'relative', color: 'var(--muted)', transition: 'color 0.2s ease' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <span
            style={{
              position: 'absolute',
              top: -6,
              right: -8,
              background: 'var(--gold)',
              color: 'var(--black)',
              fontSize: 9,
              fontWeight: 700,
              borderRadius: '50%',
              width: 16,
              height: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-dm)',
            }}
          >
            3
          </span>
        </Link>
      </div>
    </header>
  )
}
