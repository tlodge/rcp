"use server"

import { redirect } from "next/navigation"

export async function simulatePayment(externalRef: string, success: boolean) {
  try {
    // Get webhook secret from server environment
    const webhookSecret = process.env.BLINK_WEBHOOK_SECRET || "test-secret"

    // Create webhook payload (simulating what Blink would send)
    const payload = {
      externalRef,
      status: success ? "CONFIRMED" : "FAILED",
      timestamp: new Date().toISOString(),
    }

    // Create signature (simulating Blink's signature)
    const signature = await createSignature(JSON.stringify(payload), webhookSecret)

    // Get the base URL for the webhook call
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

    // Call our webhook endpoint (simulating Blink calling us)
    const response = await fetch(`${baseUrl}/api/webhooks/blink`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Blink-Signature": signature,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error("Webhook failed")
    }

    // Redirect to transactions page with status
    redirect(`/transactions?status=${success ? "success" : "failed"}`)
  } catch (error) {
    console.error("[v0] Payment simulation error:", error)
    throw error
  }
}

// Server-side signature creation
async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + secret)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
