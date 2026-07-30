import { NextRequest, NextResponse } from "next/server"
import { verifyAndFinalizePayment } from "@/lib/payment-verification"
import { logError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reference } = body

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 })
    }

    const result = await verifyAndFinalizePayment(reference)
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "Verification failed" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    logError("payments.verify", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
