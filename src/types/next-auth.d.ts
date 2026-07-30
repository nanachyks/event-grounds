import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    role: "admin" | "vendor"
    vendorId?: string
  }

  interface Session {
    user: {
      role: "admin" | "vendor"
      vendorId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "vendor"
    vendorId?: string
  }
}
