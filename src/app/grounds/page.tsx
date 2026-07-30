import type { Metadata } from "next"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatRate } from "@/lib/utils"
import { getCategoryLabel } from "@/lib/categories"
import GroundSearch from "@/components/grounds/ground-search"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Browse Event Grounds in Ghana | EventGrounds",
  description: "Search and filter event venues across Ghana by location, capacity, and price - weddings, parties, conferences, and more.",
}

export default async function GroundsPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ location?: string; category?: string; capacity?: string; minPrice?: string; maxPrice?: string; query?: string }>
}) {
  const params = await _searchParams
  const where: any = { status: "active" }

  if (params.location) where.location = { contains: params.location, mode: "insensitive" }
  if (params.category) where.category = params.category
  if (params.capacity) where.capacity = { gte: parseInt(params.capacity) }
  if (params.minPrice) where.price = { ...where.price, gte: parseFloat(params.minPrice) }
  if (params.maxPrice) where.price = { ...where.price, lte: parseFloat(params.maxPrice) }
  if (params.query) {
    where.OR = [
      { name: { contains: params.query, mode: "insensitive" } },
      { description: { contains: params.query, mode: "insensitive" } },
    ]
  }

  const [grounds, locationRows] = await Promise.all([
    prisma.ground.findMany({
      where,
      include: { vendor: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ground.findMany({
      where: { status: "active" },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
  ])
  const locations = locationRows.map((r) => r.location)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Event Grounds</h1>
      <p className="text-gray-600 mb-8">Find and book the perfect venue for your event</p>

      <GroundSearch
        locations={locations}
        currentLocation={params.location}
        currentCategory={params.category}
        currentQuery={params.query}
        currentCapacity={params.capacity}
        currentMinPrice={params.minPrice}
        currentMaxPrice={params.maxPrice}
      />

      {grounds.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No grounds found matching your criteria.</p>
          <Link href="/grounds" className="text-green-600 hover:underline mt-2 inline-block">Clear filters</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grounds.map((ground) => (
            <Link key={ground.id} href={`/grounds/${ground.id}`} className="group">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {ground.images[0] ? (
                    <img src={ground.images[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-4">
                  {getCategoryLabel(ground.category) && (
                    <span className="inline-block text-xs font-medium text-green-700 bg-green-50 rounded-full px-2 py-0.5 mb-2">
                      {getCategoryLabel(ground.category)}
                    </span>
                  )}
                  <h3 className="font-semibold text-lg mb-1">{ground.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{ground.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-700 font-bold">{formatRate(ground.pricingType, ground.price, ground.hourlyRate)}</span>
                    <span className="text-sm text-gray-500">Up to {ground.capacity} guests</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
