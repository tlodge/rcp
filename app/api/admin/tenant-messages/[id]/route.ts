import { type NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check admin access
    const user = await getCurrentUser()
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const prisma = getPrisma()
    const message = await prisma.tenantMessage.findUnique({
      where: { id: params.id },
    })

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 })
    }

    return NextResponse.json(message)
  } catch (error) {
    console.error("[v0] Error fetching tenant message:", error)
    return NextResponse.json({ error: "Failed to fetch message" }, { status: 500 })
  }
}
