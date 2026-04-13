import { sellerProducts } from "@/lib/portal-data"

export default function SellerProductsPage() {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          Product Catalog
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 42, color: "var(--white)", fontWeight: 400 }}>
          Manage listed products
        </h1>
      </div>

      {sellerProducts.map((product) => (
        <article key={product.sku} style={{ display: "grid", gridTemplateColumns: "0.9fr 1.5fr 0.6fr 0.7fr 0.7fr", gap: 14, border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>SKU</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{product.sku}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Product</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{product.name}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Stock</p>
            <p style={{ color: "var(--gold)", fontSize: 14 }}>{product.stock}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Price</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{product.price}</p>
          </div>
          <div>
            <p style={{ color: "var(--muted)", fontSize: 11 }}>Status</p>
            <p style={{ color: "var(--white)", fontSize: 14 }}>{product.status}</p>
          </div>
        </article>
      ))}
    </div>
  )
}
