"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import api from "@/lib/api"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [token, setToken] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isRequesting, setIsRequesting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get("token") ?? "")
    setEmail(params.get("email") ?? "")
  }, [])

  async function onRequestToken(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsRequesting(true)

    try {
      const res = await api.post<{ message?: string }>("/auth/request-verify/", { email })
      setMessage(res?.message ?? "If this email exists, verification instructions have been sent.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to request verification link.")
    } finally {
      setIsRequesting(false)
    }
  }

  async function onVerifyToken(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage("")
    setError("")
    setIsVerifying(true)

    try {
      const res = await api.post<{ message?: string }>("/auth/confirm-verify/", { token })
      setMessage(res?.message ?? "Email verified successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify email.")
    } finally {
      setIsVerifying(false)
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
          Account verification
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
          Verify Email
        </h1>

        <div style={{ display: "grid", gap: 18 }}>
          <form onSubmit={onRequestToken} style={{ display: "grid", gap: 12 }}>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
              Request a verification link if you have not received one yet.
            </p>
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

            <button type="submit" className="btn-primary" style={{ justifyContent: "center" }} disabled={isRequesting}>
              {isRequesting ? "Sending..." : "Send Verification Link"}
            </button>
          </form>

          <form onSubmit={onVerifyToken} style={{ display: "grid", gap: 12 }}>
            <p style={{ color: "var(--muted)", fontSize: 13, lineHeight: 1.6 }}>
              Paste the verification token from the email or debug response.
            </p>
            <input
              type="text"
              placeholder="Verification token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
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

            <button type="submit" className="btn-primary" style={{ justifyContent: "center" }} disabled={isVerifying}>
              {isVerifying ? "Verifying..." : "Verify Account"}
            </button>
          </form>
        </div>

        {message ? <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>{message}</p> : null}
        {error ? <p style={{ marginTop: 12, color: "#ff8a8a", fontSize: 13 }}>{error}</p> : null}

        <div style={{ marginTop: 14, display: "flex", gap: 14 }}>
          <Link href="/login" style={{ color: "var(--gold)", fontSize: 13 }}>
            Back to sign in
          </Link>
          <Link href="/register" style={{ color: "var(--gold)", fontSize: 13 }}>
            Create account
          </Link>
        </div>
      </section>
    </main>
  )
}