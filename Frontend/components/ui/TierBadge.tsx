// FILE: components/ui/TierBadge.tsx
// Placeholder — full implementation coming in Prompt 2

interface TierBadgeProps {
  tier: 'standard' | 'premium' | 'vip'
}

export default function TierBadge({ tier }: TierBadgeProps) {
  const labels: Record<string, string> = {
    standard: '🥈 Standard',
    premium: '🥇 Premium',
    vip: '👑 VIP',
  }
  return (
    <span
      style={{
        fontSize: 10,
        color: 'var(--gold)',
        border: '1px solid var(--gold-dim)',
        padding: '3px 10px',
        borderRadius: 'var(--radius)',
        fontFamily: 'var(--font-dm)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      }}
    >
      {labels[tier] ?? tier}
    </span>
  )
}
