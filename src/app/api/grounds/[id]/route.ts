import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ground = await prisma.ground.findUnique({
    where: { id },
    include: {
      vendor: { select: { name: true } },
      bookings: {
        where: { status: { in: ["approved", "paid"] } },
        select: { startDate: true, endDate: true },
      },
    },
  })

  if (!ground) {
    return NextResponse.json({ error: "Ground not found" }, { status: 404 })
  }

  return NextResponse.json(ground)
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.ground.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Ground not found" }, { status: 404 })
  }
  if (user.role === "vendor" && existing.vendorId !== user.vendorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { vendorId: _vendorId, status: _status, ...rest } = await request.json()
  const body = user.role === "admin" ? { ...rest, status: _status } : rest

  const ground = await prisma.ground.update({
    where: { id },
    data: body,
  })

  return NextResponse.json(ground)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.ground.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: "Ground not found" }, { status: 404 })
  }
  if (user.role === "vendor" && existing.vendorId !== user.vendorId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.ground.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
