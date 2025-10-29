"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./PaymentForm.module.css"

interface PaymentFormProps {
  accountNumber: string
  tenantSlug: string
  bankDetails: string
}

const MIN_AMOUNT = 25
const MAX_AMOUNT = 2500

export default function PaymentForm({ accountNumber, tenantSlug, bankDetails }: PaymentFormProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const amountNum = Number.parseFloat(amount)
  const isValid = !isNaN(amountNum) && amountNum >= MIN_AMOUNT && amountNum <= MAX_AMOUNT
  const isOutOfRange = !isNaN(amountNum) && (amountNum < MIN_AMOUNT || amountNum > MAX_AMOUNT)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!isValid) {
      setError("Please enter a valid amount between £25 and £2,500")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/payments/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber,
          tenantSlug,
          amountPence: Math.round(amountNum * 100),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to hosted checkout
      router.push(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>Enter Payment Amount</h3>

      <div className={styles.inputGroup}>
        <label htmlFor="amount">Amount (£)</label>
        <input
          id="amount"
          type="number"
          step="0.01"
          min={MIN_AMOUNT}
          max={MAX_AMOUNT}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className={styles.input}
          disabled={loading}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {isOutOfRange && (
        <div className={styles.bankDetails}>
          <h4>Payment Outside Limits</h4>
          <p>
            For payments outside the £{MIN_AMOUNT} - £{MAX_AMOUNT} range, please use manual bank transfer:
          </p>
          <div className={styles.bankInfo}>
            <pre>{bankDetails}</pre>
          </div>
          <p className={styles.note}>Please include your account number ({accountNumber}) as the payment reference.</p>
        </div>
      )}

      <button type="submit" className={styles.button} disabled={!isValid || loading}>
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </form>
  )
}
