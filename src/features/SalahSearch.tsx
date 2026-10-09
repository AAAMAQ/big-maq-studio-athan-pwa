import { useEffect, useMemo, useState } from 'react'
import { deriveSalahStreakRuns, indexSalahStreakRuns, getSalahStatus, parseSalahDate, SALAH_PRAYERS } from '../lib/salahInsights'
import { explainSalahSearch, parseSalahSearch, searchSalahDaysWithStreaks, summarizeSalahSearchResults, type SalahSearchStreakSummary } from '../lib/salahSearch'
import { SALAH_DATA_CHANGE_EVENT } from '../lib/salahStore'
import { findSalahStreakRun } from '../lib/salahStreaks'
import { useSalahData } from '../lib/useSalahData'
import { describeSalahSearchScope, loadRecentSalahSearches, loadSavedSalahSearches, MAX_SAVED_SALAH_SEARCHES, normalizeRecentSalahSearches, normalizeSalahSearchScope, SALAH_SEARCHES_CHANGE_EVENT, saveRecentSalahSearches, saveSavedSalahSearches, type SavedSalahSearch, type SalahSearchScope } from '../lib/salahSavedSearches'

const EXAMPLES = [
  { query: 'fajr', meaning: 'Fajr completed' },
  { query: '1&2', meaning: 'Fajr and Dhuhr completed' },
  { query: '[1&2]', meaning: 'Only Fajr and Dhuhr completed' },
  { query: '!2,!3', meaning: 'Dhuhr or Asr missed' },
  { query: '~1', meaning: 'Fajr not logged' },
  { query: '/5', meaning: 'Isha missed or not logged' },
  { query: '1&(!2,!3)', meaning: 'Fajr completed and Dhuhr or Asr missed' },
  { query: 'Oct.30', meaning: 'October 30 in any year' },
  { query: '27d.5m.26y', meaning: 'May 27, 2026' },
  { query: '(Jun.26y)&fajr', meaning: 'June 2026, Fajr completed' },
  { query: '(star(3-5))', meaning: 'Three to five prayers completed' },
  { query: '(notes)&!fajr', meaning: 'A note and Fajr missed' },
  { query: '(mon)&((logged5),(notes))', meaning: 'Mondays fully logged or with notes' },
  { query: '((2-5)m.(21-30)d.(25-26)y)', meaning: 'Feb–May, days 21–30, 2025–2026' },
  { query: '(last30days)&fajr', meaning: 'Fajr completed in the last 30 days' },
  { query: 'streak:5', meaning: 'Exactly five consecutive all-five days' },
  { query: 'streak:5+', meaning: 'Five or more consecutive all-five days' },
  { query: '(streak:max)&(notes)', meaning: 'Notes within the longest run(s)' },
  { query: 'streak(1):max', meaning: 'Longest Fajr streak(s)' },
  { query: 'streak(1,2):max', meaning: 'Independent longest Fajr and Dhuhr streaks' },
  { query: 'streak(1&2):5', meaning: 'Exactly five days with both Fajr and Dhuhr completed' }
]

export default function SalahSearch({ onOpenDay }: { onOpenDay: (date: string) => void }) {
  const { store, todayKey } = useSalahData()
  const [query, setQuery] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)
  const [includeBlankDates, setIncludeBlankDates] = useState(false)
  const [useDateRange, setUseDateRange] = useState(false)
  const [saved, setSaved] = useState(loadSavedSalahSearches)
  const [recent, setRecent] = useState(loadRecentSalahSearches)
  const [name, setName] = useState('')
  const [rename, setRename] = useState<{ id: string; name: string } | null>(null)
  const [message, setMessage] = useState('')
  const [visibleCount, setVisibleCount] = useState(60)
  const [range, setRange] = useState({ from: `${todayKey.slice(0, 7)}-01`, to: todayKey })
  const runs = useMemo(() => deriveSalahStreakRuns(store, parseSalahDate(todayKey)!), [store, todayKey])
  const outcome = useMemo(() => {
    if (!query.trim()) return { dates: [] as string[], streaks: [] as SalahSearchStreakSummary[], meaning: '', error: '' }
    try {
      if (useDateRange && range.to > todayKey) throw new Error('Choose a fixed date range ending no later than today.')
      const node = parseSalahSearch(query)
      return { ...searchSalahDaysWithStreaks(store, node, useDateRange ? { ...range, includeBlankDates } : undefined, parseSalahDate(todayKey)!, runs), meaning: explainSalahSearch(node), error: '' }
    }
    catch (error) { return { dates: [] as string[], streaks: [] as SalahSearchStreakSummary[], meaning: '', error: error instanceof Error ? error.message : 'Check the search string.' } }
  }, [store, query, includeBlankDates, range, useDateRange, todayKey, runs])
  const summary = useMemo(() => summarizeSalahSearchResults(store, outcome.dates), [store, outcome.dates])
  const runByDate = useMemo(() => indexSalahStreakRuns(runs), [runs])
  const scope: SalahSearchScope = useDateRange ? { kind: 'absolute', ...range, includeBlankDates } : { kind: 'recorded' }
  useEffect(() => {
    const refresh = () => { setSaved(loadSavedSalahSearches()); setRecent(loadRecentSalahSearches()) }
    window.addEventListener(SALAH_SEARCHES_CHANGE_EVENT, refresh)
    window.addEventListener(SALAH_DATA_CHANGE_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(SALAH_SEARCHES_CHANGE_EVENT, refresh); window.removeEventListener(SALAH_DATA_CHANGE_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  function remember(nextQuery: string) {
    const next = normalizeRecentSalahSearches({ schemaVersion: 1, queries: [nextQuery, ...recent.queries] })
    if (saveRecentSalahSearches(next)) setRecent(next)
    else setMessage('Search works, but recent searches could not be saved on this device.')
  }
  function chooseQuery(nextQuery: string) { setQuery(nextQuery); setVisibleCount(60); remember(nextQuery) }
  function openSaved(item: SavedSalahSearch) {
    chooseQuery(item.query)
    setUseDateRange(item.scope.kind === 'absolute')
    if (item.scope.kind === 'absolute') { setRange({ from: item.scope.from, to: item.scope.to }); setIncludeBlankDates(item.scope.includeBlankDates) }
    setMessage(`Opened “${item.name}”. Results use your current records.`)
  }
  function saveDefinition() {
    if (!query.trim() || outcome.error || !name.trim()) return
    const validatedScope = normalizeSalahSearchScope(scope)
    if (!validatedScope) { setMessage('Search could not be saved. Choose a valid fixed range of at most 10 years.'); return }
    if (saved.searches.length >= MAX_SAVED_SALAH_SEARCHES) { setMessage(`You can save up to ${MAX_SAVED_SALAH_SEARCHES} searches. Remove one first.`); return }
    const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const next = { ...saved, searches: [...saved.searches, { id, name: name.trim(), query: query.trim(), scope: validatedScope }] }
    if (saveSavedSalahSearches(next)) { setSaved(next); setName(''); remember(query); setMessage('Search saved locally and included in personal backups.') }
    else setMessage('Search could not be saved. Existing saved searches have not changed.')
  }
  function changeSaved(searches: SavedSalahSearch[]) {
    const next = { ...saved, searches }
    if (saveSavedSalahSearches(next)) { setSaved(next); setRename(null); setMessage('Saved searches updated.') }
    else setMessage('Changes could not be saved. Existing saved searches have not changed.')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4">
      <header><h1 className="text-2xl font-bold">Search Salah Progress</h1><p className="mt-1 text-sm text-gray-400">Find days by date and the five obligatory prayers you logged.</p></header>
      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <label className="block text-sm font-semibold">Search days
          <input type="search" value={query} maxLength={2048} onChange={(event) => { setQuery(event.target.value); setVisibleCount(60) }} onKeyDown={(event) => { if (event.key === 'Enter' && query.trim() && !outcome.error) remember(query) }} placeholder="Try Oct.30, 6m.26y, or fajr&dhuhr" autoComplete="off" spellCheck={false} aria-describedby="search-hint" className="mt-1 w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100 placeholder:text-gray-500 focus:border-teal-500 focus:outline-none" />
        </label>
        <p id="search-hint" className="text-xs text-gray-400">Try fajr, Oct.30, or streak:5+. Names mean completed, ! missed, ~ not logged. Expand help for operators and examples.</p>
        <button type="button" aria-expanded={helpOpen} aria-controls="salah-search-help" onClick={() => setHelpOpen((open) => !open)} className="min-h-11 rounded border border-gray-700 px-3 py-2 text-sm text-teal-300 focus:outline focus:outline-2 focus:outline-teal-400">{helpOpen ? '−' : '+'} Help with search strings</button>
        {helpOpen ? <div id="salah-search-help" className="space-y-3">
        <p id="search-help" className="text-xs leading-5 text-gray-400">1 Fajr · 2 Dhuhr · 3 Asr · 4 Maghrib · 5 Isha. A name or number means completed; ! means missed; ~ means not logged; / means missed or not logged. Use &amp; for both, comma or semicolon for either, parentheses to group, and [ ] for only the listed prayers completed.</p>
        <p id="search-date-help" className="text-xs leading-5 text-gray-400">Dates use dots in any order: 2026y.6m.23d. June, Jun, and 6m are equivalent; 26y means 2026 (2000–2099 for two-digit years). Label two parts to infer the third: 10m.23d.26 or 10.23d.2026y. Oct.23 always means October 23. Partial dates such as 5m or 5m.26y also work. Group the date before combining prayers: (23d.06m.2026y)&amp;fajr.</p>
        <p className="text-xs leading-5 text-gray-400">star3 (or stars3/done3) means three completed out of five; star(3-5) or done3-5 means three to five. logged5 means all five completed or missed; !logged5 means fewer than five logged. notes/note means a nonempty note; !notes means none. mon/Monday finds Mondays. last30days includes today and the previous 29 days. Component ranges, such as ((2-5)m.(21-30)d.(25-26)y), filter those months, days and years—not a continuous interval.</p>
        <div className="flex flex-wrap gap-2" aria-label="Search examples">
          {EXAMPLES.map((example) => <button key={example.query} type="button" onClick={() => chooseQuery(example.query)} className="max-w-full break-words rounded border border-gray-700 bg-gray-900 px-2 py-1 text-left text-xs text-teal-300 hover:border-teal-500"><span className="block font-semibold">{example.query}</span><span className="block text-gray-400">{example.meaning}</span></button>)}
        </div>
        <p className="text-xs leading-5 text-gray-400">streak:5 matches full runs of exactly five all-five completed days; streak:5+ means at least five. streak:max includes tied longest full runs intersecting your fixed scope, before notes, weekday or date-query filters. Query date terms restrict displayed days but never shorten a verified run. For the longest intersecting October, select October as the fixed range. Future or missing/unlogged days cannot create a streak.</p>
        <p className="text-xs leading-5 text-gray-400">Choose prayers with streak(1):max or streak(fajr):max. streak(1,2):max searches each prayer independently and reports separate Fajr and Dhuhr runs; streak(1&amp;2):max requires both completed on every day of the same run. streak(1&amp;2):5 means exactly five days, not a five-day window within a longer run; add + for at least five. Other prayers do not affect a scoped streak. Missed, not logged and absent days break it. Combine the whole streak term with dates, notes or other filters using the usual parentheses and operators.</p>
        </div> : null}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={useDateRange} onChange={(event) => { setUseDateRange(event.target.checked); setVisibleCount(60) }} className="h-4 w-4 accent-teal-600" />Restrict search to a fixed date range</label>
        {useDateRange ? (
          <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">From<input type="date" value={range.from} max={todayKey} onChange={(event) => { setRange((current) => ({ ...current, from: event.target.value })); setVisibleCount(60) }} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2" /></label>
            <label className="text-sm">Through<input type="date" value={range.to} max={todayKey} onChange={(event) => { setRange((current) => ({ ...current, to: event.target.value })); setVisibleCount(60) }} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2" /></label>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeBlankDates} onChange={(event) => { setIncludeBlankDates(event.target.checked); setVisibleCount(60) }} className="h-4 w-4 accent-teal-600" />Include days with no records in this bounded range</label>
          </>
        ) : <p className="text-xs text-gray-400">Searching recorded dates through today. Blank days are included only with an explicit bounded range.</p>}
        <p className="text-xs text-gray-400">{describeSalahSearchScope(scope)}</p>
        <div className="flex flex-wrap items-end gap-2">
          <button type="button" disabled={!query.trim() || Boolean(outcome.error)} onClick={() => remember(query)} className="rounded bg-teal-700 px-3 py-2 text-sm disabled:opacity-50">Run search / remember</button>
          <label className="min-w-0 flex-1 text-sm">Name this search<input value={name} maxLength={80} onChange={(event) => setName(event.target.value)} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2" /></label>
          <button type="button" disabled={!name.trim() || !query.trim() || Boolean(outcome.error)} onClick={saveDefinition} className="rounded bg-gray-700 px-3 py-2 text-sm disabled:opacity-50">Save search</button>
        </div>
      </section>
      {message ? <p role="status" className="rounded bg-gray-800 p-3 text-sm">{message}</p> : null}
      <section aria-label="Saved and recent searches" className="rounded-lg bg-gray-800 p-4 space-y-3">
        <h2 className="font-semibold">Saved searches</h2>
        {saved.searches.length === 0 ? <p className="text-xs text-gray-400">Save a named query to reopen it against your current local records.</p> : null}
        {saved.searches.map((item) => <div key={item.id} className="rounded bg-gray-900 p-3 space-y-2">
          <button type="button" onClick={() => openSaved(item)} className="block max-w-full break-words text-left font-semibold text-teal-300">{item.name} → Open</button>
          <p className="break-words text-xs text-gray-400">{item.query} · {describeSalahSearchScope(item.scope)}</p>
          {rename?.id === item.id ? <form className="flex flex-wrap gap-2" onSubmit={(event) => { event.preventDefault(); if (rename.name.trim()) changeSaved(saved.searches.map((entry) => entry.id === item.id ? { ...entry, name: rename.name.trim() } : entry)) }}>
            <label className="text-xs">New search name<input value={rename.name} maxLength={80} onChange={(event) => setRename({ id: item.id, name: event.target.value })} className="ml-2 rounded border border-gray-700 bg-gray-800 px-2 py-1" /></label>
            <button type="submit" disabled={!rename.name.trim()} className="rounded bg-teal-700 px-2 py-1 text-xs disabled:opacity-50">Save name</button><button type="button" onClick={() => setRename(null)} className="rounded bg-gray-700 px-2 py-1 text-xs">Cancel</button>
          </form> : <div className="flex gap-2"><button type="button" onClick={() => setRename({ id: item.id, name: item.name })} aria-label={`Rename ${item.name}`} className="rounded bg-gray-700 px-2 py-1 text-xs">Rename</button><button type="button" onClick={() => changeSaved(saved.searches.filter((entry) => entry.id !== item.id))} aria-label={`Remove saved search ${item.name}`} className="rounded bg-gray-700 px-2 py-1 text-xs">Remove</button></div>}
        </div>)}
        {recent.queries.length ? <div><h3 className="mb-2 text-sm font-semibold">Recent queries · current scope</h3><div className="flex flex-wrap gap-2">{recent.queries.map((item) => <button key={item} type="button" onClick={() => chooseQuery(item)} className="max-w-full break-words rounded border border-gray-700 px-2 py-1 text-xs text-teal-300">{item}</button>)}</div></div> : null}
      </section>
      {outcome.error ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{outcome.error}</p> : null}
      {!query.trim() ? <p className="text-sm text-gray-400">Choose an example or enter a search string.</p> : null}
      {query.trim() && !outcome.error ? (
        <section aria-live="polite" className="space-y-3">
          <p className="text-sm text-gray-300">Meaning: {outcome.meaning}.</p>
          <h2 className="font-semibold">{outcome.dates.length} matching day{outcome.dates.length === 1 ? '' : 's'}</h2>
          <p className="text-sm text-gray-300">{summary.completed} completed · {summary.missed} missed · {summary.notLogged} not logged · ★ {summary.stars}/{summary.possibleStars} stars across matching days only</p>
          {outcome.streaks.length ? <section aria-label="Matching streak summaries" className="rounded-lg bg-gray-800 p-4 space-y-3">
            <h3 className="font-semibold">Matching full streaks</h3>
            <p className="text-xs text-gray-400">Lengths use full consecutive runs, not just displayed dates. Other filters only select days within those runs.</p>
            {outcome.streaks.map((scope) => <div key={scope.key}>
              <h4 className="text-sm font-semibold text-teal-300">{scope.label} · {scope.runs.length} matching run{scope.runs.length === 1 ? '' : 's'}</h4>
              {scope.runs.length ? <ul className="mt-1 space-y-1 text-xs text-gray-300">{scope.runs.slice(0, 12).map((run) => <li key={run.start}>{run.length} day{run.length === 1 ? '' : 's'} · {run.start}–{run.end}</li>)}</ul> : <p className="mt-1 text-xs text-gray-400">No matching days from this streak scope.</p>}
              {scope.runs.length > 12 ? <p className="mt-1 text-xs text-gray-400">{scope.runs.length - 12} more runs are labelled on their matching day cards below.</p> : null}
            </div>)}
          </section> : null}
          {outcome.dates.length === 0 ? <p className="rounded bg-gray-800 p-4 text-sm text-gray-300">No matching days in this search range.</p> : null}
          {outcome.dates.slice(0, visibleCount).map((date) => {
            const log = store[date]
            const parsed = parseSalahDate(date)
            const run = runByDate.get(date)
            const scopedRuns = outcome.streaks.flatMap((scope) => {
              const entry = findSalahStreakRun(scope.runs, date)
              return entry ? [{ ...entry, label: scope.label, key: scope.key }] : []
            })
            return (
              <article key={date} className="rounded-lg bg-gray-800 p-4">
                <button type="button" onClick={() => onOpenDay(date)} className="font-semibold text-teal-300 underline-offset-2 hover:underline focus:underline">{parsed?.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) ?? date} → Open day</button>
                {scopedRuns.length ? scopedRuns.map((entry) => <p key={entry.key} className="mt-2 text-xs text-teal-300">{entry.label} streak: {entry.length} day{entry.length === 1 ? '' : 's'} · {entry.start}–{entry.end} (full run)</p>) : run ? <p className="mt-2 text-xs text-teal-300">All-five streak: {run.length} day{run.length === 1 ? '' : 's'} · {run.start}–{run.end} (full run)</p> : null}
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
