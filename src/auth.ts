import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit } from "@/lib/rate-limit"

function checkLoginRateLimit(providerId: string, email: string, request?: Request) {
  const ip = request ? getClientIp(request) : "unknown"
  const { allowed } = rateLimit(`login:${providerId}:${email.toLowerCase()}:${ip}`, 10, 15 * 60 * 1000)
  return allowed
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null
        if (!checkLoginRateLimit("admin", email, request)) return null

        const adminEmail = process.env.ADMIN_EMAIL || "admin@eventgrounds.com"
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
        if (!adminPasswordHash || email !== adminEmail) return null

        const valid = await bcrypt.compare(password, adminPasswordHash)
        if (!valid) return null

        return { id: "admin", email: adminEmail, name: "Admin", role: "admin" }
      },
    }),
    Credentials({
      id: "vendor",
      name: "Vendor",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const email = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null
        if (!checkLoginRateLimit("vendor", email, request)) return null

        const vendor = await prisma.vendor.findUnique({ where: { email } })
        if (!vendor) return null

        const valid = await bcrypt.compare(password, vendor.password)
        if (!valid) return null

        return { id: vendor.id, email: vendor.email, name: vendor.name, role: "vendor", vendorId: vendor.id }
      },
    }),
  ],
})
