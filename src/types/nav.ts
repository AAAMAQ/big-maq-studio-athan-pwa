// src/types/nav.ts
// Single source of truth for navigation tabs and screen names

export const PRIMARY_TABS = ['Home', 'Prayer', 'Settings'] as const
export type Tab = typeof PRIMARY_TABS[number]

export type Screen =
  | 'Home'
  | 'Prayer'
  | 'Settings'
  | 'Qibla'
  | 'Quran'
  | 'QuranSettings'
  | 'Credits'
  | 'DevNotes'
  | 'Privacy'
  | 'Vision'
  | 'NeedHelp'
  | 'SalahTracker'
  | 'SalahInsights'
  | 'SalahSearch'
  | 'SalahGraphs'
  | 'PrayerMonth'
  | 'AthanEngine'
  | 'Iqama'
  | 'More'
  | 'MasjidMode'
  | 'BackupRestore'
  | 'RamadanMode'
  | 'SavedCities'
  | 'Onboarding'
  | 'FeatureHub'
  | 'AppLayout'
  | 'FeatureSearch'

/** Internal destinations remain typed; search cannot dispatch arbitrary actions. */
export type NavigationIntent =
  | { screen: Screen }
  | { screen: 'Prayer'; view: 'month' }
  | { screen: 'Quran'; view: 'surahs' | 'juz' | 'saved' | 'search' | 'continue' | 'daily' | 'recent' }
  | { screen: 'Quran'; surah: number }
  | { screen: 'Quran'; juz: number }
  | { screen: 'SalahGraphs'; period: 'week' }
  | { screen: 'NeedHelp'; section: 'qibla' }
