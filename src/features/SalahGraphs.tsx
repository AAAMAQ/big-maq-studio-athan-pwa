import { useMemo, useState } from 'react'
import { calculateSalahRangeInsights, calculateSalahWeekDailyTrend, formatSalahDate, parseSalahDate, type SalahRangeSelection } from '../lib/salahInsights'
import SalahCompletionTrend from '../components/SalahCompletionTrend'
import SalahPrayerCompletionChart from '../components/SalahPrayerCompletionChart'
import SalahFullDayStreakSummary from '../components/SalahFullDayStreakSummary'
import type { NavigationIntent } from '../types/nav'
import { useSalahData } from '../lib/useSalahData'
import SalahRangePicker from './SalahRangePicker'

export default function SalahGraphs({ onOpenDay, navigationIntent }: { onOpenDay: (date: string) => void; navigationIntent?: NavigationIntent }) {
  const { store, todayKey } = useSalahData()
  const [selection, setSelection] = useState<SalahRangeSelection>(() => ({ kind: 'preset', period: navigationIntent?.screen === 'SalahGraphs' && 'period' in navigationIntent ? navigationIntent.period : 'month' }))
  const result = useMemo(() => {
    try { return { insights: calculateSalahRangeInsights(store, selection, parseSalahDate(todayKey)!), error: '' } }
    catch (error) { return { insights: null, error: error instanceof Error ? error.message : 'Choose a valid range.' } }
  }, [store, selection, todayKey])
  const insights = result.insights
  const dailyTrend = useMemo(() => selection.kind === 'preset' && selection.period === 'week' ? calculateSalahWeekDailyTrend(store, parseSalahDate(todayKey)!) : null, [store, todayKey, selection])

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4">
      <header><h1 className="text-2xl font-bold">Graph Insights</h1><p className="mt-1 text-sm text-gray-400">Visual patterns from prayers you logged. Empty periods have no rate.</p></header>
      <SalahRangePicker value={selection} onChange={setSelection} />
      {result.error ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{result.error}</p> : null}
      {insights ? (
        <>
          <p className="text-sm text-gray-300">{insights.periodLabel} · {insights.rangeLabel} · {insights.daysWithLogs} day{insights.daysWithLogs === 1 ? '' : 's'} with obligatory logs</p>
          <p className="rounded-lg bg-gray-800 p-4 text-sm"><span className="font-semibold text-teal-300">★ {insights.stars.total}/{insights.stars.possible} stars</span> · {insights.stars.averagePerDay === null ? 'No recorded-time average yet' : `${insights.stars.averagePerDay.toFixed(2)}/5 average across ${insights.stars.elapsedDays} elapsed days`}. Blank past days earn zero stars; the existing graphs below use logged-data rates.</p>
          <SalahPrayerCompletionChart prayers={insights.prayers} />
          <SalahFullDayStreakSummary insights={insights} />
          <SalahCompletionTrend points={dailyTrend ?? insights.trend} interval={dailyTrend ? 'day' : insights.trendInterval} />
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
