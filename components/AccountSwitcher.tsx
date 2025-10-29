"use client"

import { useState, useEffect } from "react"
import { getTenantUrl } from "@/lib/links"
import styles from "./AccountSwitcher.module.css"

interface Account {
  id: string
  horizonAccountNumber: string
  tenantSlug: string
  propertyAddress: string | null
}

interface AccountsByTenant {
  [tenantSlug: string]: Account[]
}

interface AccountSwitcherProps {
  currentAccountNumber?: string
  currentTenantSlug?: string
}

export default function AccountSwitcher({ currentAccountNumber, currentTenantSlug }: AccountSwitcherProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      const response = await fetch("/api/user/accounts")
      if (response.ok) {
        const data = await response.json()
        setAccounts(data.accounts || [])
      }
    } catch (error) {
      console.error("[v0] Error fetching accounts:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountSwitch = async (account: Account) => {
    try {
      const response = await fetch("/api/user/switch-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountNumber: account.horizonAccountNumber,
          tenantSlug: account.tenantSlug,
          propertyAddress: account.propertyAddress,
        }),
      })

      if (response.ok) {
        if (account.tenantSlug !== currentTenantSlug) {
          document.cookie = `dev-tenant=${account.tenantSlug}; path=/; max-age=2592000` // 30 days
          window.location.href = getTenantUrl(account.tenantSlug, "/dashboard")
        } else {
          window.location.reload()
        }
      }
    } catch (error) {
      console.error("[v0] Error switching account:", error)
    }
  }

  // Group accounts by tenant
  const accountsByTenant: AccountsByTenant = accounts.reduce((acc, account) => {
    if (!acc[account.tenantSlug]) {
      acc[account.tenantSlug] = []
    }
    acc[account.tenantSlug].push(account)
    return acc
  }, {} as AccountsByTenant)

  if (isLoading) {
    return <div className={styles.loading}>Loading accounts...</div>
  }

  if (accounts.length === 0) {
    return null
  }

  const currentAccount = accounts.find((a) => a.horizonAccountNumber === currentAccountNumber)

  return (
    <div className={styles.switcher}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.trigger}>
        <div className={styles.currentAccount}>
          <div className={styles.accountNumber}>{currentAccount?.horizonAccountNumber || "Select Account"}</div>
          {currentAccount?.propertyAddress && (
            <div className={styles.propertyAddress}>{currentAccount.propertyAddress}</div>
          )}
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {Object.entries(accountsByTenant).map(([tenantSlug, tenantAccounts]) => (
            <div key={tenantSlug} className={styles.tenantGroup}>
              <div className={styles.tenantLabel}>{tenantSlug}</div>
              {tenantAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => handleAccountSwitch(account)}
                  className={`${styles.accountOption} ${
                    account.horizonAccountNumber === currentAccountNumber ? styles.active : ""
                  }`}
                >
                  <div className={styles.accountNumber}>{account.horizonAccountNumber}</div>
                  {account.propertyAddress && <div className={styles.propertyAddress}>{account.propertyAddress}</div>}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
