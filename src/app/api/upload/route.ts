import { NextRequest, NextResponse } from "next/server"
import { requireVendorOrAdmin } from "@/lib/auth-helpers"
import { uploadImage } from "@/lib/cloudinary"
import { logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  const user = await requireVendorOrAdmin()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are supported" }, { status: 400 })
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 8MB" }, { status: 400 })
  }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`
    const url = await uploadImage(dataUri)
    return NextResponse.json({ url }, { status: 201 })
  } catch (error) {
    logError("upload", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
