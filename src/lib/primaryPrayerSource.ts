import { refreshDeviceLocation, reverseGeocodeCoordinates, saveCachedLocation } from './locationStore'
import { computePrayerTimes, loadSettings, type PrayerSettings } from './prayer'
import {
  ensureSavedCityTimezone,
  loadSavedCities,
  loadTravelDestinationId,
  lookupTimezoneForCoordinates,
  prayerTimesForSavedCity,
  settingsForSavedCity,
  type SavedCity
} from './savedCities'
import type { ManualPrayerTimes } from './manualPrayerTimetable'
import { formatAppTime, type SavedCityTimeView } from './preferences'
import { addDateKeyDays, dateKeyAnchor, dateKeyForDevice, deviceTimezone, formatUtcOffset, isValidTimezone, zonedDateKey } from './sourceTime'

export type PrimaryPrayerSource = {
  kind: 'saved-city' | 'device-location'
  savedCity: SavedCity | null
  locationLabel: string
  sourceLabel: string
  settings: PrayerSettings
  timezone: string | null
  latitude: number
  longitude: number
}

export type PrimaryPrayerContext = PrimaryPrayerSource & {
  times: ManualPrayerTimes
  nextFajr: Date
  dateKey: string
  timezoneFallback: boolean
}

export function loadPrimarySavedCity() {
  const selectedId = loadTravelDestinationId()
  return loadSavedCities().find((city) => city.id === selectedId) ?? null
}

/** Resolves the selected profile itself; a missing selected profile is never replaced silently. */
export async function resolvePrimaryPrayerSource(): Promise<PrimaryPrayerSource> {
  const selectedId = loadTravelDestinationId()
  if (selectedId) {
    const original = loadSavedCities().find((city) => city.id === selectedId)
    if (!original) throw new Error('The selected primary saved city is missing. Choose a new primary source in Saved Cities.')
    const savedCity = await ensureSavedCityTimezone(original)
    const settings = settingsForSavedCity(savedCity)
    return {
      kind: 'saved-city',
      savedCity,
      locationLabel: formatSavedCityLabel(savedCity),
      sourceLabel: savedCity.calculationMode === 'manual-timetable'
        ? `Imported yearly timetable · ${savedCity.manualTimetable?.sourceFileName || 'file'}`
        : `${settings.method} · ${settings.madhab}`,
      settings,
      timezone: isValidTimezone(savedCity.timezone) ? savedCity.timezone : null,
      latitude: savedCity.latitude,
      longitude: savedCity.longitude
    }
  }

  const state = await refreshDeviceLocation()
  if (!state.location) throw new Error('Location permission is required.')
  const { latitude, longitude } = state.location
  let locationLabel = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  try {
    const resolved = await reverseGeocodeCoordinates(latitude, longitude)
    locationLabel = resolved.label
    saveCachedLocation({ ...state.location, city: resolved.city, country: resolved.country, countryCode: resolved.countryCode })
  } catch {
    // Coordinates remain a private fallback when reverse geocoding is unavailable.
  }
  const settings = loadSettings()
  const timezone = isValidTimezone(state.location.timezone)
    ? state.location.timezone
    : await lookupTimezoneForCoordinates(latitude, longitude)
  if (timezone) saveCachedLocation({ ...state.location, timezone })
  return {
    kind: 'device-location', savedCity: null, locationLabel,
    sourceLabel: `${settings.method} · ${settings.madhab}`,
    settings, timezone, latitude, longitude
  }
}

export function sourceDateKey(source: PrimaryPrayerSource, instant = new Date()): string {
  return source.timezone ? zonedDateKey(instant, source.timezone) : dateKeyForDevice(instant)
}

export function prayerTimesForPrimarySourceDate(
  source: PrimaryPrayerSource,
  dateKey: string,
  options: { requireTimezone?: boolean; requireTimetableRow?: boolean } = {}
): ManualPrayerTimes {
  if (options.requireTimezone && !source.timezone) {
    throw new Error(`The timezone for ${source.locationLabel} is unavailable. Reopen its saved profile or set its IANA timezone before exporting.`)
  }
  const date = dateKeyAnchor(dateKey)
  if (source.savedCity) {
    const city = source.savedCity
    if (options.requireTimetableRow && city.calculationMode === 'manual-timetable') {
      const key = dateKey.slice(5)
      if (!city.manualTimetable?.rows[key]) {
        throw new Error(`The imported timetable for ${source.locationLabel} has no row for ${dateKey}.`)
      }
    }
    return prayerTimesForSavedCity(city, date, { timezoneAware: true })
  }
  return computePrayerTimes({ latitude: source.latitude, longitude: source.longitude }, date, source.settings)
}

export async function getPrimaryPrayerContext(date = new Date()): Promise<PrimaryPrayerContext> {
  const source = await resolvePrimaryPrayerSource()
  const dateKey = sourceDateKey(source, date)
  return {
    ...source,
    dateKey,
    timezoneFallback: source.kind === 'saved-city' && !source.timezone,
    times: prayerTimesForPrimarySourceDate(source, dateKey),
    nextFajr: prayerTimesForPrimarySourceDate(source, addDateKeyDays(dateKey, 1)).fajr
  }
}

export function formatSavedCityLabel(city: SavedCity) {
  const cityName = city.name || city.city || 'Saved location'
  return city.country ? `${cityName}, ${city.country}` : cityName
}

export function effectiveTimeView(source: PrimaryPrayerSource, requested: SavedCityTimeView): SavedCityTimeView {
  if (!source.savedCity) return 'device'
  if (!source.timezone && requested !== 'device') return 'device'
  return requested
}

export function formatPrimaryPrayerTime(source: PrimaryPrayerSource, instant: Date, requested: SavedCityTimeView): string {
  const view = effectiveTimeView(source, requested)
  return formatAppTime(instant, { timezone: view === 'city' ? source.timezone || undefined : view === 'utc' ? 'UTC' : undefined })
}

export function primaryTimeViewLabel(source: PrimaryPrayerSource, requested: SavedCityTimeView, instant = new Date()): string {
  if (source.savedCity && !source.timezone) return 'Device time · city timezone unavailable'
  const view = effectiveTimeView(source, requested)
  if (view === 'utc') return 'UTC (GMT+0)'
  if (view === 'city' && source.timezone) return `City time · ${source.timezone} (${formatUtcOffset(instant, source.timezone)})`
  return `Device time · ${deviceTimezone()} (${formatUtcOffset(instant, deviceTimezone())})`
}
