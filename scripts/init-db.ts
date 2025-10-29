import { execSync } from "child_process"
import { existsSync } from "fs"
import { join } from "path"

const dbPath = join(process.cwd(), "prisma", "dev.db")

console.log("[v0] Initializing database...")

try {
  // Generate Prisma Client
  console.log("[v0] Generating Prisma Client...")
  execSync("npx prisma generate", { stdio: "inherit" })

  // Push schema to database
  console.log("[v0] Pushing schema to database...")
  execSync("npx prisma db push --skip-generate", { stdio: "inherit" })

  // Run seed if database is new
  if (!existsSync(dbPath) || true) {
    console.log("[v0] Seeding database...")
    execSync("npx tsx prisma/seed.tsx", { stdio: "inherit" })
  }

  console.log("[v0] Database initialized successfully!")
} catch (error) {
  console.error("[v0] Database initialization failed:", error)
  process.exit(1)
}
