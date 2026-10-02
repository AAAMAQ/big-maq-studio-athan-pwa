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
