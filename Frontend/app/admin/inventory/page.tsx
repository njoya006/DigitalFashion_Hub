// FILE: app/admin/inventory/page.tsx
export default function AdminInventoryPage() {
  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, color: 'var(--gold)', fontWeight: 300 }}>
        Inventory
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Coming in Prompt 7
      </p>
    </main>
  )
}
