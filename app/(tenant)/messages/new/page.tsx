import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import MessageForm from "@/components/MessageForm"
import styles from "./page.module.css"

export default async function NewMessagePage() {
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
      <div className={styles.newMessagePage}>
        <h1>New Message</h1>
        <p className={styles.subtitle}>
          Send a message to {tenant.name} support at {tenant.supportEmail}
        </p>

        <MessageForm tenantSlug={tenant.slug} userId={session.user.id} supportEmail={tenant.supportEmail} />
      </div>
    </div>
  )
}
