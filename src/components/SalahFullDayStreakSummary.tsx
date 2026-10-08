import type { SalahPeriodInsights, SalahPeriodStreakRun } from '../lib/salahInsights'

function describeRun(run: SalahPeriodStreakRun) {
  return `${run.length} day${run.length === 1 ? '' : 's'} · ${run.start}–${run.end}${run.continuesBefore ? ' · began before this period' : ''}${run.continuesAfter ? ' · continues after this period' : ''}`
}

export default function SalahFullDayStreakSummary({ insights }: { insights: SalahPeriodInsights }) {
  const streaks = insights.fullDayStreaks
  return <section aria-label="All-five prayer streak" className="rounded-lg bg-gray-800 p-4 space-y-2">
    <h2 className="font-semibold text-teal-300">All-five prayer streak</h2>
    <p className="text-xs text-gray-400">Five obligatory prayers completed each consecutive day. Missing, missed or unlogged days break a verified streak. Analytics clips runs to this selected period; streak search uses full runs.</p>
    {insights.daysWithLogs === 0 ? <p className="text-sm text-gray-300">No logged data in this period.</p> : null}
    <p className="text-sm text-gray-300">Current at {insights.end.toLocaleDateString()}: {streaks.current ? describeRun(streaks.current) : '0 days'}</p>
    <p className="text-sm text-gray-300">Longest in this period: {streaks.longestLength} day{streaks.longestLength === 1 ? '' : 's'}</p>
    {streaks.longest.length === 1 ? <p className="text-sm text-gray-300">{describeRun(streaks.longest[0])}</p> : streaks.longest.length > 1 ? <details className="text-sm text-gray-300"><summary className="cursor-pointer">{streaks.longest.length} tied longest runs · View dates</summary><ul className="mt-2 space-y-1">{streaks.longest.map((run) => <li key={run.start}>{describeRun(run)}</li>)}</ul></details> : <p className="text-sm text-gray-400">No all-five streak in this period.</p>}
  </section>
}
