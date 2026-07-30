import { describe, it, expect } from "vitest"
import { calcCommission, formatCurrency, formatRate } from "./utils"

describe("calcCommission", () => {
  it("splits an amount into commission and vendor net using the given rate", () => {
    expect(calcCommission(1000, 0.1)).toEqual({ commission: 100, vendorNet: 900 })
  })

  it("returns the full amount as vendor net when the rate is 0", () => {
    expect(calcCommission(1000, 0)).toEqual({ commission: 0, vendorNet: 1000 })
  })
})

describe("formatCurrency", () => {
  it("formats an amount as GHS currency with 2 decimal places", () => {
    expect(formatCurrency(1000)).toContain("1,000.00")
  })
})

describe("formatRate", () => {
  it("shows a daily rate for daily pricing", () => {
    expect(formatRate("daily", 500, null)).toContain("500.00/day")
  })

  it("shows an hourly rate for hourly pricing", () => {
    expect(formatRate("hourly", null, 50)).toContain("50.00/hr")
  })

  it("shows both rates for 'both' pricing, joined together", () => {
    const result = formatRate("both", 500, 50)
    expect(result).toContain("500.00/day")
    expect(result).toContain("50.00/hr")
    expect(result).toContain(" · ")
  })

  it("returns an empty string when the relevant rate is missing", () => {
    expect(formatRate("daily", null, null)).toBe("")
  })
})
