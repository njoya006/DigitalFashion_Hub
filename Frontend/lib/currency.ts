export const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "JPY", "XAF", "CAD"] as const

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export const DEFAULT_CURRENCY: SupportedCurrency = "USD"

export function isSupportedCurrency(value: string | null | undefined): value is SupportedCurrency {
  return Boolean(value && SUPPORTED_CURRENCIES.includes(value as SupportedCurrency))
}
