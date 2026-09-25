import { buildIcsCalendar, downloadICS } from './ics'

const ENGINE_LOCATION_CACHE_KEY = 'athan.engine.locationCache.v2'
const ENGINE_LOCATION_CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
const ENGINE_LOCATION_CACHE_MAX_ITEMS = 100

const ALADHAN_METHOD_BY_ENGINE: Record<EngineMethod, number> = {
  MWL: 3,
  UmmAlQura: 4,
  Egypt: 5,
  Karachi: 1,
  Dubai: 16,
  Qatar: 10,
  Kuwait: 9,
  Moonsighting: 15,
  ISNA: 2,
  Singapore: 11,
  Tehran: 7,
  Turkey: 13
}

export type EngineMethod =
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

export type EngineMadhab = 'Shafi' | 'Hanafi'

export type EngineLocation = {
  label: string
  latitude: number
  longitude: number
  timezone?: string
  offsetLabel?: string
  offsetMinutes?: number
  countryCode?: string
}

type CachedEngineLocation = EngineLocation & {
  cachedAt: number
}

export type EnginePrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export type EnginePrayerRow = {
  date: string
  displayDate: string
  Fajr: string
  Sunrise: string
  Dhuhr: string
  Asr: string
  Maghrib: string
  Isha: string
}

export type EnginePrayerOptions = {
  location: EngineLocation
  fromDate: string
  toDate: string
  method: EngineMethod
  madhab: EngineMadhab
}


export type EngineIcsOptions = EnginePrayerOptions & {
  rows: EnginePrayerRow[]
  reminderMinutes: number
  includePrayers?: Partial<Record<EnginePrayerName, boolean>>
}

export const ENGINE_PRAYERS: EnginePrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export const ENGINE_REMINDER_PRAYERS: EnginePrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export function parseCoordinates(query: string): { latitude: number; longitude: number } | null {
  const match = query.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (!match) return null

  const latitude = Number(match[1])
  const longitude = Number(match[2])

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (latitude < -90 || latitude > 90) return null
  if (longitude < -180 || longitude > 180) return null

  return { latitude, longitude }
}

export async function resolveEngineLocation(query: string): Promise<EngineLocation> {
  const trimmed = query.trim()
  if (!trimmed) throw new Error('Please enter a city, country, or coordinates.')

  const coordinates = parseCoordinates(trimmed)
  const cacheKey = coordinates
    ? makeLocationCacheKey(`${coordinates.latitude.toFixed(5)},${coordinates.longitude.toFixed(5)}`)
    : makeLocationCacheKey(trimmed)

  const cached = getCachedEngineLocation(cacheKey)
  if (cached?.timezone && cached.countryCode) return cached

  const location = coordinates
    ? await reverseGeocodeEngineLocation(coordinates.latitude, coordinates.longitude)
    : await geocodeEngineLocation(trimmed)

  const enrichedLocation = await addOfficialTimezone(location)
  setCachedEngineLocation(cacheKey, enrichedLocation)
  return enrichedLocation
}

export async function geocodeEngineLocation(query: string): Promise<EngineLocation> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' }
  })

  if (!response.ok) throw new Error('Could not search this location.')

  const results = await response.json()
  const first = Array.isArray(results) ? results[0] : null
  if (!first) throw new Error('No matching location found.')

  const latitude = Number(first.lat)
  const longitude = Number(first.lon)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error('The location search returned invalid coordinates.')
  }

  const address = first.address ?? {}
  const city = address.city || address.town || address.village || address.hamlet || address.municipality || address.county
  const region = address.state || address.region
  const country = address.country
  const label = [city, region, country].filter(Boolean).join(', ') || first.display_name || query

  return {
    label,
    latitude,
    longitude,
    countryCode: typeof address.country_code === 'string' ? address.country_code.toUpperCase() : undefined
  }
}

export async function reverseGeocodeEngineLocation(latitude: number, longitude: number): Promise<EngineLocation> {
  const fallbackLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) {
      return { label: fallbackLabel, latitude, longitude }
    }

    const data = await response.json()
    const address = data?.address ?? {}
    const city = address.city || address.town || address.village || address.hamlet || address.municipality || address.county
    const region = address.state || address.region
    const country = address.country
    const label = [city, region, country].filter(Boolean).join(', ') || data?.display_name || fallbackLabel

    return {
      label,
      latitude,
      longitude,
      countryCode: typeof address.country_code === 'string' ? address.country_code.toUpperCase() : undefined
    }
  } catch {
    return { label: fallbackLabel, latitude, longitude }
  }
}

function makeLocationCacheKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getLocationCache(): Record<string, CachedEngineLocation> {
  try {
    const raw = localStorage.getItem(ENGINE_LOCATION_CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function saveLocationCache(cache: Record<string, CachedEngineLocation>) {
  try {
    localStorage.setItem(ENGINE_LOCATION_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore cache write failures so location search still works.
  }
}

function getCachedEngineLocation(cacheKey: string): EngineLocation | null {
  const cache = getLocationCache()
  const cached = cache[cacheKey]
  if (!cached) return null

  const isExpired = Date.now() - cached.cachedAt > ENGINE_LOCATION_CACHE_MAX_AGE_MS
  if (isExpired) {
    delete cache[cacheKey]
    saveLocationCache(cache)
    return null
  }

  return {
    label: cached.label,
    latitude: cached.latitude,
    longitude: cached.longitude,
    timezone: cached.timezone,
    offsetLabel: cached.offsetLabel,
    offsetMinutes: cached.offsetMinutes
  }
}

function setCachedEngineLocation(cacheKey: string, location: EngineLocation) {
  const cache = getLocationCache()
  cache[cacheKey] = {
    ...location,
    cachedAt: Date.now()
  }

  const entries = Object.entries(cache)
    .sort(([, a], [, b]) => b.cachedAt - a.cachedAt)
    .slice(0, ENGINE_LOCATION_CACHE_MAX_ITEMS)

  saveLocationCache(Object.fromEntries(entries))
}

export function getDatesInRange(fromDate: string, toDate: string): Date[] {
  const start = parseDateOnly(fromDate)
  const end = parseDateOnly(toDate)

  if (start.getTime() > end.getTime()) {
    throw new Error('The start date cannot be after the end date.')
  }

  const dates: Date[] = []
  const cursor = new Date(start)

  while (cursor.getTime() <= end.getTime()) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }

  return dates
}

export async function getEnginePrayerRows(options: EnginePrayerOptions): Promise<EnginePrayerRow[]> {
  const dates = getDatesInRange(options.fromDate, options.toDate)
  const wantedDates = new Set(dates.map(toApiDateKey))
  const rows: EnginePrayerRow[] = []

  const firstOffsetMinutes = getOffsetMinutesForLocation(options.location, dates[0] ?? parseDateOnly(options.fromDate))
  options.location.offsetMinutes = firstOffsetMinutes
  options.location.offsetLabel = formatGmtOffset(firstOffsetMinutes)
  options.location.timezone = options.location.timezone || options.location.offsetLabel

  for (const [key] of groupDatesByMonth(dates)) {
    const [year, month] = key.split('-').map(Number)
    const params = new URLSearchParams({
      latitude: String(options.location.latitude),
      longitude: String(options.location.longitude),
      method: String(ALADHAN_METHOD_BY_ENGINE[options.method] ?? 3),
      school: options.madhab === 'Hanafi' ? '1' : '0',
      month: String(month),
      year: String(year)
    })

    const response = await fetch(`https://api.aladhan.com/v1/calendar?${params.toString()}`)
    if (!response.ok) {
      throw new Error('Could not fetch prayer times for this location.')
    }

    const payload = await response.json()
    const days = Array.isArray(payload?.data) ? payload.data : []

    for (const day of days) {
      const gregorianDate = day?.date?.gregorian?.date
      if (!gregorianDate || !wantedDates.has(gregorianDate)) continue

      const [dayPart, monthPart, yearPart] = gregorianDate.split('-').map(Number)
      const displayDate = new Date(yearPart, monthPart - 1, dayPart)
      const timezone = day?.meta?.timezone
      const offsetMinutes = timezone
        ? getOffsetMinutesForTimezone(timezone, displayDate)
        : getOffsetMinutesForLocation(options.location, displayDate)

      if (timezone) {
        options.location.timezone = timezone
      }
      options.location.offsetMinutes = offsetMinutes
      options.location.offsetLabel = formatGmtOffset(offsetMinutes)

      const timings = day?.timings ?? {}

      rows.push({
        date: `${yearPart}-${String(monthPart).padStart(2, '0')}-${String(dayPart).padStart(2, '0')}`,
        displayDate: displayDate.toLocaleDateString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        Fajr: cleanApiTime(timings.Fajr),
        Sunrise: cleanApiTime(timings.Sunrise),
        Dhuhr: cleanApiTime(timings.Dhuhr),
        Asr: cleanApiTime(timings.Asr),
        Maghrib: cleanApiTime(timings.Maghrib),
        Isha: cleanApiTime(timings.Isha)
      })
    }
  }

  return rows.sort((a, b) => a.date.localeCompare(b.date))
}

export function generateEngineIcs(options: EngineIcsOptions): string {
  const included = options.includePrayers ?? {
    Fajr: true,
    Sunrise: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  }

  const events = options.rows.flatMap((row) => ENGINE_PRAYERS
    .filter((prayer) => included[prayer])
    .map((prayer) => {
      const targetOffsetMinutes = getOffsetMinutesForLocation(options.location, parseDateOnly(row.date))
      const start = dateAndTimeToUtcDate(row.date, row[prayer], targetOffsetMinutes)
      return {
        title: `Athan - ${prayer}`,
        start,
        end: new Date(start.getTime() + 5 * 60 * 1000),
        timeMode: 'utc' as const,
        uid: `${row.date}-${prayer.toLowerCase()}-${options.location.latitude}-${options.location.longitude}@athan-pwa`,
        location: options.location.label,
        description: `Prayer reminder for ${prayer}. Method: ${options.method}. Madhab: ${options.madhab}. Location: ${options.location.label}. Timezone: ${options.location.timezone || 'estimated from longitude'}. Offset: ${formatGmtOffset(targetOffsetMinutes)}. High-latitude rule is selected automatically when needed.`,
        categories: ['Deep Search Athan'],
        alarms: [{ minutesBefore: options.reminderMinutes, description: `${prayer} prayer reminder` }]
      }
    }))

  return buildIcsCalendar(events, {
    name: `Athan — ${options.location.label}`,
    description: `Prayer times for ${options.location.label}. Generated by Athan PWA.`,
    groupId: 'ATHAN-PWA-DEEP-SEARCH',
    defaultReminderMin: options.reminderMinutes
  })
}

/**
 * Inactive copy of the original Deep Search calendar generator, retained for
 * behavior comparisons while generateEngineIcs uses the canonical handler.
 */
export function legacyGenerateEngineIcsReference(options: EngineIcsOptions): string {
  const included = options.includePrayers ?? {
    Fajr: true,
    Sunrise: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true
  }
  const events = options.rows.flatMap((row) => ENGINE_PRAYERS
    .filter((prayer) => included[prayer])
    .map((prayer) => legacyBuildEngineIcsEventReference({
      prayer,
      row,
      location: options.location,
      reminderMinutes: options.reminderMinutes,
      method: options.method,
      madhab: options.madhab
    })))

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Athan PWA//Advanced Athan//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...events,
    'END:VCALENDAR'
  ].join('\r\n')
}

export function downloadEngineIcs(filename: string, content: string) {
  downloadICS(filename, content)
}

export function makeEngineIcsFilename(location: EngineLocation, fromDate: string, toDate: string) {
  const safeLocation = location.label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'location'

  return `athan-${safeLocation}-${fromDate}-to-${toDate}.ics`
}

export function toDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) throw new Error('Invalid date.')
  return new Date(year, month - 1, day)
}

function cleanApiTime(value: string | undefined) {
  return (value ?? '').replace(/\s*\(.*?\)\s*/g, '').trim()
}

function groupDatesByMonth(dates: Date[]) {
  const groups = new Map<string, Date[]>()

  for (const date of dates) {
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`
    groups.set(key, [...(groups.get(key) ?? []), date])
  }

  return groups
}

function toApiDateKey(date: Date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

async function addOfficialTimezone(location: EngineLocation): Promise<EngineLocation> {
  try {
    const url = `https://www.timeapi.io/api/TimeZone/coordinate?latitude=${encodeURIComponent(location.latitude)}&longitude=${encodeURIComponent(location.longitude)}`
    const response = await fetch(url, {
      headers: { Accept: 'application/json' }
    })

    if (!response.ok) return addEstimatedTimezone(location)

    const data = await response.json()
    const timezone = data?.timeZone || data?.timezone || data?.ianaTimeZone || data?.id

    if (typeof timezone !== 'string' || !timezone) return addEstimatedTimezone(location)

    const offsetMinutes = getOffsetMinutesForTimezone(timezone, new Date())

    return {
      ...location,
      timezone,
      offsetMinutes,
      offsetLabel: formatGmtOffset(offsetMinutes)
    }
  } catch {
    return addEstimatedTimezone(location)
  }
}

function addEstimatedTimezone(location: EngineLocation): EngineLocation {
  const offsetMinutes = estimateGmtOffsetMinutesFromLongitude(location.longitude)

  return {
    ...location,
    timezone: undefined,
    offsetMinutes,
    offsetLabel: formatGmtOffset(offsetMinutes)
  }
}

function getOffsetMinutesForLocation(location: EngineLocation, date: Date) {
  if (location.timezone) {
    return getOffsetMinutesForTimezone(location.timezone, date)
  }

  if (typeof location.offsetMinutes === 'number') return location.offsetMinutes
  return estimateGmtOffsetMinutesFromLongitude(location.longitude)
}

function getOffsetMinutesForTimezone(timezone: string, date: Date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    }).formatToParts(date)

    const offsetText = parts.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
    return parseGmtOffset(offsetText)
  } catch {
    return estimateGmtOffsetMinutesFromLongitude(0)
  }
}

function parseGmtOffset(value: string) {
  if (value === 'GMT' || value === 'UTC') return 0

  const match = value.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/i)
  if (!match) return 0

  const sign = match[1] === '-' ? -1 : 1
  const hours = Number(match[2])
  const minutes = Number(match[3] ?? '0')

  return sign * (hours * 60 + minutes)
}

function estimateGmtOffsetMinutesFromLongitude(longitude: number) {
  return Math.round(((longitude / 15) * 60) / 30) * 30
}

function formatGmtOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absolute = Math.abs(offsetMinutes)
  const hours = Math.floor(absolute / 60)
  const minutes = absolute % 60

  if (minutes === 0) return `GMT${sign}${hours}`
  return `GMT${sign}${hours}:${String(minutes).padStart(2, '0')}`
}


/**
 * Inactive reference retained from the original Deep Search exporter.
 * Active exports use buildIcsCalendar above.
 */
export function legacyBuildEngineIcsEventReference(args: {
  prayer: EnginePrayerName
  row: EnginePrayerRow
  location: EngineLocation
  reminderMinutes: number
  method: EngineMethod
  madhab: EngineMadhab
}) {
  const targetOffsetMinutes = getOffsetMinutesForLocation(args.location, parseDateOnly(args.row.date))
  const start = dateAndTimeToUtcDate(args.row.date, args.row[args.prayer], targetOffsetMinutes)
  const end = new Date(start.getTime() + 5 * 60 * 1000)
  const uid = `${args.row.date}-${args.prayer.toLowerCase()}-${args.location.latitude}-${args.location.longitude}@athan-pwa`

  return [
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${toIcsUtcDate(new Date())}`,
    `DTSTART:${toIcsUtcDate(start)}`,
    `DTEND:${toIcsUtcDate(end)}`,
    `SUMMARY:${escapeIcsText(`Athan - ${args.prayer}`)}`,
    `LOCATION:${escapeIcsText(args.location.label)}`,
    `DESCRIPTION:${escapeIcsText(`Prayer reminder for ${args.prayer}. Method: ${args.method}. Madhab: ${args.madhab}. Location: ${args.location.label}. Timezone: ${args.location.timezone || 'estimated from longitude'}. Offset: ${formatGmtOffset(targetOffsetMinutes)}. High-latitude rule is selected automatically when needed.`)}`,
    'BEGIN:VALARM',
    `TRIGGER:-PT${Math.max(0, args.reminderMinutes)}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`${args.prayer} prayer reminder`)}`,
    'END:VALARM',
    'END:VEVENT'
  ].join('\r\n')
}

function dateAndTimeToUtcDate(dateValue: string, timeValue: string, targetOffsetMinutes: number) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const timeMatch = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (!year || !month || !day || !timeMatch) return parseDateOnly(dateValue)

  let hour = Number(timeMatch[1])
  const minute = Number(timeMatch[2])
  const period = timeMatch[3]?.toUpperCase()

  if (period === 'PM' && hour < 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0

  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - targetOffsetMinutes * 60 * 1000)
}

function toIcsUtcDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}
