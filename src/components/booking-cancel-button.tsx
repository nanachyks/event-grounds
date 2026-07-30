"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

export default function BookingCancelButton({ bookingId }: { bookingId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function handleCancel() {
    setConfirmOpen(false)
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to cancel")
      showToast(`Booking cancelled${data.refunded ? " — payment refunded." : "."}`)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cancel"
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={loading}>
        {loading ? "Cancelling..." : "Cancel Booking"}
      </Button>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        message="The customer will be notified and, if the booking was already paid, a refund will be issued according to the cancellation policy."
        confirmLabel="Cancel Booking"
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
