"use client"
import { useState } from "react"
import { format, addDays, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns"

interface BookedDateRange {
  startDate: Date
  endDate: Date
}

export default function AvailabilityCalendar({ bookedDates }: { bookedDates: BookedDateRange[] }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today)
  const [selectedStart, setSelectedStart] = useState<Date | null>(null)
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null)

  const daysInMonth = eachDayOfInterval({
    start: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
    end: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0),
  })

  const startDay = daysInMonth[0].getDay()

  function isBooked(date: Date): boolean {
    return bookedDates.some((range) =>
      isWithinInterval(date, { start: new Date(range.startDate), end: new Date(range.endDate) })
    )
  }

  function isSelected(date: Date): boolean {
    if (selectedStart && !selectedEnd) return isSameDay(date, selectedStart)
    if (selectedStart && selectedEnd) {
      return isWithinInterval(date, { start: selectedStart, end: selectedEnd })
    }
    return false
  }

  function handleDateClick(date: Date) {
    if (isBooked(date) || date < today) return
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date)
      setSelectedEnd(null)
    } else {
      if (date < selectedStart) {
        setSelectedStart(date)
      } else {
        setSelectedEnd(date)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded">&larr;</button>
        <span className="font-semibold">{format(currentMonth, "MMMM yyyy")}</span>
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded">&rarr;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-gray-500 font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {daysInMonth.map((date) => {
          const booked = isBooked(date)
          const selected = isSelected(date)
          const past = date < today
          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              disabled={booked || past}
              className={`py-2 text-sm rounded-lg transition ${
                booked || past ? "bg-gray-100 text-gray-300 cursor-not-allowed" :
                selected ? "bg-green-600 text-white" :
                "hover:bg-green-50 cursor-pointer"
              }`}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 rounded" /> Booked</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-600 rounded" /> Selected</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border rounded" /> Available</div>
      </div>
    </div>
  )
}
