import { PrismaClient } from "@prisma/client"
import { neon } from "@neondatabase/serverless"

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Please ensure the Neon integration is connected or set DATABASE_URL in your environment variables.",
  )
}

// Check if we're using SQLite (local development) or PostgreSQL (production)
const isSQLite = databaseUrl.startsWith("file:")

let prisma: any

if (isSQLite) {
  // Use Prisma Client for SQLite (local development)
  const prismaClient = new PrismaClient()
  prisma = prismaClient
} else {
  // Use Neon's serverless driver for PostgreSQL (production)
  if (!databaseUrl.startsWith("postgres://") && !databaseUrl.startsWith("postgresql://")) {
    throw new Error(
      `Invalid DATABASE_URL format. Expected PostgreSQL connection string (postgresql://...), got: ${databaseUrl.substring(0, 20)}...`,
    )
  }

  const sql = neon(databaseUrl)

  // Simple query helper that mimics Prisma's API for Neon
  prisma = {
    user: {
      findUnique: async ({ where, include }: any) => {
        const result = await sql`
          SELECT * FROM "User" WHERE "email" = ${where.email}
        `
        if (result.length === 0) return null

        const user = result[0]

        if (include?.accounts) {
          const accounts = await sql`
            SELECT * FROM "UserAccountLink" WHERE "userId" = ${user.id}
          `
          return { ...user, accounts }
        }

        return user
      },
      create: async ({ data, include }: any) => {
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "User" ("id", "email", "name", "role", "defaultTenantSlug")
          VALUES (${id}, ${data.email}, ${data.name || null}, ${data.role || "USER"}, ${data.defaultTenantSlug || null})
          RETURNING *
        `

        const user = result[0]

        if (include?.accounts) {
          return { ...user, accounts: [] }
        }

        return user
      },
    },
    userAccountLink: {
      findFirst: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "UserAccountLink" 
          WHERE "userId" = ${where.userId} 
          AND "horizonAccountNumber" = ${where.horizonAccountNumber}
          LIMIT 1
        `
        return result.length > 0 ? result[0] : null
      },
      findMany: async ({ where }: any) => {
        return await sql`
          SELECT * FROM "UserAccountLink" WHERE "userId" = ${where.userId}
        `
      },
      create: async ({ data }: any) => {
        const id = `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "UserAccountLink" ("id", "userId", "tenantSlug", "horizonAccountNumber", "propertyAddress")
          VALUES (${id}, ${data.userId}, ${data.tenantSlug}, ${data.horizonAccountNumber}, ${data.propertyAddress || null})
          RETURNING *
        `
        return result[0]
      },
    },
    tenant: {
      findUnique: async ({ where, include }: any) => {
        const result = await sql`
          SELECT * FROM "Tenant" WHERE "slug" = ${where.slug}
        `

        if (result.length === 0) return null

        const tenant = result[0]

        if (include?.messages) {
          const messages = await sql`
            SELECT * FROM "TenantMessage" 
            WHERE "tenantSlug" = ${where.slug} 
            AND "isActive" = true
            ORDER BY "updatedAt" DESC
          `
          return { ...tenant, messages }
        }

        return tenant
      },
    },
    balanceSnapshot: {
      findFirst: async ({ where, orderBy }: any) => {
        const result = await sql`
          SELECT * FROM "BalanceSnapshot" 
          WHERE "userId" = ${where.userId} 
          AND "horizonAccountNumber" = ${where.horizonAccountNumber}
          ORDER BY "takenAt" DESC
          LIMIT 1
        `
        return result.length > 0 ? result[0] : null
      },
      create: async ({ data }: any) => {
        const id = `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "BalanceSnapshot" ("id", "userId", "tenantSlug", "horizonAccountNumber", "amountPence", "takenAt")
          VALUES (${id}, ${data.userId}, ${data.tenantSlug}, ${data.horizonAccountNumber}, ${data.amountPence}, ${data.takenAt})
          RETURNING *
        `
        return result[0]
      },
    },
    transaction: {
      findMany: async ({ where, orderBy, take }: any) => {
        let query = `SELECT * FROM "Transaction" WHERE "userId" = $1 AND "horizonAccountNumber" = $2`
        const params = [where.userId, where.horizonAccountNumber]

        if (where.source) {
          query += ` AND "source" = $${params.length + 1}`
          params.push(where.source)
        }
        if (where.status) {
          query += ` AND "status" = $${params.length + 1}`
          params.push(where.status)
        }

        query += ` ORDER BY "occurredAt" DESC`

        if (take) {
          query += ` LIMIT $${params.length + 1}`
          params.push(take)
        }

        return await sql(query, params)
      },
      findFirst: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "Transaction" 
          WHERE "externalRef" = ${where.externalRef}
          LIMIT 1
        `
        return result.length > 0 ? result[0] : null
      },
      findUnique: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "Transaction" WHERE "id" = ${where.id}
        `
        return result.length > 0 ? result[0] : null
      },
      create: async ({ data }: any) => {
        const id = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "Transaction" ("id", "userId", "tenantSlug", "horizonAccountNumber", "externalRef", "source", "direction", "amountPence", "status", "occurredAt", "raw")
          VALUES (${id}, ${data.userId}, ${data.tenantSlug}, ${data.horizonAccountNumber}, ${data.externalRef || null}, ${data.source}, ${data.direction}, ${data.amountPence}, ${data.status}, ${data.occurredAt}, ${JSON.stringify(data.raw || {})})
          RETURNING *
        `
        return result[0]
      },
      update: async ({ where, data }: any) => {
        const result = await sql`
          UPDATE "Transaction" 
          SET "status" = ${data.status}
          WHERE "id" = ${where.id}
          RETURNING *
        `
        return result[0]
      },
    },
    formDefinition: {
      findMany: async ({ where }: any) => {
        if (where?.OR) {
          return await sql`
            SELECT * FROM "FormDefinition" 
            WHERE ("tenantSlug" = ${where.OR[0].tenantSlug} OR "tenantSlug" IS NULL)
            AND "isActive" = true
          `
        }
        return await sql`
          SELECT * FROM "FormDefinition" WHERE "isActive" = true
        `
      },
      findFirst: async ({ where }: any) => {
        if (where?.OR) {
          const result = await sql`
            SELECT * FROM "FormDefinition" 
            WHERE "id" = ${where.id}
            AND "isActive" = ${where.isActive !== false}
            AND ("tenantSlug" = ${where.OR[0].tenantSlug} OR "tenantSlug" IS NULL)
            LIMIT 1
          `
          return result.length > 0 ? result[0] : null
        }
        const result = await sql`
          SELECT * FROM "FormDefinition" 
          WHERE "id" = ${where.id}
          LIMIT 1
        `
        return result.length > 0 ? result[0] : null
      },
      findUnique: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "FormDefinition" WHERE "id" = ${where.id}
        `
        return result.length > 0 ? result[0] : null
      },
    },
    formSubmission: {
      findMany: async ({ where, orderBy }: any) => {
        return await sql`
          SELECT * FROM "FormSubmission" 
          WHERE "userId" = ${where.userId}
          ORDER BY "createdAt" DESC
        `
      },
      findFirst: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "FormSubmission" 
          WHERE "id" = ${where.id}
          AND "userId" = ${where.userId}
          LIMIT 1
        `
        return result.length > 0 ? result[0] : null
      },
      findUnique: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "FormSubmission" WHERE "id" = ${where.id}
        `
        return result.length > 0 ? result[0] : null
      },
      create: async ({ data }: any) => {
        const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "FormSubmission" ("id", "userId", "tenantSlug", "formId", "payload", "filesPlaceholder")
          VALUES (${id}, ${data.userId}, ${data.tenantSlug}, ${data.formId}, ${JSON.stringify(data.payload)}, ${JSON.stringify(data.filesPlaceholder || {})})
          RETURNING *
        `
        return result[0]
      },
    },
    tenantMessage: {
      findMany: async ({ where, orderBy }: any = {}) => {
        // If where clause with tenantSlug is provided, filter by tenant
        if (where?.tenantSlug) {
          return await sql`
            SELECT * FROM "TenantMessage" 
            WHERE "tenantSlug" = ${where.tenantSlug} 
            AND "isActive" = true
            ORDER BY "updatedAt" DESC
          `
        }
        // Otherwise, return all messages (for admin)
        return await sql`
          SELECT * FROM "TenantMessage" 
          ORDER BY "updatedAt" DESC
        `
      },
      findUnique: async ({ where }: any) => {
        const result = await sql`
          SELECT * FROM "TenantMessage" WHERE "id" = ${where.id}
        `
        return result.length > 0 ? result[0] : null
      },
      update: async ({ where, data }: any) => {
        const result = await sql`
          UPDATE "TenantMessage" 
          SET "content" = ${data.content}, "isActive" = ${data.isActive}, "updatedAt" = NOW()
          WHERE "id" = ${where.id}
          RETURNING *
        `
        return result[0]
      },
    },
    message: {
      findMany: async ({ where, orderBy }: any) => {
        return await sql`
          SELECT * FROM "Message" 
          WHERE "userId" = ${where.userId}
          ORDER BY "createdAt" DESC
        `
      },
      create: async ({ data }: any) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const result = await sql`
          INSERT INTO "Message" ("id", "userId", "tenantSlug", "subject", "body", "status")
          VALUES (${id}, ${data.userId}, ${data.tenantSlug}, ${data.subject}, ${data.body}, ${data.status || "PENDING"})
          RETURNING *
        `
        return result[0]
      },
    },
  }
}

// Keep the getPrisma function for backward compatibility
export function getPrisma() {
  return prisma
}

export { prisma }
