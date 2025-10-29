"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Card from "./Card"
import styles from "./DynamicForm.module.css"

type FieldType = "text" | "textarea" | "number" | "date" | "select"

interface Field {
  key: string
  label: string
  type: FieldType
  required?: boolean
  options?: string[]
}

interface DynamicFormProps {
  formId: string
  fields: Field[]
  tenantSlug: string
  userId: string
}

export default function DynamicForm({ formId, fields, tenantSlug, userId }: DynamicFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      if (field.required && !formData[field.key]?.trim()) {
        newErrors[field.key] = `${field.label} is required`
      }
    })

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
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formId,
          tenantSlug,
          userId,
          payload: formData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit form")
      }

      const result = await response.json()
      router.push(`/my/submissions/${result.submissionId}`)
    } catch (error) {
      console.error("Form submission error:", error)
      alert("Failed to submit form. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className={styles.form}>
        {fields.map((field) => (
          <div key={field.key} className={styles.field}>
            <label htmlFor={field.key} className={styles.label}>
              {field.label}
              {field.required && <span className={styles.required}>*</span>}
            </label>

            {field.type === "textarea" ? (
              <textarea
                id={field.key}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`${styles.input} ${styles.textarea} ${errors[field.key] ? styles.error : ""}`}
                rows={4}
              />
            ) : field.type === "select" ? (
              <select
                id={field.key}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`${styles.input} ${errors[field.key] ? styles.error : ""}`}
              >
                <option value="">Select an option</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={field.key}
                type={field.type}
                value={formData[field.key] || ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className={`${styles.input} ${errors[field.key] ? styles.error : ""}`}
              />
            )}

            {errors[field.key] && <span className={styles.errorText}>{errors[field.key]}</span>}
          </div>
        ))}

        <div className={styles.fileUploadStub}>
          <p className={styles.stubLabel}>📎 File Attachments</p>
          <p className={styles.stubText}>
            File upload functionality coming soon. TODO: Integrate with S3 for file storage.
          </p>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Form"}
        </button>
      </form>
    </Card>
  )
}
