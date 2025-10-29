import { type NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantSlug, userId, subject, body: messageBody } = body

    if (!tenantSlug || !userId || !subject || !messageBody) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prisma = getPrisma()

    // Create message with SENT status and fake Resend response
    const message = await prisma.message.create({
      data: {
        userId,
        tenantSlug,
        subject,
        body: messageBody,
        deliveryStatus: "SENT",
        raw: JSON.stringify({
          id: `msg_${Date.now()}`,
          from: "noreply@example.com",
          to: "support@example.com",
          created_at: new Date().toISOString(),
          // Fake Resend response
          provider: "resend",
          status: "sent",
        }),
      },
    })

    console.log(`[MESSAGE SENT] Message ID: ${message.id}`)
    console.log(`  From User: ${userId}`)
    console.log(`  Tenant: ${tenantSlug}`)
    console.log(`  Subject: ${subject}`)

    return NextResponse.json({
      success: true,
      messageId: message.id,
    })
  } catch (error) {
    console.error("Message send error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
