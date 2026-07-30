import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import BookingApproveButton from "@/components/booking-approve-button"
import BookingCancelButton from "@/components/booking-cancel-button"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      ground: { include: { vendor: true } },
      payment: true,
    },
  })

  if (!booking) {
    return <div className="text-center py-20"><p className="text-gray-500">Booking not found</p><Link href="/admin/bookings" className="text-green-600 hover:underline mt-2 inline-block">Back to bookings</Link></div>
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/bookings" className="text-sm text-gray-500 hover:text-green-700 mb-4 inline-block">&larr; Back to bookings</Link>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Booking Details</h2>
            <Badge variant={booking.status === "paid" ? "success" : booking.status === "approved" ? "info" : booking.status === "pending" ? "warning" : "danger"}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer Name</p>
              <p className="font-medium">{booking.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{booking.customerPhone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{booking.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ground</p>
              <p className="font-medium">{booking.ground.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(booking.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{formatDate(booking.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className="font-bold text-green-700">{formatCurrency(booking.amount ?? booking.ground.price)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted</p>
              <p className="font-medium">{formatDate(booking.createdAt)}</p>
            </div>
          </div>

          {booking.message && (
            <div>
              <p className="text-sm text-gray-500">Message</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{booking.message}</p>
            </div>
          )}

          <div className="border-t pt-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-2">Vendor: {booking.ground.vendor.name}</p>
              <p className="text-sm text-gray-500">Commission Rate: {(booking.ground.vendor.commissionRate * 100).toFixed(0)}%</p>
            </div>
            <a
              href={buildWhatsAppLink(booking.customerPhone, `Hi ${booking.customerName}, this is regarding your booking for ${booking.ground.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline text-sm font-medium"
            >
              Message Customer on WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>

      {booking.payment && (
        <Card className="mb-6">
          <CardHeader><h2 className="text-lg font-semibold">Payment Details</h2></CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-500">Total Amount</span><span>{formatCurrency(booking.payment.amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Commission (2%)</span><span className="text-yellow-600">-{formatCurrency(booking.payment.commission)}</span></div>
            <div className="flex justify-between font-bold border-t pt-2"><span>Vendor Net</span><span className="text-green-700">{formatCurrency(booking.payment.vendorNet)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Paystack Ref</span><span className="font-mono text-xs">{booking.payment.paystackRef}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">Payment Status</span><Badge variant={booking.payment.status === "success" ? "success" : "warning"}>{booking.payment.status}</Badge></div>
          </CardContent>
        </Card>
      )}

      {booking.status === "pending" && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Actions</h3>
            <p className="text-sm text-gray-500 mb-4">Approve this booking to send a payment link to the customer.</p>
            <BookingApproveButton bookingId={booking.id} />
          </CardContent>
        </Card>
      )}

      {["pending", "approved", "paid"].includes(booking.status) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Cancel Booking</h3>
            <p className="text-sm text-gray-500 mb-4">
              Cancellation policy: {booking.ground.cancellationPolicy} — refundable if cancelled at least {booking.ground.cancellationNoticeHours}h before the event.
            </p>
            <BookingCancelButton bookingId={booking.id} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
