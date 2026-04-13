import { adminStats } from "@/lib/admin-dashboard"

const metrics = [
  { label: "Conversion Rate", value: "4.82%", note: "+0.6 pts" },
  { label: "Average Order Value", value: "$312", note: "+11%" },
  { label: "Repeat Purchases", value: "38%", note: "+3.4%" },
  { label: "Refund Rate", value: "1.1%", note: "-0.2%" },
] as const

const topProducts = [
  { name: "Oversize Wool Coat", revenue: "$24.6K", orders: 68 },
  { name: "Structured Tote Bag", revenue: "$19.1K", orders: 54 },
  { name: "Silk Evening Dress", revenue: "$17.8K", orders: 43 },
  { name: "Heritage Sneakers", revenue: "$15.2K", orders: 72 },
] as const

export default function AdminAnalyticsPage() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Analytics
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
          Revenue and growth intelligence
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 700, lineHeight: 1.7, fontSize: 13 }}>
          Use this view to understand how the marketplace is performing by revenue, retention, and product demand.
        </p>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        {metrics.map((metric, index) => (
          <article key={metric.label} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, background: index % 2 === 0 ? "rgba(255,255,255,0.02)" : "rgba(201,168,76,0.04)" }}>
            <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>{metric.label}</p>
            <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 34, lineHeight: 1, marginBottom: 8 }}>{metric.value}</p>
            <p style={{ color: "var(--gold)", fontSize: 12 }}>{metric.note}</p>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--white)", fontWeight: 400, marginBottom: 14 }}>
            Top products
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {topProducts.map((product, index) => (
              <div key={product.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <div>
                  <p style={{ color: "var(--white)", fontSize: 14, marginBottom: 4 }}>{index + 1}. {product.name}</p>
                  <p style={{ color: "var(--muted)", fontSize: 12 }}>{product.orders} completed orders</p>
                </div>
                <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 22 }}>{product.revenue}</p>
              </div>
            ))}
          </div>
        </article>

        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--white)", fontWeight: 400, marginBottom: 14 }}>
            Monthly snapshot
          </h2>
          <div style={{ display: "grid", gap: 14 }}>
            {adminStats.map((stat) => (
              <div key={stat.label} style={{ padding: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>{stat.label}</p>
                <p style={{ color: "var(--white)", fontSize: 16 }}>{stat.value} <span style={{ color: "#86efac", fontSize: 12, marginLeft: 8 }}>{stat.delta}</span></p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
