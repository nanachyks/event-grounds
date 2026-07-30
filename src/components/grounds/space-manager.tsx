"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Textarea, Label, Select } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { formatRate } from "@/lib/utils"

export interface SpaceData {
  id: string
  name: string
  capacity: number | null
  pricingType: string
  dailyRate: number | null
  hourlyRate: number | null
  images: string[]
  status: string
}

type SpaceFormState = {
  name: string
  capacity: string
  pricingType: string
  dailyRate: string
  hourlyRate: string
  images: string
  status: string
}

const emptyForm: SpaceFormState = { name: "", capacity: "", pricingType: "daily", dailyRate: "", hourlyRate: "", images: "", status: "active" }

function toFormState(space: SpaceData): SpaceFormState {
  return {
    name: space.name,
    capacity: space.capacity?.toString() ?? "",
    pricingType: space.pricingType,
    dailyRate: space.dailyRate?.toString() ?? "",
    hourlyRate: space.hourlyRate?.toString() ?? "",
    images: space.images.join("\n"),
    status: space.status,
  }
}

function SpaceForm({ initial, onSubmit, onCancel, loading }: { initial: SpaceFormState; onSubmit: (form: SpaceFormState) => void; onCancel: () => void; loading: boolean }) {
  const [form, setForm] = useState(initial)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="space-y-3 border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Space Name</Label><Input name="name" value={form.name} onChange={handleChange} required /></div>
        <div><Label>Capacity (optional)</Label><Input name="capacity" type="number" value={form.capacity} onChange={handleChange} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label>Pricing Type</Label>
          <Select name="pricingType" value={form.pricingType} onChange={handleChange}>
            <option value="daily">Daily only</option>
            <option value="hourly">Hourly only</option>
            <option value="both">Both</option>
          </Select>
        </div>
        <div><Label>Daily Rate (GHS)</Label><Input name="dailyRate" type="number" step="0.01" value={form.dailyRate} onChange={handleChange} /></div>
        <div><Label>Hourly Rate (GHS)</Label><Input name="hourlyRate" type="number" step="0.01" value={form.hourlyRate} onChange={handleChange} /></div>
      </div>
      <div><Label>Image URLs (one per line)</Label><Textarea name="images" value={form.images} onChange={handleChange} rows={2} /></div>
      <div>
        <Label>Status</Label>
        <Select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="button" disabled={loading} onClick={() => onSubmit(form)}>{loading ? "Saving..." : "Save Space"}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function SpaceManager({ groundId, initialSpaces }: { groundId: string; initialSpaces: SpaceData[] }) {
  const router = useRouter()
  const { showToast } = useToast()
  const [spaces, setSpaces] = useState(initialSpaces)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<SpaceData | null>(null)

  async function handleCreate(form: SpaceFormState) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/grounds/${groundId}/spaces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: form.images.split("\n").map((s) => s.trim()).filter(Boolean) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create space")
      setSpaces((prev) => [...prev, data])
      setAdding(false)
      showToast("Sub-space added.")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(spaceId: string, form: SpaceFormState) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/grounds/${groundId}/spaces/${spaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images: form.images.split("\n").map((s) => s.trim()).filter(Boolean) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update space")
      setSpaces((prev) => prev.map((s) => (s.id === spaceId ? data : s)))
      setEditingId(null)
      showToast("Sub-space updated.")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(spaceId: string) {
    setLoading(true)
    setError("")
    try {
      const res = await fetch(`/api/grounds/${groundId}/spaces/${spaceId}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete space")
      }
      setSpaces((prev) => prev.filter((s) => s.id !== spaceId))
      showToast("Sub-space deleted.")
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong"
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
      setDeleteTarget(null)
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sub-Spaces</h2>
          {!adding && <Button type="button" variant="outline" onClick={() => setAdding(true)}>Add Sub-Space</Button>}
        </div>
        <p className="text-sm text-gray-500 mt-1">
          If this venue has multiple bookable rooms with their own pricing, add them here. Customers will pick a specific space when booking. Leave empty to keep booking this ground as a single unit.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {spaces.length === 0 && !adding && <p className="text-sm text-gray-500">No sub-spaces yet.</p>}

        {spaces.map((space) =>
          editingId === space.id ? (
            <SpaceForm
              key={space.id}
              initial={toFormState(space)}
              loading={loading}
              onSubmit={(form) => handleUpdate(space.id, form)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={space.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
              <div>
                <p className="font-medium">{space.name} {space.capacity ? <span className="text-gray-500 text-sm">· up to {space.capacity} guests</span> : null}</p>
                <p className="text-sm text-gray-500">{formatRate(space.pricingType, space.dailyRate, space.hourlyRate)}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={space.status === "active" ? "success" : "default"}>{space.status}</Badge>
                <button type="button" className="text-green-600 hover:underline text-sm" onClick={() => setEditingId(space.id)}>Edit</button>
                <button type="button" className="text-red-600 hover:underline text-sm" onClick={() => setDeleteTarget(space)}>Delete</button>
              </div>
            </div>
          )
        )}

        {adding && (
          <SpaceForm initial={emptyForm} loading={loading} onSubmit={handleCreate} onCancel={() => setAdding(false)} />
        )}
      </CardContent>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this sub-space?"
        message={`"${deleteTarget?.name}" will be permanently removed. This can't be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => deleteTarget && handleDelete(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </Card>
  )
}
