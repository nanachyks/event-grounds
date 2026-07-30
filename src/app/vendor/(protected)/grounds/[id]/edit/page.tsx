import Link from "next/link"
import { requireVendor } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import GroundForm from "@/components/grounds/ground-form"
import SpaceManager from "@/components/grounds/space-manager"
import type { OpeningHoursEntry } from "@/lib/opening-hours"

export default async function EditVendorGroundPage({ params }: { params: Promise<{ id: string }> }) {
  const vendor = await requireVendor()
  if (!vendor) return null

  const { id } = await params
  const ground = await prisma.ground.findUnique({ where: { id }, include: { spaces: true } })

  if (!ground || ground.vendorId !== vendor.vendorId) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">This ground doesn&apos;t belong to you.</p>
        <Link href="/vendor/grounds" className="text-green-600 hover:underline mt-2 inline-block">Back to my grounds</Link>
      </div>
    )
  }

  return (
    <div>
      <GroundForm
        mode="edit"
        groundId={ground.id}
        redirectTo="/vendor/grounds"
        initialData={{
          name: ground.name,
          vendorId: ground.vendorId,
          description: ground.description,
          location: ground.location,
          category: ground.category,
          capacity: ground.capacity,
          price: ground.price,
          images: ground.images,
          videoUrl: ground.videoUrl,
          amenities: ground.amenities,
          status: ground.status,
          pricingType: ground.pricingType,
          hourlyRate: ground.hourlyRate,
          openingHours: ground.openingHours as unknown as OpeningHoursEntry[] | null,
          cancellationPolicy: ground.cancellationPolicy,
          cancellationNoticeHours: ground.cancellationNoticeHours,
        }}
      />
      <div className="max-w-2xl mx-auto">
        <SpaceManager groundId={ground.id} initialSpaces={ground.spaces} />
      </div>
    </div>
  )
}
