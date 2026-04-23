"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { adminNav } from "@/lib/admin-dashboard"

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "260px 1fr", background: "#050505" }}>
      <aside
        style={{
          borderRight: "1px solid var(--border)",
          padding: "32px 24px",
          position: "sticky",
          top: 0,
          height: "100vh",
          background: "linear-gradient(180deg, rgba(20,20,20,0.96) 0%, rgba(8,8,8,1) 100%)",
        }}
      >
        <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 32, fontWeight: 400, lineHeight: 1 }}>
          DigitalFashion
          <br />
          Hub
        </p>
        <p style={{ color: "var(--muted)", fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", marginTop: 10 }}>
          Admin Control Center
        </p>

        <nav style={{ display: "grid", gap: 10, marginTop: 32 }}>
          {adminNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "12px 14px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
                  color: active ? "var(--white)" : "var(--muted)",
                  textDecoration: "none",
                  fontFamily: "var(--font-dm)",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  background: active ? "rgba(201,168,76,0.08)" : "transparent",
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ marginTop: 32, padding: 16, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ color: "var(--white)", fontSize: 13, marginBottom: 6 }}>Operational focus</p>
          <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.7 }}>
            Monitor sellers, inventory, and revenue signals from a single command layer.
          </p>
        </div>
      </aside>

      <main style={{ padding: "36px 40px 48px" }}>{children}</main>
    </div>
  )
}
