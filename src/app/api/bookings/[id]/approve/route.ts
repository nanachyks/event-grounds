import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v4 as uuidv4 } from "uuid"
import { initializePaystackPayment } from "@/lib/paystack"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"
import { logError } from "@/lib/logger"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVendorOrAdmin()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ground: { include: { vendor: true } } },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (user.role === "vendor" && booking.ground.vendorId !== user.vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (booking.status !== "pending") {
      return NextResponse.json({ error: "Booking is not in pending status" }, { status: 400 })
    }

    const reference = uuidv4()
    const amount = booking.amount ?? booking.ground.price
    const commissionRate = booking.ground.vendor.commissionRate
    const commission = amount * commissionRate
    const vendorNet = amount - commission

    const paystackResponse = await initializePaystackPayment({
      email: booking.customerEmail,
      amount,
      reference,
      metadata: {
        bookingId: booking.id,
        groundName: booking.ground.name,
      },
    })

    if (!paystackResponse.status) {
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 })
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "approved" },
    })

    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        paystackRef: reference,
        amount,
        commission,
        vendorNet,
        status: "pending",
      },
    })

    return NextResponse.json({
      authorizationUrl: paystackResponse.data.authorization_url,
      reference,
    })
  } catch (error) {
    logError("bookings.approve", error)
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 })
  }
}
