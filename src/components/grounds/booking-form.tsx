"use client"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input, Textarea, Label, Select } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { calculateAmount } from "@/lib/pricing"

export interface SpaceOption {
  id: string
  name: string
  pricingType: string
  dailyRate: number | null
  hourlyRate: number | null
}

export default function BookingForm({
  groundId,
  groundName,
  price,
  pricingType = "daily",
  hourlyRate,
  spaces,
}: {
  groundId: string
  groundName: string
  price: number
  pricingType?: string
  hourlyRate?: number | null
  spaces?: SpaceOption[]
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [spaceId, setSpaceId] = useState(spaces?.[0]?.id ?? "")
  const [rateMode, setRateMode] = useState<"daily" | "hourly">("daily")
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    message: "",
  })

  const selectedSpace = spaces?.find((s) => s.id === spaceId)
  const effectivePricingType = selectedSpace ? selectedSpace.pricingType : pricingType
  const effectiveDailyRate = selectedSpace ? selectedSpace.dailyRate : price
  const effectiveHourlyRate = selectedSpace ? selectedSpace.hourlyRate : hourlyRate
  const effectiveRateMode: "daily" | "hourly" = effectivePricingType === "both" ? rateMode : (effectivePricingType as "daily" | "hourly")
  const isHourly = effectiveRateMode === "hourly"

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const previewAmount = useMemo(() => {
    if (!formData.startDate) return null
    const endDateStr = formData.endDate || formData.startDate
    const start = isHourly ? new Date(`${formData.startDate}T${formData.startTime}`) : new Date(formData.startDate)
    const end = isHourly ? new Date(`${formData.startDate}T${formData.endTime}`) : new Date(endDateStr)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) return null

    return calculateAmount({
      pricingType: effectivePricingType as "daily" | "hourly" | "both",
      dailyRate: effectiveDailyRate,
      hourlyRate: effectiveHourlyRate,
      startDate: start,
      endDate: end,
      rateMode: effectiveRateMode,
    })
  }, [formData.startDate, formData.endDate, formData.startTime, formData.endTime, isHourly, effectivePricingType, effectiveDailyRate, effectiveHourlyRate, effectiveRateMode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const startDate = isHourly ? `${formData.startDate}T${formData.startTime}` : formData.startDate
      const endDate = isHourly ? `${formData.startDate}T${formData.endTime}` : formData.endDate

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          startDate,
          endDate,
          groundId,
          spaceId: selectedSpace?.id || undefined,
          rateMode: effectiveRateMode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Something went wrong")
      router.push(`/booking/confirm?bookingId=${data.id}&groundName=${encodeURIComponent(groundName)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="text-sm text-gray-500 mb-2">{groundName}{selectedSpace ? ` — ${selectedSpace.name}` : ""}</div>

      {spaces && spaces.length > 0 && (
        <div>
          <Label htmlFor="spaceId">Choose a Space</Label>
          <Select id="spaceId" value={spaceId} onChange={(e) => setSpaceId(e.target.value)} required>
            {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
        </div>
      )}

      {effectivePricingType === "both" && (
        <div>
          <Label>Booking Type</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1"><input type="radio" checked={rateMode === "daily"} onChange={() => setRateMode("daily")} /> By the day</label>
            <label className="flex items-center gap-1"><input type="radio" checked={rateMode === "hourly"} onChange={() => setRateMode("hourly")} /> By the hour</label>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="customerName">Full Name</Label>
        <Input id="customerName" name="customerName" required value={formData.customerName} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="customerEmail">Email</Label>
        <Input id="customerEmail" name="customerEmail" type="email" required value={formData.customerEmail} onChange={handleChange} />
      </div>

      <div>
        <Label htmlFor="customerPhone">Phone Number</Label>
        <Input id="customerPhone" name="customerPhone" type="tel" required value={formData.customerPhone} onChange={handleChange} placeholder="+233 XX XXX XXXX" />
      </div>

      {isHourly ? (
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Date</Label>
            <Input id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="startTime">Start Time</Label>
            <Input id="startTime" name="startTime" type="time" required value={formData.startTime} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="endTime">End Time</Label>
            <Input id="endTime" name="endTime" type="time" required value={formData.endTime} onChange={handleChange} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" name="endDate" type="date" required value={formData.endDate} onChange={handleChange} />
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="message">Additional Message (optional)</Label>
        <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={3} placeholder="Any special requests or details..." />
      </div>

      {previewAmount !== null && (
        <div className="bg-green-50 rounded-lg p-3 text-sm text-green-800 flex justify-between">
          <span>Estimated total</span>
          <span className="font-semibold">{formatCurrency(previewAmount)}</span>
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Submitting..." : "Submit Booking Inquiry"}
      </Button>

      <p className="text-xs text-gray-400 text-center">You will be contacted once the vendor confirms availability.</p>
    </form>
  )
}
