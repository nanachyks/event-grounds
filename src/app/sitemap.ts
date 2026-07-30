import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const grounds = await prisma.ground.findMany({
    where: { status: "active" },
    select: { id: true, updatedAt: true },
  })

  const groundEntries: MetadataRoute.Sitemap = grounds.map((ground) => ({
    url: `${APP_URL}/grounds/${ground.id}`,
    lastModified: ground.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [
    {
      url: APP_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${APP_URL}/grounds`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${APP_URL}/vendor/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...groundEntries,
  ]
}
