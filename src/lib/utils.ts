export function calcCommission(amount: number, rate?: number): { commission: number; vendorNet: number } {
  const commissionRate = rate ?? parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.02')
  const commission = amount * commissionRate
  const vendorNet = amount - commission
  return { commission, vendorNet }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-GH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatRate(pricingType: string, dailyRate?: number | null, hourlyRate?: number | null): string {
  const parts: string[] = []
  if ((pricingType === 'daily' || pricingType === 'both') && dailyRate) parts.push(`${formatCurrency(dailyRate)}/day`)
  if ((pricingType === 'hourly' || pricingType === 'both') && hourlyRate) parts.push(`${formatCurrency(hourlyRate)}/hr`)
  return parts.join(' · ')
}
