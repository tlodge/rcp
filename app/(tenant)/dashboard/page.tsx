import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Card from "@/components/Card"
import Link from "next/link"
import styles from "./page.module.css"
import { getPrisma } from "@/lib/prisma"

export default async function DashboardPage({ searchParams }: { searchParams?: { submitted?: string } }) {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  // Check for active forms (tenant-specific or group-level)
  const prisma = getPrisma()
  const activeForms = await prisma.formDefinition.findMany({
    where: {
      isActive: true,
      OR: [{ tenantSlug: tenant.slug }, { tenantSlug: null }],
    },
    orderBy: { createdAt: "desc" },
    take: 3,
  })

  const submitted = (await searchParams)?.submitted === "1"

  return (
    <div className="container">
      <div className={styles.dashboard}>
        {submitted && (
          <div className={`${styles.alert} ${styles.alertSuccess}`}>Thanks – your information was submitted.</div>
        )}
        <h1>Welcome to {tenant.name}</h1>
        <p className={styles.subtitle}>Logged in as {session.user.email}</p>

        <div className={styles.grid}>
          <Link href="/account-balance" className={styles.cardLink}>
            <Card>
              <h3>Account Balance</h3>
              <p className={styles.balance}>£0.00</p>
              <p className={styles.muted}>Click to view details →</p>
            </Card>
          </Link>

          {activeForms.length > 0 && (
            <Link href="/forms" className={styles.cardLink}>
              <Card>
                <h3>Submit Information</h3>
                {activeForms[0] && <p className={styles.muted}>e.g. {activeForms[0].title}</p>}
                <p className={styles.muted}>View available forms →</p>
              </Card>
            </Link>
          )}

          <Card>
            <h3>Recent Activity</h3>
            <p className={styles.muted}>No recent activity</p>
          </Card>

          <Card>
            <h3>Support</h3>
            <p>Email: {tenant.supportEmail}</p>
            <p>Phone: {tenant.supportPhone}</p>
          </Card>
        </div>

        {(tenant.messages?.length ?? 0) > 0 && (
          <div className={styles.messages}>
            {tenant.messages.map((message) => (
              <Card key={message.id}>
                <div dangerouslySetInnerHTML={{ __html: message.content }} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
