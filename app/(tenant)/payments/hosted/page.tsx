import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import HostedCheckoutForm from "@/components/HostedCheckoutForm"
import styles from "./page.module.css"

interface PageProps {
  searchParams: Promise<{ ref?: string }>
}

export default async function HostedCheckoutPage({ searchParams }: PageProps) {
  const params = await searchParams
  const ref = params.ref

  if (!ref) {
    redirect("/payments")
  }

  // Get transaction details
  const prisma = getPrisma()
  const transaction = await prisma.transaction.findFirst({
    where: { externalRef: ref },
  })

  if (!transaction) {
    redirect("/payments")
  }

  const amountPounds = (transaction.amountPence / 100).toFixed(2)

  return (
    <div className="container">
      <div className={styles.hosted}>
        <Card>
          <div className={styles.header}>
            <h1>Blink Payment Gateway</h1>
            <p className={styles.subtitle}>Secure Checkout</p>
          </div>

          <div className={styles.details}>
            <div className={styles.row}>
              <span className={styles.label}>Amount:</span>
              <span className={styles.value}>£{amountPounds}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Account:</span>
              <span className={styles.value}>{transaction.horizonAccountNumber}</span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Reference:</span>
              <span className={styles.value}>{ref}</span>
            </div>
          </div>

          <div className={styles.info}>
            <p>
              This is a simulated payment gateway for testing purposes. In production, this would be hosted by Blink.
            </p>
          </div>

          <HostedCheckoutForm externalRef={ref} tenantSlug={transaction.tenantSlug} />
        </Card>
      </div>
    </div>
  )
}
