import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPaystackPayment } from "@/lib/paystack"
import { sendBookingConfirmation, sendVendorNotification } from "@/lib/email"
import { logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    const verification = await verifyPaystackPayment(reference)

    if (!verification.status || verification.data.status !== "success") {
      // Mark payment as failed
      await prisma.payment.update({
        where: { paystackRef: reference },
        data: { status: "failed" },
      })
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference },
      include: {
        booking: {
          include: {
            ground: { include: { vendor: true } },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Update payment and booking status
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "success" },
    })

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "paid" },
    })

    // Send confirmation emails
    try {
      await sendBookingConfirmation({
        customerEmail: payment.booking.customerEmail,
        customerName: payment.booking.customerName,
        groundName: payment.booking.ground.name,
        startDate: payment.booking.startDate.toISOString(),
        endDate: payment.booking.endDate.toISOString(),
        bookingId: payment.bookingId,
        amount: payment.amount,
      })

      await sendVendorNotification({
        vendorEmail: payment.booking.ground.vendor.email,
        vendorName: payment.booking.ground.vendor.name,
        groundName: payment.booking.ground.name,
        customerName: payment.booking.customerName,
        startDate: payment.booking.startDate.toISOString(),
        endDate: payment.booking.endDate.toISOString(),
      })
    } catch (emailErr) {
      logError("payments.verify.notify", emailErr, { bookingId: payment.bookingId })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError("payments.verify", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
