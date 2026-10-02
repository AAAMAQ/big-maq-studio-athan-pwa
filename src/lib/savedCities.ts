import { getCountryPrayerConfig } from '../data/countryPrayerMethods'
import {
  getManualPrayerTimes,
  normalizeManualPrayerTimetable,
  type ManualPrayerTimetable,
  type ManualPrayerTimes
} from './manualPrayerTimetable'
import {
  computePrayerTimes,
  type HighLatKey,
  type MadhabKey,
  type MethodKey,
  type PrayerSettings
} from './prayer'
import {
  DEFAULT_PRAYER_CORRECTIONS,
  applyCorrections,
  normalizeCorrections,
  type PrayerTimeCorrections
} from './prayerCorrections'
import { isValidTimezone } from './sourceTime'

export type SavedCity = {
  id: string
  name: string
  city: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  timezone?: string
  calculationMode: 'auto' | 'manual-method' | 'custom-corrections' | 'manual-timetable'
  calculationMethod: MethodKey
  madhab: MadhabKey
  highLatitudeRule: HighLatKey
  manualCorrections?: PrayerTimeCorrections
  manualTimetable?: ManualPrayerTimetable
  notes?: string
  createdAt: string
  updatedAt: string
}

export const SAVED_CITIES_KEY = 'athan.savedCities.v1'
export const TRAVEL_DESTINATION_KEY = 'athan.travel.currentCityId.v1'

export function loadSavedCities(): SavedCity[] {
  try {
    const raw = localStorage.getItem(SAVED_CITIES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalizeSavedCity).filter(Boolean) as SavedCity[] : []
  } catch {
    return []
  }
}

export function saveSavedCities(cities: SavedCity[]): void {
  try {
    localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(cities.map(normalizeSavedCity).filter(Boolean)))
  } catch {
    // Ignore storage failures.
  }
}

export function createSavedCity(input?: Partial<SavedCity>): SavedCity {
  const now = new Date().toISOString()
  const countryCode = (input?.countryCode || '').toUpperCase()
  const config = getCountryPrayerConfig(countryCode)
  return {
    id: input?.id || `city-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: input?.name || input?.city || '',
    city: input?.city || '',
    country: input?.country || config.countryName,
    countryCode: countryCode || config.countryCode,
    latitude: Number.isFinite(input?.latitude) ? Number(input?.latitude) : 0,
    longitude: Number.isFinite(input?.longitude) ? Number(input?.longitude) : 0,
    timezone: isValidTimezone(input?.timezone) ? input.timezone : undefined,
    calculationMode: input?.calculationMode || 'auto',
    calculationMethod: input?.calculationMethod || config.defaultMethod,
    madhab: input?.madhab || config.defaultMadhab,
    highLatitudeRule: input?.highLatitudeRule || config.highLatitudeRule,
    manualCorrections: normalizeCorrections(input?.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS),
    manualTimetable: normalizeManualPrayerTimetable(input?.manualTimetable),
    notes: input?.notes || '',
    createdAt: input?.createdAt || now,
    updatedAt: now
  }
}

export function upsertSavedCity(city: SavedCity, cities = loadSavedCities()): SavedCity[] {
  const normalized = normalizeSavedCity({ ...city, updatedAt: new Date().toISOString() })
  if (!normalized) return cities
  const exists = cities.some((item) => item.id === normalized.id)
  const next = exists ? cities.map((item) => item.id === normalized.id ? normalized : item) : [...cities, normalized]
  saveSavedCities(next)
  return next
}

export function deleteSavedCity(cityId: string, cities = loadSavedCities()): SavedCity[] {
  const next = cities.filter((city) => city.id !== cityId)
  saveSavedCities(next)
  if (loadTravelDestinationId() === cityId) setTravelDestinationId('')
  return next
}

export function loadTravelDestinationId(): string {
  try {
    return localStorage.getItem(TRAVEL_DESTINATION_KEY) || ''
  } catch {
    return ''
  }
}

export function setTravelDestinationId(cityId: string): void {
  try {
    if (cityId) localStorage.setItem(TRAVEL_DESTINATION_KEY, cityId)
    else localStorage.removeItem(TRAVEL_DESTINATION_KEY)
  } catch {
    // Ignore storage failures.
  }
}

export function settingsForSavedCity(city: SavedCity): PrayerSettings {
  const config = getCountryPrayerConfig(city.countryCode)
  if (city.calculationMode === 'auto') {
    return {
      method: config.defaultMethod,
      madhab: config.defaultMadhab,
      highLatRule: config.highLatitudeRule
    }
  }
  return {
    method: city.calculationMethod,
    madhab: city.madhab,
    highLatRule: city.highLatitudeRule
  }
}

export function correctionsForSavedCity(city: SavedCity): PrayerTimeCorrections | undefined {
  return city.calculationMode === 'custom-corrections'
    ? normalizeCorrections(city.manualCorrections)
    : undefined
}

export function prayerTimesForSavedCity(
  city: SavedCity,
  date = new Date(),
  options: { timezoneAware?: boolean } = {}
): ManualPrayerTimes {
  if (city.calculationMode === 'manual-timetable') {
    const imported = getManualPrayerTimes(city.manualTimetable, date, city.madhab,
      options.timezoneAware && isValidTimezone(city.timezone) ? city.timezone : undefined)
    if (imported) return imported
  }
  return applyCorrections(
    computePrayerTimes(
      { latitude: city.latitude, longitude: city.longitude },
      date,
      settingsForSavedCity(city)
    ),
    correctionsForSavedCity(city)
  )
}

export async function searchSavedCity(query: string): Promise<Partial<SavedCity>[]> {
  const trimmed = query.trim()
  if (!trimmed) return []
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(trimmed)}`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Location search failed')
  const data = await response.json()
  if (!Array.isArray(data)) return []
  return data.map((item) => {
    const address = item.address ?? {}
    const city = address.city || address.town || address.village || address.county || item.name || ''
    const countryCode = String(address.country_code || '').toUpperCase()
    const config = getCountryPrayerConfig(countryCode)
    const latitude = Number(item.lat)
    const longitude = Number(item.lon)
    return createSavedCity({
      name: city || item.display_name,
      city,
      country: address.country || config.countryName,
      countryCode,
      latitude,
      longitude,
      calculationMode: 'auto',
      calculationMethod: config.defaultMethod,
      madhab: config.defaultMadhab,
      highLatitudeRule: config.highLatitudeRule,
      notes: item.display_name || ''
    })
  })
}

/** Match Deep Search's official coordinate timezone lookup; never estimate an IANA zone. */
export async function lookupTimezoneForCoordinates(latitude: number, longitude: number): Promise<string | null> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5_000)
  try {
    const url = `https://www.timeapi.io/api/TimeZone/coordinate?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`
    const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal })
    if (!response.ok) return null
    const data = await response.json()
    const timezone = data?.timeZone || data?.timezone || data?.ianaTimeZone || data?.id
    return isValidTimezone(timezone) ? timezone : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

/** Existing saved profiles gain timezone metadata without changing their prayer rules. */
export async function ensureSavedCityTimezone(city: SavedCity): Promise<SavedCity> {
  if (isValidTimezone(city.timezone)) return city
  // 0,0 is the unsupplied-coordinate placeholder for a manually created profile.
  if (city.latitude === 0 && city.longitude === 0) return city
  const timezone = await lookupTimezoneForCoordinates(city.latitude, city.longitude)
  if (!timezone) return city
  const updated = { ...city, timezone }
  saveSavedCities(loadSavedCities().map((item) => item.id === city.id ? updated : item))
  return updated
}

function normalizeSavedCity(value: unknown): SavedCity | null {
  const maybe = value && typeof value === 'object' ? value as Partial<SavedCity> : null
  if (!maybe) return null
  const latitude = Number(maybe.latitude)
  const longitude = Number(maybe.longitude)
  const countryCode = (maybe.countryCode || '').toUpperCase()
  const config = getCountryPrayerConfig(countryCode)
  const now = new Date().toISOString()
  return {
    id: typeof maybe.id === 'string' ? maybe.id : `city-${Date.now()}`,
    name: typeof maybe.name === 'string' ? maybe.name : '',
    city: typeof maybe.city === 'string' ? maybe.city : '',
    country: typeof maybe.country === 'string' ? maybe.country : config.countryName,
    countryCode: countryCode || config.countryCode,
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    timezone: isValidTimezone(maybe.timezone) ? maybe.timezone : undefined,
    calculationMode: (
      maybe.calculationMode === 'manual-method'
      || maybe.calculationMode === 'custom-corrections'
      || maybe.calculationMode === 'manual-timetable'
    ) ? maybe.calculationMode : 'auto',
    calculationMethod: maybe.calculationMethod || config.defaultMethod,
    madhab: maybe.madhab || config.defaultMadhab,
    highLatitudeRule: maybe.highLatitudeRule || config.highLatitudeRule,
    manualCorrections: normalizeCorrections(maybe.manualCorrections ?? DEFAULT_PRAYER_CORRECTIONS),
    manualTimetable: normalizeManualPrayerTimetable(maybe.manualTimetable),
    notes: typeof maybe.notes === 'string' ? maybe.notes : '',
    createdAt: typeof maybe.createdAt === 'string' ? maybe.createdAt : now,
    updatedAt: typeof maybe.updatedAt === 'string' ? maybe.updatedAt : now
  }
}
