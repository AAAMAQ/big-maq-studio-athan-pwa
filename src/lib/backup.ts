import { APP_LAYOUT_EVENT, APP_LAYOUT_KEY, SETTINGS_SECTIONS_KEY, normalizeAppLayout, normalizeSettingsSections } from './appLayout'
import { PERFORMANCE_KEY, normalizePerformancePreferences } from './performancePreferences'
import { SALAH_SEARCHES_CHANGE_EVENT, SALAH_SAVED_SEARCHES_STORAGE_KEY, SALAH_RECENT_SEARCHES_STORAGE_KEY, normalizeSavedSalahSearches, normalizeRecentSalahSearches } from './salahSavedSearches'

export type AthanBackup = {
  app: 'Athan PWA'
  version: number
  exportedAt: string
  localStorage: Record<string, string>
}

export const BACKUP_VERSION = 1

export const ATHAN_LOCAL_STORAGE_KEYS = [
  APP_LAYOUT_KEY,
  SETTINGS_SECTIONS_KEY,
  PERFORMANCE_KEY,
  SALAH_SAVED_SEARCHES_STORAGE_KEY,
  SALAH_RECENT_SEARCHES_STORAGE_KEY,
  'athan.prayer.calculationMode.v1',
  'athan.prayer.autoCountry.v1',
  'athan.iqama.settings.v1',
  'athan.iqama.jumuahReminder.v1',
  'athan.calendar.fixedIsha.enabled.v1',
  'athan.calendar.secondReminder.v1',
  'athan.language.v1',
  'athan.preference.timeFormat.v1',
  'athan.preference.savedCityTimeView.v1',
  'athan.preference.showSunnah.v1',
  'athan.engine.locationCache.v2',
  'athan.engine.secondReminder.v1',
  'athan.location.cache.v1',
  'athan.masjid.profiles.v1',
  'athan.quran.progress.v1',
  'athan.quran.translation.v1',
  'athan.quran.readAyahs.v1',
  'athan.quran.offline.meta.v1',
  'athan.ramadan.settings.v1',
  'athan.ramadan.fasts.v1',
  'athan.salah.reminder.v1',
  'athan.savedCities.v1',
  'athan.travel.currentCityId.v1',
  'athan.prayer.customProfiles.v1',
  'athan.qibla.mode.v1',
  'athan.qibla.haptics.v1',
  'quranBookmarks',
  'quranFontPct',
  'quranViewMode',
  'salahLogV1',
  'method',
  'madhab',
  'highLatRule',
  'reminderOffsetMin',
  'reminderMinutesBefore',
  'ishaFixedTime'
] as const

export function createBackup(): AthanBackup {
  const data: Record<string, string> = {}
  for (const key of ATHAN_LOCAL_STORAGE_KEYS) {
    const value = localStorage.getItem(key)
    if (value !== null) data[key] = value
  }
  return {
    app: 'Athan PWA',
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    localStorage: data
  }
}

export function downloadBackup(): string {
  const backup = createBackup()
  const filename = `athan-pwa-backup-${formatDate(new Date())}.json`
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
  return filename
}

export function parseBackupJson(text: string): AthanBackup {
  const parsed = JSON.parse(text)
  if (!isAthanBackup(parsed)) {
    throw new Error('This file does not look like an Athan PWA backup.')
  }
  return parsed
}

export function importBackup(backup: AthanBackup): number {
  if (!isAthanBackup(backup)) throw new Error('Unsupported backup file.')
  const changes: [string, string | null][] = []
  for (const key of ATHAN_LOCAL_STORAGE_KEYS) {
    const value = backup.localStorage[key]
    if (typeof value === 'string') {
      const normalized = normalizeImportedValue(key, value)
      if (normalized !== null) changes.push([key, normalized])
    }
  }
  applyChanges(changes)
  notifyRestoredData()
  return changes.length
}

export function resetAthanAppData(): number {
  const changes: [string, null][] = []
  for (const key of ATHAN_LOCAL_STORAGE_KEYS) {
    if (localStorage.getItem(key) !== null) {
      changes.push([key, null])
    }
  }
  applyChanges(changes)
  notifyRestoredData()
  return changes.length
}

function normalizeImportedValue(key: string, raw: string): string | null {
  const normalizers: Record<string, (value: unknown) => unknown> = {
    [APP_LAYOUT_KEY]: normalizeAppLayout,
    [SETTINGS_SECTIONS_KEY]: normalizeSettingsSections,
    [PERFORMANCE_KEY]: normalizePerformancePreferences,
    [SALAH_SAVED_SEARCHES_STORAGE_KEY]: normalizeSavedSalahSearches,
    [SALAH_RECENT_SEARCHES_STORAGE_KEY]: normalizeRecentSalahSearches
  }
  if (key === 'athan.quran.offline.meta.v1') {
    // A personal JSON backup contains metadata, not Cache Storage response bodies.
    // Never claim downloaded text exists on a fresh device based on that metadata.
    try {
      const value = JSON.parse(raw)
      if (!value || typeof value !== 'object' || Array.isArray(value)) return null
      return JSON.stringify({ ...value, available: false, complete: false, downloadedSurahs: 0, error: 'Offline Quran files are not included in backups. Download text again on this device if needed.' })
    } catch { return null }
  }
  const normalize = normalizers[key]
  if (!normalize) return raw // Preserve established data formats and legacy records.
  try {
    const value = JSON.parse(raw)
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    if ((key === SALAH_SAVED_SEARCHES_STORAGE_KEY || key === SALAH_RECENT_SEARCHES_STORAGE_KEY) && value.schemaVersion !== 1) return null
    if ('schemaVersion' in value && value.schemaVersion !== 1) return null
    return JSON.stringify(normalize(value))
  } catch { return null }
}

function applyChanges(changes: [string, string | null][]) {
  const previous = changes.map(([key]) => [key, localStorage.getItem(key)] as const)
  try {
    for (const [key, value] of changes) {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    }
  } catch {
    // Best-effort rollback keeps a quota/storage failure from silently half-restoring.
    for (const [key, value] of previous) {
      try {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
      } catch { /* Storage may be completely unavailable; report failure below. */ }
    }
    throw new Error('Device storage could not save the restore/reset. Existing data was restored where storage allowed. Please keep your backup and retry.')
  }
}

function notifyRestoredData() {
  for (const event of [APP_LAYOUT_EVENT, SALAH_SEARCHES_CHANGE_EVENT, 'athan-salah-data-change', 'athan-language-change', 'athan-preferences-change', 'athan-primary-source-change']) window.dispatchEvent(new Event(event))
}

function isAthanBackup(value: unknown): value is AthanBackup {
  const maybe = value && typeof value === 'object' ? value as Partial<AthanBackup> : null
  return !!maybe &&
    maybe.app === 'Athan PWA' &&
    maybe.version === BACKUP_VERSION &&
    typeof maybe.exportedAt === 'string' &&
    !!maybe.localStorage &&
    typeof maybe.localStorage === 'object' && !Array.isArray(maybe.localStorage)
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
