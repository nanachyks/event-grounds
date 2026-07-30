import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit } from "@/lib/rate-limit"

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterSeconds } = rateLimit(`reset-password:${ip}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    )
  }

  const { token, password } = await request.json()

  if (!token || !password) {
    return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({ where: { resetToken: token } })

  if (!vendor || !vendor.resetTokenExpiry || vendor.resetTokenExpiry < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)

  await prisma.vendor.update({
    where: { id: vendor.id },
    data: { password: hashed, resetToken: null, resetTokenExpiry: null },
  })

  return NextResponse.json({ success: true })
}
