"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error("[v0] Error:", error)

    // If database not initialized, redirect to setup
    if (error.message?.includes("does not exist") || error.message?.includes("relation")) {
      router.push("/setup")
    }
  }, [error, router])

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p className={styles.subtitle}>
          {error.message?.includes("does not exist")
            ? "Database needs to be initialized. Redirecting to setup..."
            : "An error occurred. Please try again."}
        </p>
        <div className={styles.actions}>
          <button onClick={() => reset()} className={styles.primaryButton}>
            Try again
          </button>
          <button onClick={() => router.push("/")} className={styles.secondaryButton}>
            Go home
          </button>
        </div>
      </div>
    </div>
  )
}
