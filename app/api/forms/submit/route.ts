import { type NextRequest, NextResponse } from "next/server"
import { getPrisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, tenantSlug, userId, payload } = body

    if (!formId || !tenantSlug || !userId || !payload) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const prisma = getPrisma()

    // Verify form exists and is active
    const form = await prisma.formDefinition.findFirst({
      where: {
        id: formId,
        isActive: true,
        OR: [{ tenantSlug }, { tenantSlug: null }],
      },
    })

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 })
    }

    // Create submission
    const submission = await prisma.formSubmission.create({
      data: {
        userId,
        tenantSlug,
        formId,
        payload: JSON.stringify(payload),
        filesPlaceholder: null,
      },
    })

    // TODO: Notify system admin of form submission
    console.log(`[ADMIN NOTIFICATION] New form submission: ${submission.id}`)
    console.log(`  Form: ${form.title}`)
    console.log(`  User: ${userId}`)
    console.log(`  Tenant: ${tenantSlug}`)
    console.log(`  Payload:`, payload)

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
