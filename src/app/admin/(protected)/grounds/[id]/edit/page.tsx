import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import GroundForm from "@/components/grounds/ground-form"
import SpaceManager from "@/components/grounds/space-manager"
import type { OpeningHoursEntry } from "@/lib/opening-hours"

export default async function EditGroundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [ground, vendors] = await Promise.all([
    prisma.ground.findUnique({ where: { id }, include: { spaces: true } }),
    prisma.vendor.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ])

  if (!ground) notFound()

  return (
    <div>
      <GroundForm
        mode="edit"
        groundId={ground.id}
        vendors={vendors}
        redirectTo="/admin/grounds"
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
