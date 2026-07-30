export const GROUND_CATEGORIES = [
  {
    value: "garden",
    label: "Garden & Outdoor",
    icon: "🌿",
    image: "https://res.cloudinary.com/demo/image/upload/samples/landscapes/nature-mountains.jpg",
  },
  {
    value: "hall",
    label: "Event Hall",
    icon: "🏛️",
    image: "https://res.cloudinary.com/demo/image/upload/samples/landscapes/architecture-signs.jpg",
  },
  {
    value: "conference",
    label: "Conference & Meeting",
    icon: "🧑‍💼",
    image: "https://res.cloudinary.com/demo/image/upload/samples/chair-and-coffee-table.jpg",
  },
  {
    value: "studio",
    label: "Creative Studio",
    icon: "🎙️",
    image: "https://res.cloudinary.com/demo/image/upload/samples/upscale-face-1.jpg",
  },
  {
    value: "sports",
    label: "Sports Field",
    icon: "⚽",
    image: "https://res.cloudinary.com/demo/image/upload/samples/bike.jpg",
  },
  {
    value: "beach",
    label: "Beach & Poolside",
    icon: "🏖️",
    image: "https://res.cloudinary.com/demo/image/upload/samples/landscapes/beach-boat.jpg",
  },
] as const

export type GroundCategory = (typeof GROUND_CATEGORIES)[number]["value"]

export function getCategoryLabel(value: string | null | undefined): string | null {
  return GROUND_CATEGORIES.find((c) => c.value === value)?.label ?? null
}
