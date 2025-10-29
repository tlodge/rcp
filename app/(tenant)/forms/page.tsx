import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import Link from "next/link"
import Breadcrumbs from "@/components/Breadcrumbs"
import styles from "./page.module.css"

export default async function FormsPage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  const prisma = getPrisma()

  console.log("[v0] Forms page - Current tenant:", tenant.slug)

  // Get forms for current tenant and group-level forms (tenantSlug is null)
  const forms = await prisma.formDefinition.findMany({
    where: {
      isActive: true,
      OR: [{ tenantSlug: tenant.slug }, { tenantSlug: null }],
    },
    orderBy: { createdAt: "desc" },
  })

  console.log(
    "[v0] Forms found:",
    forms.length,
    forms.map((f: any) => ({ id: f.id, title: f.title, tenantSlug: f.tenantSlug })),
  )

  return (
    <div className="container">
      <div className={styles.formsPage}>
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Forms" }]} />

        <h1>Forms</h1>
        <p className={styles.subtitle}>Submit requests and applications for {tenant.name}</p>

        {forms.length === 0 ? (
          <Card>
            <p className={styles.empty}>No forms available at this time.</p>
          </Card>
        ) : (
          <div className={styles.formsList}>
            {forms.map((form) => (
              <Link key={form.id} href={`/forms/${form.id}`} className={styles.formCard}>
                <Card>
                  <h3>{form.title}</h3>
                  {form.description && <p className={styles.description}>{form.description}</p>}
                  <span className={styles.badge}>{form.tenantSlug ? "Tenant Form" : "Group Form"}</span>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <Link href="/my/submissions" className={styles.link}>
            View My Submissions →
          </Link>
        </div>
      </div>
    </div>
  )
}
