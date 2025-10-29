import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST() {
  try {
    await destroySession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Sign out error:", error)
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
  }
}
