"use client"

import { useCurrency } from "@/components/providers/CurrencyProvider"

export default function CurrencySwitcher() {
  const { currency, setCurrency, currencies } = useCurrency()

  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontSize: 10,
        color: "var(--gold)",
        border: "1px solid var(--gold-dim)",
        padding: "5px 12px",
        background: "transparent",
        letterSpacing: "0.08em",
        borderRadius: "var(--radius)",
        fontFamily: "var(--font-dm)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "var(--muted)" }}>Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as (typeof currencies)[number])}
        aria-label="Switch currency"
        style={{
          border: "none",
          background: "transparent",
          color: "var(--gold)",
          fontFamily: "var(--font-dm)",
          fontSize: 10,
          letterSpacing: "0.08em",
          outline: "none",
          cursor: "pointer",
        }}
      >
        {currencies.map((item) => (
          <option key={item} value={item} style={{ color: "#000000" }}>
            {item}
          </option>
        ))}
      </select>
    </label>
  )
}
