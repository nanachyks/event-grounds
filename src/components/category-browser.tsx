"use client"
import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { GROUND_CATEGORIES } from "@/lib/categories"

export default function CategoryBrowser() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function updateScrollState() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    updateScrollState()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener("scroll", updateScrollState, { passive: true })
    window.addEventListener("resize", updateScrollState)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      window.removeEventListener("resize", updateScrollState)
    }
  }, [])

  function scrollByCard(direction: 1 | -1) {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector("a")
    const amount = card ? card.clientWidth + 16 : 260
    el.scrollBy({ left: direction * amount, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-proximity scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {GROUND_CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={`/grounds?category=${c.value}`}
            className="group relative shrink-0 w-[200px] sm:w-[240px] aspect-[3/4] rounded-2xl overflow-hidden snap-start"
          >
            <img
              src={c.image}
              alt={c.label}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 text-white text-lg font-semibold text-center px-4">
                {c.icon} {c.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          aria-label="Scroll categories left"
          className="flex absolute left-2 top-[calc(50%-16px)] -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full items-center justify-center transition"
        >
          &#8249;
        </button>
      )}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          aria-label="Scroll categories right"
          className="flex absolute right-2 top-[calc(50%-16px)] -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full items-center justify-center transition"
        >
          &#8250;
        </button>
      )}
    </div>
  )
}
