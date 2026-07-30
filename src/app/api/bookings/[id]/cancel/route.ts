import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { refundPaystackPayment } from "@/lib/paystack"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"
import { logError } from "@/lib/logger"
import { logAudit } from "@/lib/audit-log"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireVendorOrAdmin()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { ground: true, payment: true },
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (user.role === "vendor" && booking.ground.vendorId !== user.vendorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking is already cancelled" }, { status: 400 })
    }

    let refunded = false

    if (booking.status === "paid" && booking.payment) {
      const noticeMs = booking.ground.cancellationNoticeHours * 60 * 60 * 1000
      const withinWindow = booking.startDate.getTime() - Date.now() >= noticeMs

      if (withinWindow) {
        const refundResponse = await refundPaystackPayment(booking.payment.paystackRef)
        if (refundResponse.status) {
          refunded = true
          await prisma.payment.update({
            where: { id: booking.payment.id },
            data: { status: "refunded" },
          })
        }
      }
    }

    await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    })

    await logAudit({
      actor: user,
      action: "booking.cancel",
      targetType: "booking",
      targetId: id,
      metadata: { customerName: booking.customerName, refunded },
    })

    return NextResponse.json({ success: true, refunded })
  } catch (error) {
    logError("bookings.cancel", error)
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 })
  }
}
