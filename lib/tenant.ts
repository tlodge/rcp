export type TenantSlug = "rcpmanagement" | "rcpgroup" | "rcpproperty" | "rcpgroundrent"

const TENANT_MAP: Record<string, TenantSlug> = {
  rcpmanagement: "rcpmanagement",
  rcpgroup: "rcpgroup",
  rcpproperty: "rcpproperty",
  rcpgroundrent: "rcpgroundrent",
}

/**
 * Extract tenant slug from hostname
 * Examples:
 *   rcpmanagement.localhost:3000 -> rcpmanagement
 *   rcpmanagement.example.com -> rcpmanagement
 *   example.com -> null (apex domain)
 */
export function getTenantFromHost(host: string): TenantSlug | null {
  if (!host) return null

  // Remove port if present
  const hostname = host.split(":")[0]

  // Get the primary domain from env
  const primaryDomain = process.env.PORTAL_PRIMARY_DOMAIN || "localhost"
  const primaryHostname = primaryDomain.split(":")[0]

  // Check if this is the apex domain
  if (hostname === primaryHostname || hostname === `www.${primaryHostname}`) {
    return null
  }

  // Extract subdomain
  const parts = hostname.split(".")
  const subdomain = parts[0]

  // Return tenant if it exists in our map
  return TENANT_MAP[subdomain] || null
}

/**
 * Get tenant data from database
 */
export async function getTenantData(slug: TenantSlug) {
  // Lazy import to avoid loading Prisma in Edge runtime (middleware)
  const { getPrisma } = await import("./prisma")
  const prisma = getPrisma()

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      messages: true,
    },
  })

  if (!tenant) {
    throw new Error(`Tenant not found: ${slug}`)
  }

  // Parse theme JSON
  const theme = typeof tenant.theme === "string" ? JSON.parse(tenant.theme) : tenant.theme

  return {
    ...tenant,
    theme,
    messages: tenant.messages || [],
  }
}

/**
 * Server-side helper to get current tenant from headers
 * Use in Server Components and Route Handlers
 */
export async function getCurrentTenant() {
  const { headers } = await import("next/headers")
  const headersList = await headers()
  const tenantSlug = headersList.get("x-tenant")

  if (!tenantSlug) {
    return null
  }

  return getTenantData(tenantSlug as TenantSlug)
}

/**
 * Get current tenant slug from headers (without database lookup)
 */
export async function getCurrentTenantSlug(): Promise<TenantSlug | null> {
  const { headers } = await import("next/headers")
  const headersList = await headers()
  const tenantSlug = headersList.get("x-tenant")

  return tenantSlug as TenantSlug | null
}
