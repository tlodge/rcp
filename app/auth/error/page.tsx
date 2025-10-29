import Card from "@/components/Card"
import styles from "./page.module.css"

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams.error

  return (
    <div className="container">
      <div className={styles.wrapper}>
        <Card className={styles.card}>
          <h1>Authentication Error</h1>
          <p className={styles.description}>
            {error === "Verification"
              ? "The sign in link is no longer valid. It may have expired or already been used."
              : "An error occurred during authentication. Please try again."}
          </p>
          <a href="/auth/signin" className={styles.button}>
            Back to Sign In
          </a>
        </Card>
      </div>
    </div>
  )
}
