import Link from "next/link"
import { customerOverview, customerRecentOrders } from "@/lib/portal-data"

export default function CustomerDashboardPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "110px 60px 40px", display: "grid", gap: 20 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 8 }}>
          Customer Dashboard
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 46, color: "var(--white)", fontWeight: 400 }}>
          Welcome back, {customerOverview.name}
        </h1>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}><p style={{ color: "var(--muted)", fontSize: 11 }}>Tier</p><p style={{ color: "var(--gold)", fontSize: 24, fontFamily: "var(--font-cormorant)" }}>{customerOverview.tier}</p></article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}><p style={{ color: "var(--muted)", fontSize: 11 }}>Loyalty points</p><p style={{ color: "var(--white)", fontSize: 24, fontFamily: "var(--font-cormorant)" }}>{customerOverview.loyaltyPoints}</p></article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}><p style={{ color: "var(--muted)", fontSize: 11 }}>Lifetime value</p><p style={{ color: "var(--gold)", fontSize: 24, fontFamily: "var(--font-cormorant)" }}>{customerOverview.lifetimeValue}</p></article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}><p style={{ color: "var(--muted)", fontSize: 11 }}>Preferred currency</p><p style={{ color: "var(--white)", fontSize: 24, fontFamily: "var(--font-cormorant)" }}>{customerOverview.preferredCurrency}</p></article>
      </section>

      <section style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <p style={{ color: "var(--white)", fontSize: 18, fontFamily: "var(--font-cormorant)" }}>Recent orders</p>
          <Link href="/customer/orders" style={{ color: "var(--gold)", fontSize: 12 }}>View all</Link>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {customerRecentOrders.map((order) => (
            <article key={order.id} style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 0.5fr 0.6fr", gap: 10, padding: 12, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
              <span style={{ color: "var(--white)", fontSize: 13 }}>{order.id}</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{order.date}</span>
              <span style={{ color: "var(--gold)", fontSize: 13 }}>{order.status}</span>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>{order.items} items</span>
              <span style={{ color: "var(--white)", fontSize: 13 }}>{order.total}</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
