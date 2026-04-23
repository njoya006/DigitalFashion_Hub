"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchCart, removeCartItem, updateCartItem, type CartPayload } from '@/lib/storefront'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const [cart, setCart] = useState<CartPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyVariantId, setBusyVariantId] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadCart() {
      setLoading(true)
      setError('')

      try {
        const data = await fetchCart()
        if (!mounted) return
        setCart(data)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to load cart.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadCart()

    return () => {
      mounted = false
    }
  }, [])

  async function refreshCart() {
    const data = await fetchCart()
    setCart(data)
  }

  async function handleQuantityChange(variantId: string, quantity: number) {
    setBusyVariantId(variantId)
    try {
      await updateCartItem(variantId, quantity)
      await refreshCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update cart item.')
    } finally {
      setBusyVariantId('')
    }
  }

  async function handleRemove(variantId: string) {
    setBusyVariantId(variantId)
    try {
      await removeCartItem(variantId)
      await refreshCart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove cart item.')
    } finally {
      setBusyVariantId('')
    }
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1200, margin: '0 auto' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 12 }}>Cart</p>
        <h1 style={{ fontSize: 'clamp(40px, 5vw, 68px)', marginBottom: 12 }}>Your live cart</h1>
        <p style={{ maxWidth: 720, color: 'var(--muted)', marginBottom: 26 }}>This page reads and updates the authenticated cart from the backend, including quantity changes and removals.</p>

        {error ? <div style={{ border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)', marginBottom: 20 }}>{error}</div> : null}

        {loading ? (
          <div style={{ minHeight: 280, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : cart?.items?.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 24 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              {cart.items.map((item) => (
                <article key={item.variant_id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 16, border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.03)' }}>
                    {item.image_url ? <img src={item.image_url} alt={item.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} /> : null}
                  </div>
                  <div>
                    <Link href={`/products/${item.product_id}`} style={{ display: 'block', color: 'var(--white)', fontSize: 24, marginBottom: 6 }}>{item.product_name}</Link>
                    <p style={{ color: 'var(--muted)', marginBottom: 10 }}>{item.variant_name}</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', color: 'var(--muted)', fontSize: 12 }}>
                      <span>SKU {item.variant_sku || 'N/A'}</span>
                      <span>{item.stock_quantity} in stock</span>
                      <span>{item.warehouse_count} warehouse(s)</span>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 14, flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>Qty</span>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          disabled={busyVariantId === item.variant_id}
                          onChange={(event) => handleQuantityChange(item.variant_id, Math.max(1, Number(event.target.value) || 1))}
                          style={{ width: 90, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }}
                        />
                      </label>
                      <button className="btn-ghost" type="button" disabled={busyVariantId === item.variant_id} onClick={() => handleRemove(item.variant_id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-cormorant)', fontSize: 24, color: 'var(--gold)' }}>{formatPrice((Number(item.base_price || 0) + Number(item.price_modifier || 0)) * item.quantity, item.currency_code)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>{formatPrice(Number(item.base_price || 0) + Number(item.price_modifier || 0), item.currency_code)} each</div>
                  </div>
                </article>
              ))}
            </div>

            <aside style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, height: 'fit-content', background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginBottom: 16 }}>Order summary</h2>
              <div style={{ display: 'grid', gap: 12, marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}><span>Items</span><span>{cart.item_count}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)' }}><span>Subtotal</span><span>{formatPrice(Number(cart.subtotal || 0), cart.items[0]?.currency_code || 'USD')}</span></div>
              </div>
              <Link className="btn-primary" href="/checkout" style={{ width: '100%', justifyContent: 'center' }}>Go to checkout</Link>
              <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 14 }}>Need to test a quick manual add? Open a product page and add the active variant from there.</p>
            </aside>
          </div>
        ) : (
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 28, background: 'rgba(255,255,255,0.02)' }}>
            <h2 style={{ marginBottom: 8 }}>Your cart is empty</h2>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>Browse products and add a variant to start building a checkout.</p>
            <Link href="/products" className="btn-primary">Browse products</Link>
          </div>
        )}
      </section>
    </main>
  )
}
