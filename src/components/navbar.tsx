"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [scrolledPastHero, setScrolledPastHero] = useState(false)

  useEffect(() => {
    if (!isHome) return

    function handleScroll() {
      const hero = document.getElementById("hero")
      const threshold = hero ? hero.getBoundingClientRect().bottom : 0
      setScrolledPastHero(threshold <= 64)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isHome])

  const transparent = isHome && !scrolledPastHero

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        transparent ? "bg-transparent border-transparent" : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className={`text-xl font-bold transition-colors ${transparent ? "text-white" : "text-green-700"}`}>EventGrounds</Link>
          <div className="hidden sm:flex items-center gap-6">
            <Link href="/grounds" className={`text-sm transition-colors ${transparent ? "text-white hover:text-green-100" : "text-gray-600 hover:text-green-700"}`}>Browse Grounds</Link>
            <Link href="/vendor/login" className={`text-sm transition-colors ${transparent ? "text-white hover:text-green-100" : "text-gray-600 hover:text-green-700"}`}>Vendor</Link>
            <Link href="/admin/login" className={`text-sm transition-colors ${transparent ? "text-white hover:text-green-100" : "text-gray-600 hover:text-green-700"}`}>Admin</Link>
            <Link
              href="/grounds"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                transparent ? "bg-white text-green-700 hover:bg-green-50" : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              Book Now
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className={`sm:hidden p-2 transition-colors ${transparent ? "text-white" : "text-gray-900"}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        {open && (
          <div className={`sm:hidden pb-4 space-y-2 ${transparent ? "bg-black/60 rounded-b-lg px-2" : ""}`}>
            <Link href="/grounds" className={`block px-3 py-2 text-sm ${transparent ? "text-white" : "text-gray-600 hover:text-green-700"}`} onClick={() => setOpen(false)}>Browse Grounds</Link>
            <Link href="/vendor/login" className={`block px-3 py-2 text-sm ${transparent ? "text-white" : "text-gray-600 hover:text-green-700"}`} onClick={() => setOpen(false)}>Vendor</Link>
            <Link href="/admin/login" className={`block px-3 py-2 text-sm ${transparent ? "text-white" : "text-gray-600 hover:text-green-700"}`} onClick={() => setOpen(false)}>Admin</Link>
            <Link href="/grounds" className="block px-3 py-2 text-sm bg-green-600 text-white rounded-lg text-center" onClick={() => setOpen(false)}>Book Now</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
