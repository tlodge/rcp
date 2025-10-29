import { getCurrentTenant, getCurrentTenantSlug } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import PaymentForm from "@/components/PaymentForm"
import styles from "./page.module.css"

export default async function PaymentsPage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()
  const tenantSlug = await getCurrentTenantSlug()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant || !tenantSlug) {
    redirect("/")
  }

  // Get active account from session
  const activeAccount = session.user.activeAccount

  if (!activeAccount) {
    return (
      <div className="container">
        <Card>
          <h1>Make a Payment</h1>
          <p>Please select an account from the account switcher to make a payment.</p>
        </Card>
      </div>
    )
  }

  // Get latest balance snapshot
  const prisma = getPrisma()
  const latestBalance = await prisma.balanceSnapshot.findFirst({
    where: {
      userId: session.user.id,
      tenantSlug,
      horizonAccountNumber: activeAccount,
    },
    orderBy: { takenAt: "desc" },
  })

  const balancePence = latestBalance?.amountPence || 0
  const balancePounds = (balancePence / 100).toFixed(2)

  return (
    <div className="container">
      <div className={styles.payments}>
        <h1>Make a Payment</h1>
        <p className={styles.subtitle}>Account: {activeAccount}</p>

        <div className={styles.grid}>
          <Card>
            <h3>Outstanding Balance</h3>
            <p className={styles.balance}>£{balancePounds}</p>
            {latestBalance && (
              <p className={styles.muted}>As of {new Date(latestBalance.takenAt).toLocaleDateString()}</p>
            )}
          </Card>

          <Card>
            <h3>Payment Limits</h3>
            <p className={styles.limits}>
              Minimum: <strong>£25.00</strong>
            </p>
            <p className={styles.limits}>
              Maximum: <strong>£2,500.00</strong>
            </p>
          </Card>
        </div>

        <Card>
          <PaymentForm accountNumber={activeAccount} tenantSlug={tenantSlug} bankDetails={tenant.bankDetails} />
        </Card>
      </div>
    </div>
  )
}
