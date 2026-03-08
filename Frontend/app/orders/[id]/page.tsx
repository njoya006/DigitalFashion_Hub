// FILE: app/orders/[id]/page.tsx
export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, color: 'var(--gold)', fontWeight: 300 }}>
        Order #{id}
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Coming in Prompt 5
      </p>
    </main>
  )
}
