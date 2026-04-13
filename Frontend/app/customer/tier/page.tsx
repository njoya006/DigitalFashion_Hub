import { customerOverview, customerTierBenefits } from "@/lib/portal-data"

export default function CustomerTierPage() {
  return (
    <main style={{ minHeight: "100vh", padding: "110px 60px 40px", display: "grid", gap: 20 }}>
      <div>
        <p style={{ color: "var(--gold)", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 8 }}>
          Loyalty
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: 44, color: "var(--white)", fontWeight: 400 }}>
          {customerOverview.tier} Tier Benefits
        </h1>
      </div>

      <section style={{ border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, maxWidth: 820 }}>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: 14 }}>
          Keep shopping to increase lifetime value and unlock higher discount brackets.
        </p>
        <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
          {customerTierBenefits.map((benefit) => (
            <li key={benefit} style={{ color: "var(--white)", fontSize: 14 }}>{benefit}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}
