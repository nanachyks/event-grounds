import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatRate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import GroundModerateButtons from "@/components/admin/ground-moderate-buttons"

export const dynamic = "force-dynamic"

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  active: "success",
  pending: "warning",
  rejected: "danger",
}

export default async function AdminGroundsPage() {
  const allGrounds = await prisma.ground.findMany({
    include: { vendor: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  })
  const grounds = [...allGrounds].sort((a, b) => (a.status === "pending" ? -1 : b.status === "pending" ? 1 : 0))
  const pendingCount = grounds.filter((g) => g.status === "pending").length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">All Grounds</h2>
        <Link href="/admin/grounds/new"><Button>Add Ground</Button></Link>
      </div>

      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3 mb-4">
          {pendingCount} listing{pendingCount > 1 ? "s" : ""} awaiting approval before {pendingCount > 1 ? "they" : "it"}{" "}can go live.
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Vendor</th>
              <th className="text-left px-4 py-3 font-medium">Location</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {grounds.map((ground) => (
              <tr key={ground.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{ground.name}</td>
                <td className="px-4 py-3 text-gray-500">{ground.vendor.name}</td>
                <td className="px-4 py-3 text-gray-500">{ground.location}</td>
                <td className="px-4 py-3">{formatRate(ground.pricingType, ground.price, ground.hourlyRate)}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[ground.status] ?? "default"}>{ground.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4 justify-end">
                    {ground.status === "pending" && <GroundModerateButtons groundId={ground.id} />}
                    <Link href={`/admin/grounds/${ground.id}/edit`} className="text-green-600 hover:underline text-sm">Edit</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {grounds.length === 0 && <p className="text-gray-500 text-center py-10">No grounds yet.</p>}
      </div>
    </div>
  )
}
