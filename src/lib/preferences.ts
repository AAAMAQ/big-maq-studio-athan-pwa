export type TimeFormatPreference = 'device' | '12h' | '24h'
export type SavedCityTimeView = 'city' | 'device' | 'utc'

const TIME_FORMAT_KEY = 'athan.preference.timeFormat.v1'
const SHOW_SUNNAH_KEY = 'athan.preference.showSunnah.v1'
export const SAVED_CITY_TIME_VIEW_KEY = 'athan.preference.savedCityTimeView.v1'
const PREFERENCES_EVENT = 'athan-preferences-change'

export function loadTimeFormatPreference(): TimeFormatPreference {
  try {
    const value = localStorage.getItem(TIME_FORMAT_KEY)
    return isTimeFormatPreference(value) ? value : 'device'
  } catch {
    return 'device'
  }
}

export function saveTimeFormatPreference(value: TimeFormatPreference): void {
  try {
    localStorage.setItem(TIME_FORMAT_KEY, value)
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT))
  } catch {
    // Keep time displays usable when storage is unavailable.
  }
}

export function loadShowSunnah(): boolean {
  try {
    return localStorage.getItem(SHOW_SUNNAH_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveShowSunnah(value: boolean): void {
  try {
    localStorage.setItem(SHOW_SUNNAH_KEY, String(value))
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT))
  } catch {
    // Keep Salah Tracker usable when storage is unavailable.
  }
}

export function loadSavedCityTimeView(): SavedCityTimeView {
  try {
    const value = localStorage.getItem(SAVED_CITY_TIME_VIEW_KEY)
    return value === 'device' || value === 'utc' ? value : 'city'
  } catch {
    return 'city'
  }
}

export function saveSavedCityTimeView(value: SavedCityTimeView): void {
  try {
    localStorage.setItem(SAVED_CITY_TIME_VIEW_KEY, value)
    window.dispatchEvent(new CustomEvent(PREFERENCES_EVENT))
  } catch {
    // Time display remains available for this session.
  }
}

export function formatAppTime(
  date: Date,
  options: { timezone?: string; hour?: 'numeric' | '2-digit' } = {}
): string {
  const preference = loadTimeFormatPreference()
  const formatOptions: Intl.DateTimeFormatOptions = {
    hour: options.hour ?? 'numeric',
    minute: '2-digit'
  }
  if (options.timezone) formatOptions.timeZone = options.timezone
  if (preference === '12h') formatOptions.hour12 = true
  if (preference === '24h') formatOptions.hour12 = false

  try {
    return date.toLocaleTimeString([], formatOptions)
  } catch {
    delete formatOptions.timeZone
    return date.toLocaleTimeString([], formatOptions)
  }
}

export function effectiveTimeFormat(): '12h' | '24h' {
  const preference = loadTimeFormatPreference()
  if (preference !== 'device') return preference
  try {
    return new Intl.DateTimeFormat([], { hour: 'numeric' }).resolvedOptions().hour12 ? '12h' : '24h'
  } catch {
    return '12h'
  }
}

export function isTimeFormatPreference(value: unknown): value is TimeFormatPreference {
  return value === 'device' || value === '12h' || value === '24h'
}
