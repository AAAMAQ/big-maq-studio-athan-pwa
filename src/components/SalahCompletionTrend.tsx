import { useId } from 'react'
import type { SalahTrendPoint } from '../lib/salahInsights'

export default function SalahCompletionTrend({ points, interval }: { points: SalahTrendPoint[]; interval: "day" | "week" | "month" }) {
  const titleId = useId()
  const width = 480
  const height = 240
  const left = 54
  const right = 18
  const top = 24
  const bottom = 48
  const availableWidth = width - left - right
  const availableHeight = height - top - bottom
  const values = points.flatMap((point) => point.rate === null ? [] : [point.rate])
  if (values.length === 0) {
    return <section className="rounded-lg bg-gray-800 p-4" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-lg font-semibold">Completion trend line</h2>
      <p className="mt-2 text-sm text-gray-400">No logged data in this period to plot.</p>
    </section>
  }

  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  let minRate = Math.max(0, Math.floor((rawMin - 5) / 5) * 5)
  let maxRate = Math.min(100, Math.ceil((rawMax + 5) / 5) * 5)
  if (maxRate - minRate < 10) {
    if (minRate === 0) maxRate = 10
    else if (maxRate === 100) minRate = 90
    else {
      minRate = Math.max(0, minRate - 5)
      maxRate = Math.min(100, maxRate + 5)
    }
  }
  const rateSpan = maxRate - minRate || 1
  const xFor = (index: number) => left + (points.length < 2 ? availableWidth / 2 : index * availableWidth / (points.length - 1))
  const yFor = (rate: number) => top + ((maxRate - rate) / rateSpan) * availableHeight
  const plotted = points.map((point, index) => point.rate === null
    ? null
    : { ...point, index, x: xFor(index), y: yFor(point.rate) })
  const validIndices = plotted.flatMap((point, index) => point ? [index] : [])

  const segments: string[] = []
  let segment: string[] = []
  for (const point of plotted) {
    if (!point) {
      if (segment.length) segments.push(segment.join(' '))
      segment = []
      continue
    }
    segment.push(`${segment.length ? 'L' : 'M'} ${point.x} ${point.y}`)
  }
  if (segment.length) segments.push(segment.join(' '))

  const validPoints = plotted.filter((point): point is NonNullable<typeof point> => point !== null)
  const firstPoint = validPoints[0]
  const lastPoint = validPoints.at(-1)!
  const direction = values.length < 2
    ? 'One logged period is available; add another period to see a direction.'
    : lastPoint.rate! > firstPoint.rate!
      ? `Up ${lastPoint.rate! - firstPoint.rate!} percentage points, from ${firstPoint.rate}% (${firstPoint.completed}/${firstPoint.logged} logged) to ${lastPoint.rate}% (${lastPoint.completed}/${lastPoint.logged} logged).`
      : lastPoint.rate! < firstPoint.rate!
        ? `Down ${firstPoint.rate! - lastPoint.rate!} percentage points, from ${firstPoint.rate}% (${firstPoint.completed}/${firstPoint.logged} logged) to ${lastPoint.rate}% (${lastPoint.completed}/${lastPoint.logged} logged).`
        : `Steady at ${firstPoint.rate}% from first to last logged period (${firstPoint.completed}/${firstPoint.logged} and ${lastPoint.completed}/${lastPoint.logged} logged).`
  const loggedPeriods = values.length
  const labelFor = (label: string) => label.replace(/^Week of /, '')

  return (
    <section className="rounded-lg bg-gray-800 p-4" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-lg font-semibold">Completion trend line</h2>
      <p className="mt-1 text-sm text-gray-300">{direction} Across {loggedPeriods} periods with logged data.</p>
      <p className="mt-1 text-xs text-gray-400">Rates use completed ÷ logged prayers. The vertical scale adjusts to this period’s data; gaps mean no prayers were logged.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${interval === 'day' ? 'Daily' : interval === 'month' ? 'Monthly' : 'Weekly'} completion rates. ${direction} ${loggedPeriods} logged periods.`} className="mx-auto block h-auto w-full max-w-2xl">
          <title>Prayer completion trend</title>
          <desc>Line graph of completed prayers divided by logged prayers for each {interval}.</desc>
          {[maxRate, Math.round((maxRate + minRate) / 2), minRate].map((rate) => {
            const y = yFor(rate)
            return <g key={rate}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#475569" strokeDasharray="3 5" />
              <text x={left - 10} y={y + 4} textAnchor="end" fill="#cbd5e1" fontSize="16">{rate}%</text>
            </g>
          })}
          <line x1={left} y1={top + availableHeight} x2={width - right} y2={top + availableHeight} stroke="#64748b" />
          {segments.map((path, index) => <path key={index} d={path} fill="none" stroke="#2dd4bf" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />)}
          {plotted.map((point, index) => point && (
            <g key={point.key}>
              <circle cx={point.x} cy={point.y} r="5" fill="#2dd4bf" stroke="#0f172a" strokeWidth="2">
                <title>{`${point.label}: ${point.rate}% (${point.completed}/${point.logged} logged prayers)`}</title>
              </circle>
              {index === validIndices[0] || index === validIndices.at(-1)
                ? <text x={point.x} y={height - 16} textAnchor={index === validIndices[0] ? 'start' : 'end'} fill="#cbd5e1" fontSize="16">{labelFor(point.label)}</text>
                : null}
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
