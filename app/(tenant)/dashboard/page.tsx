import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Card from "@/components/Card"
import Link from "next/link"
import styles from "./page.module.css"

export default async function DashboardPage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  return (
    <div className="container">
      <div className={styles.dashboard}>
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
