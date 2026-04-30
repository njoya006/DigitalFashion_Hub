"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, type FormEvent } from "react"

import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  fetchMe,
  updateAddress,
  type Address,
  type AddressPayload,
  type MeProfile,
} from "@/lib/storefront"

const emptyForm: AddressPayload = {
  street: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  phone: "",
  recipient_name: "",
  is_default: false,
}

export default function CustomerAddressesPage() {
  const [me, setMe] = useState<MeProfile | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState<AddressPayload>(emptyForm)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    let mounted = true

    async function loadAddresses() {
      setLoading(true)
      setMessage("")

      try {
        const [meData, addressData] = await Promise.all([fetchMe(), fetchAddresses()])
        if (!mounted) return
        setMe(meData)
        setAddresses(addressData)
      } catch (error) {
        if (!mounted) return
        setMessage(error instanceof Error ? error.message : "Unable to load addresses.")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadAddresses()

    return () => {
      mounted = false
    }
  }, [])

  const defaultAddressId = useMemo(() => addresses.find((address) => address.is_default)?.address_id ?? null, [addresses])

  function resetForm() {
    setForm(emptyForm)
    setEditingAddressId(null)
  }

  function startEdit(address: Address) {
    setEditingAddressId(address.address_id)
    setForm({
      street: address.street,
      city: address.city,
      state: address.state || "",
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || "",
      recipient_name: address.recipient_name,
      is_default: address.is_default,
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage("")

    const payload: AddressPayload = {
      ...form,
      state: form.state?.trim() || null,
      phone: form.phone?.trim() || null,
      is_default: Boolean(form.is_default),
    }

    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, payload)
        setMessage("Address updated successfully.")
      } else {
        await createAddress(payload)
        setMessage("Address created successfully.")
      }

      const updatedAddresses = await fetchAddresses()
      setAddresses(updatedAddresses)
      resetForm()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save address.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(addressId: number) {
    const confirmed = window.confirm("Delete this address?")
    if (!confirmed) return

    setSubmitting(true)
    setMessage("")

    try {
      await deleteAddress(addressId)
      setAddresses((current) => current.filter((address) => address.address_id !== addressId))
      if (editingAddressId === addressId) {
        resetForm()
      }
      setMessage("Address deleted.")
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete address.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "120px 60px 80px" }}>
      <section style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 20, marginBottom: 24 }}>
          <div>
            <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 8 }}>Customer Addresses</p>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(38px, 5vw, 64px)", color: "var(--white)", fontWeight: 400, margin: 0 }}>Manage shipping destinations</h1>
            <p style={{ color: "var(--muted)", maxWidth: 760, marginTop: 10 }}>Save multiple addresses, set a default, and reuse them at checkout without typing IDs.</p>
          </div>
          <Link href="/checkout" className="btn-ghost">Back to checkout</Link>
        </div>

        {message ? <div style={{ border: "1px solid rgba(201,168,76,0.35)", background: "rgba(201,168,76,0.08)", padding: 18, borderRadius: "var(--radius)", marginBottom: 20 }}>{message}</div> : null}

        <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 24, alignItems: "start" }}>
          <section style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, background: "rgba(255,255,255,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Address form</h2>
              {editingAddressId ? <button type="button" onClick={resetForm} className="btn-ghost">Cancel edit</button> : null}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Recipient name</div>
                <input value={form.recipient_name} onChange={(event) => setForm((current) => ({ ...current, recipient_name: event.target.value }))} required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
              </label>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Street</div>
                <input value={form.street} onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))} required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>City</div>
                  <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
                </label>
                <label>
                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>State / region</div>
                  <input value={form.state || ""} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <label>
                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Postal code</div>
                  <input value={form.postal_code} onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))} required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
                </label>
                <label>
                  <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Country</div>
                  <input value={form.country} onChange={(event) => setForm((current) => ({ ...current, country: event.target.value }))} required style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
                </label>
              </div>

              <label>
                <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>Phone</div>
                <input value={form.phone || ""} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Optional" style={{ width: "100%", padding: "14px 16px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border)", color: "var(--white)", borderRadius: "var(--radius)" }} />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input type="checkbox" checked={Boolean(form.is_default)} onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))} />
                <span style={{ color: "var(--muted)" }}>Set as default address</span>
              </label>

              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Saving..." : editingAddressId ? "Update address" : "Add address"}</button>
            </form>
          </section>

          <section style={{ display: "grid", gap: 14 }}>
            <div style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, background: "rgba(255,255,255,0.02)" }}>
              <h2 style={{ marginTop: 0 }}>Saved addresses</h2>
              <p style={{ color: "var(--muted)", marginBottom: 0 }}>{me?.full_name ? `Signed in as ${me.full_name}.` : "Loading your account..."} {defaultAddressId ? `Default address #${defaultAddressId}.` : "No default address set yet."}</p>
            </div>

            {loading ? (
              <div style={{ minHeight: 280, border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "rgba(255,255,255,0.02)" }} />
            ) : addresses.length ? (
              addresses.map((address) => (
                <article key={address.address_id} style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 18, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                    <div>
                      <h3 style={{ margin: 0, color: "var(--gold)" }}>{address.recipient_name}</h3>
                      <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{address.street}</p>
                    </div>
                    {address.is_default ? <span style={{ alignSelf: "flex-start", padding: "6px 10px", borderRadius: 999, background: "rgba(201,168,76,0.12)", color: "var(--gold)", fontSize: 12 }}>Default</span> : null}
                  </div>

                  <div style={{ display: "grid", gap: 6, color: "var(--muted)", marginBottom: 14 }}>
                    <span>{address.city}{address.state ? `, ${address.state}` : ""} {address.postal_code}</span>
                    <span>{address.country}</span>
                    {address.phone ? <span>{address.phone}</span> : null}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button type="button" className="btn-ghost" onClick={() => startEdit(address)}>Edit</button>
                    <button type="button" className="btn-ghost" onClick={() => handleDelete(address.address_id)} disabled={submitting}>Delete</button>
                    <Link href={`/checkout?address=${address.address_id}`} className="btn-ghost">Use at checkout</Link>
                  </div>
                </article>
              ))
            ) : (
              <div style={{ border: "1px dashed var(--border)", borderRadius: "var(--radius)", padding: 24, color: "var(--muted)" }}>
                No saved addresses yet. Add your first shipping address to enable checkout.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}
