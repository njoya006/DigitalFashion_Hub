"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useState } from "react"
import type { CSSProperties } from "react"

import api from "@/lib/api"

type SellerRegisterResponse = {
  success: boolean
  message: string
  data: {
    user_id: string
    email: string
    full_name: string
    role: "SELLER"
    seller_profile: {
      seller_id: string
      store_name: string
      store_logo_url: string | null
      store_description: string | null
      commission_rate: string | number
      is_approved: boolean
      rating: string | number
      total_sales: string | number
    }
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

export default function SellerRegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [storeName, setStoreName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [storeDescription, setStoreDescription] = useState("")
  const [storeLogoUrl, setStoreLogoUrl] = useState("")
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
      const res = await api.post<SellerRegisterResponse>("/auth/register/seller/", {
        full_name: fullName.trim(),
        store_name: storeName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        store_description: storeDescription.trim(),
        store_logo_url: storeLogoUrl.trim(),
        password,
        confirm_password: confirmPassword,
      })

      setSuccess(res.message || "Seller account created successfully. Please sign in.")
      setTimeout(() => {
        router.push("/login")
      }, 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Seller registration failed. Try again.")
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
      <section className="glass" style={{ width: "100%", maxWidth: 620, padding: 28, borderRadius: 2 }}>
        <p
          style={{
            color: "var(--muted)",
            letterSpacing: "0.16em",
            fontSize: 11,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Seller onboarding
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
          Create Seller Account
        </h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Store Name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
              inputMode="tel"
              maxLength={25}
              style={inputStyle}
            />
          </div>

          <input
            type="text"
            placeholder="Store Description (optional)"
            value={storeDescription}
            onChange={(e) => setStoreDescription(e.target.value)}
            style={inputStyle}
          />

          <input
            type="url"
            placeholder="Store Logo URL (optional)"
            value={storeLogoUrl}
            onChange={(e) => setStoreLogoUrl(e.target.value)}
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
          </div>

          {error ? <p style={{ color: "#e7a0a0", fontSize: 13 }}>{error}</p> : null}
          {success ? <p style={{ color: "#a6dfad", fontSize: 13 }}>{success}</p> : null}

          <button type="submit" className="btn-primary" disabled={loading} style={{ justifyContent: "center", marginTop: 4 }}>
            {loading ? "Creating Seller Account..." : "Create Seller Account"}
          </button>
        </form>

        <div style={{ marginTop: 14, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link href="/login" style={{ color: "var(--gold)", fontSize: 13 }}>
            Already have an account? Sign in
          </Link>
          <Link href="/register" style={{ color: "var(--muted)", fontSize: 13 }}>
            Customer signup
          </Link>
        </div>
      </section>
    </main>
  )
}
