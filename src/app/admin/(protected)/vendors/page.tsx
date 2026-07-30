import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminVendorsPage() {
  const vendors = await prisma.vendor.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { grounds: true } },
    },
  })

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">All Vendors</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Phone</th>
              <th className="text-left px-4 py-3 font-medium">Grounds</th>
              <th className="text-left px-4 py-3 font-medium">Commission</th>
              <th className="text-left px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{vendor.name}</td>
                <td className="px-4 py-3 text-gray-500">{vendor.email}</td>
                <td className="px-4 py-3 text-gray-500">{vendor.phone}</td>
                <td className="px-4 py-3">{vendor._count.grounds}</td>
                <td className="px-4 py-3 text-gray-500">{(vendor.commissionRate * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(vendor.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {vendors.length === 0 && <p className="text-gray-500 text-center py-10">No vendors yet.</p>}
      </div>
    </div>
  )
}
