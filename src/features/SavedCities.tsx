import { useMemo, useState } from 'react'
import { COUNTRY_PRAYER_CONFIGS, getCountryPrayerConfig } from '../data/countryPrayerMethods'
import { buildIcsForDates, downloadICS } from '../lib/ics'
import { parseManualPrayerTimetableFile } from '../lib/manualPrayerTimetable'
import { type HighLatKey, type MadhabKey, type MethodKey } from '../lib/prayer'
import {
  DEFAULT_PRAYER_CORRECTIONS,
  PRAYER_CORRECTION_KEYS,
  formatSignedCorrection,
  normalizeCorrectionMinutes,
  type PrayerTimeCorrections
} from '../lib/prayerCorrections'
import {
  createSavedCity,
  correctionsForSavedCity,
  deleteSavedCity,
  ensureSavedCityTimezone,
  loadSavedCities,
  loadTravelDestinationId,
  prayerTimesForSavedCity,
  searchSavedCity,
  setTravelDestinationId,
  settingsForSavedCity,
  upsertSavedCity,
  type SavedCity
} from '../lib/savedCities'
import { buildTimetableCsv, buildTimetableText, downloadTextFile, shareTimetable } from '../lib/timetableExport'
import { formatAppTime } from '../lib/preferences'
import { buildSavedCityProfileText, shareProfileText } from '../lib/profileSharing'

type Props = {
  go?: (screen: string) => void
}

const METHODS: MethodKey[] = ['MuslimWorldLeague','UmmAlQura','Egyptian','Karachi','Dubai','Qatar','Kuwait','MoonsightingCommittee','NorthAmerica','Singapore','Tehran','Turkey']
const MADHABS: MadhabKey[] = ['Shafi','Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight','SeventhOfTheNight','TwilightAngle']

export default function SavedCities({ go }: Props) {
  const [cities, setCities] = useState<SavedCity[]>(() => loadSavedCities())
  const [selectedId, setSelectedId] = useState(() => cities[0]?.id ?? '')
  const [travelId, setTravelId] = useState(() => loadTravelDestinationId())
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Partial<SavedCity>[]>([])
  const [message, setMessage] = useState('')
  const [fromDate, setFromDate] = useState(() => formatDate(new Date()))
  const [toDate, setToDate] = useState(() => formatDate(new Date()))

  const selected = useMemo(() => cities.find((city) => city.id === selectedId) ?? cities[0] ?? null, [cities, selectedId])
  const selectedConfig = selected ? getCountryPrayerConfig(selected.countryCode) : null
  const previewRows = useMemo(() => {
    if (!selected) return []
    return makeRows(selected, parseDate(fromDate), parseDate(toDate)).slice(0, 7)
  }, [fromDate, selected, toDate])

  async function search() {
    try {
      setMessage('Searching…')
      setResults(await searchSavedCity(query))
      setMessage('Choose a result to save.')
    } catch {
      setMessage('City search failed. Check your connection or enter coordinates manually.')
    }
  }

  async function saveResult(result: Partial<SavedCity>, resolveTimezone = true) {
    setMessage(resolveTimezone ? 'Checking the selected city’s timezone…' : 'Saving city…')
    const draft = createSavedCity(result)
    const city = resolveTimezone && hasUsableCoordinates(draft) ? await ensureSavedCityTimezone(draft) : draft
    const next = upsertSavedCity(city, cities)
    setCities(next)
    setSelectedId(city.id)
    setResults([])
    setMessage(city.timezone
      ? `Saved city added with ${city.timezone} timezone.`
      : 'Saved city added. Its timezone is unavailable; city-time display and UTC exports need a timezone.')
  }

  function updateSelected(next: SavedCity) {
    setCities((current) => current.map((city) => city.id === next.id ? next : city))
  }

  async function saveSelected() {
    if (!selected) return
    setMessage('Checking the selected city’s timezone…')
    const city = hasUsableCoordinates(selected) ? await ensureSavedCityTimezone(selected) : selected
    const next = upsertSavedCity(city, cities)
    setCities(next)
    setMessage(city.timezone
      ? `Saved city updated on this device with ${city.timezone} timezone.`
      : 'Saved city updated. Its timezone is unavailable; city-time display and UTC exports need a timezone.')
  }

  function removeSelected() {
    if (!selected) return
    if (!window.confirm('Remove this saved city from this device?')) return
    const next = deleteSavedCity(selected.id, cities)
    setCities(next)
    setSelectedId(next[0]?.id ?? '')
    setMessage('Saved city removed.')
  }

  function markTravel() {
    if (!selected) return
    setTravelDestinationId(selected.id)
    setTravelId(selected.id)
    setMessage(`${selected.name || selected.city} is now the primary prayer time source for Home and Prayer Times.`)
  }

  function clearTravel() {
    setTravelDestinationId('')
    setTravelId('')
    setMessage('Primary prayer source reset to the current device location.')
  }

  async function importTimetable(file: File | undefined) {
    if (!selected || !file) return
    try {
      setMessage('Reading and validating the yearly prayer timetable…')
      const manualTimetable = await parseManualPrayerTimetableFile(file)
      const locationParts = manualTimetable.sourceLocation?.split(',').map((part) => part.trim()).filter(Boolean) ?? []
      const importedCountry = locationParts.at(-1) || selected.country
      const importedCity = locationParts[0] || selected.city
      const countryConfig = COUNTRY_PRAYER_CONFIGS.find((item) => item.countryName.toLowerCase() === importedCountry.toLowerCase())
      const coordinatesChanged = (
        (manualTimetable.sourceLatitude !== undefined && manualTimetable.sourceLatitude !== selected.latitude)
        || (manualTimetable.sourceLongitude !== undefined && manualTimetable.sourceLongitude !== selected.longitude)
      )
      const updated: SavedCity = {
        ...selected,
        calculationMode: 'manual-timetable',
        manualTimetable,
        name: selected.name === 'Manual City' && importedCity
          ? importedCity
          : selected.name,
        city: importedCity,
        country: importedCountry,
        countryCode: countryConfig?.countryCode || selected.countryCode,
        latitude: manualTimetable.sourceLatitude ?? selected.latitude,
        longitude: manualTimetable.sourceLongitude ?? selected.longitude,
        timezone: coordinatesChanged ? undefined : selected.timezone
      }
      const city = hasUsableCoordinates(updated) ? await ensureSavedCityTimezone(updated) : updated
      const next = upsertSavedCity(city, cities)
      setCities(next)
      setSelectedId(city.id)
      setMessage(`Imported ${manualTimetable.rowCount} Gregorian dates from ${manualTimetable.sourceSheetName}. This profile now uses the timetable file.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The timetable file could not be imported.')
    }
  }

  function duplicateSelected() {
    if (!selected) return
    const copy = createSavedCity({
      ...selected,
      id: undefined,
      name: `${selected.name || selected.city || 'City'} copy`,
      createdAt: undefined,
      updatedAt: undefined
    })
    const next = upsertSavedCity(copy, cities)
    setCities(next)
    setSelectedId(copy.id)
    setMessage('City profile duplicated. Rename it to describe the local timetable or area.')
  }

  function updateCorrection(key: keyof PrayerTimeCorrections, value: number) {
    if (!selected) return
    updateSelected({
      ...selected,
      calculationMode: 'custom-corrections',
      manualCorrections: {
        ...(selected.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS),
        [key]: normalizeCorrectionMinutes(value)
      }
    })
  }

  function exportIcs() {
    if (!selected) return
    const rows = makeRows(selected, parseDate(fromDate), parseDate(toDate))
    const items = rows.flatMap((row) => [
      { title: 'Fajr', when: row.times.fajr },
      { title: 'Sunrise', when: row.times.sunrise },
      { title: 'Dhuhr', when: row.times.dhuhr },
      { title: 'Asr', when: row.times.asr },
      { title: 'Maghrib', when: row.times.maghrib },
      { title: 'Isha', when: row.times.isha }
    ])
    const ics = buildIcsForDates(items, `Athan ${selected.name || selected.city}`, 'ATHAN-PWA-SAVED-CITY', 10)
    downloadICS(`athan-${safeFile(selected.name || selected.city)}-${fromDate}-to-${toDate}.ics`, ics)
  }

  function exportCsv() {
    if (!selected) return
    const options = timetableOptions(selected, fromDate, toDate)
    downloadTextFile(`athan-${safeFile(selected.name || selected.city)}-${fromDate}-to-${toDate}.csv`, buildTimetableCsv(options), 'text/csv;charset=utf-8')
  }

  async function shareText() {
    if (!selected) return
    setMessage(await shareTimetable(buildTimetableText(timetableOptions(selected, fromDate, toDate))))
  }

  async function shareCityProfile() {
    if (!selected) return
    const result = await shareProfileText(
      `Athan PWA city profile — ${selected.name || selected.city || 'Saved city'}`,
      buildSavedCityProfileText(selected)
    )
    if (result === 'cancelled') return
    setMessage(result === 'shared'
      ? 'City profile shared.'
      : result === 'copied'
        ? 'City profile copied to the clipboard.'
        : 'Profile sharing is not available in this browser.')
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="text-center space-y-2">
        <h1 className="text-2xl font-bold">City Mode</h1>
        <p className="text-sm text-gray-300">Save multiple city presets, apply corrections or imported yearly timetables, and choose a primary prayer source.</p>
      </header>

      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <h2 className="font-semibold">Search and Save City</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city, country, or coordinates" className="flex-1 rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          <button type="button" onClick={search} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-2 font-semibold">Search</button>
        </div>
        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <button key={index} type="button" onClick={() => { void saveResult(result) }} className="block w-full rounded bg-gray-900 hover:bg-gray-700 p-3 text-left">
                <span className="font-semibold">{result.name || result.city || 'Location'}</span>
                <span className="block text-xs text-gray-400">{result.country} · {result.latitude}, {result.longitude}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg bg-gray-800 p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold">City Profiles</h2>
          <button type="button" onClick={() => { void saveResult(createSavedCity({ name: 'Manual City' }), false) }} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm">Add Manual City</button>
        </div>
        {cities.length === 0 ? <p className="text-sm text-gray-400">No saved cities yet.</p> : (
          <div className="grid gap-2 sm:grid-cols-2">
            {cities.map((city) => (
              <button key={city.id} type="button" onClick={() => setSelectedId(city.id)} className={`rounded border p-3 text-left ${selected?.id === city.id ? 'border-teal-400 bg-teal-900/40' : 'border-gray-700 bg-gray-900 hover:bg-gray-700'}`}>
                <div className="font-semibold">{city.name || city.city || 'Unnamed city'}</div>
                <div className="text-xs text-gray-400">{city.countryCode} · {city.calculationMode}{travelId === city.id ? ' · Primary prayer source' : ''}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <section className="rounded-lg bg-gray-800 p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Display name" value={selected.name} onChange={(value) => updateSelected({ ...selected, name: value })} />
            <TextField label="City" value={selected.city} onChange={(value) => updateSelected({ ...selected, city: value })} />
            <TextField label="Country" value={selected.country} onChange={(value) => updateSelected({ ...selected, country: value })} />
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Country code</span>
              <select value={selected.countryCode} onChange={(event) => {
                const config = getCountryPrayerConfig(event.target.value)
                updateSelected({ ...selected, countryCode: config.countryCode, country: config.countryName, calculationMethod: config.defaultMethod, madhab: config.defaultMadhab, highLatitudeRule: config.highLatitudeRule })
              }} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">
                <option value="ZZ">Choose a country</option>
                {COUNTRY_PRAYER_CONFIGS.map((item) => <option key={item.countryCode} value={item.countryCode}>{item.countryName}</option>)}
              </select>
            </label>
            <NumberField label="Latitude" value={selected.latitude} onChange={(value) => updateSelected({ ...selected, latitude: value, timezone: undefined })} />
            <NumberField label="Longitude" value={selected.longitude} onChange={(value) => updateSelected({ ...selected, longitude: value, timezone: undefined })} />
          </div>

          <div className="rounded bg-gray-900 p-3 text-sm text-gray-300">
            Auto selected: <span className="font-semibold text-teal-300">{selectedConfig?.defaultMethod}</span> based on {selected.country || selectedConfig?.countryName}. {selectedConfig?.notes}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Calculation mode</span>
              <select value={selected.calculationMode} onChange={(event) => updateSelected({ ...selected, calculationMode: event.target.value as SavedCity['calculationMode'] })} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">
                <option value="auto">Auto country defaults</option>
                <option value="manual-method">Manual method</option>
                <option value="custom-corrections">Manual method + corrections</option>
                <option value="manual-timetable" disabled={!selected.manualTimetable}>Imported yearly timetable file</option>
              </select>
            </label>
            <SelectField label="Method" value={selected.calculationMethod} options={METHODS} onChange={(value) => updateSelected({ ...selected, calculationMethod: value as MethodKey, calculationMode: selected.calculationMode === 'custom-corrections' ? 'custom-corrections' : 'manual-method' })} />
            <SelectField label="Madhab" value={selected.madhab} options={MADHABS} onChange={(value) => updateSelected({ ...selected, madhab: value as MadhabKey, calculationMode: selected.calculationMode === 'custom-corrections' ? 'custom-corrections' : 'manual-method' })} />
            <SelectField label="High latitude" value={selected.highLatitudeRule} options={HIGHLATS} onChange={(value) => updateSelected({ ...selected, highLatitudeRule: value as HighLatKey, calculationMode: selected.calculationMode === 'custom-corrections' ? 'custom-corrections' : 'manual-method' })} />
          </div>

          <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div>
              <h3 className="font-semibold">Manual yearly prayer timetable</h3>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Import an .xlsx, .csv, or .json calendar when local mosque times differ from built-in calculation methods. The file is read only on this device and is never uploaded.
              </p>
            </div>
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-md border border-teal-800 bg-teal-950/40 px-4 text-sm font-semibold text-teal-200 hover:bg-teal-900/50">
              Import Timetable File
              <input
                type="file"
                accept=".xlsx,.csv,.json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,application/json"
                className="sr-only"
                onChange={(event) => {
                  void importTimetable(event.target.files?.[0])
                  event.target.value = ''
                }}
              />
            </label>
            {selected.manualTimetable && (
              <div className="rounded-md bg-gray-950/70 p-3 text-xs leading-5 text-gray-300">
                <p className="font-semibold text-teal-300">Imported timetable active</p>
                <p>{selected.manualTimetable.sourceFileName} · {selected.manualTimetable.rowCount} dates</p>
                <p>Source: {selected.manualTimetable.sourceSheetName}{selected.manualTimetable.sourceLocation ? ` · ${selected.manualTimetable.sourceLocation}` : ''}</p>
                <button
                  type="button"
                  onClick={() => updateSelected({ ...selected, calculationMode: 'auto', manualTimetable: undefined })}
                  className="mt-2 rounded-md border border-red-900 px-3 py-2 font-semibold text-red-200"
                >
                  Remove Imported Timetable
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div>
              <h3 className="font-semibold">Prayer time corrections</h3>
              <p className="text-xs text-gray-400">
                Use negative minutes for an earlier time and positive minutes for a later time. Preview and exports include these corrections.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {PRAYER_CORRECTION_KEYS.map((key) => (
                <SignedCorrectionField
                  key={key}
                  label={key}
                  value={(selected.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS)[key]}
                  onChange={(value) => updateCorrection(key, value)}
                />
              ))}
            </div>
            <p className="rounded bg-gray-950/60 px-3 py-2 text-xs text-gray-300">
              Active offsets: {PRAYER_CORRECTION_KEYS.map((key) => `${key} ${formatSignedCorrection((selected.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS)[key])}`).join(' · ')} minutes
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">From date</span>
              <input type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">To date</span>
              <input type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
          </div>

          <div className="overflow-x-auto rounded bg-gray-900 p-3">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-gray-400"><tr><th>Date</th><th>Fajr</th><th>Sunrise</th><th>Dhuhr</th><th>Asr</th><th>Maghrib</th><th>Isha</th></tr></thead>
              <tbody>{previewRows.map((row) => <tr key={row.date} className="border-t border-gray-800"><td>{row.date}</td><td>{fmt(row.times.fajr)}</td><td>{fmt(row.times.sunrise)}</td><td>{fmt(row.times.dhuhr)}</td><td>{fmt(row.times.asr)}</td><td>{fmt(row.times.maghrib)}</td><td>{fmt(row.times.isha)}</td></tr>)}</tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={saveSelected} className="rounded bg-teal-600 hover:bg-teal-500 px-3 py-2 font-semibold">Save City</button>
            <button type="button" onClick={markTravel} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Use as Primary Prayer Source</button>
            <button type="button" onClick={clearTravel} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Use Current Device Location</button>
            <button type="button" onClick={duplicateSelected} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Duplicate Profile</button>
            <button type="button" onClick={exportIcs} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Export Athan ICS</button>
            <button type="button" onClick={exportCsv} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Export CSV</button>
            <button type="button" onClick={shareText} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 font-semibold">Share Text</button>
            <button type="button" onClick={shareCityProfile} className="rounded border border-teal-700 bg-teal-950/40 px-3 py-2 font-semibold text-teal-200 hover:bg-teal-900/60">Share City Profile</button>
            <button type="button" onClick={removeSelected} className="rounded bg-red-900/70 hover:bg-red-800 px-3 py-2 font-semibold">Remove City</button>
          </div>
          <p className="rounded border border-amber-900/70 bg-amber-950/30 p-3 text-xs leading-5 text-amber-100">
            Sharing this profile includes its city, coordinates, calculation settings, corrections, and notes.
            Imported yearly timetable rows are not included. Review the selected profile before sharing.
          </p>
        </section>
      )}

      {message && <p className="rounded bg-gray-800 p-3 text-sm text-teal-300">{message}</p>}
      <button type="button" onClick={() => go ? go('More') : window.location.hash = '#More'} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-2">Back</button>
    </div>
  )
}

function makeRows(city: SavedCity, from: Date, to: Date) {
  const rows = []
  const current = new Date(from)
  while (current <= to) {
    const times = prayerTimesForSavedCity(city, current)
    rows.push({ date: formatDate(current), times })
    current.setDate(current.getDate() + 1)
  }
  return rows
}

function timetableOptions(city: SavedCity, fromDate: string, toDate: string) {
  return {
    locationName: city.name || city.city || 'Saved city',
    coords: { latitude: city.latitude, longitude: city.longitude },
    fromDate: parseDate(fromDate),
    toDate: parseDate(toDate),
    settings: settingsForSavedCity(city),
    corrections: correctionsForSavedCity(city),
    prayerTimesForDate: (date: Date) => prayerTimesForSavedCity(city, date),
    sourceDescription: city.calculationMode === 'manual-timetable'
      ? `Imported yearly timetable (${city.manualTimetable?.sourceFileName || 'file'})`
      : undefined
  }
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" /></label>
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" /></label>
}

function SignedCorrectionField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  const normalized = normalizeCorrectionMinutes(value)
  return (
    <div className="rounded border border-gray-700 bg-gray-900 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{label}</span>
        <span className={`min-w-12 rounded px-2 py-1 text-center text-sm font-bold ${normalized === 0 ? 'bg-gray-800 text-gray-300' : normalized > 0 ? 'bg-teal-950 text-teal-300' : 'bg-amber-950/60 text-amber-200'}`}>
          {formatSignedCorrection(normalized)}
        </span>
      </div>
      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] gap-2">
        <button
          type="button"
          onClick={() => onChange(normalized - 1)}
          aria-label={`Move ${label} one minute earlier`}
          className="h-10 rounded bg-gray-800 text-lg font-bold hover:bg-gray-700"
        >
          −
        </button>
        <input
          type="number"
          min="-180"
          max="180"
          step="1"
          value={normalized}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={`${label} correction in minutes`}
          className="min-w-0 rounded border border-gray-700 bg-gray-950 px-2 text-center"
        />
        <button
          type="button"
          onClick={() => onChange(normalized + 1)}
          aria-label={`Move ${label} one minute later`}
          className="h-10 rounded bg-gray-800 text-lg font-bold hover:bg-gray-700"
        >
          +
        </button>
      </div>
      <p className="text-center text-[11px] text-gray-500">− earlier · + later</p>
    </div>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="space-y-1 text-sm"><span className="font-semibold">{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

function hasUsableCoordinates(city: SavedCity) {
  return Number.isFinite(city.latitude) && Number.isFinite(city.longitude)
    && (city.latitude !== 0 || city.longitude !== 0)
}

function parseDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fmt(date: Date) {
  return formatAppTime(date, { hour: '2-digit' })
}

function safeFile(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'saved-city'
}
