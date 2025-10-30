import Link from "next/link"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default async function TenantMessagesPage() {
  const prisma = getPrisma()
  const messages = await prisma.tenantMessage.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Tenant Messages</h1>
        <Link href="/admin/tenant-messages/new" className={styles.createButton}>
          Create Message
        </Link>
      </div>

      <div className={styles.list}>
        {messages.map((message) => (
          <Card key={message.id}>
            <div className={styles.messageCard}>
              <div className={styles.messageHeader}>
                <h3>{message.tenantSlug}</h3>
                <span className={`${styles.badge} ${message.isActive ? styles.active : styles.inactive}`}>
                  {message.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className={styles.content} dangerouslySetInnerHTML={{ __html: message.content || "" }} />
              <div className={styles.actions}>
                <Link href={`/admin/tenant-messages/${message.id}/edit`} className={styles.editButton}>
                  Edit
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
