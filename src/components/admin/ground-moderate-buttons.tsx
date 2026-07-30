"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"

export default function GroundModerateButtons({ groundId }: { groundId: string }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [confirmReject, setConfirmReject] = useState(false)

  async function moderate(action: "approve" | "reject") {
    setLoading(action)
    try {
      const res = await fetch(`/api/grounds/${groundId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update")
      showToast(action === "approve" ? "Ground approved and now live." : "Ground rejected.")
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update", "error")
    } finally {
      setLoading(null)
      setConfirmReject(false)
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button onClick={() => moderate("approve")} disabled={loading !== null}>
        {loading === "approve" ? "Approving..." : "Approve"}
      </Button>
      <Button variant="danger" onClick={() => setConfirmReject(true)} disabled={loading !== null}>
        Reject
      </Button>

      <ConfirmDialog
        open={confirmReject}
        title="Reject this listing?"
        message="The vendor will see this ground marked as rejected and it will not appear publicly."
        confirmLabel="Reject"
        danger
        onConfirm={() => moderate("reject")}
        onCancel={() => setConfirmReject(false)}
      />
    </div>
  )
}
