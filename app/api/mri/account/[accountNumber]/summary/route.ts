import { type NextRequest, NextResponse } from "next/server"
import { getAccountSummary } from "@/lib/mri"

export async function GET(request: NextRequest, { params }: { params: { accountNumber: string } }) {
  try {
    const { accountNumber } = params

    if (!accountNumber) {
      return NextResponse.json({ error: "Account number is required" }, { status: 400 })
    }

    const summary = await getAccountSummary(accountNumber)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("[v0] Error fetching account summary:", error)
    return NextResponse.json({ error: "Failed to fetch account summary" }, { status: 500 })
  }
}
