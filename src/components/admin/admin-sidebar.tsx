"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import LogoutButton from "@/components/logout-button"

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "▦", exact: true },
  { href: "/admin/grounds", label: "Grounds", icon: "⌂" },
  { href: "/admin/bookings", label: "Bookings", icon: "☷" },
  { href: "/admin/vendors", label: "Vendors", icon: "▤" },
  { href: "/admin/audit-log", label: "Audit Log", icon: "🕘" },
]

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
              active ? "bg-green-600 text-white" : "text-green-100 hover:bg-green-900/60"
            }`}
          >
            <span className="text-base w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 bg-green-950 min-h-screen px-4 py-6">
        <Link href="/admin" className="block text-white text-xl font-bold px-4 mb-8">
          EventGrounds <span className="text-green-400">Admin</span>
        </Link>
        <NavLinks pathname={pathname} />
        <div className="mt-auto px-2 pt-6">
          <LogoutButton redirectTo="/admin/login" />
        </div>
      </aside>

      <div className="lg:hidden flex items-center justify-between bg-green-950 px-4 py-3">
        <Link href="/admin" className="text-white text-lg font-bold">
          EventGrounds <span className="text-green-400">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          className="text-white text-2xl leading-none px-2"
        >
          &#9776;
        </button>
      </div>
      {mobileOpen && (
        <div className="lg:hidden bg-green-950 px-4 pb-4">
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <div className="pt-4">
            <LogoutButton redirectTo="/admin/login" />
          </div>
        </div>
      )}
    </>
  )
}
