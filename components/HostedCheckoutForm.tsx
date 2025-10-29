"use client"

import { useState } from "react"
import { simulatePayment } from "@/app/actions/simulate-payment"
import styles from "./HostedCheckoutForm.module.css"

interface HostedCheckoutFormProps {
  externalRef: string
  tenantSlug: string
}

export default function HostedCheckoutForm({ externalRef, tenantSlug }: HostedCheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePayment = async (success: boolean) => {
    setLoading(true)
    setError("")

    try {
      await simulatePayment(externalRef, success)
      // Server action will redirect, so we won't reach here
    } catch (err) {
      console.error("[v0] Payment error:", err)
      setError("An error occurred processing the payment. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.actions}>
        <button onClick={() => handlePayment(true)} disabled={loading} className={`${styles.button} ${styles.success}`}>
          {loading ? "Processing..." : "Simulate Success"}
        </button>
        <button onClick={() => handlePayment(false)} disabled={loading} className={`${styles.button} ${styles.fail}`}>
          {loading ? "Processing..." : "Simulate Failure"}
        </button>
      </div>
    </div>
  )
}
