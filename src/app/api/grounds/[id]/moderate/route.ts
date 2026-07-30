import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-helpers"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { action } = await request.json()
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const { id } = await params
  const ground = await prisma.ground.findUnique({ where: { id } })
  if (!ground) {
    return NextResponse.json({ error: "Ground not found" }, { status: 404 })
  }

  const updated = await prisma.ground.update({
    where: { id },
    data: { status: action === "approve" ? "active" : "rejected" },
  })

  return NextResponse.json(updated)
}
