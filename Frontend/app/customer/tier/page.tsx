"use client"

import { useEffect, useState } from 'react'
import { fetchMe, type MeProfile } from '@/lib/storefront'
import { formatPrice } from '@/lib/utils'

export default function CustomerTierPage() {
  const [me, setMe] = useState<MeProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadProfile() {
      setLoading(true)
      try {
        const data = await fetchMe()
        if (!mounted) return
        setMe(data)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProfile().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const profile = me?.customer_profile

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 980, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Loyalty</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Your tier status</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>Tier information now comes from the authenticated profile endpoint.</p>

        {loading ? (
          <div style={{ minHeight: 220, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : profile ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>Current tier</div>
              <h2 style={{ fontSize: 42, marginTop: 10 }}>{profile.tier_name}</h2>
              <p style={{ color: 'var(--muted)', marginTop: 12 }}>Discount rate: {profile.discount_percentage}%</p>
              <p style={{ color: 'var(--muted)', marginTop: 8 }}>Lifetime value: {formatPrice(Number(profile.lifetime_value || 0), me?.customer_profile?.preferred_currency || 'USD')}</p>
            </div>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>Points</div>
              <h2 style={{ fontSize: 42, marginTop: 10 }}>{profile.loyalty_points}</h2>
              <p style={{ color: 'var(--muted)', marginTop: 12 }}>Preferred currency: {profile.preferred_currency}</p>
            </div>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No customer profile available</h2>
            <p style={{ color: 'var(--muted)' }}>Sign in as a customer account to view tier and loyalty data.</p>
          </div>
        )}
      </section>
    </main>
  )
}
