'use client'
// FILE: components/layout/Footer.tsx

import Link from 'next/link'

const SHOP_LINKS = [
  { href: '/products?filter=new', label: 'New Arrivals' },
  { href: '/products?category=women', label: "Women's Fashion" },
  { href: '/products?category=men', label: "Men's Fashion" },
  { href: '/products?category=accessories', label: 'Accessories' },
  { href: '/products?filter=sale', label: 'Sale' },
]

const ACCOUNT_LINKS = [
  { href: '/customer/orders', label: 'My Orders' },
  { href: '/wishlist', label: 'Wishlist' },
  { href: '/customer/tier', label: 'Loyalty Tier' },
  { href: '/seller', label: 'Seller Portal' },
  { href: '/admin', label: 'Admin Panel' },
]

const SUPPORT_LINKS = [
  { href: '/support', label: 'Help Centre' },
  { href: '/shipping', label: 'Shipping Info' },
  { href: '/returns', label: 'Returns Policy' },
  { href: '/currency-faq', label: 'Currency FAQ' },
  { href: '/contact', label: 'Contact Us' },
]

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          fontFamily: 'var(--font-dm)',
          fontWeight: 500,
          marginBottom: 24,
        }}
      >
        {title}
      </p>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              style={{
                fontSize: 13,
                color: 'var(--muted)',
                fontFamily: 'var(--font-dm)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--white)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted)')}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '64px 60px 32px',
      }}
    >
      {/* Main grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
          gap: 48,
          marginBottom: 48,
        }}
      >
        {/* Col 1 — Brand */}
        <div>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 20 }}>
            <span
              style={{
                fontFamily: 'var(--font-cormorant)',
                fontSize: 24,
                fontWeight: 300,
                letterSpacing: '0.05em',
                color: 'var(--white)',
              }}
            >
              Digital<span style={{ color: 'var(--gold)' }}>Fashion</span> Hub
            </span>
          </Link>
          <p
            style={{
              fontSize: 13,
              color: 'var(--muted)',
              lineHeight: 1.7,
              maxWidth: 280,
              marginBottom: 28,
              fontFamily: 'var(--font-dm)',
            }}
          >
            A premium global marketplace where style meets cutting-edge commerce technology.
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
              { label: 'Twitter', path: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
              { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
              { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
            ].map((social) => (
              <a
                key={social.label}
                href="#"
                aria-label={social.label}
                style={{
                  width: 36,
                  height: 36,
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--muted)',
                  transition: 'border-color 0.2s ease, color 0.2s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gold)'
                  e.currentTarget.style.color = 'var(--gold)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--muted)'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Account" links={ACCOUNT_LINKS} />
        <FooterColumn title="Support" links={SUPPORT_LINKS} />
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: '1px solid var(--border)',
          paddingTop: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-dm)', letterSpacing: '0.05em' }}>
          © 2026 DigitalFashion Hub. ICT 3212 Advanced Database Systems Project.
        </p>
        <p style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-dm)', letterSpacing: '0.05em' }}>
          ICT University · Cameroon · Yaoundé
        </p>
      </div>
    </footer>
  )
}
