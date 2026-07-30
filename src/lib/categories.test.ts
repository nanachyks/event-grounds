import { describe, it, expect } from "vitest"
import { getCategoryLabel, GROUND_CATEGORIES } from "./categories"

describe("getCategoryLabel", () => {
  it("returns the label for a known category value", () => {
    expect(getCategoryLabel("garden")).toBe("Garden & Outdoor")
  })

  it("returns null for an unknown category value", () => {
    expect(getCategoryLabel("not-a-real-category")).toBeNull()
  })

  it("returns null for null or undefined", () => {
    expect(getCategoryLabel(null)).toBeNull()
    expect(getCategoryLabel(undefined)).toBeNull()
  })

  it("has a unique, non-empty label for every category", () => {
    const labels = GROUND_CATEGORIES.map((c) => c.label)
    expect(new Set(labels).size).toBe(labels.length)
    labels.forEach((label) => expect(label.length).toBeGreaterThan(0))
  })
})
