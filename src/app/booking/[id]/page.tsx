import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import ReviewForm from "@/components/grounds/review-form"
import { buildWhatsAppLink } from "@/lib/whatsapp"

export const dynamic = "force-dynamic"

export default async function BookingStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      ground: { include: { vendor: true } },
      payment: true,
      review: true,
    },
  })

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
