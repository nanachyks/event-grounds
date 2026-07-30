import type { NextAuthConfig } from "next-auth"

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.vendorId = user.vendorId
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role as "admin" | "vendor"
      session.user.vendorId = token.vendorId as string | undefined
      return session
    },
  },
}
