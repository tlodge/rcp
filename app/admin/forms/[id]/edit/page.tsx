import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import Card from "@/components/Card"
import styles from "./page.module.css"

export default async function EditFormPage({ params }: { params: { id: string } }) {
  const prisma = getPrisma()
  const form = await prisma.formDefinition.findUnique({
    where: { id: params.id },
  })

  if (!form) {
    redirect("/admin/forms")
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className={styles.page}>
      <h1>Edit Form Definition</h1>

      <Card>
        <form action="/api/admin/forms/update" method="POST" className={styles.form}>
          <input type="hidden" name="id" value={form.id} />

          <div className={styles.field}>
            <label htmlFor="title">Form Title</label>
            <input type="text" id="title" name="title" defaultValue={form.title} disabled />
          </div>

          <div className={styles.field}>
            <label htmlFor="tenantSlug">Tenant</label>
            <select id="tenantSlug" name="tenantSlug" defaultValue={form.tenantSlug || ""}>
              <option value="">Group Level (All Tenants)</option>
              {tenants.map((tenant) => (
                <option key={tenant.slug} value={tenant.slug}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.checkbox}>
              <input type="checkbox" name="isActive" defaultChecked={form.isActive} />
              <span>Active</span>
            </label>
          </div>

          <div className={styles.actions}>
            <button type="submit" className={styles.primary}>
              Save Changes
            </button>
            <a href="/admin/forms" className={styles.secondary}>
              Cancel
            </a>
          </div>
        </form>
      </Card>
    </div>
  )
}
