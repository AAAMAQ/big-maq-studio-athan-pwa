// src/features/AthanEngine.tsx

import { useState } from 'react'
import {
  ensureSavedCityTimezone,
  loadSavedCities,
  prayerTimesForSavedCity,
  settingsForSavedCity,
  type SavedCity
} from '../lib/savedCities'
import { formatSignedCorrection, PRAYER_CORRECTION_KEYS } from '../lib/prayerCorrections'
import { getCountryPrayerConfig } from '../data/countryPrayerMethods'
import { effectiveTimeFormat } from '../lib/preferences'
import { addDateKeyDays, dateKeyAnchor, isValidTimezone } from '../lib/sourceTime'
import {
  DEEP_SEARCH_SECOND_REMINDER_KEY,
  loadSecondReminder,
  saveSecondReminder
} from '../lib/calendarSecondReminder'

type Props = {
  go?: (screen: string) => void
}

type EngineMethod =
  | 'MWL'
  | 'UmmAlQura'
  | 'Egypt'
  | 'Karachi'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'Moonsighting'
  | 'ISNA'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey'

type EngineMadhab = 'Shafi' | 'Hanafi'

type EngineLocation = {
  label: string
  latitude: number
  longitude: number
  timezone?: string
  offsetLabel?: string
  countryCode?: string
}

type EnginePrayerRow = {
  date: string
  displayDate: string
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
  instants?: Partial<Record<'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha', Date>>
}

type TimeFormat = '24h' | '12h'

const METHOD_OPTIONS: { value: EngineMethod; label: string }[] = [
  { value: 'MWL', label: 'Muslim World League' },
  { value: 'UmmAlQura', label: 'Umm Al-Qura' },
  { value: 'Egypt', label: 'Egyptian General Authority' },
  { value: 'Karachi', label: 'University of Islamic Sciences, Karachi/India' },
  { value: 'Dubai', label: 'Dubai' },
  { value: 'Qatar', label: 'Qatar' },
  { value: 'Kuwait', label: 'Kuwait' },
  { value: 'Moonsighting', label: 'Moonsighting Committee' },
  { value: 'ISNA', label: 'ISNA' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Tehran', label: 'Tehran' },
  { value: 'Turkey', label: 'Turkey' }
]

const REMINDER_OPTIONS = [0, 5, 10, 15, 20, 30, 45, 60]

function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, amount: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback
}

function formatEngineTime(value: string, format: TimeFormat) {
  const trimmed = value.trim()
  if (format === '24h') return trimmed

  const match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return trimmed

  let hour = Number(match[1])
  const minute = match[2]
  const period = hour >= 12 ? 'PM' : 'AM'

  hour = hour % 12
  if (hour === 0) hour = 12

  return `${hour}:${minute} ${period}`
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) throw new Error('Please choose a valid date range.')
  return new Date(year, month - 1, day)
}

function formatDisplayDate(value: string) {
  return parseDateInput(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function toEngineMethod(method: ReturnType<typeof settingsForSavedCity>['method']): EngineMethod {
  const methods: Record<ReturnType<typeof settingsForSavedCity>['method'], EngineMethod> = {
    MuslimWorldLeague: 'MWL',
    UmmAlQura: 'UmmAlQura',
    Egyptian: 'Egypt',
    Karachi: 'Karachi',
    Dubai: 'Dubai',
    Qatar: 'Qatar',
    Kuwait: 'Kuwait',
    MoonsightingCommittee: 'Moonsighting',
    NorthAmerica: 'ISNA',
    Singapore: 'Singapore',
    Tehran: 'Tehran',
    Turkey: 'Turkey'
  }
  return methods[method]
}

async function loadEngine() {
  const engine = await import('../lib/engine')
  const module = engine as Record<string, unknown>

  const resolveLocation = module.resolveEngineLocation || module.resolveLocation || module.geocodeEngineLocation
  const getPrayerRows = module.getEnginePrayerRows || module.getPrayerRows
  const generateIcs = module.generateEngineIcs || module.generateIcs
  const downloadIcs = module.downloadEngineIcs || module.downloadIcs
  const makeIcsFilename = module.makeEngineIcsFilename || module.makeIcsFilename

  if (typeof resolveLocation !== 'function') {
    throw new Error(`Deep Search Athan engine is missing a location search function. Available exports: ${Object.keys(engine).join(', ') || 'none'}`)
  }

  if (typeof getPrayerRows !== 'function') {
    throw new Error(`Deep Search Athan engine is missing a prayer-row function. Available exports: ${Object.keys(engine).join(', ') || 'none'}`)
  }

  return {
    resolveLocation,
    getPrayerRows,
    generateIcs,
    downloadIcs,
    makeIcsFilename
  }
}

export default function AthanEngine({ go }: Props) {
  const today = new Date()
  const [savedCities] = useState<SavedCity[]>(() => loadSavedCities())
  const [savedCityId, setSavedCityId] = useState('')
  const [activeSavedCityId, setActiveSavedCityId] = useState('')
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState<EngineLocation | null>(null)
  const [rows, setRows] = useState<EnginePrayerRow[]>([])
  const [fromDate, setFromDate] = useState(toDateInputValue(today))
  const [toDate, setToDate] = useState(toDateInputValue(addDays(today, 13)))
  const [method, setMethod] = useState<EngineMethod>('MWL')
  const [madhab, setMadhab] = useState<EngineMadhab>('Shafi')
  const [reminderMinutes, setReminderMinutes] = useState(10)
  const [secondReminder, setSecondReminder] = useState(() => loadSecondReminder(DEEP_SEARCH_SECOND_REMINDER_KEY))
  const [timeFormat] = useState<TimeFormat>(() => effectiveTimeFormat())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const activeSavedCity = savedCities.find((city) => city.id === activeSavedCityId) ?? null

  function updateSecondReminder(update: Partial<typeof secondReminder>) {
    setSecondReminder(saveSecondReminder(DEEP_SEARCH_SECOND_REMINDER_KEY, { ...secondReminder, ...update }))
  }

  async function handleSearch() {
    try {
      setLoading(true)
      setError('')
      setNotice('')

      const engine = await loadEngine()
      const resolvedLocation = await engine.resolveLocation(query) as EngineLocation
      const regionalConfig = getCountryPrayerConfig(resolvedLocation.countryCode)
      const regionalMethod = toEngineMethod(regionalConfig.defaultMethod)
      const regionalMadhab = regionalConfig.defaultMadhab
      const prayerRows = await engine.getPrayerRows({
        location: resolvedLocation,
        fromDate,
        toDate,
        method: regionalMethod,
        madhab: regionalMadhab
      }) as EnginePrayerRow[]

      setMethod(regionalMethod)
      setMadhab(regionalMadhab)
      setLocation(resolvedLocation)
      setActiveSavedCityId('')
      setRows(prayerRows)
      setNotice(`Generated ${prayerRows.length} day${prayerRows.length === 1 ? '' : 's'} for ${resolvedLocation.label} using the ${regionalConfig.countryName} regional defaults (${regionalMethod}, ${regionalMadhab}).`)
    } catch (err) {
      setLocation(null)
      setRows([])
      setError(getErrorMessage(err, 'Something went wrong while searching.'))
    } finally {
      setLoading(false)
    }
  }

  async function generateSavedCityRows(city: SavedCity) {
    const profile = await ensureSavedCityTimezone(city)
    if (!isValidTimezone(profile.timezone)) {
      throw new Error(`The timezone for ${city.name || city.city || 'this saved city'} is unavailable. Add a valid timezone to its City Mode profile before exporting.`)
    }
    const settings = settingsForSavedCity(profile)
    const start = parseDateInput(fromDate)
    const end = parseDateInput(toDate)
    if (start > end) throw new Error('The start date cannot be after the end date.')
    const formatCityTime = (instant: Date) => new Intl.DateTimeFormat('en-GB', {
      timeZone: profile.timezone,
      hourCycle: 'h23', hour: '2-digit', minute: '2-digit'
    }).format(instant)
    const prayerRows: EnginePrayerRow[] = []
    for (let dateKey = fromDate; dateKey <= toDate; dateKey = addDateKeyDays(dateKey, 1)) {
      if (profile.calculationMode === 'manual-timetable' && !profile.manualTimetable?.rows[dateKey.slice(5)]) {
        throw new Error(`The imported timetable for ${profile.name || profile.city} has no row for ${dateKey}.`)
      }
      const times = prayerTimesForSavedCity(profile, dateKeyAnchor(dateKey), { timezoneAware: true })
      prayerRows.push({
        date: dateKey,
        displayDate: formatDisplayDate(dateKey),
        Fajr: formatCityTime(times.fajr), Sunrise: formatCityTime(times.sunrise),
        Dhuhr: formatCityTime(times.dhuhr), Asr: formatCityTime(times.asr),
        Maghrib: formatCityTime(times.maghrib), Isha: formatCityTime(times.isha),
        instants: {
          Fajr: times.fajr, Sunrise: times.sunrise, Dhuhr: times.dhuhr,
          Asr: times.asr, Maghrib: times.maghrib, Isha: times.isha
        }
      })
    }
    const savedLocation: EngineLocation = {
      label: profile.name || profile.city || `${profile.latitude.toFixed(4)}, ${profile.longitude.toFixed(4)}`,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone
    }

    setMethod(toEngineMethod(settings.method))
    setMadhab(settings.madhab)
    setLocation(savedLocation)
    setRows(prayerRows)
    setActiveSavedCityId(city.id)
    return prayerRows
  }

  async function handleLoadSavedCity() {
    const city = savedCities.find((item) => item.id === savedCityId)
    if (!city) {
      setError('Choose a saved city profile first.')
      return
    }
    try {
      setLoading(true)
      setError('')
      setNotice('')
      const prayerRows = await generateSavedCityRows(city)
      setQuery(city.name || city.city)
      setNotice(`Generated ${prayerRows.length} day${prayerRows.length === 1 ? '' : 's'} for ${city.name || city.city} using ${city.calculationMode === 'manual-timetable' ? 'its imported yearly timetable' : 'its saved calculation settings and corrections'}.`)
    } catch (err) {
      setRows([])
      setError(getErrorMessage(err, 'Could not generate prayer times for this saved city.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshRows() {
    if (!location) {
      setError('Please search a location first.')
      return
    }

    try {
      setError('')
      setNotice('')

      if (activeSavedCity) {
        await generateSavedCityRows(activeSavedCity)
        setNotice(`Updated ${activeSavedCity.name || activeSavedCity.city} using ${activeSavedCity.calculationMode === 'manual-timetable' ? 'its imported yearly timetable' : 'its saved method, madhab, high-latitude rule, and corrections'}.`)
        return
      }

      const engine = await loadEngine()
      const prayerRows = await engine.getPrayerRows({
        location,
        fromDate,
        toDate,
        method,
        madhab
      }) as EnginePrayerRow[]

      setRows(prayerRows)
      setNotice(`Updated prayer times using ${method}, ${madhab}, and ${reminderMinutes} minute reminders.`)
    } catch (err) {
      setRows([])
      setError(getErrorMessage(err, 'Could not refresh prayer times.'))
    }
  }

  async function handleDownloadIcs() {
    if (!location || rows.length === 0) {
      setError('Please generate prayer times before downloading an ICS file.')
      return
    }

    try {
      const engine = await loadEngine()

      if (typeof engine.generateIcs !== 'function' || typeof engine.downloadIcs !== 'function' || typeof engine.makeIcsFilename !== 'function') {
        throw new Error('Deep Search Athan engine is missing one or more ICS export functions.')
      }

      const ics = engine.generateIcs({
        location,
        fromDate,
        toDate,
        method,
        madhab,
        rows,
        reminderMinutes,
        secondReminder
      })

      engine.downloadIcs(engine.makeIcsFilename(location, fromDate, toDate), ics)
      setError('')
      setNotice('Your custom ICS file has been downloaded.')
    } catch (err) {
      setError(getErrorMessage(err, 'Could not download the ICS file.'))
    }
  }

  const reminderEventCount = rows.length * 6

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-1 text-center">
        <h1 className="text-2xl font-bold">Deep Search Athan</h1>
        <p className="text-gray-300">
          Search any location and generate custom prayer-time calendar reminders.
        </p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <div className="rounded border border-gray-700 bg-gray-900/70 p-3 space-y-3">
          <div>
            <h2 className="font-semibold">Load from City Mode</h2>
            <p className="text-xs text-gray-400">
              Generate locally with the profile&apos;s method, madhab, high-latitude rule, and signed prayer corrections.
            </p>
          </div>
          {savedCities.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <label htmlFor="deep-search-saved-city" className="sr-only">City Mode profile</label>
              <select
                id="deep-search-saved-city"
                value={savedCityId}
                onChange={(event) => setSavedCityId(event.target.value)}
                className="w-full rounded bg-gray-950 border border-gray-700 px-3 py-2 text-white"
              >
                <option value="">Choose a City Mode profile</option>
                {savedCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name || city.city || 'Unnamed city'}{city.country ? `, ${city.country}` : ''}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleLoadSavedCity}
                disabled={!savedCityId || loading}
                className="rounded bg-teal-600 px-4 py-2 font-semibold hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Load &amp; Generate
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No City Mode profiles are available yet. Add one from More → City Mode first.</p>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="h-px flex-1 bg-gray-700" />
          <span>or search a new location</span>
          <span className="h-px flex-1 bg-gray-700" />
        </div>

        <div className="space-y-2">
          <label htmlFor="athan-engine-location" className="block text-sm font-semibold">
            Search location
          </label>
          <input
            id="athan-engine-location"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleSearch()
            }}
            placeholder="City, country, or coordinates"
            className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white placeholder:text-gray-500"
          />
          <p className="text-xs text-gray-400">
            Examples: London, Makkah Saudi Arabia, or 21.4225, 39.8262.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">From date</span>
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold">To date</span>
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm block">
          <span className="font-semibold">Calculation method</span>
          <select
            value={method}
            onChange={(event) => {
              setMethod(event.target.value as EngineMethod)
              setActiveSavedCityId('')
            }}
            className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="space-y-1 text-sm">
            <span className="font-semibold">Madhab</span>
            <select
              value={madhab}
              onChange={(event) => {
                setMadhab(event.target.value as EngineMadhab)
                setActiveSavedCityId('')
              }}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            >
              <option value="Shafi">Shafi</option>
              <option value="Hanafi">Hanafi</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="font-semibold">Reminder time</span>
            <select
              value={reminderMinutes}
              onChange={(event) => setReminderMinutes(Number(event.target.value))}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2 text-white"
            >
              {REMINDER_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes === 0 ? 'At prayer time' : `${minutes} minutes before prayer`}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1 text-sm">
            <span className="block font-semibold">Time format</span>
            <p className="rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-300">
              {timeFormat === '12h' ? 'AM/PM' : '24-hour'} · Change in Settings → Preferences
            </p>
          </div>
        </div>

        <div className="rounded border border-gray-700 bg-gray-900/70 p-3 space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
            <input
              type="checkbox"
              checked={secondReminder.enabled}
              onChange={(event) => updateSecondReminder({ enabled: event.target.checked })}
              className="h-4 w-4 accent-teal-500"
            />
            Second reminder for each exported prayer-time event
          </label>
          {secondReminder.enabled && (
            <label className="block text-sm text-gray-300" htmlFor="deep-search-second-reminder">
              Second alert
              <select
                id="deep-search-second-reminder"
                value={secondReminder.minutesBefore}
                onChange={(event) => updateSecondReminder({ minutesBefore: Number(event.target.value) })}
                className="mt-1 w-full rounded bg-gray-950 border border-gray-700 px-3 py-2 text-white"
              >
                {REMINDER_OPTIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes === 0 ? 'At prayer time' : `${minutes} minutes before prayer`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {secondReminder.enabled && secondReminder.minutesBefore === reminderMinutes && (
            <p className="text-xs text-amber-200">Choose a different time for the second alert.</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full px-4 py-3 rounded bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold"
          >
            {loading ? 'Searching…' : 'Search & Generate Preview'}
          </button>

          <button
            onClick={handleRefreshRows}
            disabled={!location}
            className="w-full px-4 py-3 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold"
          >
            Refresh Current Preview
          </button>
        </div>

        {error && (
          <p className="rounded bg-red-950/40 border border-red-700 p-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {notice && (
          <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">
            {notice}
          </p>
        )}
      </section>

      {location && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-2">
          <h2 className="text-xl font-semibold">{location.label}</h2>
          <p className="text-sm text-gray-300">
            Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </p>
          <p className="text-xs text-gray-400">
            This Deep Search Athan setup is separate from the main Settings page.
          </p>
          {activeSavedCity && (
            <div className="rounded border border-teal-900 bg-teal-950/30 p-3 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-teal-300">Saved profile applied</p>
              <p>
                {settingsForSavedCity(activeSavedCity).method} · {settingsForSavedCity(activeSavedCity).madhab} · {settingsForSavedCity(activeSavedCity).highLatRule}
              </p>
              <p>
                Corrections: {activeSavedCity.calculationMode === 'custom-corrections'
                  ? PRAYER_CORRECTION_KEYS.map((prayer) => `${prayer} ${formatSignedCorrection(activeSavedCity.manualCorrections?.[prayer])}`).join(' · ')
                  : 'None'}
              </p>
            </div>
          )}
        </section>
      )}

      {rows.length > 0 && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Prayer-time preview</h2>
              <p className="text-sm text-gray-400">
                {rows.length} day{rows.length === 1 ? '' : 's'} selected · {reminderEventCount} prayer reminders
              </p>
            </div>
            <button
              onClick={handleDownloadIcs}
              className="px-4 py-3 rounded bg-teal-600 hover:bg-teal-500 text-white font-semibold"
            >
              Download Custom ICS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-gray-300">
                <tr className="border-b border-gray-700">
                  <th className="py-2 pr-3">Date</th>
                  <th className="py-2 pr-3">Fajr</th>
                  <th className="py-2 pr-3">Sunrise</th>
                  <th className="py-2 pr-3">Dhuhr</th>
                  <th className="py-2 pr-3">Asr</th>
                  <th className="py-2 pr-3">Maghrib</th>
                  <th className="py-2 pr-3">Isha</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.date} className="border-b border-gray-700/60 last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.displayDate}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Fajr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Sunrise, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Dhuhr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Asr, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Maghrib, timeFormat)}</td>
                    <td className="py-2 pr-3">{formatEngineTime(row.Isha, timeFormat)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded bg-gray-900 p-3 text-xs text-gray-400 space-y-1">
            <p>Calendar alerts are handled by your calendar app, not by the PWA.</p>
            <p>The time format option only changes the preview table. Calendar export keeps machine-readable times.</p>
            <p>Avoid importing the same ICS file multiple times to prevent duplicate prayer reminders.</p>
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={() => go ? go('More') : window.location.hash = '#More'}
        className="rounded bg-gray-700 px-4 py-2 hover:bg-gray-600"
      >
        Back
      </button>
    </div>
  )
}
