import { getCurrentTenant } from "@/lib/tenant"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getPrisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import DynamicForm from "@/components/DynamicForm"
import Breadcrumbs from "@/components/Breadcrumbs"
import styles from "./page.module.css"

export default async function FormPage({ params }: { params: { id: string } }) {
  const session = await getSession()
  const tenant = await getCurrentTenant()

  if (!session) {
    redirect("/auth/signin")
  }

  if (!tenant) {
    redirect("/")
  }

  const prisma = getPrisma()

  const form = await prisma.formDefinition.findFirst({
    where: {
      id: params.id,
      isActive: true,
      OR: [{ tenantSlug: tenant.slug }, { tenantSlug: null }],
    },
  })

  if (!form) {
    notFound()
  }

  const fields = typeof form.fields === "string" ? JSON.parse(form.fields) : form.fields

  return (
    <div className="container">
      <div className={styles.formPage}>
        <Breadcrumbs
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Forms", href: "/forms" },
            { label: form.title },
          ]}
        />

        <h1>{form.title}</h1>
        {form.description && <p className={styles.description}>{form.description}</p>}

        <DynamicForm formId={form.id} fields={fields} tenantSlug={tenant.slug} userId={session.user.id} />
      </div>
    </div>
  )
}
