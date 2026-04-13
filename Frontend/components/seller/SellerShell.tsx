"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

const sellerNav = [
  { href: "/seller", label: "Overview" },
  { href: "/seller/orders", label: "Orders" },
  { href: "/seller/products", label: "Products" },
] as const

export default function SellerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "240px 1fr", background: "#050505" }}>
      <aside style={{ borderRight: "1px solid var(--border)", padding: "30px 20px", background: "rgba(10,10,10,0.95)" }}>
        <p style={{ color: "var(--gold)", fontFamily: "var(--font-cormorant)", fontSize: 30, lineHeight: 1 }}>
          Seller
          <br />
          Portal
        </p>
        <p style={{ color: "var(--muted)", fontSize: 11, marginTop: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
          Store Operations
        </p>

        <nav style={{ marginTop: 28, display: "grid", gap: 10 }}>
          {sellerNav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "11px 12px",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${active ? "var(--gold)" : "var(--border)"}`,
                  color: active ? "var(--white)" : "var(--muted)",
                  textDecoration: "none",
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
      </aside>

      <main style={{ padding: "36px 40px 50px" }}>{children}</main>
    </div>
  )
}
