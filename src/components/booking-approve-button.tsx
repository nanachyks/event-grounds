"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function BookingApproveButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [paymentUrl, setPaymentUrl] = useState("")

  async function handleApprove() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/bookings/${bookingId}/approve`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to approve")
      setPaymentUrl(data.authorizationUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button onClick={handleApprove} disabled={loading}>
        {loading ? "Processing..." : "Approve & Send Payment Link"}
      </Button>
      {paymentUrl && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700 mb-2">Payment link generated:</p>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 underline break-all text-sm">{paymentUrl}</a>
          <p className="text-xs text-gray-500 mt-2">Share this link with the customer to complete payment.</p>
        </div>
      )}
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  )
}
