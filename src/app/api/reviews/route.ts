import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getClientIp, rateLimit } from "@/lib/rate-limit"
import { logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfterSeconds } = await rateLimit(`reviews:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      )
    }

    const { bookingId, customerEmail, rating, comment } = await request.json()

    if (!bookingId || !customerEmail || !Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.customerEmail !== customerEmail) {
      return NextResponse.json({ error: "Email does not match this booking" }, { status: 403 })
    }

    if (booking.status !== "paid") {
      return NextResponse.json({ error: "You can only review a completed booking" }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        bookingId,
        groundId: booking.groundId,
        rating: Math.round(rating),
        comment: comment || null,
        customerName: booking.customerName,
      },
    })

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 409 })
    }
    logError("reviews.create", error)
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 })
  }
}
