import { neon } from "@neondatabase/serverless"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ error: "Database connection not configured" }, { status: 500 })
    }

    const sql = neon(databaseUrl)

    await sql`CREATE TABLE IF NOT EXISTS "Tenant" (
      "id" TEXT PRIMARY KEY,
      "slug" TEXT UNIQUE NOT NULL,
      "name" TEXT NOT NULL,
      "supportEmail" TEXT NOT NULL,
      "supportPhone" TEXT NOT NULL,
      "paymentGatewayKey" TEXT NOT NULL,
      "bankDetails" TEXT NOT NULL,
      "theme" JSONB NOT NULL
    )`

    await sql`CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "name" TEXT,
      "passwordHash" TEXT,
      "defaultTenantSlug" TEXT,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "UserAccountLink" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantSlug" TEXT NOT NULL,
      "horizonAccountNumber" TEXT NOT NULL,
      "propertyAddress" TEXT,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "BalanceSnapshot" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantSlug" TEXT NOT NULL,
      "horizonAccountNumber" TEXT NOT NULL,
      "amountPence" INTEGER NOT NULL,
      "takenAt" TIMESTAMP NOT NULL
    )`

    await sql`CREATE TABLE IF NOT EXISTS "Transaction" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantSlug" TEXT NOT NULL,
      "horizonAccountNumber" TEXT NOT NULL,
      "externalRef" TEXT,
      "source" TEXT NOT NULL,
      "direction" TEXT NOT NULL,
      "amountPence" INTEGER NOT NULL,
      "status" TEXT NOT NULL,
      "occurredAt" TIMESTAMP NOT NULL,
      "raw" JSONB,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "FormDefinition" (
      "id" TEXT PRIMARY KEY,
      "tenantSlug" TEXT,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "fields" JSONB NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true
    )`

    await sql`CREATE TABLE IF NOT EXISTS "FormSubmission" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantSlug" TEXT NOT NULL,
      "formId" TEXT NOT NULL,
      "payload" JSONB NOT NULL,
      "filesPlaceholder" JSONB,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "TenantMessage" (
      "id" TEXT PRIMARY KEY,
      "tenantSlug" TEXT NOT NULL,
      "content" TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    await sql`CREATE TABLE IF NOT EXISTS "Message" (
      "id" TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "tenantSlug" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
    )`

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_session_userId" ON "Session"("userId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_useraccountlink_userId" ON "UserAccountLink"("userId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_transaction_userId" ON "Transaction"("userId")`
    await sql`CREATE INDEX IF NOT EXISTS "idx_transaction_tenantSlug" ON "Transaction"("tenantSlug")`

    await sql`INSERT INTO "Tenant" ("id", "slug", "name", "supportEmail", "supportPhone", "paymentGatewayKey", "bankDetails", "theme")
     VALUES 
       ('tenant1', 'rcpmanagement', 'RCP Management', 'support@rcpmanagement.com', '+44 20 1234 5678', 'pk_test_management', 'Sort: 12-34-56, Acc: 12345678', '{"primaryColor":"#2563eb","accentColor":"#7c3aed"}'::jsonb),
       ('tenant2', 'rcpgroup', 'RCP Group', 'support@rcpgroup.com', '+44 20 2345 6789', 'pk_test_group', 'Sort: 23-45-67, Acc: 23456789', '{"primaryColor":"#059669","accentColor":"#0891b2"}'::jsonb),
       ('tenant3', 'rcpproperty', 'RCP Property', 'support@rcpproperty.com', '+44 20 3456 7890', 'pk_test_property', 'Sort: 34-56-78, Acc: 34567890', '{"primaryColor":"#dc2626","accentColor":"#ea580c"}'::jsonb),
       ('tenant4', 'rcpgroundrent', 'RCP Ground Rent', 'support@rcpgroundrent.com', '+44 20 4567 8901', 'pk_test_groundrent', 'Sort: 45-67-89, Acc: 45678901', '{"primaryColor":"#7c3aed","accentColor":"#db2777"}'::jsonb)
     ON CONFLICT ("slug") DO NOTHING`

    await sql`INSERT INTO "User" ("id", "email", "name", "role", "defaultTenantSlug")
     VALUES ('admin1', 'admin@example.com', 'Admin User', 'ADMIN', 'rcpmanagement')
     ON CONFLICT ("email") DO NOTHING`

    await sql`INSERT INTO "User" ("id", "email", "name", "role", "defaultTenantSlug")
     VALUES ('demo1', 'demo@example.com', 'Demo User', 'USER', 'rcpmanagement')
     ON CONFLICT ("email") DO NOTHING`

    await sql`INSERT INTO "UserAccountLink" ("id", "userId", "tenantSlug", "horizonAccountNumber", "propertyAddress")
     VALUES 
       ('link1', 'demo1', 'rcpmanagement', 'ACC001', '123 Main Street, London'),
       ('link2', 'demo1', 'rcpproperty', 'ACC002', '456 Oak Avenue, Manchester')
     ON CONFLICT ("id") DO NOTHING`

    await sql`INSERT INTO "FormDefinition" ("id", "tenantSlug", "title", "description", "fields")
     VALUES 
       ('form1', 'rcpmanagement', 'Pet Licence Application', 'Apply for permission to keep a pet in your property', '[{"key":"petType","label":"Type of Pet","type":"select","required":true,"options":["Dog","Cat","Bird","Other"]},{"key":"petName","label":"Pet Name","type":"text","required":true},{"key":"petBreed","label":"Breed","type":"text","required":false},{"key":"reason","label":"Reason for Request","type":"textarea","required":true}]'::jsonb),
       ('form2', NULL, 'Request to Alter Property', 'Request permission to make alterations to your property', '[{"key":"alterationType","label":"Type of Alteration","type":"select","required":true,"options":["Structural","Cosmetic","Electrical","Plumbing","Other"]},{"key":"description","label":"Description of Work","type":"textarea","required":true},{"key":"contractor","label":"Contractor Name","type":"text","required":false},{"key":"startDate","label":"Proposed Start Date","type":"date","required":true}]'::jsonb)
     ON CONFLICT ("id") DO NOTHING`

    await sql`INSERT INTO "TenantMessage" ("id", "tenantSlug", "content")
     VALUES 
       ('msg1', 'rcpmanagement', 'Please note: Debit card payments are subject to limits between £25 and £2,500 per transaction.'),
       ('msg2', 'rcpgroup', 'Please note: Debit card payments are subject to limits between £25 and £2,500 per transaction.'),
       ('msg3', 'rcpproperty', 'Please note: Debit card payments are subject to limits between £25 and £2,500 per transaction.'),
       ('msg4', 'rcpgroundrent', 'Please note: Debit card payments are subject to limits between £25 and £2,500 per transaction.')
     ON CONFLICT ("id") DO NOTHING`

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error: any) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json({ error: error.message || "Failed to initialize database" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (!databaseUrl) {
      return NextResponse.json({ initialized: false, error: "No database connection" })
    }

    const sql = neon(databaseUrl)

    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'Tenant'
      ) as exists
    `

    return NextResponse.json({ initialized: result[0]?.exists || false })
  } catch (error: any) {
    return NextResponse.json({ initialized: false, error: error.message })
  }
}
