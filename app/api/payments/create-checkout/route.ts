import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { accountNumber, tenantSlug, amountPence } = body

    // Validate input
    if (!accountNumber || !tenantSlug || !amountPence) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate amount (£25 - £2,500)
    if (amountPence < 2500 || amountPence > 250000) {
      return NextResponse.json({ error: "Amount must be between £25 and £2,500" }, { status: 400 })
    }

    // Create transaction with PENDING status
    const prisma = getPrisma()
    const externalRef = `BLINK-${Date.now()}-${Math.random().toString(36).substring(7)}`

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        tenantSlug,
        horizonAccountNumber: accountNumber,
        externalRef,
        source: "BLINK",
        direction: "CREDIT",
        amountPence,
        status: "PENDING",
        occurredAt: new Date(),
      },
    })

    // Generate hosted checkout URL
    const hostedUrl = `/payments/hosted?ref=${externalRef}`

    return NextResponse.json({
      url: hostedUrl,
      transactionId: transaction.id,
      externalRef,
    })
  } catch (error) {
    console.error("[v0] Create checkout error:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}
