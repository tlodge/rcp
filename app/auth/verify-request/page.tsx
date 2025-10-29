import Card from "@/components/Card"
import styles from "./page.module.css"

export default function VerifyRequestPage() {
  return (
    <div className="container">
      <div className={styles.wrapper}>
        <Card className={styles.card}>
          <div className={styles.icon}>📧</div>
          <h1>Check your email</h1>
          <p className={styles.description}>
            A sign in link has been sent to your email address. Click the link in the email to sign in.
          </p>
          <p className={styles.note}>
            The link will expire in 24 hours. If you don't see the email, check your spam folder.
          </p>
        </Card>
      </div>
    </div>
  )
}
