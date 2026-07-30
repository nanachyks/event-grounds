import Link from "next/link"
import { requireVendor } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function VendorDashboardPage() {
  const vendor = await requireVendor()
  if (!vendor) return null

  const recentBookings = await prisma.booking.findMany({
    where: { ground: { vendorId: vendor.vendorId! } },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { ground: { select: { name: true } } },
  })

  return (
    <div>
      <Card className="mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
        </div>
        <div className="p-6">
          {recentBookings.length === 0 ? (
            <p className="text-gray-500">No bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <Link key={booking.id} href={`/vendor/bookings/${booking.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                  <div>
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.ground.name}</p>
                  </div>
                  <Badge variant={booking.status === "paid" ? "success" : booking.status === "approved" ? "info" : booking.status === "pending" ? "warning" : "danger"}>
                    {booking.status}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/vendor/bookings" className="block text-center text-sm text-green-600 hover:underline mt-4">View all bookings</Link>
        </div>
      </Card>
    </div>
  )
}
