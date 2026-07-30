export default function BookingTrendChart({ data }: { data: { label: string; value: number }[] }) {
  const width = 600
  const height = 200
  const padding = 24
  const max = Math.max(1, ...data.map((d) => d.value))

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(1, data.length - 1)) * (width - padding * 2)
    const y = height - padding - (d.value / max) * (height - padding * 2)
    return { x, y }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")
  const areaPath = `${linePath} L${points[points.length - 1]?.x.toFixed(1) ?? padding},${height - padding} L${padding},${height - padding} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bookingTrendFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#16a34a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#bookingTrendFill)" />
      <path d={linePath} fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#16a34a" />
      ))}
      <text x={padding} y={height - 4} fontSize="10" fill="#9ca3af">{data[0]?.label}</text>
      <text x={width - padding} y={height - 4} fontSize="10" fill="#9ca3af" textAnchor="end">{data[data.length - 1]?.label}</text>
    </svg>
  )
}
