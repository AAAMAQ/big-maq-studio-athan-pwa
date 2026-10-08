import { useMemo, useState } from 'react'
import { calculateSalahRangeInsights, parseSalahDate, SALAH_PRAYERS, type SalahPeriodInsights, type SalahRangeSelection } from '../lib/salahInsights'
import { useSalahData } from '../lib/useSalahData'
import SalahRangePicker from './SalahRangePicker'
import SalahFullDayStreakSummary from '../components/SalahFullDayStreakSummary'

export default function SalahInsights() {
  const { store, todayKey } = useSalahData()
  const [selection, setSelection] = useState<SalahRangeSelection>({ kind: 'preset', period: 'month' })
  const result = useMemo(() => {
    try { return { insights: calculateSalahRangeInsights(store, selection, parseSalahDate(todayKey)!), error: '' } }
    catch (error) { return { insights: null, error: error instanceof Error ? error.message : 'Choose a valid range.' } }
  }, [store, selection, todayKey])
  const insights = result.insights

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4">
      <header>
        <h1 className="text-2xl font-bold">Salah Insights</h1>
        <p className="mt-1 text-sm text-gray-400">A private view of your logged obligatory prayers.</p>
      </header>
      <SalahRangePicker value={selection} onChange={setSelection} />
      {result.error ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{result.error}</p> : null}
      {insights ? (
        <>
          <p className="text-sm text-gray-300">{insights.periodLabel} · {insights.rangeLabel} · {insights.daysWithLogs} day{insights.daysWithLogs === 1 ? '' : 's'} with at least one obligatory prayer logged</p>
          <section aria-label="Fixed-capacity Salah stars" className="rounded-lg bg-gray-800 p-4">
            <h2 className="font-semibold text-teal-300">★ {insights.stars.total}/{insights.stars.possible} stars</h2>
            <p className="mt-1 text-sm text-gray-300">Average: {insights.stars.averagePerDay === null ? '—' : `${insights.stars.averagePerDay.toFixed(2)}/5 stars per day`} · {insights.stars.elapsedDays} elapsed calendar days</p>
            <p className="mt-1 text-xs text-gray-400">{insights.daysWithLogs}/{insights.stars.elapsedDays} days with obligatory logs. Missed and unlogged slots earn zero stars, including blank past days. Completion rates below use logged prayers only.</p>
          </section>
          {insights.daysWithLogs === 0 ? <p className="rounded bg-gray-800 p-4 text-sm text-gray-300">No obligatory prayer data is logged for this period.</p> : null}
          <SalahFullDayStreakSummary insights={insights} />
          <section aria-label="Per-prayer statistics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SALAH_PRAYERS.map((prayer) => {
              const stats = insights.prayers[prayer]
              return (
                <div key={prayer} className="rounded-lg bg-gray-800 p-4 space-y-1">
                  <h2 className="font-semibold text-teal-300">{prayer}</h2>
                  <p className="text-2xl font-bold">{stats.rate === null ? '—' : `${stats.rate}%`}</p>
                  <p className="text-sm text-gray-300">{stats.completed} completed of {stats.logged} logged</p>
                  <p className="text-xs text-gray-400">Current verified streak: {stats.currentStreak} days</p>
                  <p className="text-xs text-gray-400">Longest verified streak: {stats.longestStreak} days</p>
                </div>
              )
            })}
          </section>
          <section aria-label="Contextual summaries" className="grid gap-3 sm:grid-cols-2">
            <SummaryCards insights={insights} />
          </section>
          <section className="rounded-lg bg-gray-800 p-4">
            <h2 className="font-semibold">{insights.trendInterval === 'month' ? 'Monthly' : 'Weekly'} completion trend</h2>
            <p className="mt-1 text-xs text-gray-400">Each percentage includes only logged obligatory prayers.</p>
            <div className="mt-3 space-y-3">
              {insights.trend.map((point) => (
                <div key={point.key} className="rounded bg-gray-900 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm"><span>{point.label}</span><span className="text-gray-400">{point.rate === null ? 'No logged data' : `${point.rate}% · ${point.completed}/${point.logged} logged`}</span></div>
                  <div className="mt-2 h-2 rounded bg-gray-700"><div className="h-2 rounded bg-teal-500" style={{ width: `${point.rate ?? 0}%` }} /></div>
                  <p className="mt-2 text-xs text-teal-300">★ {point.stars}/{point.possibleStars} stars · {(point.stars / point.elapsedDays).toFixed(2)}/5 average over {point.elapsedDays} elapsed days</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

function SummaryCards({ insights }: { insights: SalahPeriodInsights }) {
  const consistent = insights.mostConsistent
  const improved = insights.mostImproved
  const weekday = insights.strongestWeekday
  return (
    <>
      <Summary title="Most consistent">{consistent ? `${consistent.prayer}: ${consistent.rate}% (${consistent.completed}/${consistent.logged} logged), with logs on ${consistent.coverageDays}/${insights.dayCount} days (${consistent.coverageRate}% coverage).` : 'Not enough logged data.'}</Summary>
      <Summary title="Most improved">{improved ? `${improved.prayer}: ${improved.rateChange > 0 ? '+' : ''}${improved.rateChange} points versus the preceding equal-length period (${improved.currentCompleted}/${improved.currentLogged} now; ${improved.previousCompleted}/${improved.previousLogged} before).` : 'Log the same prayer in this and the preceding equal-length period to compare.'}</Summary>
      <Summary title="All five completed">{`${insights.allFive.completedDays} day${insights.allFive.completedDays === 1 ? '' : 's'}, from ${insights.allFive.fullyLoggedDays} fully logged day${insights.allFive.fullyLoggedDays === 1 ? '' : 's'}.`}</Summary>
      <Summary title="Strongest weekday">{weekday ? `${weekday.weekday}: ${weekday.rate}% (${weekday.completed}/${weekday.logged} logged prayers).` : 'Not enough logged data.'}</Summary>
    </>
  )
}

function Summary({ title, children }: { title: string; children: string }) {
  return <div className="rounded bg-gray-900 p-3"><h3 className="font-semibold text-teal-300">{title}</h3><p className="mt-1 text-sm text-gray-300">{children}</p></div>
}
