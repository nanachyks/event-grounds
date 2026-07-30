"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Textarea, Label, Select } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useToast } from "@/components/ui/toast"
import { GROUND_CATEGORIES } from "@/lib/categories"
import type { OpeningHoursEntry } from "@/lib/opening-hours"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function defaultOpeningHours(): OpeningHoursEntry[] {
  return DAY_NAMES.map((_, day) => ({ day, open: "08:00", close: "18:00", closed: false }))
}

type GroundFormData = {
  name: string
  vendorId: string
  description: string
  location: string
  category: string
  capacity: string
  price: string
  images: string
  videoUrl: string
  amenities: string
  status: string
  pricingType: string
  hourlyRate: string
  cancellationPolicy: string
  cancellationNoticeHours: string
}

export type GroundFormInitialData = {
  name: string
  vendorId: string
  description: string
  location: string
  category?: string | null
  capacity: number
  price: number
  images: string[]
  videoUrl?: string | null
  amenities: string[]
  status: string
  pricingType?: string
  hourlyRate?: number | null
  openingHours?: OpeningHoursEntry[] | null
  cancellationPolicy?: string
  cancellationNoticeHours?: number
}

export default function GroundForm({
  mode,
  groundId,
  initialData,
  vendors,
  redirectTo,
}: {
  mode: "create" | "edit"
  groundId?: string
  initialData?: GroundFormInitialData
  vendors?: { id: string; name: string }[]
  redirectTo: string
}) {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState<GroundFormData>({
    name: initialData?.name ?? "",
    vendorId: initialData?.vendorId ?? vendors?.[0]?.id ?? "",
    description: initialData?.description ?? "",
    location: initialData?.location ?? "",
    category: initialData?.category ?? "",
    capacity: initialData?.capacity?.toString() ?? "",
    price: initialData?.price?.toString() ?? "",
    images: initialData?.images?.join("\n") ?? "",
    videoUrl: initialData?.videoUrl ?? "",
    amenities: initialData?.amenities?.join(", ") ?? "",
    status: initialData?.status ?? "active",
    pricingType: initialData?.pricingType ?? "daily",
    hourlyRate: initialData?.hourlyRate?.toString() ?? "",
    cancellationPolicy: initialData?.cancellationPolicy ?? "flexible",
    cancellationNoticeHours: initialData?.cancellationNoticeHours?.toString() ?? "48",
  })
  const [openingHours, setOpeningHours] = useState<OpeningHoursEntry[]>(initialData?.openingHours ?? defaultOpeningHours())
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setUploading(true)
    setUploadError("")
    try {
      const uploadedUrls: string[] = []
      for (const file of files) {
        const body = new FormData()
        body.append("file", file)
        const res = await fetch("/api/upload", { method: "POST", body })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Upload failed")
        uploadedUrls.push(data.url)
      }
      setForm((prev) => ({
        ...prev,
        images: [prev.images, ...uploadedUrls].filter(Boolean).join("\n"),
      }))
      showToast(uploadedUrls.length > 1 ? `${uploadedUrls.length} images uploaded.` : "Image uploaded.")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed"
      setUploadError(message)
      showToast(message, "error")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  const imageList = form.images.split("\n").map((s) => s.trim()).filter(Boolean)

  function updateDay(day: number, patch: Partial<OpeningHoursEntry>) {
    setOpeningHours((prev) => prev.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        location: form.location,
        category: form.category || null,
        capacity: parseInt(form.capacity),
        price: parseFloat(form.price),
        images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
        videoUrl: form.videoUrl.trim() || null,
        amenities: form.amenities.split(",").map((a) => a.trim()).filter(Boolean),
        pricingType: form.pricingType,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
        openingHours,
        cancellationPolicy: form.cancellationPolicy,
        cancellationNoticeHours: parseInt(form.cancellationNoticeHours) || 48,
      }
      if (mode === "edit") payload.status = form.status
      if (mode === "create" && vendors) payload.vendorId = form.vendorId

      const res = await fetch(mode === "create" ? "/api/grounds" : `/api/grounds/${groundId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Failed to ${mode === "create" ? "create" : "update"} ground`)
      }
      showToast(mode === "create" ? "Ground created." : "Changes saved.")
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${mode === "create" ? "create" : "update"} ground`
      setError(message)
      showToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader><h2 className="text-lg font-semibold">{mode === "create" ? "Add New Ground" : "Edit Ground"}</h2></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Ground Name</Label><Input name="name" value={form.name} onChange={handleChange} required /></div>
            <div><Label>Location</Label><Input name="location" value={form.location} onChange={handleChange} required /></div>
          </div>
          <div><Label>Description</Label><Textarea name="description" value={form.description} onChange={handleChange} rows={3} required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <Select name="category" value={form.category} onChange={handleChange}>
                <option value="">No category</option>
                {GROUND_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </Select>
            </div>
            <div><Label>Capacity (guests)</Label><Input name="capacity" type="number" value={form.capacity} onChange={handleChange} required /></div>
          </div>
          <div><Label>Daily Rate (GHS)</Label><Input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} required /></div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Pricing Type</Label>
              <Select name="pricingType" value={form.pricingType} onChange={handleChange}>
                <option value="daily">Daily only</option>
                <option value="hourly">Hourly only</option>
                <option value="both">Both daily and hourly</option>
              </Select>
            </div>
            {form.pricingType !== "daily" && (
              <div><Label>Hourly Rate (GHS)</Label><Input name="hourlyRate" type="number" step="0.01" value={form.hourlyRate} onChange={handleChange} required /></div>
            )}
          </div>

          {form.pricingType !== "daily" && (
            <div>
              <Label>Opening Hours (for hourly bookings)</Label>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
                {openingHours.map((entry) => (
                  <div key={entry.day} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <span className="w-24 shrink-0">{DAY_NAMES[entry.day]}</span>
                    <label className="flex items-center gap-1 text-gray-500">
                      <input type="checkbox" checked={!!entry.closed} onChange={(e) => updateDay(entry.day, { closed: e.target.checked })} />
                      Closed
                    </label>
                    {!entry.closed && (
                      <>
                        <input type="time" value={entry.open} onChange={(e) => updateDay(entry.day, { open: e.target.value })} className="border border-gray-300 rounded px-2 py-1" />
                        <span className="text-gray-400">to</span>
                        <input type="time" value={entry.close} onChange={(e) => updateDay(entry.day, { close: e.target.value })} className="border border-gray-300 rounded px-2 py-1" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Cancellation Policy</Label>
              <Select name="cancellationPolicy" value={form.cancellationPolicy} onChange={handleChange}>
                <option value="flexible">Flexible</option>
                <option value="moderate">Moderate</option>
                <option value="strict">Strict</option>
              </Select>
            </div>
            <div><Label>Refund Notice Window (hours)</Label><Input name="cancellationNoticeHours" type="number" value={form.cancellationNoticeHours} onChange={handleChange} /></div>
          </div>
          {(vendors || mode === "edit") && (
            <div className="grid grid-cols-2 gap-4">
              {vendors && mode === "create" && (
                <div>
                  <Label>Vendor</Label>
                  <Select name="vendorId" value={form.vendorId} onChange={handleChange} required>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </Select>
                </div>
              )}
              {vendors && mode === "edit" && (
                <div>
                  <Label>Vendor</Label>
                  <p className="text-sm text-gray-700 py-2">{vendors.find((v) => v.id === form.vendorId)?.name ?? "Unknown"} <span className="text-gray-400">(not reassignable here)</span></p>
                </div>
              )}
              {vendors && mode === "edit" && (
                <div>
                  <Label>Status</Label>
                  <Select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="pending">Pending Review</option>
                    <option value="rejected">Rejected</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>
              )}
            </div>
          )}
          <div>
            <Label>Upload Images:</Label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-700 file:text-sm file:font-medium hover:file:bg-green-100"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            {uploadError && <p className="text-sm text-red-600 mt-1">{uploadError}</p>}
            {imageList.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {imageList.map((src, i) => (
                  <img key={i} src={src} alt="" className="h-16 w-full object-cover rounded-lg border border-gray-200" />
                ))}
              </div>
            )}
          </div>
          <div><Label>Image URLs (one per line)</Label><Textarea name="images" value={form.images} onChange={handleChange} rows={3} placeholder="https://... (or use Upload Images above)" /></div>
          <div>
            <Label>YouTube Video Link (optional)</Label>
            <Input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div><Label>Amenities (comma separated)</Label><Input name="amenities" value={form.amenities} onChange={handleChange} placeholder="Parking, Stage, Sound System" /></div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : mode === "create" ? "Create Ground" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
