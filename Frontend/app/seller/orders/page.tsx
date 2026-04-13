import { sellerOrders } from "@/lib/portal-data"

export default function SellerOrdersPage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Seller Orders
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 42, color: "var(--white)", fontWeight: 400 }}>
          Fulfillment queue
        </h1>
      </div>

      {sellerOrders.map((order) => (
        <article key={order.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.7fr 0.8fr 0.8fr", gap: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Order</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{order.id}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Customer</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{order.customer}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Status</p>
            <p style={{ color: "var(--gold)", fontSize: 14 }}>{order.status}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Amount</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{order.amount}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Date</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{order.date}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
