"use client"

import { useEffect, useState } from "react"

import { fetchMe, fetchProducts, type MeProfile, type ProductSummary } from "@/lib/storefront"

export default function SellerOverviewPage() {
  const [profile, setProfile] = useState<MeProfile | null>(null)
  const [products, setProducts] = useState<ProductSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      const me = await fetchMe()
      const data = await fetchProducts({ seller_id: me.user_id, include_unpublished: true, limit: 100 })
      if (!mounted) return
      setProfile(me)
      setProducts(data)
      setLoading(false)
    }

    load().catch(() => setLoading(false))

    return () => {
      mounted = false
    }
  }, [])

  const seller = profile?.seller_profile

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Seller Overview
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
          {loading ? "Loading seller account..." : seller?.store_name || profile?.full_name || "Seller Portal"}
        </h1>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Store rating</p>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{seller?.rating ?? "0.0"}</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Pending orders</p>
          <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>-</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Monthly revenue</p>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{seller?.total_sales ?? 0}</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Active products</p>
          <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{products.filter((product) => product.is_published).length}</p>
        </article>
      </section>

      <section style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
        <p style={{ color: "var(--white)", fontSize: 18, fontFamily: "var(--font-cormorant)", marginBottom: 10 }}>Catalog snapshot</p>
        <p style={{ color: "var(--muted)" }}>Your products page now reads from the live backend products table.</p>
      </section>
    </div>
  )
}
