// FILE: app/seller/orders/page.tsx
export default function SellerOrdersPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, color: 'var(--gold)', fontWeight: 300 }}>
        Seller Orders
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Coming in Prompt 6
      </p>
    </main>
  )
}
