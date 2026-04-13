"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import type { CSSProperties } from "react"

import api from "@/lib/api"

type RegisterResponse = {
  success: boolean
  message: string
  data: {
    user_id: string
    email: string
    full_name: string
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

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currency, setCurrency] = useState("USD")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const res = await api.post<RegisterResponse>("/auth/register/", {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        preferred_currency: currency,
        password,
        confirm_password: confirmPassword,
      })

      setSuccess(res.message || "Account created successfully. Please verify your email.")
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Try again.")
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
      <section className="glass" style={{ width: "100%", maxWidth: 520, padding: 28, borderRadius: 2 }}>
        <p
          style={{
            color: "var(--muted)",
            letterSpacing: "0.16em",
            fontSize: 11,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Join the marketplace
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
          Create Account
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Phone (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />

          <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={inputStyle}>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="XAF">XAF</option>
          </select>

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            style={inputStyle}
          />

          {error ? <p style={{ color: "#e7a0a0", fontSize: 13 }}>{error}</p> : null}
          {success ? <p style={{ color: "#a6dfad", fontSize: 13 }}>{success}</p> : null}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: "center", marginTop: 4 }}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: 14 }}>
          <Link href="/login" style={{ color: "var(--gold)", fontSize: 13 }}>
            Already have an account? Sign in
          </Link>
          <div style={{ marginTop: 8 }}>
            <Link href="/verify-email" style={{ color: "var(--muted)", fontSize: 13 }}>
              Verify your email
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
