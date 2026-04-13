"use client"

import Link from "next/link"
import { FormEvent, useState } from "react"
import api from "@/lib/api"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsSubmitting(true)

    try {
      const res = await api.post<{ message?: string }>("/auth/request-reset/", { email })
      setMessage(res?.message ?? "If this email exists, password reset instructions have been sent.")
      setEmail("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to request password reset."
      setError(msg)
    } finally {
      setIsSubmitting(false)
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
      <section className="glass" style={{ width: "100%", maxWidth: 460, padding: 28, borderRadius: 2 }}>
        <p
          style={{
            color: "var(--muted)",
            letterSpacing: "0.16em",
            fontSize: 11,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Account recovery
        </p>

        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 44,
            color: "var(--gold)",
            fontWeight: 400,
            marginBottom: 18,
          }}
        >
          Forgot Password
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="email"
            placeholder="Enter your account email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 12px",
              border: "1px solid var(--border)",
              background: "rgba(255,255,255,0.03)",
              color: "var(--white)",
              fontFamily: "var(--font-dm)",
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{ justifyContent: "center", marginTop: 4 }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>

        {message ? <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>{message}</p> : null}
        {error ? <p style={{ marginTop: 12, color: "#ff8a8a", fontSize: 13 }}>{error}</p> : null}

        <div style={{ marginTop: 14 }}>
          <Link href="/login" style={{ color: "var(--gold)", fontSize: 13 }}>
            Back to sign in
          </Link>
        </div>
      </section>
    </main>
  )
}
