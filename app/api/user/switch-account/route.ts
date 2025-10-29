import { type NextRequest, NextResponse } from "next/server"
import { getSession, setActiveAccount } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { accountNumber, tenantSlug, propertyAddress } = await request.json()

    if (!accountNumber || !tenantSlug) {
      return NextResponse.json({ error: "Account number and tenant slug are required" }, { status: 400 })
    }

    await setActiveAccount({
      accountNumber,
      tenantSlug,
      propertyAddress: propertyAddress || "",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error switching account:", error)
    return NextResponse.json({ error: "Failed to switch account" }, { status: 500 })
  }
}
