"use client"

import { useRouter, useSearchParams } from "next/navigation"
import styles from "./TransactionFilters.module.css"

interface TransactionFiltersProps {
  currentSource?: string
  currentStatus?: string
  currentFrom?: string
  currentTo?: string
}

export default function TransactionFilters({
  currentSource = "ALL",
  currentStatus = "ALL",
  currentFrom = "",
  currentTo = "",
}: TransactionFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/transactions?${params.toString()}`)
  }

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label htmlFor="source">Source</label>
        <select
          id="source"
          value={currentSource}
          onChange={(e) => updateFilter("source", e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Sources</option>
          <option value="BLINK">Blink</option>
          <option value="MRI">MRI</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="status">Status</label>
        <select
          id="status"
          value={currentStatus}
          onChange={(e) => updateFilter("status", e.target.value)}
          className={styles.select}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="from">From Date</label>
        <input
          id="from"
          type="date"
          value={currentFrom}
          onChange={(e) => updateFilter("from", e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="to">To Date</label>
        <input
          id="to"
          type="date"
          value={currentTo}
          onChange={(e) => updateFilter("to", e.target.value)}
          className={styles.input}
        />
      </div>
    </div>
  )
}
