import { getCurrentTenant, getCurrentTenantSlug } from "@/lib/tenant"
import { getSession, getActiveAccount } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import Link from "next/link"
import Breadcrumbs from "@/components/Breadcrumbs"
import styles from "./page.module.css"

export default async function AccountBalancePage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()
  const tenantSlug = await getCurrentTenantSlug()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant || !tenantSlug) {
    redirect("/")
  }

  const prisma = getPrisma()

  const activeAccount = await getActiveAccount()
  let accountNumber = activeAccount?.accountNumber

  if (!accountNumber) {
    // Try to find the user's first account for this tenant
    const userAccount = await prisma.userAccountLink.findFirst({
      where: {
        userId: session.user.id,
        tenantSlug,
      },
    })
    accountNumber = userAccount?.horizonAccountNumber
  }

  let balancePounds = "0.00"
  let transactions: any[] = []
  let latestBalance: any = null
  let isDemo = false

  if (!accountNumber) {
    // Use demo data for presentation
    isDemo = true
    accountNumber = "DEMO-12345"
    balancePounds = "1234.56"

    // Demo transactions
    transactions = [
      {
        id: "demo-1",
        occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        direction: "CREDIT",
        amountPence: 50000,
        status: "COMPLETED",
      },
      {
        id: "demo-2",
        occurredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        direction: "DEBIT",
        amountPence: 125000,
        status: "COMPLETED",
      },
      {
        id: "demo-3",
        occurredAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        direction: "CREDIT",
        amountPence: 50000,
        status: "COMPLETED",
      },
      {
        id: "demo-4",
        occurredAt: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000),
        direction: "DEBIT",
        amountPence: 125000,
        status: "COMPLETED",
      },
    ]

    latestBalance = {
      takenAt: new Date(),
    }
  } else {
    // Get real data
    latestBalance = await prisma.balanceSnapshot.findFirst({
      where: {
        userId: session.user.id,
        tenantSlug,
        horizonAccountNumber: accountNumber,
      },
      orderBy: { takenAt: "desc" },
    })

    transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        tenantSlug,
        horizonAccountNumber: accountNumber,
      },
      orderBy: { occurredAt: "desc" },
      take: 10,
    })

    const balancePence = latestBalance?.amountPence || 0
    balancePounds = (balancePence / 100).toFixed(2)
  }

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Account Balance" }]} />

      <div className={styles.accountBalance}>
        <div className={styles.header}>
          <div>
            <h1>Account Balance</h1>
            <p className={styles.accountNumber}>
              Account: {accountNumber}
              {isDemo && <span className={styles.demoBadge}>Demo Data</span>}
            </p>
          </div>
          <Link href="/payments" className={styles.payButton}>
            Make a Payment
          </Link>
        </div>

        <div className={styles.grid}>
          <Card>
            <h3>Current Balance</h3>
            <p className={styles.balance}>£{balancePounds}</p>
            {latestBalance && (
              <p className={styles.muted}>As of {new Date(latestBalance.takenAt).toLocaleDateString()}</p>
            )}
          </Card>

          <Card>
            <h3>Account Details</h3>
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span className={styles.label}>Account Number:</span>
                <span className={styles.value}>{accountNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.label}>Tenant:</span>
                <span className={styles.value}>{tenant.name}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3>Recent Transactions</h3>
          {transactions.length > 0 ? (
            <div className={styles.transactions}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{new Date(tx.occurredAt).toLocaleDateString()}</td>
                      <td className={styles.type}>{tx.direction === "CREDIT" ? "Payment" : "Charge"}</td>
                      <td className={tx.direction === "CREDIT" ? styles.credit : styles.debit}>
                        {tx.direction === "CREDIT" ? "-" : "+"}£{(tx.amountPence / 100).toFixed(2)}
                      </td>
                      <td>
                        <span className={`${styles.status} ${styles[tx.status.toLowerCase()]}`}>{tx.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.muted}>No transactions yet</p>
          )}
        </Card>
      </div>
    </div>
  )
}
