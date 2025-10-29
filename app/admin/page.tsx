import Link from "next/link"
import styles from "./page.module.css"

export default function AdminPage() {
  return (
    <div className={styles.dashboard}>
      <h1>Admin Dashboard</h1>
      <p>Welcome to the admin area. Select an option below to manage your application.</p>

      <div className={styles.cards}>
        <Link href="/admin/tenant-messages" className={styles.card}>
          <h2>Tenant Messages</h2>
          <p>Manage messages displayed to users on each tenant</p>
        </Link>

        <Link href="/admin/forms" className={styles.card}>
          <h2>Form Definitions</h2>
          <p>Manage forms, toggle active status, and set tenant visibility</p>
        </Link>
      </div>
    </div>
  )
}
