import { describe, it, expect } from "vitest"
import { calculateAmount } from "./pricing"

describe("calculateAmount", () => {
  it("charges hourly rate x hours for hourly pricing", () => {
    const start = new Date("2026-01-01T10:00:00Z")
    const end = new Date("2026-01-01T12:00:00Z")
    expect(calculateAmount({ pricingType: "hourly", hourlyRate: 100, startDate: start, endDate: end })).toBe(200)
  })

  it("charges at least a 1-hour minimum for hourly pricing", () => {
    const start = new Date("2026-01-01T10:00:00Z")
    const end = new Date("2026-01-01T10:30:00Z")
    expect(calculateAmount({ pricingType: "hourly", hourlyRate: 100, startDate: start, endDate: end })).toBe(100)
  })

  it("returns 0 for hourly pricing with no hourly rate set", () => {
    const start = new Date("2026-01-01T10:00:00Z")
    const end = new Date("2026-01-01T12:00:00Z")
    expect(calculateAmount({ pricingType: "hourly", hourlyRate: null, startDate: start, endDate: end })).toBe(0)
  })

  it("charges daily rate x days for daily pricing, minimum 1 day", () => {
    const start = new Date("2026-01-01T00:00:00Z")
    const end = new Date("2026-01-01T00:00:00Z")
    expect(calculateAmount({ pricingType: "daily", dailyRate: 500, startDate: start, endDate: end })).toBe(500)
  })

  it("rounds partial days up for daily pricing", () => {
    const start = new Date("2026-01-01T00:00:00Z")
    const end = new Date("2026-01-03T12:00:00Z")
    expect(calculateAmount({ pricingType: "daily", dailyRate: 500, startDate: start, endDate: end })).toBe(1500)
  })

  it("returns 0 for daily pricing with no daily rate set", () => {
    const start = new Date("2026-01-01T00:00:00Z")
    const end = new Date("2026-01-02T00:00:00Z")
    expect(calculateAmount({ pricingType: "daily", dailyRate: null, startDate: start, endDate: end })).toBe(0)
  })

  it("uses the hourly rate for 'both' pricing when rateMode is hourly", () => {
    const start = new Date("2026-01-01T10:00:00Z")
    const end = new Date("2026-01-01T13:00:00Z")
    expect(
      calculateAmount({ pricingType: "both", dailyRate: 500, hourlyRate: 50, rateMode: "hourly", startDate: start, endDate: end })
    ).toBe(150)
  })

  it("defaults 'both' pricing to daily when rateMode is not given", () => {
    const start = new Date("2026-01-01T00:00:00Z")
    const end = new Date("2026-01-02T00:00:00Z")
    expect(
      calculateAmount({ pricingType: "both", dailyRate: 500, hourlyRate: 50, startDate: start, endDate: end })
    ).toBe(500)
  })
})
