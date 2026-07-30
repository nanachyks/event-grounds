import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })
  const role = token?.role

  const isAdminArea = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")
  const isVendorArea =
    pathname.startsWith("/vendor") &&
    !pathname.startsWith("/vendor/login") &&
    !pathname.startsWith("/vendor/signup") &&
    !pathname.startsWith("/vendor/forgot-password") &&
    !pathname.startsWith("/vendor/reset-password")

  if (isAdminArea && role !== "admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  if (isVendorArea && role !== "vendor") {
    return NextResponse.redirect(new URL("/vendor/login", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*"],
}
