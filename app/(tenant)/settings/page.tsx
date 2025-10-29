import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Breadcrumbs from "@/components/Breadcrumbs"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Settings", href: "/settings" },
        ]}
      />

      <main className={styles.main}>
        <h1>Account Settings</h1>

        <Card>
          <h2>Profile Information</h2>
          <form action="/api/user/update-email" method="POST" className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" defaultValue={user.name || ""} />
            </div>

            <div className={styles.field}>
              <label htmlFor="email">Email Address (Portal Only)</label>
              <input type="email" id="email" name="email" defaultValue={user.email} required />
              <p className={styles.notice}>
                ⚠️ This only changes your portal login email. Your Horizon account email remains unchanged and will be
                reconciled during the next sync.
              </p>
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primary}>
                Update Email
              </button>
              <button type="button" className={styles.secondary} disabled>
                Sync to Horizon Later
              </button>
            </div>
          </form>
        </Card>

        <Card>
          <h2>Account Information</h2>
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>User ID:</span>
              <span className={styles.value}>{user.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Role:</span>
              <span className={styles.value}>{user.role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Default Tenant:</span>
              <span className={styles.value}>{user.defaultTenantSlug || "None"}</span>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
