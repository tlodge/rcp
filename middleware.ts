import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getTenantFromHost } from "./lib/tenant"

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || ""
  let tenantSlug = getTenantFromHost(host)

  if (!tenantSlug) {
    const devTenant = request.cookies.get("dev-tenant")?.value
    if (devTenant) {
      tenantSlug = devTenant as any
    }
  }

  // Clone the request headers
  const requestHeaders = new Headers(request.headers)

  // Add tenant slug to headers (or empty string if apex domain)
  if (tenantSlug) {
    requestHeaders.set("x-tenant", tenantSlug)
  } else {
    requestHeaders.set("x-tenant", "")
  }

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}
