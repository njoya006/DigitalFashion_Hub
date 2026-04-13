import { pendingUsers } from "@/lib/admin-dashboard"

export default function AdminUsersPage() {
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6 }}>
          User Management
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400, marginBottom: 8 }}>
          Manage sellers and customers
        </h1>
        <p style={{ color: "var(--muted)", maxWidth: 700, lineHeight: 1.7, fontSize: 13 }}>
          Review seller approvals, confirm customer activity, and keep account governance simple.
        </p>
      </div>

      <section style={{ display: "grid", gap: 12 }}>
        {pendingUsers.map((user) => (
          <article key={user.email} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.7fr 0.8fr 0.5fr", gap: 16, alignItems: "center", padding: 18, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p style={{ color: "var(--white)", fontSize: 15, marginBottom: 4 }}>{user.name}</p>
              <p style={{ color: "var(--muted)", fontSize: 12 }}>{user.email}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Role</p>
              <p style={{ color: "var(--gold)", fontSize: 13 }}>{user.role}</p>
            </div>
            <div>
              <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4 }}>Status</p>
              <p style={{ color: "var(--white)", fontSize: 13 }}>{user.status}</p>
            </div>
            <button style={{ border: "1px solid var(--gold-dim)", background: "transparent", color: "var(--gold)", padding: "10px 12px", borderRadius: "var(--radius)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", cursor: "pointer" }}>
              Review
            </button>
          </article>
        ))}
      </section>
    </div>
  )
}
