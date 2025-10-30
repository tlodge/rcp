import Link from "next/link"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import styles from "./page.module.css"

export const dynamic = "force-dynamic"

export default async function AdminFormsPage() {
  const prisma = getPrisma()
  const forms = await prisma.formDefinition.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Form Definitions</h1>
      </div>

      <div className={styles.list}>
        {forms.map((form) => (
          <Card key={form.id}>
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <div>
                  <h3>{form.title}</h3>
                  <p className={styles.tenant}>{form.tenantSlug || "Group Level"}</p>
                </div>
                <span className={`${styles.badge} ${form.isActive ? styles.active : styles.inactive}`}>
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              {form.description && <p className={styles.description}>{form.description}</p>}
              <div className={styles.actions}>
                <Link href={`/admin/forms/${form.id}/edit`} className={styles.editButton}>
                  Edit
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
