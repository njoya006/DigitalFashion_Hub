// FILE: app/seller/layout.tsx
export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '80px 60px 20px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <span style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.25em', textTransform: 'uppercase', fontFamily: 'var(--font-dm)' }}>
          Seller Portal
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
