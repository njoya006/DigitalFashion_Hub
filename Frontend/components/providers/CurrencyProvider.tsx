"use client"

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react"
import { DEFAULT_CURRENCY, isSupportedCurrency, SupportedCurrency, SUPPORTED_CURRENCIES } from "@/lib/currency"

type CurrencyContextValue = {
  currency: SupportedCurrency
  setCurrency: (currency: SupportedCurrency) => void
  currencies: readonly SupportedCurrency[]
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined)

function readInitialCurrency(): SupportedCurrency {
  if (typeof window === "undefined") return DEFAULT_CURRENCY

  const storedCurrency = localStorage.getItem("selected_currency")
  if (isSupportedCurrency(storedCurrency)) return storedCurrency

  const cookieCurrency = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith("selected_currency="))
    ?.split("=")[1]

  if (isSupportedCurrency(cookieCurrency)) return cookieCurrency

  return DEFAULT_CURRENCY
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(DEFAULT_CURRENCY)

  useEffect(() => {
    setCurrencyState(readInitialCurrency())
  }, [])

  const setCurrency = (nextCurrency: SupportedCurrency) => {
    setCurrencyState(nextCurrency)
    localStorage.setItem("selected_currency", nextCurrency)
    document.cookie = `selected_currency=${nextCurrency}; Path=/; Max-Age=31536000; SameSite=Lax`
  }

  const value = useMemo(
    () => ({ currency, setCurrency, currencies: SUPPORTED_CURRENCIES }),
    [currency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
