import { type NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    // Verify signature
    const signature = request.headers.get("X-Blink-Signature")
    const webhookSecret = process.env.BLINK_WEBHOOK_SECRET || "test-secret"

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    const body = await request.json()
    const { externalRef, status, timestamp } = body

    // Verify signature (simple implementation for demo)
    const expectedSignature = await createSignature(JSON.stringify(body), webhookSecret)

    if (signature !== expectedSignature) {
      console.error("[v0] Invalid webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Update transaction status
    const prisma = getPrisma()
    const transaction = await prisma.transaction.findFirst({
      where: { externalRef },
    })

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: {
        status: status as "CONFIRMED" | "FAILED",
        raw: JSON.stringify(body),
      },
    })

    // If confirmed, update balance snapshot
    if (status === "CONFIRMED") {
      const latestBalance = await prisma.balanceSnapshot.findFirst({
        where: {
          userId: transaction.userId,
          tenantSlug: transaction.tenantSlug,
          horizonAccountNumber: transaction.horizonAccountNumber,
        },
        orderBy: { takenAt: "desc" },
      })

      const currentBalance = latestBalance?.amountPence || 0
      const newBalance = currentBalance - transaction.amountPence

      await prisma.balanceSnapshot.create({
        data: {
          userId: transaction.userId,
          tenantSlug: transaction.tenantSlug,
          horizonAccountNumber: transaction.horizonAccountNumber,
          amountPence: newBalance,
          takenAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Simple signature creation matching client-side
async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + secret)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}
