import Link from "next/link"
import { requireVendor } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { formatRate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  active: "success",
  pending: "warning",
  rejected: "danger",
}

export default async function VendorGroundsPage() {
  const vendor = await requireVendor()
  if (!vendor) return null

  const grounds = await prisma.ground.findMany({
    where: { vendorId: vendor.vendorId! },
    orderBy: { createdAt: "desc" },
  })
  const pendingCount = grounds.filter((g) => g.status === "pending").length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">My Grounds</h2>
        <Link href="/vendor/grounds/new"><Button>Add Ground</Button></Link>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
          {pendingCount} listing{pendingCount > 1 ? "s" : ""} awaiting admin review — {pendingCount > 1 ? "they" : "it"}{" "}won&apos;t appear publicly until approved.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grounds.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">No grounds yet. Add your first venue to start receiving bookings.</td></tr>
            ) : grounds.map((ground) => (
              <tr key={ground.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{ground.name}</td>
                <td className="px-4 py-3 text-gray-500">{ground.location}</td>
                <td className="px-4 py-3">{formatRate(ground.pricingType, ground.price, ground.hourlyRate)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[ground.status] ?? "default"}>{ground.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/vendor/grounds/${ground.id}/edit`} className="text-green-600 hover:underline text-sm">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
