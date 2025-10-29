"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import styles from "./Header.module.css"

export default function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })

      if (response.ok) {
        // Redirect to homepage after successful signout
        router.push("/")
        router.refresh()
      } else {
        console.error("[v0] Sign out failed")
        alert("Failed to sign out. Please try again.")
      }
    } catch (error) {
      console.error("[v0] Sign out error:", error)
      alert("Failed to sign out. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button type="button" onClick={handleSignOut} disabled={isLoading} className={styles.button}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </button>
  )
}
