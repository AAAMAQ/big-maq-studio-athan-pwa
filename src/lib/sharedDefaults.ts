import { applyDocumentLanguage, isAppLanguage, loadLanguage, type AppLanguage } from './i18n'
import { APP_LAYOUT_EVENT, APP_LAYOUT_KEY, loadAppLayout, normalizeAppLayout, type AppLayoutPreferences } from './appLayout'
import { isRootFeatureId } from './rootFeatures'
import {
  isTimeFormatPreference,
  loadShowSunnah,
  loadTimeFormatPreference,
  type TimeFormatPreference
} from './preferences'
import {
  loadSettings,
  type HighLatKey,
  type MadhabKey,
  type MethodKey,
  type PrayerSettings
} from './prayer'

const SHARE_HASH_PREFIX = '#share-defaults='
const CALCULATION_MODE_KEY = 'athan.prayer.calculationMode.v1'
const REMINDER_OFFSET_KEY = 'reminderOffsetMin'
const ISHA_FIXED_KEY = 'ishaFixedTime'

const METHODS: MethodKey[] = ['MuslimWorldLeague', 'UmmAlQura', 'Egyptian', 'Karachi', 'Dubai', 'Qatar', 'Kuwait', 'MoonsightingCommittee', 'NorthAmerica', 'Singapore', 'Tehran', 'Turkey']
const MADHABS: MadhabKey[] = ['Shafi', 'Hanafi']
const HIGH_LAT_RULES: HighLatKey[] = ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle']

export type SharedDefaults = {
  app: 'Athan PWA defaults'
  version: 1 | 2
  prayer: PrayerSettings
  preferences: {
    language: AppLanguage
    timeFormat: TimeFormatPreference
    showSunnah: boolean
  }
  reminders: {
    offsetMinutes: number
    fixedIshaTime: string
  }
  layout?: AppLayoutPreferences
  /** Generated validation feedback, never taken from the link or serialized. */
  layoutWarnings?: string[]
}

export type ShareDefaultsOptions = { includeLayout?: boolean }

export function createSharedDefaults(options: ShareDefaultsOptions = {}): SharedDefaults {
  const defaults: SharedDefaults = {
    app: 'Athan PWA defaults',
    version: 1,
    prayer: loadSettings(),
    preferences: {
      language: loadLanguage(),
      timeFormat: loadTimeFormatPreference(),
      showSunnah: loadShowSunnah()
    },
    reminders: {
      offsetMinutes: readReminderOffset(),
      fixedIshaTime: readFixedIshaTime()
    }
  }
  if (options.includeLayout) {
    defaults.version = 2
    defaults.layout = normalizeAppLayout(loadAppLayout())
  }
  const safe = normalizeSharedDefaults(defaults)
  if (!safe) throw new Error('Some saved defaults are invalid. Review your calculation and reminder settings before sharing.')
  return safe
}

export function createSharedDefaultsUrl(baseUrl: string, options: ShareDefaultsOptions = {}): string {
  const url = new URL(baseUrl)
  url.hash = `${SHARE_HASH_PREFIX.slice(1)}${encodePayload(createSharedDefaults(options))}`
  return url.toString()
}

export function parseSharedDefaultsUrl(urlValue: string): SharedDefaults | null {
  try {
    const url = new URL(urlValue)
    if (!url.hash.startsWith(SHARE_HASH_PREFIX)) return null
    if (url.hash.length > 12000) return null
    return normalizeSharedDefaults(JSON.parse(decodePayload(url.hash.slice(SHARE_HASH_PREFIX.length))))
  } catch {
    return null
  }
}

export function applySharedDefaults(defaults: SharedDefaults, options: { applyLayout?: boolean } = {}): void {
  const safe = normalizeSharedDefaults(defaults)
  if (!safe) throw new Error('These shared defaults are invalid or unsupported.')

  // Use explicit writes here: the ordinary preference helpers intentionally swallow
  // storage errors, which would make this consent flow falsely report success.
  const writes: [string, string][] = [
    ['method', safe.prayer.method], ['madhab', safe.prayer.madhab], ['highLatRule', safe.prayer.highLatRule],
    ['athan.language.v1', safe.preferences.language],
    ['athan.preference.timeFormat.v1', safe.preferences.timeFormat],
    ['athan.preference.showSunnah.v1', String(safe.preferences.showSunnah)],
    [CALCULATION_MODE_KEY, 'manual'], [REMINDER_OFFSET_KEY, String(safe.reminders.offsetMinutes)],
    [ISHA_FIXED_KEY, safe.reminders.fixedIshaTime]
  ]
  if (options.applyLayout && safe.layout) writes.push([APP_LAYOUT_KEY, JSON.stringify(safe.layout)])
  let completed = 0
  try {
    for (const [key, value] of writes) {
      localStorage.setItem(key, value)
      completed++
    }
  } catch {
    if (completed) {
      if (completed >= 4) {
        applyDocumentLanguage(safe.preferences.language)
        window.dispatchEvent(new CustomEvent('athan-language-change', { detail: safe.preferences.language }))
      }
      window.dispatchEvent(new Event('athan-preferences-change'))
      throw new Error('Some defaults were saved before storage became unavailable. Your existing layout and personal records were not changed. Free device storage and retry, or close this dialog to review the saved defaults.')
    }
    throw new Error('These defaults could not be saved because device storage is unavailable. Nothing was changed. Free device storage and retry.')
  }
  applyDocumentLanguage(safe.preferences.language)
  window.dispatchEvent(new CustomEvent('athan-language-change', { detail: safe.preferences.language }))
  window.dispatchEvent(new Event('athan-preferences-change'))
  if (options.applyLayout && safe.layout) window.dispatchEvent(new Event(APP_LAYOUT_EVENT))
}

export function clearSharedDefaultsHash(): void {
  if (typeof window === 'undefined' || !window.location.hash.startsWith(SHARE_HASH_PREFIX)) return
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
}

function normalizeSharedDefaults(value: unknown): SharedDefaults | null {
  if (!value || typeof value !== 'object') return null
  const maybe = value as Partial<SharedDefaults>
  const prayer = maybe.prayer
  const preferences = maybe.preferences
  const reminders = maybe.reminders
  if (
    maybe.app !== 'Athan PWA defaults' || (maybe.version !== 1 && maybe.version !== 2) ||
    !prayer || !METHODS.includes(prayer.method) || !MADHABS.includes(prayer.madhab) || !HIGH_LAT_RULES.includes(prayer.highLatRule) ||
    !preferences || !isAppLanguage(preferences.language) || !isTimeFormatPreference(preferences.timeFormat) || typeof preferences.showSunnah !== 'boolean' ||
    !reminders || !Number.isInteger(reminders.offsetMinutes) || reminders.offsetMinutes < 1 || reminders.offsetMinutes > 180 ||
    typeof reminders.fixedIshaTime !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(reminders.fixedIshaTime)
  ) return null

  const safe: SharedDefaults = {
    app: 'Athan PWA defaults',
    version: maybe.version,
    prayer: { method: prayer.method, madhab: prayer.madhab, highLatRule: prayer.highLatRule },
    preferences: { language: preferences.language, timeFormat: preferences.timeFormat, showSunnah: preferences.showSunnah },
    reminders: { offsetMinutes: reminders.offsetMinutes, fixedIshaTime: reminders.fixedIshaTime }
  }
  if (maybe.version === 2) {
    const { layout, warnings } = validateSharedLayout(maybe.layout)
    if (layout) safe.layout = layout
    if (warnings.length) safe.layoutWarnings = warnings
  }
  return safe
}

function validateSharedLayout(value: unknown): { layout?: AppLayoutPreferences; warnings: string[] } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { warnings: ['The shared layout is missing or invalid and will not be applied.'] }
  const raw = value as Record<string, unknown>
  if (raw.schemaVersion !== 1 || typeof raw.enabled !== 'boolean' ||
    !['navigation', 'home', 'more'].every((surface) => Array.isArray(raw[surface]) && (raw[surface] as unknown[]).length <= 64 && (raw[surface] as unknown[]).every((id) => typeof id === 'string' && id.length <= 80)) ||
    (raw.homeSections !== undefined && (!raw.homeSections || typeof raw.homeSections !== 'object' || Array.isArray(raw.homeSections) || typeof (raw.homeSections as Record<string, unknown>).salahBrief !== 'boolean' || ((raw.homeSections as Record<string, unknown>).salahBriefView !== undefined && !['line', 'bars'].includes((raw.homeSections as Record<string, unknown>).salahBriefView as string))))) {
    return { warnings: ['This shared layout format is unsupported or invalid and will not be applied. Your layout stays unchanged.'] }
  }
  const lists = [raw.navigation, raw.home, raw.more] as string[][]
  const unknownIds = [...new Set(lists.flat().filter((id) => !isRootFeatureId(id)))]
  const layout = normalizeAppLayout({
    schemaVersion: 1, enabled: raw.enabled, navigation: raw.navigation, home: raw.home, more: raw.more,
    homeSections: { salahBrief: (raw.homeSections as { salahBrief?: boolean } | undefined)?.salahBrief === true, salahBriefView: (raw.homeSections as { salahBriefView?: string } | undefined)?.salahBriefView }
  })
  const warnings: string[] = []
  // Do not echo arbitrary user-controlled labels; feedback describes the safe normalization.
  if (unknownIds.length) warnings.push(`${unknownIds.length} unrecognized feature ${unknownIds.length === 1 ? 'ID was' : 'IDs were'} omitted. Update the app if a newer feature is missing.`)
  if (lists.some((list, index) => list.length !== [layout.navigation, layout.home, layout.more][index].length)) warnings.push('Duplicate or invalid shortcut placements were removed; navigation is limited to Home plus four extras. Preview the resulting order before applying.')
  return { layout, warnings }
}

function readReminderOffset(): number {
  const value = Number.parseInt(localStorage.getItem(REMINDER_OFFSET_KEY) || '20', 10)
  return Number.isInteger(value) ? Math.min(180, Math.max(1, value)) : 20
}

function readFixedIshaTime(): string {
  const value = localStorage.getItem(ISHA_FIXED_KEY) || '22:00'
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '22:00'
}

function encodePayload(value: SharedDefaults): string {
  const { app, version, prayer, preferences, reminders, layout } = value
  return btoa(JSON.stringify({ app, version, prayer, preferences, reminders, ...(layout ? { layout } : {}) })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function decodePayload(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  return atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))
}
