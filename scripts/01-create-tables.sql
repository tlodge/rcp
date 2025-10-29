-- Create tables for multi-tenant portal

-- Tenant table
CREATE TABLE IF NOT EXISTS "Tenant" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "supportEmail" TEXT NOT NULL,
    "supportPhone" TEXT NOT NULL,
    "paymentGatewayKey" TEXT NOT NULL,
    "bankDetails" TEXT NOT NULL,
    "theme" JSONB NOT NULL
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "defaultTenantSlug" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Account table (for NextAuth compatibility, though we're using custom auth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    UNIQUE("provider", "providerAccountId")
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY,
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP NOT NULL
);

-- VerificationToken table
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP NOT NULL,
    PRIMARY KEY ("identifier", "token")
);

-- UserAccountLink table
CREATE TABLE IF NOT EXISTS "UserAccountLink" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantSlug" TEXT NOT NULL,
    "horizonAccountNumber" TEXT NOT NULL,
    "propertyAddress" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- BalanceSnapshot table
CREATE TABLE IF NOT EXISTS "BalanceSnapshot" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantSlug" TEXT NOT NULL,
    "horizonAccountNumber" TEXT NOT NULL,
    "amountPence" INTEGER NOT NULL,
    "takenAt" TIMESTAMP NOT NULL
);

-- Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
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
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- FormDefinition table
CREATE TABLE IF NOT EXISTS "FormDefinition" (
    "id" TEXT PRIMARY KEY,
    "tenantSlug" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fields" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true
);

-- FormSubmission table
CREATE TABLE IF NOT EXISTS "FormSubmission" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantSlug" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "filesPlaceholder" JSONB,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- TenantMessage table
CREATE TABLE IF NOT EXISTS "TenantMessage" (
    "id" TEXT PRIMARY KEY,
    "tenantSlug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Message table
CREATE TABLE IF NOT EXISTS "Message" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tenantSlug" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "UserAccountLink_userId_idx" ON "UserAccountLink"("userId");
CREATE INDEX IF NOT EXISTS "UserAccountLink_tenantSlug_idx" ON "UserAccountLink"("tenantSlug");
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_tenantSlug_idx" ON "Transaction"("tenantSlug");
CREATE INDEX IF NOT EXISTS "FormSubmission_userId_idx" ON "FormSubmission"("userId");
CREATE INDEX IF NOT EXISTS "Message_userId_idx" ON "Message"("userId");
