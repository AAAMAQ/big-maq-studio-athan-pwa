import { useEffect, useState } from 'react'
import { formatPrimaryPrayerTime, prayerTimesForPrimarySourceDate, primaryTimeViewLabel, resolvePrimaryPrayerSource, sourceDateKey, type PrimaryPrayerSource } from '../lib/primaryPrayerSource'
import { loadSavedCityTimeView, type SavedCityTimeView } from '../lib/preferences'
import { sourceWeekday } from '../lib/sourceTime'

const PRAYERS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
type PrayerName = typeof PRAYERS[number]
type Row = { date: number } & Record<PrayerName, string>

export default function PrayerMonth() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [source, setSource] = useState<PrimaryPrayerSource | null>(null)
  const [timeView] = useState<SavedCityTimeView>(loadSavedCityTimeView)

  useEffect(() => {
    let cancelled = false
    resolvePrimaryPrayerSource().then((resolved) => {
      if (cancelled) return
      setSource(resolved)
      const [sourceYear, sourceMonth] = sourceDateKey(resolved).split('-').map(Number)
      setYear(sourceYear)
      setMonth(sourceMonth - 1)
    }).catch((reason) => {
      if (!cancelled) {
        setError(reason instanceof Error ? reason.message : 'Prayer source unavailable.')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    if (!source) return () => { cancelled = true }
    ;(async () => {
      const results: Row[] = []
      const daysInMonth = new Date(year, month + 1, 0).getDate()
      for (let day = 1; day <= daysInMonth; day += 1) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const times = prayerTimesForPrimarySourceDate(source, dateKey)
        results.push({
          date: day,
          Fajr: formatPrimaryPrayerTime(source, times.fajr, timeView),
          Sunrise: formatPrimaryPrayerTime(source, times.sunrise, timeView),
          Dhuhr: formatPrimaryPrayerTime(source, times.dhuhr, timeView),
          Asr: formatPrimaryPrayerTime(source, times.asr, timeView),
          Maghrib: formatPrimaryPrayerTime(source, times.maghrib, timeView),
          Isha: formatPrimaryPrayerTime(source, times.isha, timeView)
        })
      }
      if (!cancelled) setRows(results)
    })()
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Monthly prayer times could not be calculated.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [month, source, timeView, year])

  const monthName = new Date(2000, month, 1).toLocaleString([], { month: 'long' })
  const todayKey = source ? sourceDateKey(source) : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const previousMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((value) => value - 1)
    } else {
      setMonth((value) => value - 1)
    }
  }
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((value) => value + 1)
    } else {
      setMonth((value) => value + 1)
    }
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-xs font-semibold uppercase text-teal-400">Monthly Timetable</p>
        <h2 className="mt-1 text-2xl font-bold text-white">{monthName} {year}</h2>
        <p className={`mt-1 text-xs ${source?.savedCity ? 'font-semibold text-teal-300' : 'text-gray-500'}`}>
          {source?.savedCity ? `Saved City: ${source.locationLabel}` : 'Current device location'}
        </p>
        {source && <p className="mt-1 text-xs text-gray-400">{primaryTimeViewLabel(source, timeView)}</p>}
      </header>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3">
        <button type="button" aria-label="Previous month" className="h-10 w-10 rounded-md bg-gray-900 text-gray-200 hover:bg-gray-700" onClick={previousMonth}>←</button>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <span className="font-semibold text-gray-100">{monthName}</span>
          <select
            aria-label="Timetable year"
            className="rounded-md border border-gray-700 bg-gray-950 px-2 py-2 text-sm text-gray-100"
            value={year}
            onChange={(event) => setYear(Number.parseInt(event.target.value, 10))}
          >
            {Array.from({ length: 11 }, (_, index) => Number(todayKey.slice(0, 4)) - 5 + index).map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </div>
        <button type="button" aria-label="Next month" className="h-10 w-10 rounded-md bg-gray-900 text-gray-200 hover:bg-gray-700" onClick={nextMonth}>→</button>
      </section>

      <section className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800/80">
        {loading ? (
          <p className="p-8 text-center text-sm text-gray-400">Calculating monthly prayer times…</p>
        ) : error ? (
          <p role="alert" className="p-8 text-center text-sm text-amber-200">{error}</p>
        ) : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-gray-900/80 text-xs uppercase text-gray-400">
              <tr>
                <th className="px-3 py-3">Day</th>
                {PRAYERS.map((prayer) => <th key={prayer} className="px-3 py-3">{prayer}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/70">
              {rows.map((row) => (
                <tr key={row.date} className={`${year}-${String(month + 1).padStart(2, '0')}-${String(row.date).padStart(2, '0')}` === todayKey ? 'bg-teal-950/35' : ''}>
                  <td className="px-3 py-3 font-semibold text-teal-300">{row.date}{sourceWeekday(`${year}-${String(month + 1).padStart(2, '0')}-${String(row.date).padStart(2, '0')}`) === 5 ? <span className="ml-1 text-xs text-teal-200">Fri · Jumu’ah</span> : null}</td>
                  {PRAYERS.map((prayer) => <td key={prayer} className="whitespace-nowrap px-3 py-3 text-gray-200">{row[prayer]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
