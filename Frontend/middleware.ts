import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_PREFIX = "/admin"
const SELLER_PREFIX = "/seller"
const CUSTOMER_PREFIX = "/customer"
const AUTH_PAGES = new Set(["/login", "/register"])

function roleHome(role?: string) {
  if (role === "ADMIN") return "/admin"
  if (role === "SELLER") return "/seller"
  if (role === "CUSTOMER") return "/customer"
  return "/"
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("auth_token")?.value
  const role = request.cookies.get("user_role")?.value

  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX)
  const isSellerRoute = pathname.startsWith(SELLER_PREFIX)
  const isCustomerRoute = pathname.startsWith(CUSTOMER_PREFIX)

  if (AUTH_PAGES.has(pathname) && token) {
    return NextResponse.redirect(new URL(roleHome(role), request.url))
  }

  if ((isAdminRoute || isSellerRoute || isCustomerRoute) && !token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAdminRoute && role !== "ADMIN") {
    return NextResponse.redirect(new URL(roleHome(role), request.url))
  }

  if (isSellerRoute && role !== "SELLER") {
    return NextResponse.redirect(new URL(roleHome(role), request.url))
  }

  if (isCustomerRoute && role !== "CUSTOMER") {
    return NextResponse.redirect(new URL(roleHome(role), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*", "/customer/:path*", "/login", "/register"],
}
