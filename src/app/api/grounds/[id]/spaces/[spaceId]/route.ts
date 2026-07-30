import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"

async function checkOwnership(groundId: string, spaceId: string, user: { role: string; vendorId?: string }) {
  const space = await prisma.space.findUnique({ where: { id: spaceId }, include: { ground: true } })
  if (!space || space.groundId !== groundId) return { error: NextResponse.json({ error: "Space not found" }, { status: 404 }) }
  if (user.role === "vendor" && space.ground.vendorId !== user.vendorId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }
  return { space }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, spaceId } = await params
  const { error } = await checkOwnership(id, spaceId, user)
  if (error) return error

  const body = await request.json()
  const { name, capacity, pricingType, dailyRate, hourlyRate, images, status } = body

  const space = await prisma.space.update({
    where: { id: spaceId },
    data: {
      name,
      capacity: capacity ? parseInt(capacity) : null,
      pricingType,
      dailyRate: dailyRate ? parseFloat(dailyRate) : null,
      hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
      images: Array.isArray(images) ? images : undefined,
      status,
    },
  })

  return NextResponse.json(space)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; spaceId: string }> }) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id, spaceId } = await params
  const { error } = await checkOwnership(id, spaceId, user)
  if (error) return error

  await prisma.space.delete({ where: { id: spaceId } })
  return NextResponse.json({ success: true })
}
