import { memo, useMemo, useState } from 'react'
import SalahPrayerCompletionChart from '../components/SalahPrayerCompletionChart'
import SalahCompletionTrend from '../components/SalahCompletionTrend'
import { loadAppLayout, saveAppLayout, type SalahBriefView } from '../lib/appLayout'
import { calculateSalahPeriodInsights, calculateSalahWeekDailyTrend, parseSalahDate } from '../lib/salahInsights'
import { useSalahData } from '../lib/useSalahData'
import type { NavigationIntent } from '../types/nav'

/** Mounted only for the selected Home section; unrelated countdown renders do no work. */
const SalahBrief = memo(function SalahBrief({ onNavigate, view = 'line' }: { onNavigate?: (intent: NavigationIntent) => void; view?: SalahBriefView }) {
  const { store, todayKey } = useSalahData()
  const [message, setMessage] = useState('')
  const insights = useMemo(() => calculateSalahPeriodInsights(store, 'week', parseSalahDate(todayKey)!), [store, todayKey])
  const trend = useMemo(() => view === 'line' ? calculateSalahWeekDailyTrend(store, parseSalahDate(todayKey)!) : [], [store, todayKey, view])
  function changeView(next: SalahBriefView) {
    const current = loadAppLayout()
    const saved = saveAppLayout({ ...current, homeSections: { ...current.homeSections, salahBrief: current.homeSections?.salahBrief === true, salahBriefView: next } })
    setMessage(saved ? '' : 'Chart choice could not be saved. Try again in Settings.')
  }
  return <section aria-label="Salah Brief" className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-3">
    <h2 className="text-lg font-semibold text-teal-300">Salah Brief</h2>
    <div role="group" aria-label="Salah Brief chart" className="flex flex-wrap gap-2">
      {(['line', 'bars'] as const).map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => changeView(option)} className={`min-h-11 rounded-md border px-3 py-2 text-sm ${view === option ? 'border-teal-600 bg-teal-700 text-white' : 'border-gray-600 bg-gray-900 text-gray-300'}`}>{option === 'line' ? 'Line graph' : 'Prayer bars'}</button>)}
    </div>
    {message ? <p role="status" className="text-sm text-gray-300">{message}</p> : null}
    <p className="text-sm text-gray-300">This week · {insights.rangeLabel} · {insights.daysWithLogs}/{insights.dayCount} days with obligatory logs</p>
    <p className="text-xs text-gray-400">Completion rates use completed ÷ logged prayers. Not logged is not a recorded miss.</p>
    {insights.daysWithLogs === 0 ? <p className="text-sm text-gray-300">No logged data this week.</p> : null}
    {view === 'line' ? <SalahCompletionTrend points={trend} interval="day" /> : <SalahPrayerCompletionChart prayers={insights.prayers} />}
    {onNavigate ? <button type="button" onClick={() => onNavigate({ screen: 'SalahGraphs', period: 'week' })} className="min-h-11 rounded bg-teal-700 px-3 py-2 text-sm focus:outline focus:outline-2 focus:outline-teal-300">View full graphs</button> : null}
  </section>
})

export default SalahBrief
