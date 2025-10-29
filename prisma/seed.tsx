import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create tenants
  const tenants = [
    {
      slug: "rcpmanagement",
      name: "RCP Management",
      supportEmail: "support@rcpmanagement.com",
      supportPhone: "+44 20 1234 5678",
      paymentGatewayKey: "pk_test_rcpmanagement",
      bankDetails: "Sort Code: 12-34-56, Account: 12345678",
      theme: JSON.stringify({
        primaryColor: "#2563eb",
        secondaryColor: "#64748b",
        logo: "/logos/rcpmanagement.png",
      }),
    },
    {
      slug: "rcpgroup",
      name: "RCP Group",
      supportEmail: "support@rcpgroup.com",
      supportPhone: "+44 20 2345 6789",
      paymentGatewayKey: "pk_test_rcpgroup",
      bankDetails: "Sort Code: 23-45-67, Account: 23456789",
      theme: JSON.stringify({
        primaryColor: "#16a34a",
        secondaryColor: "#64748b",
        logo: "/logos/rcpgroup.png",
      }),
    },
    {
      slug: "rcpproperty",
      name: "RCP Property",
      supportEmail: "support@rcpproperty.com",
      supportPhone: "+44 20 3456 7890",
      paymentGatewayKey: "pk_test_rcpproperty",
      bankDetails: "Sort Code: 34-56-78, Account: 34567890",
      theme: JSON.stringify({
        primaryColor: "#ea580c",
        secondaryColor: "#64748b",
        logo: "/logos/rcpproperty.png",
      }),
    },
    {
      slug: "rcpgroundrent",
      name: "RCP Ground Rent",
      supportEmail: "support@rcpgroundrent.com",
      supportPhone: "+44 20 4567 8901",
      paymentGatewayKey: "pk_test_rcpgroundrent",
      bankDetails: "Sort Code: 45-67-89, Account: 45678901",
      theme: JSON.stringify({
        primaryColor: "#dc2626",
        secondaryColor: "#64748b",
        logo: "/logos/rcpgroundrent.png",
      }),
    },
  ]

  for (const tenant of tenants) {
    await prisma.tenant.upsert({
      where: { slug: tenant.slug },
      update: tenant,
      create: tenant,
    })
    console.log(`Created/updated tenant: ${tenant.name}`)
  }

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@rcpgroup.com" },
    update: {
      name: "Admin User",
      role: "ADMIN",
      defaultTenantSlug: "rcpgroup",
    },
    create: {
      email: "admin@rcpgroup.com",
      name: "Admin User",
      role: "ADMIN",
      defaultTenantSlug: "rcpgroup",
    },
  })
  console.log(`Created/updated admin user: ${adminUser.email}`)

  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {
      name: "Demo User",
      role: "USER",
      defaultTenantSlug: "rcpmanagement",
    },
    create: {
      email: "demo@example.com",
      name: "Demo User",
      role: "USER",
      defaultTenantSlug: "rcpmanagement",
    },
  })
  console.log(`Created/updated demo user: ${demoUser.email}`)

  // Create user account links for demo user
  const accountLinks = [
    {
      userId: demoUser.id,
      tenantSlug: "rcpmanagement",
      horizonAccountNumber: "HRZ001234",
      propertyAddress: "123 Main Street, London, SW1A 1AA",
    },
    {
      userId: demoUser.id,
      tenantSlug: "rcpgroundrent",
      horizonAccountNumber: "HRZ005678",
      propertyAddress: "456 Park Avenue, Manchester, M1 1AA",
    },
  ]

  for (const link of accountLinks) {
    await prisma.userAccountLink.upsert({
      where: {
        userId_tenantSlug_horizonAccountNumber: {
          userId: link.userId,
          tenantSlug: link.tenantSlug,
          horizonAccountNumber: link.horizonAccountNumber,
        },
      },
      update: link,
      create: link,
    })
    console.log(`Created/updated account link: ${link.horizonAccountNumber}`)
  }

  // Create form definitions
  const formDefinitions = [
    {
      id: "pet-licence-form",
      tenantSlug: "rcpmanagement",
      title: "Pet Licence Application",
      description: "Apply for permission to keep a pet in your property",
      fields: JSON.stringify([
        {
          key: "petType",
          label: "Type of Pet",
          type: "select",
          required: true,
          options: ["Dog", "Cat", "Bird", "Other"],
        },
        {
          key: "petName",
          label: "Pet Name",
          type: "text",
          required: true,
        },
        {
          key: "petBreed",
          label: "Breed",
          type: "text",
          required: false,
        },
        {
          key: "petAge",
          label: "Age",
          type: "number",
          required: true,
        },
        {
          key: "additionalInfo",
          label: "Additional Information",
          type: "textarea",
          required: false,
        },
      ]),
      isActive: true,
    },
    {
      id: "alteration-request-form",
      tenantSlug: null, // Group level
      title: "Request to Alter Property",
      description: "Request permission to make alterations to your property",
      fields: JSON.stringify([
        {
          key: "alterationType",
          label: "Type of Alteration",
          type: "select",
          required: true,
          options: ["Painting/Decorating", "Flooring", "Kitchen/Bathroom", "Structural", "Other"],
        },
        {
          key: "description",
          label: "Description of Work",
          type: "textarea",
          required: true,
        },
        {
          key: "startDate",
          label: "Proposed Start Date",
          type: "date",
          required: true,
        },
        {
          key: "contractor",
          label: "Contractor Name (if applicable)",
          type: "text",
          required: false,
        },
        {
          key: "estimatedCost",
          label: "Estimated Cost (£)",
          type: "number",
          required: false,
        },
      ]),
      isActive: true,
    },
  ]

  for (const form of formDefinitions) {
    await prisma.formDefinition.upsert({
      where: { id: form.id },
      update: form,
      create: form,
    })
    console.log(`Created/updated form: ${form.title}`)
  }

  // Create tenant messages
  const messages = [
    {
      tenantSlug: "rcpmanagement",
      content: `
        <p><strong>Important Notice:</strong> Debit card payment limits</p>
        <p>Please note that debit card payments are subject to the following limits:</p>
        <ul>
          <li>Minimum payment: £25</li>
          <li>Maximum payment: £2,500</li>
        </ul>
        <p>For payments outside these limits, please contact our support team.</p>
      `,
      isActive: true,
    },
    {
      tenantSlug: "rcpgroup",
      content: `
        <p><strong>Payment Information:</strong></p>
        <p>Debit card payments must be between £25 and £2,500. For larger amounts, please use bank transfer.</p>
      `,
      isActive: true,
    },
    {
      tenantSlug: "rcpproperty",
      content: `
        <p><strong>Debit Card Limits:</strong> Payments between £25 - £2,500 only.</p>
      `,
      isActive: true,
    },
    {
      tenantSlug: "rcpgroundrent",
      content: `
        <p><strong>Notice:</strong> Debit card payments are limited to £25 - £2,500. Contact support for alternative payment methods.</p>
      `,
      isActive: true,
    },
  ]

  for (const message of messages) {
    // Find existing message for this tenant
    const existing = await prisma.tenantMessage.findFirst({
      where: { tenantSlug: message.tenantSlug },
    })

    if (existing) {
      await prisma.tenantMessage.update({
        where: { id: existing.id },
        data: message,
      })
    } else {
      await prisma.tenantMessage.create({
        data: message,
      })
    }
    console.log(`Created/updated message for: ${message.tenantSlug}`)
  }

  console.log("Seed completed successfully!")
}

main()
  .catch((e) => {
    console.error("Error during seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
