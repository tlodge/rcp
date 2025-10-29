export interface MRIAccount {
  accountNumber: string
  tenantSlug: string
  propertyAddress: string
}

export interface MRIVerifyEmailResponse {
  exists: boolean
  accounts: MRIAccount[]
}

export interface MRIAccountSummary {
  balancePence: number
  lastUpdatedIso: string
}

export interface MRITransaction {
  externalRef: string
  direction: "DEBIT" | "CREDIT"
  amountPence: number
  occurredAt: string
  description: string
}

/**
 * Verify if an email exists in MRI and return associated accounts
 * For MVP: simulates lookup - if email includes "demo", returns mock accounts
 */
export async function verifyEmailWithMRI(email: string): Promise<MRIVerifyEmailResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock implementation: if email contains "demo", return test accounts
  if (email.toLowerCase().includes("demo")) {
    return {
      exists: true,
      accounts: [
        {
          accountNumber: "HRZ001234",
          tenantSlug: "rcpmanagement",
          propertyAddress: "123 Demo Street, London, SW1A 1AA",
        },
        {
          accountNumber: "HRZ005678",
          tenantSlug: "rcpproperty",
          propertyAddress: "456 Test Avenue, Manchester, M1 1AA",
        },
      ],
    }
  }

  // For non-demo emails, return single account
  return {
    exists: true,
    accounts: [
      {
        accountNumber: `HRZ${Math.floor(Math.random() * 900000 + 100000)}`,
        tenantSlug: "rcpmanagement",
        propertyAddress: "Sample Property Address",
      },
    ],
  }
}

/**
 * Get account summary from MRI
 */
export async function getAccountSummary(accountNumber: string): Promise<MRIAccountSummary> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock implementation: return random balance
  const balancePence = Math.floor(Math.random() * 500000) - 100000 // -£1000 to £4000

  return {
    balancePence,
    lastUpdatedIso: new Date().toISOString(),
  }
}

/**
 * Get transactions from MRI since a given date
 */
export async function getTransactionsSince(accountNumber: string, sinceIso?: string): Promise<MRITransaction[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Mock implementation: return sample transactions
  const transactions: MRITransaction[] = [
    {
      externalRef: "MRI-2024-001",
      direction: "CREDIT",
      amountPence: 125000, // £1,250.00
      occurredAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Rent payment received",
    },
    {
      externalRef: "MRI-2024-002",
      direction: "DEBIT",
      amountPence: 5000, // £50.00
      occurredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Service charge",
    },
    {
      externalRef: "MRI-2024-003",
      direction: "DEBIT",
      amountPence: 2500, // £25.00
      occurredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      description: "Admin fee",
    },
  ]

  // Filter by date if provided
  if (sinceIso) {
    const sinceDate = new Date(sinceIso)
    return transactions.filter((tx) => new Date(tx.occurredAt) > sinceDate)
  }

  return transactions
}
