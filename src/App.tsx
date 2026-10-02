// src/App.tsx
import { useEffect, useRef, useState } from 'react'
import PrayerTimes from './features/PrayerTimes'
import Qibla from './features/Qibla'
import Quran from './features/Quran'
import QuranSettings from './features/QuranSettings'
import Settings from './features/Settings'
import Home from './features/Home'
import Credits from './features/Credits'
import Privacy from './features/Privacy'
import Vision from './features/Vision'
import NeedHelp from './features/NeedHelp'
import SalahTracker from './features/SalahTracker'
import SalahInsights from './features/SalahInsights'
import SalahSearch from './features/SalahSearch'
import SalahGraphs from './features/SalahGraphs'
import AthanEngine from './features/AthanEngine'
import Iqama from './features/Iqama'
import More from './features/More'
import MasjidMode from './features/MasjidMode'
import BackupRestore from './features/BackupRestore'
import RamadanMode from './features/RamadanMode'
import SavedCities from './features/SavedCities'
import Onboarding from './features/Onboarding'
import SharedDefaultsPrompt from './components/SharedDefaultsPrompt'
import { loadLanguage, t, type AppLanguage } from './lib/i18n'
import { parseSharedDefaultsUrl, type SharedDefaults } from './lib/sharedDefaults'
import { PRIMARY_TABS, type Screen, type Tab } from './types/nav'

const primaryTabs = PRIMARY_TABS

export default function App() {
  const [tab, setTab] = useState<Tab>('Home')
  const [screen, setScreen] = useState<Screen>('Home')
  const [history, setHistory] = useState<Screen[]>([])
  const [trackerSelectedDate, setTrackerSelectedDate] = useState<string>()
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage())
  const [sharedDefaults, setSharedDefaults] = useState<SharedDefaults | null>(() => (
    typeof window === 'undefined' ? null : parseSharedDefaultsUrl(window.location.href)
  ))
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onLanguageChange = () => setLanguage(loadLanguage())
    window.addEventListener('athan-language-change', onLanguageChange)
    return () => window.removeEventListener('athan-language-change', onLanguageChange)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 })
  }, [screen])

  const isPrimary = (s: Screen): s is Tab => (primaryTabs as readonly string[]).includes(s)

  const goTab = (t: Tab) => {
    setTab(t)
    setScreen(t)
    setHistory([])
  }

  const go = (s: string) => {
    const target = (s === 'Help' ? 'NeedHelp' : s) as Screen
    if (target === screen) return
    if (history.at(-1) === target) {
      setHistory((current) => current.slice(0, -1))
      setScreen(target)
      if (isPrimary(target)) setTab(target)
      return
    }
    setHistory((current) => [...current, screen])
    setScreen(target)
    if (isPrimary(target)) setTab(target)
  }

  const goBack = () => {
    const previous = history.at(-1)
    if (previous) {
      setHistory((current) => current.slice(0, -1))
      setScreen(previous)
      if (isPrimary(previous)) setTab(previous)
      return
    }
    goTab('Home')
  }

  const openTrackerDay = (date: string) => {
    setTrackerSelectedDate(date)
    go('SalahTracker')
  }

  const screenLabels: Record<Screen, string> = {
    Home: t('home', language),
    Prayer: t('prayerTimes', language),
    Settings: t('settings', language),
    Qibla: t('qibla', language),
    Quran: t('quran', language),
    QuranSettings: 'Quran Settings',
    Credits: t('credits', language),
    Privacy: t('privacy', language),
    Vision: t('vision', language),
    NeedHelp: t('needHelp', language),
    SalahTracker: t('salahTracker', language),
    SalahInsights: 'Salah Insights',
    SalahSearch: 'Search Salah Progress',
    SalahGraphs: 'Graph Insights',
    PrayerMonth: t('prayerTimes', language),
    AthanEngine: t('deepSearchAthan', language),
    Iqama: t('iqama', language),
    More: t('more', language),
    MasjidMode: t('masjidMode', language),
    BackupRestore: t('backupRestore', language),
    RamadanMode: t('ramadanMode', language),
    SavedCities: t('savedCities', language),
    Onboarding: t('onboarding', language)
  }

  const tabLabels: Record<Tab, string> = {
    Home: t('home', language),
    Prayer: t('prayer', language),
    Settings: t('settings', language)
  }

  const title = screenLabels[screen]

  return (
    <div className="flex flex-col h-full">
      {/* Header with optional Back on secondary screens */}
      <header className="p-4 bg-gray-800 flex items-center justify-between">
        {!isPrimary(screen) ? (
          <button
            className="min-h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-gray-200 hover:border-teal-600"
            onClick={goBack}
          >
            ← {t('back', language)}
          </button>
        ) : <span className="w-[64px]" />}
        <h1 className="text-xl font-bold text-center flex-1">{title}</h1>
        <span className="w-[64px]" />
      </header>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-auto p-4">
        {screen === 'Home' && <Home go={go} />}
        {screen === 'Prayer' && <PrayerTimes />}
        {screen === 'Settings' && <Settings go={go} />}
        {screen === 'Qibla' && <Qibla go={go} />}
        {screen === 'Quran' && <Quran go={go} />}
        {screen === 'QuranSettings' && <QuranSettings />}
        {screen === 'Credits' && <Credits go={go} />}
        {screen === 'Privacy' && <Privacy />}
        {screen === 'Vision' && <Vision />}
        {screen === 'NeedHelp' && <NeedHelp />}
        {/* Optional future screens */} 
        {screen === 'SalahTracker' && <SalahTracker go={go} initialDate={trackerSelectedDate} />}
        {screen === 'SalahInsights' && <SalahInsights />}
        {screen === 'SalahSearch' && <SalahSearch onOpenDay={openTrackerDay} />}
        {screen === 'SalahGraphs' && <SalahGraphs onOpenDay={openTrackerDay} />}
        {screen === 'AthanEngine' && <AthanEngine go={go} />}
        {screen === 'Iqama' && <Iqama go={go} />}
        {screen === 'More' && <More go={go} />}
        {screen === 'MasjidMode' && <MasjidMode go={go} />}
        {screen === 'BackupRestore' && <BackupRestore go={go} />}
        {screen === 'RamadanMode' && <RamadanMode go={go} />}
        {screen === 'SavedCities' && <SavedCities go={go} />}
        {screen === 'Onboarding' && <Onboarding go={go} />}
      </main>

      {/* Bottom navigation — ONLY three tabs */}
      <nav className="flex justify-around bg-gray-800 p-2">
        {primaryTabs.map(t => (
          <button
            key={t}
            onClick={() => goTab(t)}
            aria-current={tab === t ? 'page' : undefined}
            className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-1 py-1 text-xs transition-colors ${tab === t ? 'text-teal-300' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <NavIcon tab={t} />
            {tabLabels[t]}
          </button>
        ))}
      </nav>
      {sharedDefaults && (
        <SharedDefaultsPrompt defaults={sharedDefaults} onClose={() => setSharedDefaults(null)} />
      )}
    </div>
  )
}

function NavIcon({ tab }: { tab: Tab }) {
  if (tab === 'Home') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </svg>
    )
  }
  if (tab === 'Prayer') {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M5 20V9a7 7 0 0 1 14 0v11" />
        <path d="M8 20v-7a4 4 0 0 1 8 0v7M3 20h18" />
        <path d="M12 2V0.8" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  )
}
