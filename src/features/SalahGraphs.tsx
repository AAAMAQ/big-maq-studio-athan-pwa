import { useMemo, useState } from 'react'
import { calculateSalahRangeInsights, formatSalahDate, parseSalahDate, SALAH_PRAYERS, type SalahRangeSelection } from '../lib/salahInsights'
import { useSalahData } from '../lib/useSalahData'
import SalahRangePicker from './SalahRangePicker'

export default function SalahGraphs({ onOpenDay }: { onOpenDay: (date: string) => void }) {
  const { store, todayKey } = useSalahData()
  const [selection, setSelection] = useState<SalahRangeSelection>({ kind: 'preset', period: 'month' })
  const result = useMemo(() => {
    try { return { insights: calculateSalahRangeInsights(store, selection, parseSalahDate(todayKey)!), error: '' } }
    catch (error) { return { insights: null, error: error instanceof Error ? error.message : 'Choose a valid range.' } }
  }, [store, selection, todayKey])
  const insights = result.insights

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4">
      <header><h1 className="text-2xl font-bold">Graph Insights</h1><p className="mt-1 text-sm text-gray-400">Visual patterns from prayers you logged. Empty periods have no rate.</p></header>
      <SalahRangePicker value={selection} onChange={setSelection} />
      {result.error ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{result.error}</p> : null}
      {insights ? (
        <>
          <p className="text-sm text-gray-300">{insights.periodLabel} · {insights.rangeLabel} · {insights.daysWithLogs} day{insights.daysWithLogs === 1 ? '' : 's'} with obligatory logs</p>
          <p className="rounded-lg bg-gray-800 p-4 text-sm"><span className="font-semibold text-teal-300">★ {insights.stars.total}/{insights.stars.possible} stars</span> · {insights.stars.averagePerDay === null ? 'No recorded-time average yet' : `${insights.stars.averagePerDay.toFixed(2)}/5 average across ${insights.stars.elapsedDays} elapsed days`}. Blank past days earn zero stars; the existing graphs below use logged-data rates.</p>
          <section className="rounded-lg bg-gray-800 p-4 space-y-4">
            <h2 className="text-lg font-semibold">Prayer completion</h2>
            {SALAH_PRAYERS.map((prayer) => {
              const item = insights.prayers[prayer]
              return (
                <div key={prayer}>
                  <div className="flex justify-between gap-2 text-sm"><span>{prayer}</span><span className="text-gray-300">{item.rate === null ? 'No logged data' : `${item.rate}% · ${item.completed}/${item.logged} logged`}</span></div>
                  <div role="img" aria-label={`${prayer}: ${item.rate === null ? 'no logged data' : `${item.completed} of ${item.logged} logged prayers completed, ${item.rate}%`}`} className={`mt-1 h-4 rounded ${item.rate === null ? 'border border-dashed border-gray-500 bg-gray-900' : 'bg-gray-700'}`}><div className="h-full rounded bg-teal-500" style={{ width: `${item.rate ?? 0}%` }} /></div>
                </div>
              )
            })}
          </section>
          <LineTrend insights={insights} />
          <section className="rounded-lg bg-gray-800 p-4 space-y-3">
            <h2 className="text-lg font-semibold">{insights.trendInterval === 'month' ? 'Monthly' : 'Weekly'} trend</h2>
            <p className="text-xs text-gray-400">Select a period to open its first day in the tracker. Each rate uses logged prayers only.</p>
            {insights.trend.map((point) => {
              const date = point.key < formatSalahDate(insights.start) ? formatSalahDate(insights.start) : point.key
              return (
                <button key={point.key} type="button" onClick={() => onOpenDay(date)} className="block w-full rounded bg-gray-900 p-3 text-left hover:outline hover:outline-1 hover:outline-teal-500 focus:outline focus:outline-2 focus:outline-teal-400" aria-label={`${point.label}: ${point.rate === null ? 'no logged data' : `${point.completed} of ${point.logged} logged prayers completed, ${point.rate}%`}. Open ${date} in tracker`}>
                  <span className="flex justify-between gap-2 text-sm"><span>{point.label}</span><span className="text-gray-300">{point.rate === null ? 'No logged data' : `${point.rate}% · ${point.completed}/${point.logged} logged`}</span></span>
                  <span className={`mt-2 block h-3 rounded ${point.rate === null ? 'border border-dashed border-gray-500' : 'bg-gray-700'}`}><span className="block h-full rounded bg-teal-500" style={{ width: `${point.rate ?? 0}%` }} /></span>
                  <span className="mt-2 block text-xs text-teal-300">★ {point.stars}/{point.possibleStars} stars · {(point.stars / point.elapsedDays).toFixed(2)}/5 average over {point.elapsedDays} elapsed days</span>
                </button>
              )
            })}
          </section>
          {insights.strongestWeekday ? <p className="rounded-lg bg-gray-800 p-4 text-sm">Strongest weekday from logged records: <span className="font-semibold text-teal-300">{insights.strongestWeekday.weekday}</span> · {insights.strongestWeekday.completed}/{insights.strongestWeekday.logged} logged prayers completed ({insights.strongestWeekday.rate}%).</p> : null}
        </>
      ) : null}
    </div>
  )
}

function LineTrend({ insights }: { insights: NonNullable<ReturnType<typeof calculateSalahRangeInsights>> }) {
  const width = 720
  const height = 300
  const left = 58
  const right = 18
  const top = 24
  const bottom = 48
  const availableWidth = width - left - right
  const availableHeight = height - top - bottom
  const values = insights.trend.flatMap((point) => point.rate === null ? [] : [point.rate])
  if (values.length === 0) {
    return <section className="rounded-lg bg-gray-800 p-4" aria-labelledby="line-trend-title">
      <h2 id="line-trend-title" className="text-lg font-semibold">Completion trend line</h2>
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
  const xFor = (index: number) => left + (insights.trend.length < 2 ? availableWidth / 2 : index * availableWidth / (insights.trend.length - 1))
  const yFor = (rate: number) => top + ((maxRate - rate) / rateSpan) * availableHeight
  const plotted = insights.trend.map((point, index) => point.rate === null
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
    <section className="rounded-lg bg-gray-800 p-4" aria-labelledby="line-trend-title">
      <h2 id="line-trend-title" className="text-lg font-semibold">Completion trend line</h2>
      <p className="mt-1 text-sm text-gray-300">{direction} Across {loggedPeriods} periods with logged data.</p>
      <p className="mt-1 text-xs text-gray-400">Rates use completed ÷ logged prayers. The vertical scale adjusts to this period’s data; gaps mean no prayers were logged.</p>
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${insights.trendInterval === 'month' ? 'Monthly' : 'Weekly'} completion rates. ${direction} ${loggedPeriods} logged periods.`} className="block h-auto min-w-[480px] w-full">
          <title>Prayer completion trend</title>
          <desc>Line graph of completed prayers divided by logged prayers for each {insights.trendInterval}.</desc>
          {[maxRate, Math.round((maxRate + minRate) / 2), minRate].map((rate) => {
            const y = yFor(rate)
            return <g key={rate}>
              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#475569" strokeDasharray="3 5" />
              <text x={left - 10} y={y + 4} textAnchor="end" fill="#cbd5e1" fontSize="13">{rate}%</text>
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
                ? <text x={point.x} y={height - 16} textAnchor={index === validIndices[0] ? 'start' : 'end'} fill="#cbd5e1" fontSize="13">{labelFor(point.label)}</text>
                : null}
            </g>
          ))}
        </svg>
      </div>
    </section>
  )
}
