import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailWithMRI } from "@/lib/mri"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 })
    }

    const result = await verifyEmailWithMRI(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error verifying email with MRI:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
