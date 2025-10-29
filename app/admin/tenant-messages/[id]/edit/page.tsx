"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default function EditTenantMessagePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [message, setMessage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/tenant-messages/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setMessage(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error loading message:", error)
        router.push("/admin/tenant-messages")
      })
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/admin/tenant-messages/update", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        router.push("/admin/tenant-messages")
      } else {
        alert("Failed to update message")
        setSaving(false)
      }
    } catch (error) {
      console.error("[v0] Error updating message:", error)
      alert("Failed to update message")
      setSaving(false)
    }
  }

  if (loading) {
    return <div className={styles.page}>Loading...</div>
  }

  if (!message) {
    return <div className={styles.page}>Message not found</div>
  }

  return (
    <div className={styles.page}>
      <h1>Edit Tenant Message</h1>

      <Card>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input type="hidden" name="id" value={message.id} />

          <div className={styles.field}>
            <label htmlFor="tenantSlug">Tenant</label>
            <input type="text" id="tenantSlug" value={message.tenantSlug} disabled />
          </div>

          <div className={styles.field}>
            <label htmlFor="content">Message Content</label>
            <textarea id="content" name="content" rows={4} defaultValue={message.content} required />
          </div>

          <div className={styles.field}>
            <label className={styles.checkbox}>
              <input type="checkbox" name="isActive" defaultChecked={message.isActive} />
              <span>Active</span>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.push("/admin/tenant-messages")} className={styles.secondary}>
              Cancel
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
