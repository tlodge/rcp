import Link from "next/link"
import { getSession } from "@/lib/auth"
import SignOutButton from "./SignOutButton"
import styles from "./Header.module.css"

interface HeaderProps {
  tenant?: {
    name: string
    slug: string
  }
}

export default async function Header({ tenant }: HeaderProps) {
  const session = await getSession()

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.content}>
          <Link href="/" className={styles.logo}>
            {tenant ? tenant.name : "RCP Group"}
          </Link>

          <nav className={styles.nav}>
            {session ? (
              <>
                <Link href="/dashboard" className={styles.link}>
                  Dashboard
                </Link>
                <div className={styles.user}>
                  <span className={styles.email}>{session.user.email}</span>
                  <SignOutButton />
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className={styles.link}>
                  Sign In
                </Link>
                <Link href="/register" className={styles.button}>
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
