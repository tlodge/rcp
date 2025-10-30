// app/payments/page.tsx (CSS Modules version)
import { redirect } from "next/navigation";
import { getSession, getActiveAccount } from "@/lib/auth";
import { getCurrentTenant, getCurrentTenantSlug } from "@/lib/tenant";
import { getPrisma } from "@/lib/prisma";
import PaymentForm from "@/components/PaymentForm";
import styles from "./page.module.css";

function formatGBP(pence: number) {
  const pounds = (pence / 100).toFixed(2);
  return `£${pounds}`;
}

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/signin");

  const tenant = await getCurrentTenant();
  const tenantSlug = await getCurrentTenantSlug();
  if (!tenant || !tenantSlug) redirect("/");

  const active = await getActiveAccount();
  let accountNumber = (active?.accountNumber as string | null) || null;

  const prisma = getPrisma();

  if (!accountNumber) {
    const link = await prisma.userAccountLink.findFirst({
      where: { userId: session.user.id, tenantSlug },
    });
    accountNumber = link?.horizonAccountNumber || null;

    if (!accountNumber) {
      return (
        <main className={styles.emptyMain}>
          <div className={styles.containerNarrow}>
            <div className={styles.card}>
              <header className={styles.cardHeader}>
                <h1 className={styles.title}>Make a payment</h1>
                <p className={styles.subtitle}>Select an account from the account switcher to continue.</p>
              </header>

              <div className={styles.alert}>
                <div className={styles.alertIcon} aria-hidden>⚠️</div>
                <div>
                  <p className={styles.alertText}>We couldn’t find an active account for your profile.</p>
                  <p className={styles.alertHelp}>Use the account switcher at the top of the page to choose an account, then return here.</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      );
    }
  }

  const latestBalance = await prisma.balanceSnapshot.findFirst({
    where: {
      userId: session.user.id,
      tenantSlug,
      horizonAccountNumber: accountNumber,
    },
    orderBy: { takenAt: "desc" },
  });

  const balancePence = latestBalance?.amountPence ?? 0;
  const balanceFormatted = formatGBP(balancePence);

  return (
    <main className={styles.main}>
      <div className={styles.containerWide}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.merchantWrap}>
            <div className={styles.monogram}>R</div>
            <div className={styles.merchant}>RCP Group</div>
          </div>
          <div className={styles.secure}>
            <svg aria-hidden className={styles.secureIcon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a5 5 0 00-5 5v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7a5 5 0 00-5-5zm-3 8V7a3 3 0 116 0v3H9z"/>
            </svg>
            <span>Secure checkout</span>
          </div>
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {/* Main */}
          <section className={styles.mainCol}>
            <div className={styles.card}>
              <header className={styles.cardHeader}>
                <h1 className={styles.title}>Make a payment</h1>
                <p className={styles.subtitle}>Account {accountNumber}</p>
              </header>

              <div className={styles.formScope}>
                <PaymentForm
                  accountNumber={accountNumber}
                  tenantSlug={tenantSlug}
                  bankDetails={tenant.bankDetails}
                />
              </div>

              <div className={styles.trustRow}>
                <div className={styles.trustItem}><span aria-hidden>✅</span>PCI DSS compliant</div>
                <span className={styles.dot}/>
                <div className={styles.trustItem}><span aria-hidden>🔒</span>TLS encryption</div>
                <span className={styles.dot}/>
                <div className={styles.trustItem}><span aria-hidden>⚡</span>Powered by Blink</div>
              </div>
            </div>
          </section>

          {/* Summary */}
          <aside className={styles.summaryAside}>
            <div className={styles.card}>
              <h2 className={styles.summaryTitle}>Summary</h2>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Outstanding balance</span>
                <span className={styles.balance}>{balanceFormatted}</span>
              </div>

              {latestBalance ? (
                <p className={styles.asOf}>As of {new Date(latestBalance.takenAt).toLocaleDateString()}</p>
              ) : (
                <p className={styles.asOf}>No recent balance snapshot.</p>
              )}

              <div className={styles.brandGrid}>
                <div className={styles.brandCard} aria-label="Visa">
                  <svg viewBox="0 0 36 24" className={styles.brandSvg}>
                    <text x="50%" y="70%" textAnchor="middle" fontSize="16" fill="currentColor">VISA</text>
                  </svg>
                </div>
                <div className={styles.brandCard} aria-label="Mastercard">
                  <svg viewBox="0 0 36 24" className={styles.brandSvg}>
                    <circle cx="14" cy="12" r="8"/>
                    <circle cx="22" cy="12" r="8" opacity=".6"/>
                  </svg>
                </div>
                <div className={styles.brandCard} aria-label="American Express">
                  <svg viewBox="0 0 36 24" className={styles.brandSvg}>
                    <text x="50%" y="72%" textAnchor="middle" fontSize="20" fill="currentColor">AMEX</text>
                  </svg>
                </div>
                <div className={styles.brandCard} aria-label="Apple Pay">
                  <svg viewBox="0 0 36 24" className={styles.brandSvg}>
                    <text x="50%" y="72%" textAnchor="middle" fontSize="20" fill="currentColor"> Pay</text>
                  </svg>
                </div>
                <div className={styles.brandCard} aria-label="Google Pay">
                  <svg viewBox="0 0 36 24" className={styles.brandSvg}>
                    <text x="50%" y="72%" textAnchor="middle" fontSize="20" fill="currentColor">G Pay</text>
                  </svg>
                </div>
              </div>

              <div className={styles.note}>
                You can choose a different amount in the form. Payments usually appear on your account within a few minutes.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}