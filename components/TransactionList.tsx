"use client"

import { useState } from "react"
import Card from "./Card"
import styles from "./TransactionList.module.css"

interface Transaction {
  id: string
  externalRef: string | null
  source: string
  direction: string
  amountPence: number
  status: string
  occurredAt: Date
  createdAt: Date
}

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [exporting, setExporting] = useState(false)

  const handleExportCSV = async () => {
    setExporting(true)

    try {
      // Create CSV content
      const headers = ["Date", "Reference", "Source", "Type", "Amount", "Status"]
      const rows = transactions.map((tx) => [
        new Date(tx.occurredAt).toLocaleDateString(),
        tx.externalRef || tx.id,
        tx.source,
        tx.direction,
        `£${(tx.amountPence / 100).toFixed(2)}`,
        tx.status,
      ])

      const csv = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

      // Download CSV
      const blob = new Blob([csv], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("[v0] Export error:", error)
      alert("Failed to export CSV")
    } finally {
      setExporting(false)
    }
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <p className={styles.empty}>No transactions found matching your filters.</p>
      </Card>
    )
  }

  return (
    <div>
      <div className={styles.actions}>
        <button onClick={handleExportCSV} disabled={exporting} className={styles.exportButton}>
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className={styles.list}>
        {transactions.map((tx) => (
          <Card key={tx.id}>
            <div className={styles.transaction}>
              <div className={styles.main}>
                <div className={styles.info}>
                  <span className={styles.date}>{new Date(tx.occurredAt).toLocaleDateString()}</span>
                  <span className={styles.ref}>{tx.externalRef || tx.id}</span>
                </div>
                <div className={styles.details}>
                  <span className={styles.source}>{tx.source}</span>
                  <span className={styles.direction}>{tx.direction}</span>
                </div>
              </div>
              <div className={styles.right}>
                <span className={`${styles.amount} ${tx.direction === "CREDIT" ? styles.credit : styles.debit}`}>
                  {tx.direction === "CREDIT" ? "-" : "+"}£{(tx.amountPence / 100).toFixed(2)}
                </span>
                <span className={`${styles.status} ${styles[tx.status.toLowerCase()]}`}>{tx.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
