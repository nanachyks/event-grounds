import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const url = new URL(request.url)
  const start = url.searchParams.get("start")
  const end = url.searchParams.get("end")
  const spaceId = url.searchParams.get("spaceId")

  const where: any = spaceId
    ? { spaceId, status: { in: ["approved", "paid"] } }
    : { groundId: id, spaceId: null, status: { in: ["approved", "paid"] } }

  if (start && end) {
    where.startDate = { lte: new Date(end) }
    where.endDate = { gte: new Date(start) }
  }

  const bookings = await prisma.booking.findMany({
    where,
    select: { startDate: true, endDate: true },
  })

  return NextResponse.json(bookings)
}
