import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const prisma = getPrisma()

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { accounts: true },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ accounts: user.accounts })
  } catch (error) {
    console.error("[v0] Error fetching user accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 })
  }
}
