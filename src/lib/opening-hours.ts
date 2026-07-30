export interface OpeningHoursEntry {
  day: number // 0=Sunday .. 6=Saturday
  open: string // "HH:mm"
  close: string // "HH:mm"
  closed?: boolean
}

export function isWithinOpeningHours(
  openingHours: OpeningHoursEntry[] | null | undefined,
  date: Date,
  startTime: string,
  endTime: string
): boolean {
  if (!openingHours || openingHours.length === 0) return true

  const entry = openingHours.find((e) => e.day === date.getDay())
  if (!entry || entry.closed) return false

  return startTime >= entry.open && endTime <= entry.close
}
