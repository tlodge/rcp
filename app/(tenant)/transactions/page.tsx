import { getCurrentTenant, getCurrentTenantSlug } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import TransactionList from "@/components/TransactionList"
import TransactionFilters from "@/components/TransactionFilters"
import styles from "./page.module.css"

interface PageProps {
  searchParams: Promise<{
    source?: string
    status?: string
    from?: string
    to?: string
  }>
}

export default async function TransactionsPage({ searchParams }: PageProps) {
  const session = await getSession()
  const tenant = await getCurrentTenant()
  const tenantSlug = await getCurrentTenantSlug()
  const params = await searchParams

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant || !tenantSlug) {
    redirect("/")
  }

  const activeAccount = session.user.activeAccount

  if (!activeAccount) {
    return (
      <div className="container">
        <Card>
          <h1>Transaction History</h1>
          <p>Please select an account from the account switcher to view transactions.</p>
        </Card>
      </div>
    )
  }

  // Build query filters
  const where: any = {
    userId: session.user.id,
    tenantSlug,
    horizonAccountNumber: activeAccount,
  }

  if (params.source && params.source !== "ALL") {
    where.source = params.source
  }

  if (params.status && params.status !== "ALL") {
    where.status = params.status
  }

  if (params.from || params.to) {
    where.occurredAt = {}
    if (params.from) {
      where.occurredAt.gte = new Date(params.from)
    }
    if (params.to) {
      where.occurredAt.lte = new Date(params.to)
    }
  }

  // Fetch transactions
  const prisma = getPrisma()
  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { occurredAt: "desc" },
  })

  return (
    <div className="container">
      <div className={styles.transactions}>
        <div className={styles.header}>
          <div>
            <h1>Transaction History</h1>
            <p className={styles.subtitle}>Account: {activeAccount}</p>
          </div>
        </div>

        <Card>
          <div className={styles.info}>
            <p>
              <strong>Transaction Status:</strong> Transactions start as <span className={styles.pending}>Pending</span>{" "}
              and move to <span className={styles.confirmed}>Confirmed</span> after reconciliation with your account.
              Failed transactions are marked as <span className={styles.failed}>Failed</span>.
            </p>
          </div>
        </Card>

        <TransactionFilters
          currentSource={params.source}
          currentStatus={params.status}
          currentFrom={params.from}
          currentTo={params.to}
        />

        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}
