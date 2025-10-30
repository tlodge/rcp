import type React from "react"
import type { Metadata } from "next"
import "../styles/globals.css"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "RCP Portal",
  description: "Multi-tenant property management portal",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
