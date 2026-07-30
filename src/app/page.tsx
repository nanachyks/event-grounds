import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { formatRate } from "@/lib/utils"
import HeroSlider from "@/components/hero-slider"
import CategoryBrowser from "@/components/category-browser"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const [featuredGrounds, locationRows] = await Promise.all([
    prisma.ground.findMany({
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.ground.findMany({
      where: { status: "active" },
      select: { location: true },
      distinct: ["location"],
      orderBy: { location: "asc" },
    }),
  ])
  const locations = locationRows.map((r) => r.location)

  const heroImages = featuredGrounds.map((g) => g.images[0]).filter(Boolean).slice(0, 5)

  return (
    <div>
      <div id="hero" className="relative h-[220vh] sm:h-[160vh] -mt-16">
        <section className="sticky top-0 min-h-screen text-white">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <HeroSlider images={heroImages} />
            {heroImages.length === 0 && (
              <div className="absolute inset-0 bg-gradient-to-br from-green-700 via-green-600 to-emerald-800" />
            )}
          </div>
          <div className="relative z-[1] max-w-7xl mx-auto px-6 py-32 sm:px-8 lg:px-12 text-left">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">Find Your Perfect<br />Event Ground</h1>
            <p className="text-lg sm:text-xl text-green-100 mb-10 max-w-2xl">
              Browse and book the best event venues across Ghana for weddings, corporate events, parties, and more.
            </p>
            {locations.length > 0 && (
              <form action="/grounds" method="GET" className="bg-white rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row gap-2 max-w-xl mb-6 shadow-lg">
                <select
                  name="location"
                  defaultValue=""
                  className="flex-1 rounded-xl sm:rounded-full px-4 py-2 text-gray-700 text-sm focus:outline-none"
                  aria-label="Filter by location"
                >
                  <option value="">Any location</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <button type="submit" className="bg-green-600 text-white rounded-xl sm:rounded-full px-6 py-2 text-sm font-semibold hover:bg-green-700 transition">
                  Search
                </button>
              </form>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-start">
              <Link href="/grounds" className="bg-white text-green-700 px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-50 transition">
                Browse Grounds
              </Link>
              <Link href="/vendor/signup" className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white/10 transition">
                List Your Ground
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section className="relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 pt-16 pb-6 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-700">Explore Our Space Categories</h2>
            <p className="text-gray-500 max-w-sm">Browse different types of spaces and find the one that fits your event.</p>
          </div>
          <CategoryBrowser />
        </div>
      </section>

      {featuredGrounds.length > 0 && (
        <section className="relative z-10 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-2 mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-700">Featured Venues</h2>
              <p className="text-gray-500 max-w-sm">A few of the venues currently open for booking.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredGrounds.map((ground) => (
                <Link key={ground.id} href={`/grounds/${ground.id}`} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="h-40 bg-gray-200 overflow-hidden">
                      {ground.images[0] ? (
                        <img src={ground.images[0]} alt={ground.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-1">{ground.name}</h3>
                      <p className="text-sm text-gray-500 mb-2">{ground.location}</p>
                      <span className="text-green-700 font-bold text-sm">{formatRate(ground.pricingType, ground.price, ground.hourlyRate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/grounds" className="text-green-600 hover:underline font-medium">View all venues &rarr;</Link>
            </div>
          </div>
        </section>
      )}

      <section className="relative z-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">Book your event ground in three simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Browse", desc: "Explore our curated list of event grounds across Ghana with photos, amenities, and pricing." },
              { step: "02", title: "Inquire", desc: "Select your preferred dates and submit a booking inquiry. We&apos;ll confirm availability." },
              { step: "03", title: "Confirm", desc: "Pay securely via Paystack and get your booking confirmed instantly." },
            ].map((item) => (
              <div key={item.step} className="text-center p-6">
                <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-stone-900 text-amber-50 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm mb-3">Our Mission</p>
          <h2 className="text-4xl font-extrabold mb-6">Trusted Venues, Across Every Corner of Ghana</h2>
          <p className="text-stone-300 mb-10 max-w-xl mx-auto text-lg">
            From Accra to Kumasi, we connect event organizers with venues worth remembering — and give hosts the tools to fill their calendars.
          </p>
          <Link href="/grounds" className="inline-block bg-amber-500 text-stone-900 px-8 py-3 rounded-full text-lg font-semibold hover:bg-amber-400 transition">
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  )
}
