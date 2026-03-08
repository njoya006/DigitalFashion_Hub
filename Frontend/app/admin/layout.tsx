// FILE: app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          Admin Panel
        </span>
      </div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  )
}
