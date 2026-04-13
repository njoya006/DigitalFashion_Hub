import { customerRecentOrders } from "@/lib/portal-data"

export default function CustomerOrdersPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "110px 60px 40px", display: "grid", gap: 18 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 8 }}>
          Orders
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400 }}>
          Order history
        </h1>
      </div>

      {customerRecentOrders.map((order) => (
        <article key={order.id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, display: "grid", gridTemplateColumns: "1fr 0.8fr 0.8fr 0.6fr 0.8fr", gap: 12 }}>
          <span style={{ color: "var(--white)", fontSize: 14 }}>{order.id}</span>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{order.date}</span>
          <span style={{ color: "var(--gold)", fontSize: 14 }}>{order.status}</span>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{order.items} items</span>
          <span style={{ color: "var(--white)", fontSize: 14 }}>{order.total}</span>
        </article>
      ))}
    </main>
  )
}
