import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { requireVendor } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import LogoutButton from "@/components/logout-button"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { robots: { index: false, follow: false } }

async function getStats(vendorId: string) {
  const [groundsCount, bookingsCount, pendingCount, paidCount, totalRevenue] = await Promise.all([
    prisma.ground.count({ where: { vendorId } }),
    prisma.booking.count({ where: { ground: { vendorId } } }),
    prisma.booking.count({ where: { ground: { vendorId }, status: "pending" } }),
    prisma.booking.count({ where: { ground: { vendorId }, status: "paid" } }),
    prisma.payment.aggregate({
      where: { status: "success", booking: { ground: { vendorId } } },
      _sum: { vendorNet: true },
    }),
  ])
  return { groundsCount, bookingsCount, pendingCount, paidCount, totalRevenue: totalRevenue._sum.vendorNet || 0 }
}

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const vendor = await requireVendor()
  if (!vendor) redirect("/vendor/login")

  const stats = await getStats(vendor.vendorId!)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="w-full sm:w-auto">
            <Link href="/vendor" className="text-2xl font-bold hover:text-green-700 block">Vendor Dashboard</Link>
            <p className="text-gray-500">Welcome back, {vendor.name}</p>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Link href="/vendor" className="text-sm text-gray-600 hover:text-green-700">Dashboard</Link>
            <Link href="/vendor/grounds" className="text-sm text-gray-600 hover:text-green-700">My Grounds</Link>
            <Link href="/vendor/bookings" className="text-sm text-gray-600 hover:text-green-700">My Bookings</Link>
            <LogoutButton redirectTo="/vendor/login" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 w-full mt-4 sm:hidden">
          <Link href="/vendor" className="text-center text-sm font-medium text-gray-600 hover:text-green-700 bg-gray-50 rounded-lg py-2">Dashboard</Link>
          <Link href="/vendor/grounds" className="text-center text-sm font-medium text-gray-600 hover:text-green-700 bg-gray-50 rounded-lg py-2">My Grounds</Link>
          <Link href="/vendor/bookings" className="text-center text-sm font-medium text-gray-600 hover:text-green-700 bg-gray-50 rounded-lg py-2">My Bookings</Link>
        </div>
        <div className="mt-2 sm:hidden">
          <LogoutButton redirectTo="/vendor/login" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">My Grounds</p>
            <p className="text-2xl font-bold">{stats.groundsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Bookings</p>
            <p className="text-2xl font-bold">{stats.bookingsCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Net Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
          </CardContent>
        </Card>
      </div>

      {children}
    </div>
  )
}
