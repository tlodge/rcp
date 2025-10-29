"use client"
import styles from "./TenantSelector.module.css"

const TENANTS = [
  { slug: "rcpmanagement", name: "RCP Management", description: "Property management services" },
  { slug: "rcpgroup", name: "RCP Group", description: "Group services and information" },
  { slug: "rcpproperty", name: "RCP Property", description: "Property sales and lettings" },
  { slug: "rcpgroundrent", name: "RCP Ground Rent", description: "Ground rent management" },
]

export default function TenantSelector() {
  const handleSelectTenant = async (tenantSlug: string) => {
    document.cookie = `dev-tenant=${tenantSlug}; path=/; max-age=2592000` // 30 days

    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  return (
    <div className={styles.selector}>
      <div className={styles.tenantGrid}>
        {TENANTS.map((tenant) => (
          <button
            key={tenant.slug}
            onClick={() => handleSelectTenant(tenant.slug)}
            className={styles.tenantCard}
            type="button"
          >
            <h3>{tenant.name}</h3>
            <p>{tenant.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
