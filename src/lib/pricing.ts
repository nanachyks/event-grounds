export type PricingType = "daily" | "hourly" | "both"

export interface CalculateAmountInput {
  pricingType: PricingType
  dailyRate?: number | null
  hourlyRate?: number | null
  startDate: Date
  endDate: Date
  rateMode?: "daily" | "hourly"
}

export function calculateAmount({ pricingType, dailyRate, hourlyRate, startDate, endDate, rateMode }: CalculateAmountInput): number {
  const effectiveMode = pricingType === "both" ? rateMode ?? "daily" : pricingType

  if (effectiveMode === "hourly") {
    if (!hourlyRate) return 0
    const hours = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))
    return hours * hourlyRate
  }

  if (!dailyRate) return 0
  const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
  return days * dailyRate
}
