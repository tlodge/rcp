import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const email = formData.get("email") as string
    const name = formData.get("name") as string

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const prisma = getPrisma()
    await prisma.user.update({
      where: { id: user.id },
      data: { email, name: name || user.name },
    })

    // Redirect back to settings
    return NextResponse.redirect(new URL("/settings", request.url))
  } catch (error) {
    console.error("[v0] Error updating email:", error)
    return NextResponse.json({ error: "Failed to update email" }, { status: 500 })
  }
}
