"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { fetchCart, fetchMe, placeOrder, type CartPayload, type MeProfile } from '@/lib/storefront'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartPayload | null>(null)
  const [me, setMe] = useState<MeProfile | null>(null)
  const [shippingAddressId, setShippingAddressId] = useState('')
  const [currencyCode, setCurrencyCode] = useState('USD')
  const [shippingCost, setShippingCost] = useState('25')
  const [taxRate, setTaxRate] = useState('8')
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCheckout() {
      setLoading(true)
      setMessage('')

      try {
        const [cartData, meData] = await Promise.all([fetchCart(), fetchMe()])
        if (!mounted) return
        setCart(cartData)
        setMe(meData)
        setCurrencyCode(meData.customer_profile?.preferred_currency || cartData.items[0]?.currency_code || 'USD')
      } catch (err) {
        if (!mounted) return
        setMessage(err instanceof Error ? err.message : 'Unable to load checkout.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCheckout()

    return () => {
      mounted = false
    }
  }, [])

  const totals = useMemo(() => {
    const subtotal = Number(cart?.subtotal || 0)
    const shipping = Number(shippingCost || 0)
    const tax = subtotal * (Number(taxRate || 0) / 100)
    return { subtotal, shipping, tax, total: subtotal + shipping + tax }
  }, [cart?.subtotal, shippingCost, taxRate])

  async function handlePlaceOrder() {
    if (!cart?.items?.length) {
      setMessage('Your cart is empty.')
      return
    }
    if (!shippingAddressId.trim()) {
      setMessage('Enter a shipping address ID before placing the order.')
      return
    }

    setSubmitting(true)
    setMessage('')

    try {
      const response = await placeOrder({
        currency_code: currencyCode,
        shipping_address_id: shippingAddressId.trim(),
        items: cart.items.map((item) => ({ variant_id: item.variant_id, quantity: item.quantity })),
        coupon_code: couponCode.trim() || undefined,
        shipping_cost: Number(shippingCost || 0),
        tax_rate: Number(taxRate || 0),
      })

      const orderId = response.data.order_id || response.data.order_number
      setMessage('Order placed successfully.')
      if (orderId) {
        router.push(`/orders/${orderId}`)
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to place order.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Checkout</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Place the order</h1>
        <p style={{ maxWidth: 760, color: 'var(--muted)', marginBottom: 26 }}>Checkout now talks to the live order placement endpoint. Enter the shipping address ID used by the backend and submit the cart contents as-is.</p>

        {message ? <div style={{ border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)', marginBottom: 20 }}>{message}</div> : null}

        {loading ? (
          <div style={{ minHeight: 360, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : cart?.items?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.8fr', gap: 24 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginBottom: 16 }}>Shipping and payment</h2>
              <div style={{ display: 'grid', gap: 14 }}>
                <label>
                  <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Shipping address ID</div>
                  <input value={shippingAddressId} onChange={(event) => setShippingAddressId(event.target.value)} placeholder="Paste shipping address UUID" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Currency</div>
                    <input value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value.toUpperCase().slice(0, 3))} style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
                  </label>
                  <label>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Coupon</div>
                    <input value={couponCode} onChange={(event) => setCouponCode(event.target.value)} placeholder="Optional coupon code" style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <label>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Shipping cost</div>
                    <input type="number" min={0} value={shippingCost} onChange={(event) => setShippingCost(event.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
                  </label>
                  <label>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Tax rate %</div>
                    <input type="number" min={0} step="0.1" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }} />
                  </label>
                </div>
                <button className="btn-primary" type="button" disabled={submitting} onClick={handlePlaceOrder}>{submitting ? 'Submitting...' : 'Place order'}</button>
              </div>
              {me?.customer_profile ? (
                <div style={{ marginTop: 18, borderTop: '1px solid var(--border)', paddingTop: 14, color: 'var(--muted)' }}>
                  Signed in as {me.full_name} with preferred currency {me.customer_profile.preferred_currency}.
                </div>
              ) : null}
            </div>

            <aside style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, height: 'fit-content', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginBottom: 16 }}>Review summary</h2>
              <div style={{ display: 'grid', gap: 12, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Items</span><span>{cart.item_count}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Subtotal</span><span>{formatPrice(totals.subtotal, currencyCode)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Shipping</span><span>{formatPrice(totals.shipping, currencyCode)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'between' }}><span style={{ color: 'var(--muted)' }}>Tax</span><span>{formatPrice(totals.tax, currencyCode)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}><strong>Total</strong><strong style={{ color: 'var(--gold)' }}>{formatPrice(totals.total, currencyCode)}</strong></div>
              </div>
              <Link href="/cart" className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Back to cart</Link>
            </aside>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>Nothing to checkout</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>Add items to cart before you can place an order.</p>
            <Link href="/products" className="btn-primary">Browse products</Link>
          </div>
        )}
      </section>
    </main>
  )
}
