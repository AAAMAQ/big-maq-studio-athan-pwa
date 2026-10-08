import type { NavigationIntent } from '../types/nav'
import { ROOT_FEATURE_IDS, rootFeatureLabel } from './rootFeatures'
import type { AppLanguage } from './i18n'
import { JUZ_STARTS, QURAN_DESTINATION_NAMES } from './quranDestinations'

export type AppDestination = { id: string; label: string; breadcrumb: string; aliases: readonly string[]; intent: NavigationIntent }
type ChildDestination = { id: string; en: string; ar: string; parent: 'Prayer' | 'Quran' | 'SalahTracker' | 'Settings' | 'Credits' | 'NeedHelp'; aliases: string[]; intent: NavigationIntent }
const CHILD_DESTINATIONS: readonly ChildDestination[] = [
  { id: 'PrayerMonth', en: 'Monthly Timetable', ar: 'جدول الصلاة الشهري', parent: 'Prayer', aliases: ['monthly view', 'month', 'prayer month'], intent: { screen: 'Prayer', view: 'month' } },
  { id: 'QuranSettings', en: 'Quran Settings', ar: 'إعدادات القرآن', parent: 'Quran', aliases: ['quran preferences', 'translation', 'quran font'], intent: { screen: 'QuranSettings' } },
  { id: 'SalahInsights', en: 'Salah Insights', ar: 'إحصاءات الصلاة', parent: 'SalahTracker', aliases: ['insights', 'analytics', 'streak', 'stars'], intent: { screen: 'SalahInsights' } },
  { id: 'SalahSearch', en: 'Search Salah Progress', ar: 'البحث في سجل الصلاة', parent: 'SalahTracker', aliases: ['prayer history', 'salah search', 'search progress', 'daily notes', 'logged prayers'], intent: { screen: 'SalahSearch' } },
  { id: 'SalahGraphs', en: 'Graph Insights', ar: 'رسوم إحصاءات الصلاة', parent: 'SalahTracker', aliases: ['graph', 'charts', 'trend', 'salah brief'], intent: { screen: 'SalahGraphs' } },
  { id: 'DevNotes', en: 'Developer Notes', ar: 'ملاحظات المطور', parent: 'Credits', aliases: ['dev notes', 'devlog', 'release notes', 'updates'], intent: { screen: 'DevNotes' } },
  { id: 'Privacy', en: 'Privacy', ar: 'الخصوصية', parent: 'Credits', aliases: ['privacy policy', 'local data'], intent: { screen: 'Privacy' } },
  { id: 'Vision', en: 'Our Vision', ar: 'رؤيتنا', parent: 'Credits', aliases: ['vision', 'goals', 'purpose'], intent: { screen: 'Vision' } },
  { id: 'QiblaHelp', en: 'Qibla Help', ar: 'المساعدة في القبلة', parent: 'NeedHelp', aliases: ['compass help', 'qibla troubleshooting'], intent: { screen: 'NeedHelp', section: 'qibla' } },
  { id: 'AppLayout', en: 'Performance & App Layout', ar: 'الأداء وتخطيط التطبيق', parent: 'Settings', aliases: ['customize', 'custom layout', 'priorities', 'performance mode', 'home shortcuts', 'navigation'], intent: { screen: 'AppLayout' } },
  { id: 'QuranSurahs', en: 'Surah List', ar: 'قائمة السور', parent: 'Quran', aliases: ['surahs', 'browse quran', 'chapters'], intent: { screen: 'Quran', view: 'surahs' } },
  { id: 'QuranJuz', en: 'Juz View', ar: 'أجزاء القرآن', parent: 'Quran', aliases: ['juz', '30 parts'], intent: { screen: 'Quran', view: 'juz' } },
  { id: 'QuranSaved', en: 'Saved Surahs & Bookmarks', ar: 'السور المحفوظة والعلامات', parent: 'Quran', aliases: ['saved quran places', 'surah bookmarks', 'favorites'], intent: { screen: 'Quran', view: 'saved' } },
  { id: 'QuranSearch', en: 'Quran Verse Search', ar: 'البحث في آيات القرآن', parent: 'Quran', aliases: ['ayah search', 'surah search', 'verse search'], intent: { screen: 'Quran', view: 'search' } },
  { id: 'QuranContinue', en: 'Continue Reading', ar: 'متابعة القراءة', parent: 'Quran', aliases: ['quran reader', 'last read', 'last read ayah', 'resume quran'], intent: { screen: 'Quran', view: 'continue' } },
  { id: 'QuranDaily', en: 'Ayah of the Day', ar: 'آية اليوم', parent: 'Quran', aliases: ['daily ayah', 'daily reflection'], intent: { screen: 'Quran', view: 'daily' } },
  { id: 'QuranRecent', en: 'Recently Read', ar: 'القراءة الأخيرة', parent: 'Quran', aliases: ['recent surahs', 'recent quran'], intent: { screen: 'Quran', view: 'recent' } },
]

const ROOT_ALIASES: Record<string, string[]> = {
  SavedCities: ['saved cities', 'city mode', 'travel', 'city profiles'], AthanEngine: ['deep search', 'athan search', 'advanced athan'],
  Iqama: ['iqama', 'iqamah', 'congregation'], MasjidMode: ['masjid', 'mosque'], Onboarding: ['app guide', 'guide', 'onboarding'],
  BackupRestore: ['backup', 'restore', 'export app data', 'import app data'], Prayer: ['prayer', 'athan times'], FeatureHub: ['all features', 'hub'],
  NeedHelp: ['help', 'faq', 'how to use', 'user guide', 'المساعدة', 'مساعدة', 'دليل المساعدة'],
}
const SURAH_ALIASES: Record<number, string[]> = {
  1: ['fatiha', 'fatihah'], 2: ['baqarah', 'baqara'], 3: ['ali imran', 'al imran'], 5: ['maidah'], 9: ['tawbah'],
  20: ['taha'], 23: ['muminun', 'muminoon'], 24: ['nur'], 30: ['rum'], 32: ['sajdah'], 35: ['fatir'], 36: ['yasin', 'ya sin'],
  45: ['jathiyah'], 56: ['waqiah'], 58: ['mujadilah'], 62: ['jumuah'], 69: ['haqqah'], 71: ['nuh'], 75: ['qiyamah'],
  78: ['naba'], 93: ['duha'], 94: ['inshirah'], 99: ['zalzalah'], 101: ['qariah'], 106: ['quraysh'], 112: ['ikhlas'], 114: ['nas'],
}

/** Pure, bounded metadata catalog. It never reads worship records or imports screens. */
export function appDestinations(language: AppLanguage = 'en'): AppDestination[] {
  const quran = rootFeatureLabel('Quran', language)
  return [
    ...ROOT_FEATURE_IDS.map((id) => ({ id, label: id === 'FeatureHub' && language === 'ar' ? 'مركز الميزات' : rootFeatureLabel(id, language), breadcrumb: language === 'ar' ? 'التطبيق' : 'App', aliases: [rootFeatureLabel(id, 'en'), ...(ROOT_ALIASES[id] ?? [])], intent: { screen: id } as NavigationIntent })),
    ...CHILD_DESTINATIONS.map(({ id, en, ar, parent, aliases, intent }) => ({ id, label: language === 'ar' ? ar : en, breadcrumb: rootFeatureLabel(parent, language), aliases: [en, ar, ...aliases], intent })),
    ...QURAN_DESTINATION_NAMES.map(([en, ar], index) => ({
      id: `Surah${index + 1}`, label: `${index + 1}. ${language === 'ar' ? ar : en}`, breadcrumb: quran,
      aliases: [en, ar, `surah ${en}`, en.replace(/([aeiou])\1/g, '$1'), `${index + 1}`, `surah ${index + 1}`, ...(SURAH_ALIASES[index + 1] ?? []).flatMap((alias) => [alias, `al ${alias}`, `surah ${alias}`])],
      intent: { screen: 'Quran', surah: index + 1 } as NavigationIntent,
    })),
    ...JUZ_STARTS.map((_, index) => ({ id: `Juz${index + 1}`, label: `${language === 'ar' ? 'الجزء' : 'Juz'} ${index + 1}`, breadcrumb: quran, aliases: [`juz ${index + 1}`, `part ${index + 1}`, `الجزء ${index + 1}`], intent: { screen: 'Quran', juz: index + 1 } as NavigationIntent })),
  ]
}

function normalize(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, '').replace(/ـ/g, '').replace(/[إأٱآ]/g, 'ا').toLowerCase().replace(/['’\s-]/g, '')
}

/** Exact label/alias matches first, then prefix, then substring; at most 12 suggestions. */
export function searchAppDestinations(query: string, catalog: readonly AppDestination[], limit = 10): AppDestination[] {
  const maximum = Math.max(1, Math.min(12, Number.isFinite(limit) ? Math.floor(limit) : 10))
  const needle = normalize(query.slice(0, 200))
  if (!needle) return catalog.filter((entry) => !entry.id.startsWith('Surah') && !entry.id.startsWith('Juz')).slice(0, maximum)
  return catalog.map((entry, order) => {
    const terms = [entry.label, ...entry.aliases].map(normalize)
    const rank = terms.some((term) => term === needle) ? 0 : terms.some((term) => term.startsWith(needle)) ? 1 : terms.some((term) => term.includes(needle)) ? 2 : 3
    return { entry, rank, order }
  }).filter(({ rank }) => rank < 3).sort((a, b) => a.rank - b.rank || a.order - b.order).slice(0, maximum).map(({ entry }) => entry)
}
