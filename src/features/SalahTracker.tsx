import { useEffect, useMemo, useState } from 'react'
import { computePrayerTimes } from '../lib/prayer'
import { refreshDeviceLocation } from '../lib/locationStore'
import {
  getSalahStatus,
  parseSalahDate,
  SALAH_PRAYERS,
  summarizeSalahDay,
  type SalahDayLog,
  type SalahLogStatus,
  type SalahPrayerKey
} from '../lib/salahInsights'
import { useSalahData } from '../lib/useSalahData'
import { formatAppTime, loadShowSunnah } from '../lib/preferences'

function pad2(n: number) { return n.toString().padStart(2, '0') }
function ymd(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}` }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function addMonths(d: Date, delta: number) { return new Date(d.getFullYear(), d.getMonth() + delta, 1) }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }

function monthMatrix(forMonth: Date) {
  const first = startOfMonth(forMonth)
  const firstWeekday = first.getDay()
  const start = new Date(first)
  start.setDate(first.getDate() - firstWeekday)
  const matrix: Date[][] = []
  const current = new Date(start)
  for (let rowIndex = 0; rowIndex < 6; rowIndex += 1) {
    const row: Date[] = []
    for (let columnIndex = 0; columnIndex < 7; columnIndex += 1) {
      row.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    matrix.push(row)
  }
  return { matrix, monthFirst: first }
}

export default function SalahTracker({ go, initialDate }: { go: (screen: string) => void; initialDate?: string }) {
  const { store, updateStore: setStore, storageError, todayKey } = useSalahData()
  const [month, setMonth] = useState<Date>(() => startOfMonth(initialDate ? parseSalahDate(initialDate) ?? new Date() : new Date()))
  const [selected, setSelected] = useState<Date>(() => initialDate ? parseSalahDate(initialDate) ?? new Date() : new Date())
  const [todayTimes, setTodayTimes] = useState<Partial<Record<SalahPrayerKey, string>>>({})
  const [showSunnah] = useState(loadShowSunnah)

  useEffect(() => {
    let cancelled = false
    refreshDeviceLocation().then((location) => {
      if (!location.location || cancelled) return
      const times = computePrayerTimes({ latitude: location.location.latitude, longitude: location.location.longitude })
      setTodayTimes({
        Fajr: formatAppTime(times.fajr, { hour: '2-digit' }),
        Dhuhr: formatAppTime(times.dhuhr, { hour: '2-digit' }),
        Asr: formatAppTime(times.asr, { hour: '2-digit' }),
        Maghrib: formatAppTime(times.maghrib, { hour: '2-digit' }),
        Isha: formatAppTime(times.isha, { hour: '2-digit' })
      })
    }).catch(() => undefined)
    return () => { cancelled = true }
  }, [])

  const { matrix, monthFirst } = useMemo(() => monthMatrix(month), [month])
  const selectedKey = ymd(selected)
  const dayLog = store[selectedKey] || {}
  const daySummary = summarizeSalahDay(dayLog)

  function setPrayerStatus(prayer: SalahPrayerKey, status: SalahLogStatus) {
    setStore((current) => {
      const next = { ...current }
      const day = { ...(next[selectedKey] || {}) }
      if (status === 'not-logged') delete day[prayer]
      else day[prayer] = status === 'completed'
      if (Object.keys(day).length === 0) delete next[selectedKey]
      else next[selectedKey] = day
      return next
    })
  }

  function markAllCompleted() {
    setStore((current) => ({
      ...current,
      [selectedKey]: SALAH_PRAYERS.reduce<SalahDayLog>((day, prayer) => {
        day[prayer] = true
        return day
      }, { ...(current[selectedKey] || {}) })
    }))
  }

  function clearAllObligatory() {
    setStore((current) => {
      const next = { ...current }
      const day = { ...(next[selectedKey] || {}) }
      for (const prayer of SALAH_PRAYERS) delete day[prayer]
      if (Object.keys(day).length === 0) delete next[selectedKey]
      else next[selectedKey] = day
      return next
    })
  }

  function toggleSunnah() {
    setStore((current) => {
      const next = { ...current }
      const day = { ...(next[selectedKey] || {}) }
      if (day.Sunnah) delete day.Sunnah
      else day.Sunnah = true
      if (Object.keys(day).length === 0) delete next[selectedKey]
      else next[selectedKey] = day
      return next
    })
  }

  function updateNotes(notes: string) {
    setStore((current) => {
      const next = { ...current }
      const day = { ...(next[selectedKey] || {}) }
      if (notes.length === 0) delete day.Notes
      else day.Notes = notes
      if (Object.keys(day).length === 0) delete next[selectedKey]
      else next[selectedKey] = day
      return next
    })
  }

  function goToday() {
    const today = new Date()
    setMonth(startOfMonth(today))
    setSelected(today)
  }

  const monthLabel = month.toLocaleString(undefined, { month: 'long', year: 'numeric' })
  const selectedLabel = selected.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Track Salah</h1>
        <p className="mt-1 text-sm text-gray-400">Private daily logging stored only on this device.</p>
      </header>
      {storageError ? <p role="alert" className="rounded bg-red-950 p-3 text-sm text-red-100">{storageError}</p> : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous month" onClick={() => setMonth((value) => addMonths(value, -1))} className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">←</button>
          <div className="font-semibold">{monthLabel}</div>
          <button type="button" aria-label="Next month" onClick={() => setMonth((value) => addMonths(value, 1))} className="px-2 py-1 bg-gray-800 rounded hover:bg-gray-700">→</button>
        </div>
        <button type="button" onClick={goToday} className="px-3 py-1 bg-gray-800 rounded hover:bg-gray-700">Today</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((weekday) => (
          <div key={weekday} className="text-center text-gray-400 py-1">{weekday}</div>
        ))}
        {matrix.flat().map((date) => {
          const inMonth = date.getMonth() === monthFirst.getMonth()
          const summary = summarizeSalahDay(store[ymd(date)])
          const future = ymd(date) > todayKey
          const selectedDay = sameDay(date, selected)
          return (
            <button
              key={ymd(date)}
              type="button"
              onClick={() => setSelected(date)}
              className={`aspect-square rounded flex flex-col items-center justify-center ${heatClass(future ? 0 : summary.completed, future ? 0 : summary.logged, inMonth)} ${selectedDay ? 'ring-2 ring-teal-200' : ''}`}
              aria-label={`${date.toDateString()}: ${summary.completed} completed of ${summary.logged} logged; ${future ? 'future date, stars not applicable' : `${summary.stars} of 5 stars`}`}
              title={`${date.toDateString()} · ${summary.logged === 0 ? 'No data' : `${summary.completed} completed, ${summary.missed} missed, ${summary.notLogged} not logged`}`}
            >
              <span className="text-[10px]">{date.getDate()}</span>
              <span className="text-[10px]">{summary.logged === 0 ? '—' : `${summary.completed}/${summary.logged}`}</span>
              <span aria-hidden="true" className={`text-[10px] ${future || summary.stars === 0 ? 'text-gray-400' : summary.stars >= 4 ? 'text-gray-950' : 'text-teal-100'}`}>★ {future ? '—' : `${summary.stars}/5`}</span>
            </button>
          )
        })}
      </div>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-sm text-gray-300">Selected day</div>
            <h2 className="text-lg font-semibold">{selectedLabel}</h2>
          </div>
          <div className={`text-sm ${daySummary.logged === 0 ? 'text-gray-400' : 'text-gray-300'}`}>
            {daySummary.logged === 0
              ? 'No data for this day'
              : `${daySummary.completed} completed · ${daySummary.missed} missed · ${daySummary.notLogged} not logged`}
          </div>
        </div>
        <p className="text-sm text-teal-300">{selectedKey > todayKey ? 'Future date: stars do not count yet.' : `★ ${daySummary.stars}/5 stars`} <span className="text-xs text-gray-400">Missed and not logged earn zero stars; logged-data rates stay separate.</span></p>

        {sameDay(selected, new Date()) ? (
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
            {SALAH_PRAYERS.map((prayer) => todayTimes[prayer] ? <span key={prayer}>{prayer}: {todayTimes[prayer]}</span> : null)}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          {SALAH_PRAYERS.map((prayer) => (
            <PrayerStatusControl
              key={prayer}
              prayer={prayer}
              status={getSalahStatus(dayLog, prayer)}
              onChange={(status) => setPrayerStatus(prayer, status)}
            />
          ))}
        </div>

        {showSunnah ? (
          <div className="rounded border border-gray-700 bg-gray-900 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold">Optional Sunnahs</div>
                <div className="text-xs text-gray-400">Kept separate from obligatory totals, rates, and streaks.</div>
              </div>
              <button type="button" aria-pressed={dayLog.Sunnah === true} onClick={toggleSunnah} className={`rounded px-3 py-2 text-sm font-semibold ${dayLog.Sunnah ? 'bg-teal-600 hover:bg-teal-500' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {dayLog.Sunnah ? 'Completed ✓' : 'Not logged'}
              </button>
            </div>
          </div>
        ) : null}

        <label className="block rounded border border-gray-700 bg-gray-900 p-3">
          <span className="font-semibold">Daily notes</span>
          <textarea
            value={dayLog.Notes || ''}
            onChange={(event) => updateNotes(event.target.value)}
            rows={4}
            maxLength={5000}
            placeholder="Write a private note for this day…"
            className="mt-2 w-full resize-y rounded border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none transition placeholder:text-gray-500 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
          <span className="mt-2 block text-xs leading-5 text-gray-400">Stored only on this device and included in Backup &amp; Restore.</span>
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={markAllCompleted} className="px-3 py-2 rounded bg-teal-700 hover:bg-teal-600">Mark all completed</button>
          <button type="button" onClick={clearAllObligatory} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">Clear all obligatory</button>
        </div>
      </section>

      <section aria-label="Explore Salah Tracker" className="grid gap-3 sm:grid-cols-3">
        <ExploreButton title="Insights" description="Rates, streaks, and summaries" onClick={() => go('SalahInsights')} />
        <ExploreButton title="Search Salah Progress" description="Find days by date and prayer status" onClick={() => go('SalahSearch')} />
        <ExploreButton title="Graph Insights" description="See logged patterns visually" onClick={() => go('SalahGraphs')} />
      </section>
    </div>
  )
}

function PrayerStatusControl({ prayer, status, onChange }: { prayer: SalahPrayerKey; status: SalahLogStatus; onChange: (status: SalahLogStatus) => void }) {
  return (
    <fieldset className="rounded border border-gray-700 bg-gray-900 p-3">
      <legend className="px-1 font-semibold text-teal-300">{prayer}</legend>
      <div className="grid grid-cols-3 gap-1" aria-label={`${prayer} status`}>
        <StatusButton label="Completed" selected={status === 'completed'} selectedClass="bg-teal-600 border-teal-400" onClick={() => onChange('completed')} />
        <StatusButton label="Missed" selected={status === 'missed'} selectedClass="bg-red-900 border-red-500" onClick={() => onChange('missed')} />
        <StatusButton label="Not logged" selected={status === 'not-logged'} selectedClass="bg-gray-600 border-gray-400" onClick={() => onChange('not-logged')} />
      </div>
    </fieldset>
  )
}

function StatusButton({ label, selected, selectedClass, onClick }: { label: string; selected: boolean; selectedClass: string; onClick: () => void }) {
  return (
    <button type="button" aria-pressed={selected} onClick={onClick} className={`min-h-11 rounded border px-2 py-2 text-xs font-semibold ${selected ? selectedClass : 'border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
      {label}
    </button>
  )
}

function ExploreButton({ title, description, onClick }: { title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="min-h-20 rounded-lg bg-gray-800 p-4 text-left hover:bg-gray-700 focus:outline focus:outline-2 focus:outline-teal-400"><span className="block font-semibold text-teal-300">{title} →</span><span className="mt-1 block text-xs text-gray-400">{description}</span></button>
}

function heatClass(completed: number, logged: number, inMonth: boolean) {
  const opacity = inMonth ? '' : 'opacity-40'
  if (logged === 0) return `bg-gray-800 ${opacity}`
  if (completed === 0) return `bg-red-950 ${opacity}`
  const colors = ['bg-gray-800', 'bg-teal-900', 'bg-teal-800', 'bg-teal-700', 'bg-teal-600', 'bg-teal-500']
  return `${colors[completed]} ${opacity}`
}
