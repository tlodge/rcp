"use client"

import type React from "react"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Failed to sign in. Please try again.")
      } else {
        window.location.href = callbackUrl
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
          <h1>Sign In</h1>
          <p className={styles.description}>
            Enter your email address to sign in. (Demo mode - no email verification required)
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
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account?{" "}
            <a href="/register" className={styles.link}>
              Register here
            </a>
          </p>
        </Card>
      </div>
    </div>
  )
}
