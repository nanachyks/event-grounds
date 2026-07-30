import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import StatCard from "@/components/admin/stat-card"
import BookingTrendChart from "@/components/admin/booking-trend-chart"

export const dynamic = "force-dynamic"

async function getStats() {
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13)
  fourteenDaysAgo.setHours(0, 0, 0, 0)

  const [groundsCount, bookingsCount, pendingCount, paidCount, vendorsCount, totalRevenue, recentBookings, trendBookings] =
    await Promise.all([
      prisma.ground.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "pending" } }),
      prisma.booking.count({ where: { status: "paid" } }),
      prisma.vendor.count(),
      prisma.payment.aggregate({ where: { status: "success" }, _sum: { amount: true } }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { ground: { select: { name: true } } },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
    ])

  const dayBuckets: { label: string; value: number }[] = []
  for (let i = 0; i < 14; i++) {
    const day = new Date(fourteenDaysAgo)
    day.setDate(day.getDate() + i)
    const count = trendBookings.filter((b) => {
      const created = new Date(b.createdAt)
      return created.getFullYear() === day.getFullYear() && created.getMonth() === day.getMonth() && created.getDate() === day.getDate()
    }).length
    dayBuckets.push({ label: day.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), value: count })
  }

  return {
    groundsCount,
    bookingsCount,
    pendingCount,
    paidCount,
    vendorsCount,
    totalRevenue: totalRevenue._sum.amount || 0,
    recentBookings,
    trend: dayBuckets,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Welcome back, here&apos;s what&apos;s happening across EventGrounds.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <StatCard label="Total Grounds" value={stats.groundsCount} icon="⌂" color="green" />
        <StatCard label="Total Bookings" value={stats.bookingsCount} icon="☷" color="blue" />
        <StatCard label="Pending" value={stats.pendingCount} icon="⏳" color="amber" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Confirmed" value={stats.paidCount} icon="✓" color="teal" />
        <StatCard label="Vendors" value={stats.vendorsCount} icon="▤" color="purple" />
        <StatCard label="Revenue" value={formatCurrency(stats.totalRevenue)} icon="₵" color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Recent Bookings</h2>
          </div>
          <div className="p-6">
            {stats.recentBookings.length === 0 ? (
              <p className="text-gray-500">No bookings yet.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentBookings.map((booking) => (
                  <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
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
            <Link href="/admin/bookings" className="block text-center text-sm text-green-600 hover:underline mt-4">View all bookings</Link>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold">Bookings, Last 14 Days</h2>
          </div>
          <div className="p-6">
            <BookingTrendChart data={stats.trend} />
          </div>
        </div>
      </div>
    </div>
  )
}
