import { t, type AppLanguage } from './i18n'
import type { Screen } from '../types/nav'

export const ROOT_FEATURE_IDS = ['Home', 'Prayer', 'Settings', 'Quran', 'Qibla', 'More', 'Credits', 'AthanEngine', 'SavedCities', 'Iqama', 'MasjidMode', 'SalahTracker', 'BackupRestore', 'RamadanMode', 'Onboarding', 'NeedHelp', 'FeatureHub'] as const
export type RootFeatureId = typeof ROOT_FEATURE_IDS[number]

const labels: Record<RootFeatureId, string> = {
  Home: 'home', Prayer: 'prayerTimes', Settings: 'settings', Quran: 'quran', Qibla: 'qibla',
  More: 'more', Credits: 'credits', AthanEngine: 'deepSearchAthan', SavedCities: 'savedCitiesTravel',
  Iqama: 'iqamaTimes', MasjidMode: 'masjidMode', SalahTracker: 'salahTracker',
  BackupRestore: 'backupRestore', RamadanMode: 'ramadanMode', Onboarding: 'onboarding', NeedHelp: 'needHelp', FeatureHub: 'Feature Hub'
}

export function isRootFeatureId(value: unknown): value is RootFeatureId {
  return typeof value === 'string' && (ROOT_FEATURE_IDS as readonly string[]).includes(value)
}

export function rootFeatureLabel(id: RootFeatureId, language: AppLanguage): string {
  return id === 'FeatureHub' ? 'Feature Hub' : t(labels[id], language)
}

export function rootForScreen(screen: Screen): RootFeatureId {
  if (isRootFeatureId(screen)) return screen
  if (screen === 'PrayerMonth') return 'Prayer'
  if (screen === 'QuranSettings') return 'Quran'
  if (screen === 'SalahInsights' || screen === 'SalahSearch' || screen === 'SalahGraphs') return 'SalahTracker'
  if (screen === 'AppLayout') return 'Settings'
  if (screen === 'FeatureSearch') return 'Home'
  return 'Credits'
}
