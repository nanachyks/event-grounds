import { auth } from "@/auth"

export type SessionUser = {
  role: "admin" | "vendor"
  vendorId?: string
  email?: string | null
  name?: string | null
}

export async function requireAdmin(): Promise<SessionUser | null> {
  const session = await auth()
  if (session?.user.role !== "admin") return null
  return session.user
}

export async function requireVendor(): Promise<SessionUser | null> {
  const session = await auth()
  if (session?.user.role !== "vendor") return null
  return session.user
}

export async function requireVendorOrAdmin(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session || (session.user.role !== "admin" && session.user.role !== "vendor")) return null
  return session.user
}
