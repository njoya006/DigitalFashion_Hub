"use client"

import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import api from "@/lib/api"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get("token") ?? "")
  }, [])

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setMessage("")

    if (!token) {
      setError("Reset token is required.")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await api.post<{ message?: string }>("/auth/confirm-reset/", {
        token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      setMessage(res?.message ?? "Password reset successful. You can now sign in.")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to reset password."
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
          Reset Password
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <input
            type="text"
            placeholder="Paste your reset token"
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

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {message ? <p style={{ marginTop: 12, color: "var(--muted)", fontSize: 13 }}>{message}</p> : null}
        {error ? <p style={{ marginTop: 12, color: "#ff8a8a", fontSize: 13 }}>{error}</p> : null}

        <div style={{ marginTop: 14, display: "flex", gap: 14 }}>
          <Link href="/login" style={{ color: "var(--gold)", fontSize: 13 }}>
            Back to sign in
          </Link>
          <Link href="/forgot-password" style={{ color: "var(--gold)", fontSize: 13 }}>
            Request another token
          </Link>
        </div>
      </section>
    </main>
  )
}
