import { type NextRequest, NextResponse } from "next/server"
import { createSession, setActiveAccount } from "@/lib/auth"
import { getPrisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import type { MRIAccount } from "@/lib/mri"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const prisma = getPrisma()

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    })

    if (!user) {
      const role = email === "admin@example.com" ? "ADMIN" : "USER"

      // Create new user in demo mode
      user = await prisma.user.create({
        data: {
          email,
          name: email.split("@")[0],
          role,
        },
        include: { accounts: true },
      })
    }

    const cookieStore = await cookies()
    const pendingAccountsCookie = cookieStore.get("pending_mri_accounts")

    if (pendingAccountsCookie?.value) {
      try {
        const mriAccounts: MRIAccount[] = JSON.parse(pendingAccountsCookie.value)

        for (const account of mriAccounts) {
          const existingLink = await prisma.userAccountLink.findFirst({
            where: {
              userId: user.id,
              horizonAccountNumber: account.accountNumber,
            },
          })

          if (!existingLink) {
            await prisma.userAccountLink.create({
              data: {
                userId: user.id,
                tenantSlug: account.tenantSlug,
                horizonAccountNumber: account.accountNumber,
                propertyAddress: account.propertyAddress,
              },
            })
          }
        }

        if (mriAccounts.length > 0) {
          await setActiveAccount({
            accountNumber: mriAccounts[0].accountNumber,
            tenantSlug: mriAccounts[0].tenantSlug,
            propertyAddress: mriAccounts[0].propertyAddress,
          })
        }

        // Clear the pending accounts cookie
        cookieStore.delete("pending_mri_accounts")
      } catch (error) {
        console.error("[v0] Error linking MRI accounts:", error)
      }
    } else if (user.accounts.length > 0) {
      const firstAccount = user.accounts[0]
      await setActiveAccount({
        accountNumber: firstAccount.horizonAccountNumber,
        tenantSlug: firstAccount.tenantSlug,
        propertyAddress: firstAccount.propertyAddress || "",
      })
    }

    // Create session
    await createSession(user.id, user.email, user.name, user.role)

    return NextResponse.json({ success: true, user: { email: user.email, name: user.name } })
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 })
  }
}
