import { adminHighlights, adminRevenueBreakdown, adminStats } from "@/lib/admin-dashboard"

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
        {eyebrow}
      </p>
      <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
        {title}
      </h1>
      <p style={{ color: "var(--muted)", maxWidth: 680, lineHeight: 1.7, fontSize: 13 }}>
        {description}
      </p>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <SectionTitle
        eyebrow="Admin Overview"
        title="Command the marketplace from one place"
        description="This dashboard gives NJOYA a fast view of revenue, order flow, inventory health, and user activity across the platform."
      />

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
        {adminStats.map((stat) => (
          <article key={stat.label} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, background: "rgba(255,255,255,0.02)" }}>
            <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>
              {stat.label}
            </p>
            <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 34, lineHeight: 1, marginBottom: 8 }}>
              {stat.value}
            </p>
            <p style={{ color: "#86efac", fontSize: 12, letterSpacing: "0.08em" }}>{stat.delta}</p>
          </article>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--white)", fontWeight: 400, marginBottom: 14 }}>
            Priority signals
          </h2>
          <div style={{ display: "grid", gap: 14 }}>
            {adminHighlights.map((item) => (
              <div key={item.title} style={{ padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
                  <p style={{ color: "var(--white)", fontSize: 14 }}>{item.title}</p>
                  <p style={{ color: "var(--gold)", fontSize: 13, letterSpacing: "0.08em" }}>{item.value}</p>
                </div>
                <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.7 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 22, background: "rgba(255,255,255,0.02)" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--white)", fontWeight: 400, marginBottom: 14 }}>
            Revenue mix
          </h2>
          <div style={{ display: "grid", gap: 12 }}>
            {adminRevenueBreakdown.map((currency) => (
              <div key={currency.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}>
                <div>
                  <p style={{ color: "var(--white)", fontSize: 14 }}>{currency.label}</p>
                  <p style={{ color: "var(--muted)", fontSize: 12 }}>{currency.share} of total revenue</p>
                </div>
                <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 22 }}>{currency.value}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
