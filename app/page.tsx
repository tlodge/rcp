import styles from "./page.module.css"
import TenantSelector from "@/components/TenantSelector"
import Header from "@/components/Header"

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="container">
        <main className={styles.main}>
          <h1 className={styles.title}>RCP Group Portal</h1>
          <p className={styles.description}>Welcome to the RCP Group portal. Please select your service to continue:</p>

          <TenantSelector />
        </main>
      </div>
    </>
  )
}
