import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import Link from "next/link"
import styles from "./page.module.css"

export default async function MessagesPage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  const prisma = getPrisma()

  const messages = await prisma.message.findMany({
    where: {
      userId: session.user.id,
      tenantSlug: tenant.slug,
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container">
      <div className={styles.messagesPage}>
        <div className={styles.header}>
          <h1>Messages</h1>
          <Link href="/messages/new" className={styles.newButton}>
            New Message
          </Link>
        </div>

        <p className={styles.subtitle}>Your message history with {tenant.name}</p>

        {messages.length === 0 ? (
          <Card>
            <p className={styles.empty}>
              No messages yet.{" "}
              <Link href="/messages/new" className={styles.link}>
                Send your first message
              </Link>
            </p>
          </Card>
        ) : (
          <div className={styles.messagesList}>
            {messages.map((message) => (
              <Card key={message.id}>
                <div className={styles.message}>
                  <div className={styles.messageHeader}>
                    <h3>{message.subject}</h3>
                    <span className={`${styles.status} ${styles[message.deliveryStatus.toLowerCase()]}`}>
                      {message.deliveryStatus}
                    </span>
                  </div>
                  <p className={styles.messageBody}>{message.body}</p>
                  <p className={styles.messageDate}>{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
