"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import type { CSSProperties } from "react"

import api from "@/lib/api"
import { setAuthSession } from "@/lib/auth"

type LoginResponse = {
  success: boolean
  data: {
    access: string
    refresh: string
    user_id: string
    email: string
    full_name: string
    role: "ADMIN" | "SELLER" | "CUSTOMER" | null
  }
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "14px 12px",
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.03)",
  color: "var(--white)",
  fontFamily: "var(--font-dm)",
  fontSize: 14,
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function isAllowedNextPath(role: LoginResponse["data"]["role"], nextPath: string) {
    if (!nextPath.startsWith("/")) return false
    if (nextPath.startsWith("/admin")) return role === "ADMIN"
    if (nextPath.startsWith("/seller")) return role === "SELLER"
    if (nextPath.startsWith("/customer")) return role === "CUSTOMER"
    return true
  }

  function roleDefaultPath(role: LoginResponse["data"]["role"]) {
    if (role === "ADMIN") return "/admin"
    if (role === "SELLER") return "/seller"
    if (role === "CUSTOMER") return "/customer"
    return "/"
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await api.post<LoginResponse>("/auth/login/", {
        email: email.trim().toLowerCase(),
        password,
      })

      setAuthSession({
        access: res.data.access,
        refresh: res.data.refresh,
        role: res.data.role ?? "",
        email: res.data.email,
        fullName: res.data.full_name,
      })

      const nextPath = new URLSearchParams(window.location.search).get("next")
      if (nextPath && isAllowedNextPath(res.data.role, nextPath)) {
        router.push(nextPath)
      } else {
        router.push(roleDefaultPath(res.data.role))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 20px",
      }}
    >
      <section
        className="glass"
        style={{
          width: "100%",
          maxWidth: 460,
          padding: 28,
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0) 70%)",
            pointerEvents: "none",
          }}
        />

        <p
          style={{
            color: "var(--muted)",
            letterSpacing: "0.16em",
            fontSize: 11,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Welcome back
        </p>

        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 46,
            color: "var(--gold)",
            fontWeight: 400,
            marginBottom: 18,
          }}
        >
          Sign In
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />

          {error ? (
            <p style={{ color: "#e7a0a0", fontSize: 13 }}>{error}</p>
          ) : null}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: "center", marginTop: 4 }}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <Link href="/register" style={{ color: "var(--gold)", fontSize: 13 }}>
            Create account
          </Link>
          <Link href="/seller-register" style={{ color: "var(--muted)", fontSize: 13 }}>
            Seller signup
          </Link>
          <Link href="/verify-email" style={{ color: "var(--muted)", fontSize: 13 }}>
            Verify email
          </Link>
          <Link href="/forgot-password" style={{ color: "var(--muted)", fontSize: 13 }}>
            Forgot password?
          </Link>
        </div>
      </section>
    </main>
  )
}
