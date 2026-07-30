import { prisma } from "@/lib/prisma"
import { verifyPaystackPayment } from "@/lib/paystack"
import { sendBookingConfirmation, sendVendorNotification } from "@/lib/email"
import { logError } from "@/lib/logger"

export async function verifyAndFinalizePayment(reference: string): Promise<{ ok: boolean; error?: string }> {
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
    return { ok: false, error: "Payment not found" }
  }

  if (payment.status === "success") {
    return { ok: true }
  }

  const verification = await verifyPaystackPayment(reference)

  if (!verification.status || verification.data.status !== "success") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    })
    return { ok: false, error: "Payment verification failed" }
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "success" },
  })

  await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: "paid" },
  })

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

  return { ok: true }
}
