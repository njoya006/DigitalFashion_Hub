"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchOrders, type OrderSummary } from '@/lib/storefront'
import { formatDateShort, formatPrice } from '@/lib/utils'

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadOrders() {
      const data = await fetchOrders()
      if (!mounted) return
      setOrders(data)
      setLoading(false)
    }

    loadOrders().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Seller</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Orders pipeline</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>This view now consumes the live order feed returned to seller accounts.</p>

        {loading ? (
          <div style={{ minHeight: 280, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : orders.length ? (
          <div style={{ display: 'grid', gap: 16 }}>
            {orders.map((order) => (
              <article key={order.order_id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>{order.order_number}</p>
                  <h2 style={{ marginTop: 6 }}>{order.status}</h2>
                  <p style={{ color: 'var(--muted)', marginTop: 6 }}>{formatDateShort(order.order_date)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--gold)', fontFamily: 'var(--font-cormorant)', fontSize: 28 }}>{formatPrice(Number(order.total_amount || 0), order.currency_code)}</div>
                  <div style={{ color: 'var(--muted)' }}>{order.payment_status}</div>
                  <Link href={`/orders/${order.order_id}`} style={{ display: 'inline-block', marginTop: 10, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: 11 }}>View details</Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>No orders available</h2>
            <p style={{ color: 'var(--muted)' }}>Seller accounts will see backend orders here once they exist.</p>
          </div>
        )}
      </section>
    </main>
  )
}
