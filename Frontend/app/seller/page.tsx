import { sellerOverview } from "@/lib/portal-data"

export default function SellerOverviewPage() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Seller Overview
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
          {sellerOverview.storeName}
        </h1>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 }}>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Store rating</p>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{sellerOverview.rating}</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Pending orders</p>
          <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{sellerOverview.pendingOrders}</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Monthly revenue</p>
          <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{sellerOverview.monthlyRevenue}</p>
        </article>
        <article style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ color: "var(--muted)", fontSize: 11, marginBottom: 6 }}>Active products</p>
          <p style={{ color: "var(--white)", fontFamily: "var(--font-cormorant)", fontSize: 32 }}>{sellerOverview.activeProducts}</p>
        </article>
      </section>
    </div>
  )
}
