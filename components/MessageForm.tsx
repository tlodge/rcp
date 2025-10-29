"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Card from "./Card"
import styles from "./MessageForm.module.css"

interface MessageFormProps {
  tenantSlug: string
  userId: string
  supportEmail: string
}

export default function MessageForm({ tenantSlug, userId, supportEmail }: MessageFormProps) {
  const router = useRouter()
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const newErrors: { subject?: string; body?: string } = {}

    if (!subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!body.trim()) {
      newErrors.body = "Message body is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug,
          userId,
          subject,
          body,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      router.push("/messages")
    } catch (error) {
      console.error("Message send error:", error)
      alert("Failed to send message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="to" className={styles.label}>
            To
          </label>
          <input id="to" type="text" value={supportEmail} disabled className={`${styles.input} ${styles.disabled}`} />
        </div>

        <div className={styles.field}>
          <label htmlFor="subject" className={styles.label}>
            Subject<span className={styles.required}>*</span>
          </label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value)
              if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }))
            }}
            className={`${styles.input} ${errors.subject ? styles.error : ""}`}
            placeholder="Enter subject"
          />
          {errors.subject && <span className={styles.errorText}>{errors.subject}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="body" className={styles.label}>
            Message<span className={styles.required}>*</span>
          </label>
          <textarea
            id="body"
            value={body}
            onChange={(e) => {
              setBody(e.target.value)
              if (errors.body) setErrors((prev) => ({ ...prev, body: undefined }))
            }}
            className={`${styles.input} ${styles.textarea} ${errors.body ? styles.error : ""}`}
            placeholder="Enter your message"
            rows={8}
          />
          {errors.body && <span className={styles.errorText}>{errors.body}</span>}
        </div>

        <div className={styles.info}>
          <p>
            💡 This message will be sent to {supportEmail}. You'll receive a response via email. Staff replies are not
            shown in this portal (MVP limitation).
          </p>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
            Cancel
          </button>
          <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </Card>
  )
}
