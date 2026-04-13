export type UserRole = "ADMIN" | "SELLER" | "CUSTOMER" | ""

type SessionPayload = {
  access: string
  refresh: string
  role: UserRole
  email: string
  fullName: string
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function setAuthSession(payload: SessionPayload) {
  if (typeof window === "undefined") return

  localStorage.setItem("auth_token", payload.access)
  localStorage.setItem("refresh_token", payload.refresh)
  localStorage.setItem("user_role", payload.role)
  localStorage.setItem("user_email", payload.email)
  localStorage.setItem("user_name", payload.fullName)

  setCookie("auth_token", payload.access, 60 * 60 * 2)
  setCookie("user_role", payload.role, 60 * 60 * 24 * 7)
}

export function clearAuthSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user_role")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_name")
  }

  clearCookie("auth_token")
  clearCookie("user_role")
}
