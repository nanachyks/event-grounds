import type { MetadataRoute } from "next"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/vendor/login",
        "/vendor/forgot-password",
        "/vendor/reset-password",
        "/vendor/grounds",
        "/vendor/bookings",
        "/api/",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  }
}
