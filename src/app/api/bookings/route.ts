import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAdminNewBooking } from "@/lib/email"
import { calculateAmount } from "@/lib/pricing"
import { isWithinOpeningHours, type OpeningHoursEntry } from "@/lib/opening-hours"
import { getClientIp, rateLimit } from "@/lib/rate-limit"
import { logError } from "@/lib/logger"

export async function GET() {
  const bookings = await prisma.booking.findMany({
    include: { ground: { select: { name: true, price: true } } },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(bookings)
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const { allowed, retryAfterSeconds } = await rateLimit(`bookings:${ip}`, 10, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many booking attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } }
      )
    }

    const body = await request.json()
    const { groundId, spaceId, customerName, customerEmail, customerPhone, startDate, endDate, message, rateMode } = body

    if (!groundId || !customerName || !customerEmail || !customerPhone || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return NextResponse.json({ error: "End date must be after start date" }, { status: 400 })
    }

    const ground = await prisma.ground.findUnique({ where: { id: groundId } })
    if (!ground) {
      return NextResponse.json({ error: "Ground not found" }, { status: 404 })
    }

    let space = null
    if (spaceId) {
      space = await prisma.space.findUnique({ where: { id: spaceId } })
      if (!space || space.groundId !== groundId) {
        return NextResponse.json({ error: "Invalid space for this ground" }, { status: 400 })
      }
    }

    const effectivePricingType = space ? space.pricingType : ground.pricingType
    const effectiveDailyRate = space ? space.dailyRate : ground.price
    const effectiveHourlyRate = space ? space.hourlyRate : ground.hourlyRate
    const effectiveRateMode: "daily" | "hourly" = effectivePricingType === "both" ? (rateMode === "hourly" ? "hourly" : "daily") : (effectivePricingType as "daily" | "hourly")

    if (effectiveRateMode === "hourly") {
      const startTime = start.toTimeString().slice(0, 5)
      const endTime = end.toTimeString().slice(0, 5)
      const withinHours = isWithinOpeningHours(ground.openingHours as unknown as OpeningHoursEntry[] | null, start, startTime, endTime)
      if (!withinHours) {
        return NextResponse.json({ error: "Requested time is outside opening hours" }, { status: 400 })
      }
    }

    // Prevent double-booking: same space if selected, otherwise the ground itself booked directly
    const conflictWhere = spaceId
      ? { spaceId, status: { in: ["approved", "paid"] }, startDate: { lt: end }, endDate: { gt: start } }
      : { groundId, spaceId: null, status: { in: ["approved", "paid"] }, startDate: { lt: end }, endDate: { gt: start } }
    const conflict = await prisma.booking.findFirst({ where: conflictWhere })
    if (conflict) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 })
    }

    const amount = calculateAmount({
      pricingType: effectivePricingType as "daily" | "hourly" | "both",
      dailyRate: effectiveDailyRate,
      hourlyRate: effectiveHourlyRate,
      startDate: start,
      endDate: end,
      rateMode: effectiveRateMode,
    })

    const booking = await prisma.booking.create({
      data: {
        groundId,
        spaceId: spaceId || null,
        customerName,
        customerEmail,
        customerPhone,
        startDate: start,
        endDate: end,
        message: message || null,
        status: "pending",
        amount,
      },
      include: { ground: { select: { name: true } } },
    })

    // Notify admin
    try {
      await sendAdminNewBooking({
        adminEmail: process.env.ADMIN_EMAIL || "admin@eventgrounds.com",
        customerName,
        groundName: booking.ground.name,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        bookingId: booking.id,
      })
    } catch (emailErr) {
      logError("bookings.create.notify", emailErr, { bookingId: booking.id })
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    logError("bookings.create", error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}
