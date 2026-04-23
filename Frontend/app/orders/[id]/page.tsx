"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchOrder, type OrderDetail } from '@/lib/storefront'
import { formatDateShort, formatPrice } from '@/lib/utils'

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = typeof params.id === 'string' ? params.id : ''
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadOrder() {
      if (!orderId) return
      setLoading(true)
      setError('')

      try {
        const data = await fetchOrder(orderId)
        if (!mounted) return
        setOrder(data)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to load order.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadOrder()

    return () => {
      mounted = false
    }
  }, [orderId])

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Link href="/customer/orders" style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 11 }}>Back to orders</Link>

        {loading ? (
          <div style={{ marginTop: 24, minHeight: 360, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : error ? (
          <div style={{ marginTop: 24, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)' }}>{error}</div>
        ) : order ? (
          <div style={{ display: 'grid', gap: 24, marginTop: 24 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--muted)' }}>{order.order_number}</p>
                  <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', marginTop: 8 }}>{order.status}</h1>
                  <p style={{ color: 'var(--muted)', marginTop: 8 }}>Placed {formatDateShort(order.order_date)}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 36, color: 'var(--gold)' }}>{formatPrice(Number(order.total_amount || 0), order.currency_code)}</div>
                  <div style={{ color: 'var(--muted)' }}>{order.payment_status}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 24 }}>
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ marginBottom: 16 }}>Items</h2>
                <div style={{ display: 'grid', gap: 14 }}>
                  {order.items.map((item) => (
                    <div key={`${item.line_number}-${item.variant_id}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
                      <div>
                        <div style={{ color: 'var(--white)' }}>Line {item.line_number}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 12 }}>Variant {item.variant_id}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>{item.quantity} x {formatPrice(Number(item.unit_price || 0), order.currency_code)}</div>
                        <div style={{ color: 'var(--gold)' }}>{formatPrice(Number(item.final_price || 0), order.currency_code)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <aside style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, height: 'fit-content', background: 'rgba(255,255,255,0.02)' }}>
                <h2 style={{ marginBottom: 16 }}>Totals</h2>
                <div style={{ display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Subtotal</span><span>{formatPrice(Number(order.subtotal || 0), order.currency_code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Discount</span><span>{formatPrice(Number(order.discount_amount || 0), order.currency_code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Shipping</span><span>{formatPrice(Number(order.shipping_cost || 0), order.currency_code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Tax</span><span>{formatPrice(Number(order.tax_amount || 0), order.currency_code)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}><strong>Total</strong><strong style={{ color: 'var(--gold)' }}>{formatPrice(Number(order.total_amount || 0), order.currency_code)}</strong></div>
                </div>
                <p style={{ color: 'var(--muted)', marginTop: 16 }}>Transaction ref: {order.transaction_ref || 'Pending'}</p>
              </aside>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  )
}
