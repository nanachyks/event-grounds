import { describe, it, expect } from "vitest"
import { isWithinOpeningHours, type OpeningHoursEntry } from "./opening-hours"

const hours: OpeningHoursEntry[] = [
  { day: 0, open: "00:00", close: "00:00", closed: true },
  { day: 1, open: "08:00", close: "18:00" },
  { day: 2, open: "08:00", close: "18:00" },
  { day: 3, open: "08:00", close: "18:00" },
  { day: 4, open: "08:00", close: "18:00" },
  { day: 5, open: "08:00", close: "20:00" },
  { day: 6, open: "10:00", close: "20:00" },
]

describe("isWithinOpeningHours", () => {
  it("allows any time when no opening hours are configured", () => {
    expect(isWithinOpeningHours(null, new Date("2026-01-05"), "02:00", "03:00")).toBe(true)
    expect(isWithinOpeningHours([], new Date("2026-01-05"), "02:00", "03:00")).toBe(true)
  })

  it("allows a booking fully within the day's open/close window", () => {
    const monday = new Date("2026-01-05T00:00:00")
    expect(isWithinOpeningHours(hours, monday, "09:00", "17:00")).toBe(true)
  })

  it("rejects a booking that starts before opening", () => {
    const monday = new Date("2026-01-05T00:00:00")
    expect(isWithinOpeningHours(hours, monday, "07:00", "10:00")).toBe(false)
  })

  it("rejects a booking that ends after closing", () => {
    const monday = new Date("2026-01-05T00:00:00")
    expect(isWithinOpeningHours(hours, monday, "17:00", "19:00")).toBe(false)
  })

  it("rejects a booking on a day explicitly marked closed", () => {
    const sunday = new Date("2026-01-04T00:00:00")
    expect(isWithinOpeningHours(hours, sunday, "10:00", "12:00")).toBe(false)
  })

  it("rejects a booking on a day missing from the schedule", () => {
    const partialHours = hours.filter((h) => h.day !== 6)
    const saturday = new Date("2026-01-10T00:00:00")
    expect(isWithinOpeningHours(partialHours, saturday, "10:00", "12:00")).toBe(false)
  })
})
