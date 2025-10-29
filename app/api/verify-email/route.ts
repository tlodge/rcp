import { type NextRequest, NextResponse } from "next/server"
import { verifyEmailWithMRI } from "@/lib/mri"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const mriResult = await verifyEmailWithMRI(email)

    if (!mriResult.exists || mriResult.accounts.length === 0) {
      return NextResponse.json({ error: "Email not found in MRI system" }, { status: 404 })
    }

    const cookieStore = await cookies()
    cookieStore.set("pending_mri_accounts", JSON.stringify(mriResult.accounts), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    })

    return NextResponse.json({
      success: true,
      accountCount: mriResult.accounts.length,
    })
  } catch (error) {
    console.error("[v0] Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
