import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendPasswordReset } from "@/lib/email"
import { getClientIp, rateLimit } from "@/lib/rate-limit"
import { logError } from "@/lib/logger"

const GENERIC_MESSAGE = "If an account exists with that email, a password reset link has been sent."

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const { allowed, retryAfterSeconds } = rateLimit(`forgot-password:${ip}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
    )
  }

  const { email } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const vendor = await prisma.vendor.findUnique({ where: { email } })

  if (vendor) {
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000)

    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { resetToken, resetTokenExpiry },
    })

    try {
      await sendPasswordReset({ vendorEmail: vendor.email, vendorName: vendor.name, resetToken })
    } catch (emailErr) {
      logError("vendor.forgot-password.notify", emailErr, { vendorId: vendor.id })
    }
  }

  return NextResponse.json({ message: GENERIC_MESSAGE })
}
