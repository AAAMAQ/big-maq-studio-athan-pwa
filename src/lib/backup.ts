export type AthanBackup = {
  app: 'Athan PWA'
  version: number
  exportedAt: string
  localStorage: Record<string, string>
}

export const BACKUP_VERSION = 1

export const ATHAN_LOCAL_STORAGE_KEYS = [
  'athan.iqama.settings.v1',
  'athan.iqama.jumuahReminder.v1',
  'athan.calendar.fixedIsha.enabled.v1',
  'athan.language.v1',
  'athan.preference.timeFormat.v1',
  'athan.preference.showSunnah.v1',
  'athan.engine.locationCache.v2',
  'athan.location.cache.v1',
  'athan.masjid.profiles.v1',
  'athan.quran.progress.v1',
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
  let count = 0
  for (const key of ATHAN_LOCAL_STORAGE_KEYS) {
    const value = backup.localStorage[key]
    if (typeof value === 'string') {
      localStorage.setItem(key, value)
      count++
    }
  }
  return count
}

export function resetAthanAppData(): number {
  let count = 0
  for (const key of ATHAN_LOCAL_STORAGE_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key)
      count++
    }
  }
  return count
}

function isAthanBackup(value: unknown): value is AthanBackup {
  const maybe = value && typeof value === 'object' ? value as Partial<AthanBackup> : null
  return !!maybe &&
    maybe.app === 'Athan PWA' &&
    typeof maybe.version === 'number' &&
    typeof maybe.exportedAt === 'string' &&
    !!maybe.localStorage &&
    typeof maybe.localStorage === 'object'
}

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
