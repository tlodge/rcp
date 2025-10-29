import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const id = formData.get("id") as string
    const content = formData.get("content") as string
    const isActive = formData.get("isActive") === "on"

    const prisma = getPrisma()
    await prisma.tenantMessage.update({
      where: { id },
      data: { content, isActive },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating tenant message:", error)
    return NextResponse.json({ error: "Failed to update message" }, { status: 500 })
  }
}
