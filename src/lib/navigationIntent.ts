import type { NavigationIntent, Screen } from '../types/nav'

const screens: readonly Screen[] = ['Home','Prayer','Settings','Qibla','Quran','QuranSettings','Credits','DevNotes','Privacy','Vision','NeedHelp','SalahTracker','SalahInsights','SalahSearch','SalahGraphs','PrayerMonth','AthanEngine','Iqama','More','MasjidMode','BackupRestore','RamadanMode','SavedCities','Onboarding','FeatureHub','AppLayout','FeatureSearch']
export function isScreen(value: unknown): value is Screen {
  return typeof value === 'string' && screens.includes(value as Screen)
}

/** Reject malformed runtime values as well as accidental unchecked TypeScript casts. */
export function isNavigationIntent(value: unknown): value is NavigationIntent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const raw = value as Record<string, unknown>
  if (!isScreen(raw.screen)) return false
  if (Object.keys(raw).length === 1) return true
  if (raw.screen === 'Prayer') return raw.view === 'month' && Object.keys(raw).length === 2
  if (raw.screen === 'SalahGraphs') return raw.period === 'week' && Object.keys(raw).length === 2
  if (raw.screen === 'NeedHelp') return raw.section === 'qibla' && Object.keys(raw).length === 2
  if (raw.screen === 'Quran' && Object.keys(raw).length === 2) {
    if (typeof raw.surah === 'number') return Number.isInteger(raw.surah) && raw.surah >= 1 && raw.surah <= 114
    if (typeof raw.juz === 'number') return Number.isInteger(raw.juz) && raw.juz >= 1 && raw.juz <= 30
    return typeof raw.view === 'string' && ['surahs','juz','saved','search','continue','daily','recent'].includes(raw.view)
  }
  return false
}
