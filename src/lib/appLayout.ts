import { isRootFeatureId, type RootFeatureId } from './rootFeatures'

export const APP_LAYOUT_KEY = 'athan.layout.v1'
export const SETTINGS_SECTIONS_KEY = 'athan.settings.sections.v1'
export const APP_LAYOUT_EVENT = 'athan-layout-change'
export const DEFAULT_HOME_SHORTCUTS: RootFeatureId[] = ['Quran', 'Qibla', 'More', 'Credits']
export const DEFAULT_MORE_SHORTCUTS: RootFeatureId[] = ['AthanEngine', 'SavedCities', 'Iqama', 'MasjidMode', 'SalahTracker', 'RamadanMode', 'BackupRestore', 'Onboarding']
export const SETTINGS_SECTION_IDS = ['preferences', 'source', 'calculation', 'calendar', 'data', 'pwa', 'layout'] as const
export type SettingsSectionId = typeof SETTINGS_SECTION_IDS[number]
export type LayoutSurface = 'navigation' | 'home' | 'more'
export type SalahBriefView = 'line' | 'bars'
export type AppLayoutPreferences = { schemaVersion: 1; enabled: boolean; navigation: RootFeatureId[]; home: RootFeatureId[]; more: RootFeatureId[]; homeSections?: { salahBrief: boolean; salahBriefView?: SalahBriefView } }
export type SettingsSections = Partial<Record<SettingsSectionId, boolean>>

export function defaultAppLayout(): AppLayoutPreferences {
  return { schemaVersion: 1, enabled: false, navigation: ['Prayer', 'Settings'], home: [...DEFAULT_HOME_SHORTCUTS], more: [...DEFAULT_MORE_SHORTCUTS], homeSections: { salahBrief: false, salahBriefView: 'line' } }
}

function normalizeList(value: unknown, fallback: RootFeatureId[], surface: LayoutSurface): RootFeatureId[] {
  if (!Array.isArray(value)) return [...fallback]
  const list = [...new Set(value.filter(isRootFeatureId))].filter((id) => surface === 'home' ? id !== 'Home' : surface === 'more' ? id !== 'More' : id !== 'Home')
  return surface === 'navigation' ? list.slice(0, 4) : list
}

export function normalizeAppLayout(value: unknown): AppLayoutPreferences {
  const defaults = defaultAppLayout()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  const raw = value as Partial<AppLayoutPreferences>
  if (raw.schemaVersion !== undefined && raw.schemaVersion !== 1) return defaults
  return { schemaVersion: 1, enabled: raw.enabled === true, navigation: normalizeList(raw.navigation, defaults.navigation, 'navigation'), home: normalizeList(raw.home, defaults.home, 'home'), more: normalizeList(raw.more, defaults.more, 'more'), homeSections: { salahBrief: raw.homeSections?.salahBrief === true, salahBriefView: raw.homeSections?.salahBriefView === 'bars' ? 'bars' : 'line' } }
}

export function readPreference(key: string): unknown {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : undefined } catch { return undefined }
}

export function writePreference(key: string, value: unknown): boolean {
  try { localStorage.setItem(key, JSON.stringify(value)); window.dispatchEvent(new Event(APP_LAYOUT_EVENT)); return true } catch { return false }
}

export function loadAppLayout(): AppLayoutPreferences { return normalizeAppLayout(readPreference(APP_LAYOUT_KEY)) }
export function saveAppLayout(value: AppLayoutPreferences): boolean { return writePreference(APP_LAYOUT_KEY, normalizeAppLayout(value)) }
export function effectiveLayout(value: AppLayoutPreferences): AppLayoutPreferences { return value.enabled ? normalizeAppLayout(value) : defaultAppLayout() }
export function navigationFeatures(value: AppLayoutPreferences): RootFeatureId[] { return ['Home', ...effectiveLayout(value).navigation] }
export function visibleRootFeatures(value: AppLayoutPreferences): RootFeatureId[] {
  const layout = effectiveLayout(value)
  return [...new Set<RootFeatureId>(['Home', 'Settings', 'FeatureHub', ...layout.navigation, ...layout.home, ...layout.more])]
}

export function normalizeSettingsSections(value: unknown): SettingsSections {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const raw = value as Record<string, unknown>
  return Object.fromEntries(SETTINGS_SECTION_IDS.filter((id) => typeof raw[id] === 'boolean').map((id) => [id, raw[id]]))
}
export function loadSettingsSections(): SettingsSections { return normalizeSettingsSections(readPreference(SETTINGS_SECTIONS_KEY)) }
export function saveSettingsSections(value: SettingsSections): boolean { return writePreference(SETTINGS_SECTIONS_KEY, normalizeSettingsSections(value)) }
