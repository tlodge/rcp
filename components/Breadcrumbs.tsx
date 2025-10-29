"use client"

import Link from "next/link"
import styles from "./Breadcrumbs.module.css"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            {item.href ? (
              <>
                <Link href={item.href} className={styles.link}>
                  {item.label}
                </Link>
                {index < items.length - 1 && <span className={styles.separator}>/</span>}
              </>
            ) : (
              <span className={styles.current}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
