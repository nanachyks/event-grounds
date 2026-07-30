import type { Metadata } from "next"
import { redirect } from "next/navigation"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { requireAdmin } from "@/lib/auth-helpers"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin()
  if (!admin) redirect("/admin/login")

  return (
    <div className="lg:flex bg-gray-50 min-h-screen">
      <AdminSidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-7xl">{children}</main>
    </div>
  )
}
