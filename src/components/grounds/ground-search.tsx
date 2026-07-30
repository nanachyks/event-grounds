"use client"
import { useRouter } from "next/navigation"
import { Input, Select } from "@/components/ui/input"
import { GROUND_CATEGORIES } from "@/lib/categories"

export default function GroundSearch({
  locations,
  currentLocation,
  currentCategory,
  currentQuery,
  currentCapacity,
  currentMinPrice,
  currentMaxPrice,
}: {
  locations?: string[]
  currentLocation?: string
  currentCategory?: string
  currentQuery?: string
  currentCapacity?: string
  currentMinPrice?: string
  currentMaxPrice?: string
}) {
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const params = new URLSearchParams()
    const query = form.get("query")?.toString()
    const location = form.get("location")?.toString()
    const category = form.get("category")?.toString()
    const capacity = form.get("capacity")?.toString()
    const minPrice = form.get("minPrice")?.toString()
    const maxPrice = form.get("maxPrice")?.toString()
    if (query) params.set("query", query)
    if (location) params.set("location", location)
    if (category) params.set("category", category)
    if (capacity) params.set("capacity", capacity)
    if (minPrice) params.set("minPrice", minPrice)
    if (maxPrice) params.set("maxPrice", maxPrice)
    router.push(`/grounds?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4">
        <Input name="query" placeholder="Search grounds..." defaultValue={currentQuery} />
        {locations && locations.length > 0 ? (
          <Select name="location" defaultValue={currentLocation ?? ""}>
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </Select>
        ) : (
          <Input name="location" placeholder="Location" defaultValue={currentLocation} />
        )}
        <Select name="category" defaultValue={currentCategory ?? ""}>
          <option value="">All categories</option>
          {GROUND_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
          ))}
        </Select>
        <Input name="capacity" type="number" placeholder="Min guests" defaultValue={currentCapacity} />
        <Input name="minPrice" type="number" placeholder="Min price (GHS)" defaultValue={currentMinPrice} />
        <Input name="maxPrice" type="number" placeholder="Max price (GHS)" defaultValue={currentMaxPrice} />
        <button type="submit" className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 transition">
          Search
        </button>
      </div>
    </form>
  )
}
