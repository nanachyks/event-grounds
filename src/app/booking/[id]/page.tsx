import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ReviewForm from "@/components/grounds/review-form"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { verifyAndFinalizePayment } from "@/lib/payment-verification"

export const dynamic = "force-dynamic"

export default async function BookingStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ reference?: string }>
}) {
  const { id } = await params
  const { reference } = await searchParams

  let booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      ground: { include: { vendor: true } },
      payment: true,
      review: true,
    },
  })

  let verificationFailed = false

  if (booking && reference && booking.status === "approved" && booking.payment?.paystackRef === reference) {
    const result = await verifyAndFinalizePayment(reference)
    verificationFailed = !result.ok
    booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ground: { include: { vendor: true } },
        payment: true,
        review: true,
      },
    })
  }

  if (!booking) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
        <Link href="/grounds" className="text-green-600 hover:underline">Browse grounds</Link>
      </div>
    )
  }

  const whatsappLink = buildWhatsAppLink(booking.ground.vendor.phone, `Hi, I'm reaching out about my booking (${booking.id}) for ${booking.ground.name}.`)

  return (
    <div className="max-w-lg mx-auto px-4 py-16">
      {verificationFailed && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-6">
          We couldn&apos;t confirm your payment yet. If you completed checkout, this can take a moment — refresh this page, or message the host on WhatsApp below.
        </div>
      )}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Booking Status</h1>
            <Badge variant={booking.status === "paid" ? "success" : booking.status === "approved" ? "info" : booking.status === "pending" ? "warning" : "danger"}>
              {booking.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-gray-500">Ground</p>
            <p className="font-medium">{booking.ground.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Dates</p>
            <p className="font-medium">{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="font-medium">{formatCurrency(booking.amount ?? booking.ground.price)}</p>
          </div>
          <div className="pt-2">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
              Message host on WhatsApp
            </a>
          </div>
        </CardContent>
      </Card>

      {booking.status === "paid" && !booking.review && (
        <ReviewForm bookingId={booking.id} customerEmail={booking.customerEmail} />
      )}

      {booking.review && (
        <Card>
          <CardContent className="p-6">
            <p className="text-amber-500 mb-1">{"★".repeat(booking.review.rating)}{"☆".repeat(5 - booking.review.rating)}</p>
            {booking.review.comment && <p className="text-gray-700">{booking.review.comment}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
