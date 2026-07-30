import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const where: any = { status: "active" }

  const location = searchParams.get("location")
  const category = searchParams.get("category")
  const capacity = searchParams.get("capacity")
  const minPrice = searchParams.get("minPrice")
  const maxPrice = searchParams.get("maxPrice")
  const query = searchParams.get("query")

  if (location) where.location = { contains: location, mode: "insensitive" }
  if (category) where.category = category
  if (capacity) where.capacity = { gte: parseInt(capacity) }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ]
  }

  const grounds = await prisma.ground.findMany({
    where,
    include: { vendor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(grounds)
}

export async function POST(request: NextRequest) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const {
    name, description, location, category, capacity, price, images, amenities, videoUrl,
    pricingType, hourlyRate, openingHours, cancellationPolicy, cancellationNoticeHours,
  } = body

  if (!name || !description || !location || !Number.isFinite(capacity) || capacity <= 0 || !Number.isFinite(price) || price <= 0) {
    return NextResponse.json({ error: "Missing or invalid required fields" }, { status: 400 })
  }

  let vendorId: string
  let status = "active"

  if (user.role === "vendor") {
    vendorId = user.vendorId!
    status = "pending"
  } else {
    if (!body.vendorId) {
      return NextResponse.json({ error: "vendorId is required" }, { status: 400 })
    }
    const vendor = await prisma.vendor.findUnique({ where: { id: body.vendorId } })
    if (!vendor) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 400 })
    }
    vendorId = vendor.id
    if (body.status) status = body.status
  }

  const ground = await prisma.ground.create({
    data: {
      name,
      description,
      location,
      category: category || null,
      capacity,
      price,
      images: Array.isArray(images) ? images : [],
      videoUrl: videoUrl || null,
      amenities: Array.isArray(amenities) ? amenities : [],
      status,
      vendorId,
      pricingType: pricingType || "daily",
      hourlyRate: hourlyRate ?? null,
      openingHours: openingHours ?? undefined,
      cancellationPolicy: cancellationPolicy || "flexible",
      cancellationNoticeHours: Number.isFinite(cancellationNoticeHours) ? cancellationNoticeHours : 48,
    },
  })

  return NextResponse.json(ground, { status: 201 })
}
