import { cookies } from "next/headers"
import bcrypt from "bcrypt"

const SESSION_COOKIE_NAME = "session"
const ACTIVE_ACCOUNT_COOKIE_NAME = "active_account"
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface Session {
  user: {
    id: string
    email: string
    name: string | null
    role: string
  }
  expires: string
}

export interface ActiveAccount {
  accountNumber: string
  tenantSlug: string
  propertyAddress: string
}

export async function createSession(userId: string, email: string, name: string | null, role: string) {
  const session: Session = {
    user: { id: userId, email, name, role },
    expires: new Date(Date.now() + SESSION_DURATION).toISOString(),
  }

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })

  return session
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

    if (!sessionCookie?.value) {
      return null
    }

    const session: Session = JSON.parse(sessionCookie.value)

    // Check if session is expired
    if (new Date(session.expires) < new Date()) {
      await destroySession()
      return null
    }

    return session
  } catch (error) {
    console.error("[v0] Error getting session:", error)
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function setActiveAccount(account: ActiveAccount) {
  const cookieStore = await cookies()
  cookieStore.set(ACTIVE_ACCOUNT_COOKIE_NAME, JSON.stringify(account), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  })
}

export async function getActiveAccount(): Promise<ActiveAccount | null> {
  try {
    const cookieStore = await cookies()
    const accountCookie = cookieStore.get(ACTIVE_ACCOUNT_COOKIE_NAME)

    if (!accountCookie?.value) {
      return null
    }

    return JSON.parse(accountCookie.value)
  } catch (error) {
    console.error("[v0] Error getting active account:", error)
    return null
  }
}

export async function clearActiveAccount() {
  const cookieStore = await cookies()
  cookieStore.delete(ACTIVE_ACCOUNT_COOKIE_NAME)
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}
