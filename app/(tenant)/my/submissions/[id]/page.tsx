import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import Card from "@/components/Card"
import Breadcrumbs from "@/components/Breadcrumbs"
import styles from "./page.module.css"

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  const prisma = getPrisma()

  const submission = await prisma.formSubmission.findFirst({
    where: {
      id: params.id,
      userId: session.user.id,
      tenantSlug: tenant.slug,
    },
  })

  if (!submission) {
    notFound()
  }

  const form = await prisma.formDefinition.findUnique({
    where: { id: submission.formId },
  })

  const payload = typeof submission.payload === "string" ? JSON.parse(submission.payload) : submission.payload

  return (
    <div className="container">
      <div className={styles.detailPage}>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "My Submissions", href: "/my/submissions" },
            { label: `Submission ${submission.id.substring(0, 8)}` },
          ]}
        />

        <Card>
          <div className={styles.receipt}>
            <h1>Submission Receipt</h1>

            <div className={styles.info}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Submission ID:</span>
                <span className={styles.value}>{submission.id}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Form:</span>
                <span className={styles.value}>{form?.title || "Unknown"}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Submitted:</span>
                <span className={styles.value}>{new Date(submission.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.divider} />

            <h2>Submitted Data</h2>
            <pre className={styles.payload}>{JSON.stringify(payload, null, 2)}</pre>

            {submission.filesPlaceholder && (
              <>
                <h2>Attachments</h2>
                <p className={styles.muted}>File attachments will be displayed here once S3 integration is complete.</p>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
