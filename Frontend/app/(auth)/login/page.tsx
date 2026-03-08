// FILE: app/(auth)/login/page.tsx
export default function LoginPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontFamily: 'var(--font-cormorant)', fontSize: 48, color: 'var(--gold)', fontWeight: 300 }}>
        Sign In
      </p>
      <p style={{ color: 'var(--muted)', fontSize: 13, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
        Coming in Prompt 3
      </p>
    </main>
  )
}
