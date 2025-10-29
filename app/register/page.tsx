"use client"

import type React from "react"
import { useState } from "react"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to verify email")
        return
      }

      const signInResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const signInData = await signInResponse.json()

      if (!signInResponse.ok) {
        setError(signInData.error || "Failed to sign in. Please try again.")
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <Card className={styles.card}>
          <h1>Register</h1>
          <p className={styles.description}>
            Enter your email address to create an account. (Demo mode - MRI verification simulated)
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="email" className={styles.label}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <button type="submit" disabled={isLoading} className={styles.button}>
              {isLoading ? "Creating account..." : "Continue"}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{" "}
            <a href="/auth/signin" className={styles.link}>
              Sign in here
            </a>
          </p>
        </Card>
      </div>
    </div>
  )
}
