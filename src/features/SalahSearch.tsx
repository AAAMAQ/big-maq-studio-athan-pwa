import { useMemo, useState } from 'react'
import { getSalahStatus, parseSalahDate, SALAH_PRAYERS } from '../lib/salahInsights'
import { explainSalahSearch, searchSalahDays } from '../lib/salahSearch'
import { loadSalahStore } from '../lib/salahStore'

const EXAMPLES = [
  { query: 'fajr', meaning: 'Fajr completed' },
  { query: '1&2', meaning: 'Fajr and Dhuhr completed' },
  { query: '[1&2]', meaning: 'Only Fajr and Dhuhr completed' },
  { query: '!2,!3', meaning: 'Dhuhr or Asr missed' },
  { query: '~1', meaning: 'Fajr not logged' },
  { query: '/5', meaning: 'Isha missed or not logged' },
  { query: '1&(!2,!3)', meaning: 'Fajr completed and Dhuhr or Asr missed' }
]

export default function SalahSearch({ onOpenDay }: { onOpenDay: (date: string) => void }) {
  const [store] = useState(loadSalahStore)
  const [query, setQuery] = useState('')
  const [includeBlankDates, setIncludeBlankDates] = useState(false)
  const [visibleCount, setVisibleCount] = useState(60)
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const [range, setRange] = useState({ from: `${todayKey.slice(0, 7)}-01`, to: todayKey })
  const outcome = useMemo(() => {
    if (!query.trim()) return { dates: [] as string[], meaning: '', error: '' }
    try { return { dates: searchSalahDays(store, query, includeBlankDates ? range : undefined), meaning: explainSalahSearch(query), error: '' } }
    catch (error) { return { dates: [] as string[], meaning: '', error: error instanceof Error ? error.message : 'Check the search string.' } }
  }, [store, query, includeBlankDates, range])

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4">
      <header><h1 className="text-2xl font-bold">Search Salah Progress</h1><p className="mt-1 text-sm text-gray-400">Find days by the five obligatory prayers you logged.</p></header>
      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <label className="block text-sm font-semibold">Search days
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(60) }} placeholder="Try fajr&dhuhr or [1&2]" autoComplete="off" spellCheck={false} aria-describedby="search-help" className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-teal-500 focus:outline-none" />
        </label>
        <p id="search-help" className="text-xs leading-5 text-gray-400">1 Fajr · 2 Dhuhr · 3 Asr · 4 Maghrib · 5 Isha. A name or number means completed; ! means missed; ~ means not logged; / means missed or not logged. Use &amp; for both, comma or semicolon for either, parentheses to group, and [ ] for only the listed prayers completed.</p>
        <div className="flex flex-wrap gap-2" aria-label="Search examples">
          {EXAMPLES.map((example) => <button key={example.query} type="button" onClick={() => setQuery(example.query)} className="rounded border border-gray-700 bg-gray-900 px-2 py-1 text-left text-xs text-teal-300 hover:border-teal-500"><span className="block font-semibold">{example.query}</span><span className="block text-gray-400">{example.meaning}</span></button>)}
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeBlankDates} onChange={(event) => setIncludeBlankDates(event.target.checked)} className="h-4 w-4 accent-teal-600" />Search a date range, including days with no records</label>
        {includeBlankDates ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">From<input type="date" value={range.from} max={todayKey} onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2" /></label>
            <label className="text-sm">Through<input type="date" value={range.to} max={todayKey} onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2" /></label>
          </div>
        ) : <p className="text-xs text-gray-400">Searching recorded dates through today. Use a date range to include blank dates for ~ or / searches.</p>}
      </section>
      {outcome.error ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{outcome.error}</p> : null}
      {!query.trim() ? <p className="text-sm text-gray-400">Choose an example or enter a search string.</p> : null}
      {query.trim() && !outcome.error ? (
        <section aria-live="polite" className="space-y-3">
          <p className="text-sm text-gray-300">Meaning: {outcome.meaning}.</p>
          <h2 className="font-semibold">{outcome.dates.length} matching day{outcome.dates.length === 1 ? '' : 's'}</h2>
          {outcome.dates.length === 0 ? <p className="rounded bg-gray-800 p-4 text-sm text-gray-300">No matching days in this search range.</p> : null}
          {outcome.dates.slice(0, visibleCount).map((date) => {
            const log = store[date]
            const parsed = parseSalahDate(date)
            return (
              <article key={date} className="rounded-lg bg-gray-800 p-4">
                <button type="button" onClick={() => onOpenDay(date)} className="font-semibold text-teal-300 underline-offset-2 hover:underline focus:underline">{parsed?.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) ?? date} → Open day</button>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-5">
                  {SALAH_PRAYERS.map((prayer) => {
                    const status = getSalahStatus(log, prayer)
                    return <div key={prayer} className="rounded bg-gray-900 px-2 py-2"><span className="font-semibold">{prayer}</span><span className={`ml-2 ${status === 'completed' ? 'text-teal-300' : status === 'missed' ? 'text-red-300' : 'text-gray-400'}`}>{status === 'not-logged' ? 'Not logged' : status === 'completed' ? 'Completed' : 'Missed'}</span></div>
                  })}
                </div>
                {log?.Notes ? <details className="mt-3 text-sm text-gray-300"><summary className="cursor-pointer">Daily note</summary><p className="mt-2 whitespace-pre-wrap break-words">{log.Notes}</p></details> : null}
              </article>
            )
          })}
          {outcome.dates.length > visibleCount ? <button type="button" onClick={() => setVisibleCount((count) => count + 60)} className="rounded bg-gray-700 px-3 py-2 text-sm hover:bg-gray-600">Show more days</button> : null}
        </section>
      ) : null}
    </div>
  )
}
