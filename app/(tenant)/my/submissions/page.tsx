import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import Link from "next/link"
import Breadcrumbs from "@/components/Breadcrumbs"
import styles from "./page.module.css"

export default async function SubmissionsPage() {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  const prisma = getPrisma()

  const submissions = await prisma.formSubmission.findMany({
    where: {
      userId: session.user.id,
      tenantSlug: tenant.slug,
    },
    orderBy: { createdAt: "desc" },
  })

  // Get form titles
  const formIds = [...new Set(submissions.map((s) => s.formId))]
  const formTitles: Record<string, string> = {}

  for (const formId of formIds) {
    const form = await prisma.formDefinition.findUnique({
      where: { id: formId },
    })
    if (form) {
      formTitles[formId] = form.title
    }
  }

  return (
    <div className="container">
      <div className={styles.submissionsPage}>
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "My Submissions" }]} />

        <h1>My Submissions</h1>
        <p className={styles.subtitle}>View all your form submissions for {tenant.name}</p>

        {submissions.length === 0 ? (
          <Card>
            <p className={styles.empty}>
              You haven't submitted any forms yet.{" "}
              <Link href="/forms" className={styles.link}>
                Browse forms
              </Link>
            </p>
          </Card>
        ) : (
          <div className={styles.table}>
            <Card>
              <table>
                <thead>
                  <tr>
                    <th>Form</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((submission) => (
                    <tr key={submission.id}>
                      <td>{formTitles[submission.formId] || "Unknown Form"}</td>
                      <td>{new Date(submission.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Link href={`/my/submissions/${submission.id}`} className={styles.viewLink}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
