import type React from "react"
import { getCurrentUser } from "@/lib/auth"
import Header from "@/components/Header"
import styles from "./layout.module.css"
import Link from "next/link"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return (
      <>
        <Header />
        <div className="container">
          <div className={styles.accessDenied}>
            <h1>Access Denied</h1>
            <p>You need administrator privileges to access this area.</p>
            {!user && <p>Please sign in with an admin account.</p>}
            {user && user.role !== "ADMIN" && <p>Your account ({user.email}) does not have admin access.</p>}
            <Link href="/dashboard" className={styles.backLink}>
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <h2>Admin</h2>
            <nav className={styles.nav}>
              <Link href="/admin" className={styles.navLink}>
                Dashboard
              </Link>
              <Link href="/admin/tenant-messages" className={styles.navLink}>
                Tenant Messages
              </Link>
              <Link href="/admin/forms" className={styles.navLink}>
                Form Definitions
              </Link>
            </nav>
          </aside>
          <main className={styles.content}>{children}</main>
        </div>
      </div>
    </>
  )
}
