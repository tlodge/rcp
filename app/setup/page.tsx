"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./page.module.css"

export default function SetupPage() {
  const [status, setStatus] = useState<"checking" | "needed" | "running" | "complete" | "error">("checking")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    checkSetup()
  }, [])

  async function checkSetup() {
    try {
      const res = await fetch("/api/setup")
      const data = await res.json()

      if (data.initialized) {
        setStatus("complete")
        setTimeout(() => router.push("/"), 1500)
      } else {
        setStatus("needed")
      }
    } catch (err: any) {
      setStatus("needed")
    }
  }

  async function runSetup() {
    setStatus("running")
    setError("")

    try {
      const res = await fetch("/api/setup", { method: "POST" })
      const data = await res.json()

      if (data.success) {
        setStatus("complete")
        setTimeout(() => router.push("/"), 1500)
      } else {
        setStatus("error")
        setError(data.error || "Setup failed")
      }
    } catch (err: any) {
      setStatus("error")
      setError(err.message || "Setup failed")
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Database Setup</h1>

        {status === "checking" && (
          <div className={styles.content}>
            <div className={styles.spinner}></div>
            <p>Checking database status...</p>
          </div>
        )}

        {status === "needed" && (
          <div className={styles.content}>
            <p className={styles.description}>
              Your database needs to be initialized with tables and seed data. This is a one-time setup that will create
              all necessary tables and add demo data.
            </p>
            <button onClick={runSetup} className={styles.button}>
              Initialize Database
            </button>
          </div>
        )}

        {status === "running" && (
          <div className={styles.content}>
            <div className={styles.spinner}></div>
            <p>Setting up database...</p>
            <p className={styles.hint}>This may take a few moments</p>
          </div>
        )}

        {status === "complete" && (
          <div className={styles.content}>
            <div className={styles.success}>✓</div>
            <p>Database initialized successfully!</p>
            <p className={styles.hint}>Redirecting...</p>
          </div>
        )}

        {status === "error" && (
          <div className={styles.content}>
            <div className={styles.error}>✗</div>
            <p>Setup failed: {error}</p>
            <button onClick={runSetup} className={styles.button}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
