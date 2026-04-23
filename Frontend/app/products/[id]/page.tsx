"use client"

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { addToCart, fetchProduct, fetchReviews, getPrimaryImage, getProductVariantLabel, normalizeTags, toNumber, type ProductDetail, type ReviewSummary } from '@/lib/storefront'
import { formatDateShort, formatPrice, truncate } from '@/lib/utils'
import { isWishlisted, toggleWishlistItem } from '@/lib/wishlist'

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetailContent productId={id} />
}

function ProductDetailContent({ productId }: { productId: string }) {
  'use client'
  const router = useRouter()
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [reviews, setReviews] = useState<ReviewSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedVariantId, setSelectedVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [wishlistActive, setWishlistActive] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      setLoading(true)
      setError('')

      try {
        const [productData, reviewData] = await Promise.all([
          fetchProduct(productId),
          fetchReviews({ product_id: productId, limit: 20 }),
        ])

        if (!mounted) return
        setProduct(productData)
        setReviews(reviewData)
        setSelectedVariantId(productData.variants.find((variant) => variant.is_active !== false)?.variant_id ?? productData.variants[0]?.variant_id ?? '')
        setWishlistActive(isWishlisted(productData.product_id))
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Unable to load product detail.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [productId])

  const selectedVariant = useMemo(
    () => product?.variants.find((variant) => variant.variant_id === selectedVariantId) ?? product?.variants[0],
    [product, selectedVariantId],
  )

  const finalPrice = useMemo(() => {
    if (!product) return 0
    return toNumber(product.base_price) + toNumber(selectedVariant?.price_modifier)
  }, [product, selectedVariant])

  async function handleAddToCart() {
    if (!selectedVariant) {
      setFeedback('Select a variant before adding to cart.')
      return
    }

    try {
      await addToCart(selectedVariant.variant_id, quantity)
      setFeedback('Added to cart successfully.')
      router.push('/cart')
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Unable to add item to cart.')
    }
  }

  function handleWishlistToggle() {
    if (!product) return

    const next = toggleWishlistItem({
      productId: product.product_id,
      productName: product.product_name,
      slug: product.slug,
      sellerName: product.seller_name || 'Digital Fashion Hub',
      categoryName: product.category_name || 'Uncategorized',
      currencyCode: product.currency_code,
      price: finalPrice,
      imageUrl: getPrimaryImage(product),
    })

    const active = next.some((item) => item.productId === product.product_id)
    setWishlistActive(active)
    setFeedback(active ? 'Saved to wishlist.' : 'Removed from wishlist.')
  }

  return (
    <main style={{ padding: '140px 60px 80px' }}>
      <section style={{ maxWidth: 1280, margin: '0 auto' }}>
        <Link href="/products" style={{ color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.2em', fontSize: 11 }}>Back to products</Link>

        {loading ? (
          <div style={{ marginTop: 24, minHeight: 560, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(255,255,255,0.02)' }} />
        ) : error ? (
          <div style={{ marginTop: 24, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(201,168,76,0.08)', padding: 18, borderRadius: 'var(--radius)' }}>{error}</div>
        ) : product ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 30, marginTop: 24 }}>
            <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ aspectRatio: '4 / 5', background: 'rgba(255,255,255,0.03)' }}>
                {getPrimaryImage(product) ? (
                  <img src={getPrimaryImage(product)} alt={product.primary_image_alt_text || product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>No image available</div>
                )}
              </div>
              {product.images.length > 1 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10, padding: 14, borderTop: '1px solid var(--border)' }}>
                  {product.images.map((image) => (
                    <div key={image.image_id} style={{ aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: 'var(--radius)', border: image.is_primary ? '1px solid var(--gold)' : '1px solid var(--border)' }}>
                      <img src={image.image_url} alt={image.alt_text || product.product_name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 10 }}>Product detail</p>
              <h1 style={{ fontSize: 'clamp(42px, 4.8vw, 64px)', marginBottom: 10 }}>{product.product_name}</h1>
              <p style={{ color: 'var(--muted)', marginBottom: 22 }}>{truncate(product.description || '', 260)}</p>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 18 }}>
                <div style={{ fontSize: 32, color: 'var(--gold)', fontFamily: 'var(--font-cormorant)' }}>{formatPrice(finalPrice, product.currency_code)}</div>
                <div style={{ color: 'var(--muted)', fontSize: 12 }}>{product.currency_code}</div>
              </div>

              <div style={{ display: 'grid', gap: 14, marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Variant</div>
                  <select
                    value={selectedVariantId}
                    onChange={(event) => setSelectedVariantId(event.target.value)}
                    style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }}
                  >
                    {product.variants.map((variant) => (
                      <option key={variant.variant_id} value={variant.variant_id}>{getProductVariantLabel(variant)}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Quantity</div>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
                      style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--white)', borderRadius: 'var(--radius)' }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Availability</div>
                    <div style={{ minHeight: 48, display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '0 16px', color: 'var(--white)' }}>
                      {selectedVariant?.is_active === false ? 'Inactive variant' : 'Live and purchasable'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                <button className="btn-primary" type="button" onClick={handleAddToCart} disabled={!selectedVariant}>Add to cart</button>
                <button className="btn-ghost" type="button" onClick={handleWishlistToggle}>{wishlistActive ? 'Remove wishlist' : 'Save wishlist'}</button>
              </div>

              {feedback ? <p style={{ marginBottom: 18, color: 'var(--gold)' }}>{feedback}</p> : null}

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 18, display: 'grid', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ color: 'var(--muted)' }}>Seller</span><span>{product.seller_name || 'Digital Fashion Hub'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ color: 'var(--muted)' }}>Category</span><span>{product.category_name || 'Uncategorized'}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}><span style={{ color: 'var(--muted)' }}>Tags</span><span>{normalizeTags(product.tags).join(', ') || 'None'}</span></div>
              </div>
            </div>
          </div>
        ) : null}

        {product ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 34 }}>
            <section style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginBottom: 14 }}>Product notes</h2>
              <p style={{ color: 'var(--muted)' }}>
                This product is being served live from the Django backend. Variants, images, reviews, and add-to-cart actions all come from the same API flow used by the rest of the storefront.
              </p>
            </section>
            <section style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 20, background: 'rgba(255,255,255,0.02)' }}>
              <h2 style={{ marginBottom: 14 }}>Customer reviews</h2>
              {reviews.length ? (
                <div style={{ display: 'grid', gap: 16 }}>
                  {reviews.map((review) => (
                    <article key={review.review_id} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                        <strong>{review.customer_name}</strong>
                        <span style={{ color: 'var(--gold)' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      </div>
                      <p style={{ color: 'var(--white)', marginBottom: 4 }}>{review.title || 'Verified feedback'}</p>
                      <p style={{ color: 'var(--muted)' }}>{review.body || 'No review text provided.'}</p>
                      <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 8 }}>{formatDateShort(review.created_at)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)' }}>No reviews yet for this item.</p>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </main>
  )
}

