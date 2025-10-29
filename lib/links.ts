export function getTenantUrl(tenantSlug: string, path = "/dashboard"): string {
  // In dev mode (default), we use cookies instead of subdomains
  // Just return the path - the tenant will be set via cookie
  return path
}

export function getApexUrl(path = "/"): string {
  return path
}

export function isApexDomain(host: string): boolean {
  // In dev mode, we don't use subdomains
  return true
}

export function getSubdomain(host: string): string | null {
  // In dev mode, we don't use subdomains
  return null
}
