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
    const tenantSlug = formData.get("tenantSlug") as string
    const isActive = formData.get("isActive") === "on"

    const prisma = getPrisma()
    await prisma.formDefinition.update({
      where: { id },
      data: {
        tenantSlug: tenantSlug || null,
        isActive,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating form:", error)
    return NextResponse.json({ error: "Failed to update form" }, { status: 500 })
  }
}
