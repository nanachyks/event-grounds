import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const ground = await prisma.ground.findUnique({ where: { id } })
  if (!ground) {
    return NextResponse.json({ error: "Ground not found" }, { status: 404 })
  }
  if (user.role === "vendor" && ground.vendorId !== user.vendorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const { name, capacity, pricingType, dailyRate, hourlyRate, images } = body

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  const space = await prisma.space.create({
    data: {
      groundId: id,
      name,
      capacity: capacity ? parseInt(capacity) : null,
      pricingType: pricingType || "daily",
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      images: Array.isArray(images) ? images : [],
    },
  })

  return NextResponse.json(space, { status: 201 })
}
