import { lowStockInventory } from "@/lib/admin-dashboard"

export default function AdminInventoryPage() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Inventory
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
          Stock watch and reorder signals
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 700, lineHeight: 1.7, fontSize: 13 }}>
          Track items approaching reorder thresholds and keep fulfillment stable across regional warehouses.
        </p>
      </div>

      <section style={{ display: "grid", gap: 12 }}>
        {lowStockInventory.map((item) => (
          <article key={item.sku} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.6fr 0.6fr", gap: 16, alignItems: "center", padding: 18, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p style={{ color: "var(--white)", fontSize: 15, marginBottom: 4 }}>{item.product}</p>
              <p style={{ color: "var(--muted)", fontSize: 12 }}>{item.sku}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Warehouse</p>
              <p style={{ color: "var(--white)", fontSize: 13 }}>{item.warehouse}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Stock</p>
              <p style={{ color: "#fbbf24", fontSize: 18, fontFamily: "var(--font-cormorant)" }}>{item.stock}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Threshold</p>
              <p style={{ color: "var(--gold)", fontSize: 18, fontFamily: "var(--font-cormorant)" }}>{item.threshold}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
