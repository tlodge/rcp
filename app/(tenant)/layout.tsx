import type React from "react"
import { getCurrentTenant } from "@/lib/tenant"
import { redirect } from "next/navigation"
import Header from "@/components/Header"

export const dynamic = "force-dynamic"

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const tenant = await getCurrentTenant()

  // If no tenant, redirect to apex domain
  if (!tenant) {
    redirect("/")
  }

  return (
    <>
      <Header tenant={tenant} />
      <main>{children}</main>
    </>
  )
}
