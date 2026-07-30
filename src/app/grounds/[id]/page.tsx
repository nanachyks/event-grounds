import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { formatDate, formatRate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import AvailabilityCalendar from "@/components/availability-calendar"
import BookingForm from "@/components/grounds/booking-form"
import ImageGallery from "@/components/grounds/image-gallery"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { getYouTubeEmbedUrl } from "@/lib/youtube"
import Link from "next/link"

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const ground = await prisma.ground.findUnique({
    where: { id },
    select: { name: true, location: true, description: true, images: true, status: true },
  })

  if (!ground || ground.status !== "active") {
    return { title: "Ground Not Found | EventGrounds" }
  }

  const title = `${ground.name} - ${ground.location} | EventGrounds`
  const description = ground.description.length > 155 ? `${ground.description.slice(0, 152)}...` : ground.description

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ground.images[0] ? [ground.images[0]] : undefined,
    },
  }
}

export default async function GroundDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ground = await prisma.ground.findUnique({
    where: { id },
    include: {
      vendor: { select: { name: true, phone: true } },
      spaces: { where: { status: "active" } },
      bookings: {
        where: { status: { in: ["approved", "paid"] } },
        select: { startDate: true, endDate: true },
      },
      reviews: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  })

  if (!ground || ground.status !== "active") {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Ground Not Found</h1>
        <Link href="/grounds" className="text-green-600 hover:underline">Back to grounds</Link>
      </div>
    )
  }

  const videoEmbedUrl = getYouTubeEmbedUrl(ground.videoUrl)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 lg:pb-8 sm:px-6 lg:px-8">
      <Link href="/grounds" className="text-sm text-gray-500 hover:text-green-700 mb-4 inline-block">&larr; Back to grounds</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div>
          <ImageGallery images={ground.images} alt={ground.name} />
          {videoEmbedUrl && (
            <div className="mt-4 aspect-video rounded-xl overflow-hidden">
              <iframe
                src={videoEmbedUrl}
                title={`${ground.name} video`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{ground.name}</h1>
              <p className="text-gray-500 mt-1">{ground.location}</p>
            </div>
            <Badge variant="success">{ground.status}</Badge>
          </div>

          {ground.reviews.length > 0 && (
            <div className="mb-2">
              <Badge variant="rating">
                ★ {(ground.reviews.reduce((sum, r) => sum + r.rating, 0) / ground.reviews.length).toFixed(1)} ({ground.reviews.length} review{ground.reviews.length === 1 ? "" : "s"})
              </Badge>
            </div>
          )}

          <p className="text-3xl font-bold text-green-700 mb-4">
            {ground.spaces.length > 0 ? "Multiple spaces available" : formatRate(ground.pricingType, ground.price, ground.hourlyRate)}
          </p>
          <p className="text-sm text-gray-500 mb-4">Up to {ground.capacity} guests</p>

          <p className="text-gray-700 mb-6">{ground.description}</p>

          <div className="mb-6">
            <h3 className="font-semibold mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {ground.amenities.map((a) => (
                <span key={a} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{a}</span>
              ))}
            </div>
          </div>

          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-1 capitalize">{ground.cancellationPolicy} Cancellation Policy</h3>
            <p className="text-sm text-gray-600">
              Full refund if cancelled at least {ground.cancellationNoticeHours} hours before your event. Cancellations after that window are non-refundable.
            </p>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            <p>Listed by: {ground.vendor.name}</p>
            <p>Added: {formatDate(ground.createdAt)}</p>
          </div>

          <a
            href={buildWhatsAppLink(ground.vendor.phone, `Hi, I'm interested in ${ground.name} on EventGrounds.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-green-600 hover:underline text-sm font-medium"
          >
            Message Host on WhatsApp
          </a>
        </div>
      </div>

      <div id="book" className="grid grid-cols-1 lg:grid-cols-2 gap-8 scroll-mt-20">
        <div>
          <h2 className="text-2xl font-bold mb-4">Availability</h2>
          <AvailabilityCalendar bookedDates={ground.bookings} />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Book This Ground</h2>
          <BookingForm
            groundId={ground.id}
            groundName={ground.name}
            price={ground.price}
            pricingType={ground.pricingType}
            hourlyRate={ground.hourlyRate}
            spaces={ground.spaces.length > 0 ? ground.spaces : undefined}
          />
        </div>
      </div>

      {ground.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {ground.reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium">{review.customerName}</p>
                  <p className="text-amber-500">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                </div>
                {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-4 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="min-w-0">
          <p className="text-lg font-bold text-green-700 truncate">
            {ground.spaces.length > 0 ? "Multiple spaces" : formatRate(ground.pricingType, ground.price, ground.hourlyRate)}
          </p>
          <p className="text-xs text-gray-500 truncate">{ground.name}</p>
        </div>
        <a
          href="#book"
          className="shrink-0 bg-green-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-green-700 transition"
        >
          Book Now
        </a>
      </div>
    </div>
  )
}
