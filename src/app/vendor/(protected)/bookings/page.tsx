import Link from "next/link"
import { requireVendor } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function VendorBookingsPage() {
  const vendor = await requireVendor()
  if (!vendor) return null

  const bookings = await prisma.booking.findMany({
    where: { ground: { vendorId: vendor.vendorId! } },
    include: { ground: { select: { name: true, price: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">My Bookings</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Customer</th>
              <th className="text-left px-4 py-3 font-medium">Ground</th>
              <th className="text-left px-4 py-3 font-medium">Dates</th>
              <th className="text-left px-4 py-3 font-medium">Amount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-right px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-gray-500">No bookings yet.</td></tr>
            ) : bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{booking.customerName}</p>
                  <p className="text-gray-500 text-xs">{booking.customerEmail}</p>
                </td>
                <td className="px-4 py-3">{booking.ground.name}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                </td>
                <td className="px-4 py-3">{formatCurrency(booking.amount ?? booking.ground.price)}</td>
                <td className="px-4 py-3">
                  <Badge variant={booking.status === "paid" ? "success" : booking.status === "approved" ? "info" : booking.status === "pending" ? "warning" : "danger"}>
                    {booking.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(booking.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/vendor/bookings/${booking.id}`} className="text-green-600 hover:underline text-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
