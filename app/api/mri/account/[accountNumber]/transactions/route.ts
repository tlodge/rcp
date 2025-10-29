import { type NextRequest, NextResponse } from "next/server"
import { getTransactionsSince } from "@/lib/mri"

export async function GET(request: NextRequest, { params }: { params: { accountNumber: string } }) {
  try {
    const { accountNumber } = params
    const searchParams = request.nextUrl.searchParams
    const since = searchParams.get("since") || undefined

    if (!accountNumber) {
      return NextResponse.json({ error: "Account number is required" }, { status: 400 })
    }

    const transactions = await getTransactionsSince(accountNumber, since)

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("[v0] Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
