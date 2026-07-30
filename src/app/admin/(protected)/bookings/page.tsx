import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: { ground: { select: { name: true, price: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <h2 className="text-lg font-semibold mb-6">All Bookings</h2>

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
            {bookings.map((booking) => (
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
                  <Link href={`/admin/bookings/${booking.id}`} className="text-green-600 hover:underline text-sm">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
