// src/App.tsx
import { Suspense, useEffect, useRef, useState } from 'react'
import Home from './features/Home'
import SharedDefaultsPrompt from './components/SharedDefaultsPrompt'
import ScreenBoundary, { ScreenLoading } from './components/ScreenBoundary'
import { loadLanguage, t, type AppLanguage } from './lib/i18n'
import { parseSharedDefaultsUrl, type SharedDefaults } from './lib/sharedDefaults'
import type { NavigationIntent, Screen } from './types/nav'
import { APP_LAYOUT_EVENT, loadAppLayout, navigationFeatures } from './lib/appLayout'
import { loadPerformancePreferences } from './lib/performancePreferences'
import { rootFeatureLabel, rootForScreen, type RootFeatureId } from './lib/rootFeatures'
import { getLazyScreen, resetFeatureScreen, scheduleFeaturePreparation } from './lib/screenLoader'
import { refreshAthanApp } from './lib/pwa'
import { isNavigationIntent, isScreen } from './lib/navigationIntent'
import { getRecentDeviceLocation, refreshDeviceLocation } from './lib/locationStore'
import { loadAutomaticQiblaLocation, QIBLA_PREFERENCES_EVENT } from './lib/qiblaPreferences'
import { prepareQiblaCompassAccess } from './lib/qiblaCompassAccess'

export default function App() {
  const [screen, setScreen] = useState<Screen>('Home')
  const [navigationIntent, setNavigationIntent] = useState<NavigationIntent>()
  const [history, setHistory] = useState<{ screen: Screen; intent?: NavigationIntent }[]>([])
  const [trackerSelectedDate, setTrackerSelectedDate] = useState<string>()
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage())
  const [layout, setLayout] = useState(loadAppLayout)
  const [performance, setPerformance] = useState(loadPerformancePreferences)
  const [retry, setRetry] = useState(0)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [sharedDefaults, setSharedDefaults] = useState<SharedDefaults | null>(() => (
    typeof window === 'undefined' ? null : parseSharedDefaultsUrl(window.location.href)
  ))
  const mainRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const primaryTabs = navigationFeatures(layout)

  useEffect(() => {
    const reload = () => {
      setLayout(loadAppLayout())
      setPerformance(loadPerformancePreferences())
    }
    window.addEventListener(APP_LAYOUT_EVENT, reload)
    window.addEventListener('storage', reload)
    return () => {
      window.removeEventListener(APP_LAYOUT_EVENT, reload)
      window.removeEventListener('storage', reload)
    }
  }, [])

  useEffect(() => scheduleFeaturePreparation(layout, performance), [layout, performance])

  useEffect(() => {
    let prepared = false
    const prepareLocation = () => {
      if (!loadAutomaticQiblaLocation()) { prepared = false; return }
      if (prepared) return
      prepared = true
      if (!getRecentDeviceLocation()) void refreshDeviceLocation({ allowCachedFallback: false })
    }
    prepareLocation()
    window.addEventListener(QIBLA_PREFERENCES_EVENT, prepareLocation)
    window.addEventListener('storage', prepareLocation)
    return () => {
      window.removeEventListener(QIBLA_PREFERENCES_EVENT, prepareLocation)
      window.removeEventListener('storage', prepareLocation)
    }
  }, [])

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
    mainRef.current?.scrollTo?.({ top: 0 })
    if (screen !== 'FeatureSearch' && !sharedDefaults) titleRef.current?.focus({ preventScroll: true })
  }, [screen, sharedDefaults])

  const isPrimary = (s: Screen) => (primaryTabs as readonly string[]).includes(s)

  const goTab = (t: RootFeatureId) => {
    if (t === 'Qibla' && screen !== 'Qibla') prepareQiblaCompassAccess()
    setNavigationIntent(undefined)
    setScreen(t)
    setHistory([])
  }

  const go = (s: string) => {
    const target = s === 'Help' ? 'NeedHelp' : s
    if (!isScreen(target)) return
    if (target === screen) return
    if (target === 'Qibla') prepareQiblaCompassAccess()
    if (history.at(-1)?.screen === target) {
      setNavigationIntent(history.at(-1)?.intent)
      setHistory((current) => current.slice(0, -1))
      setScreen(target)
      return
    }
    setNavigationIntent(s === 'PrayerMonth' ? { screen: 'Prayer', view: 'month' } : undefined)
    setHistory((current) => [...current, { screen, intent: navigationIntent }])
    setScreen(target)
  }

  const goBack = () => {
    setNavigationIntent(undefined)
    const previous = history.at(-1)
    if (previous) {
      if (previous.screen === 'Qibla') prepareQiblaCompassAccess()
      setNavigationIntent(previous.intent)
      setHistory((current) => current.slice(0, -1))
      setScreen(previous.screen)
      return
    }
    goTab('Home')
  }

  const openTrackerDay = (date: string) => {
    setTrackerSelectedDate(date)
    go('SalahTracker')
  }

  const navigate = (intent: NavigationIntent) => {
    if (!isNavigationIntent(intent)) return
    go(intent.screen)
    setNavigationIntent(intent)
  }

  const screenLabels: Record<Screen, string> = {
    Home: t('home', language),
    Prayer: t('prayerTimes', language),
    Settings: t('settings', language),
    Qibla: t('qibla', language),
    Quran: t('quran', language),
    QuranSettings: 'Quran Settings',
    Credits: t('credits', language),
    DevNotes: 'Developer Notes',
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
    Onboarding: t('onboarding', language),
    FeatureHub: 'Feature Hub',
    AppLayout: 'Performance & App Layout',
    FeatureSearch: 'Search app'
  }

  const title = screenLabels[screen]
  const FeatureScreen = screen === 'Home' ? Home : getLazyScreen(screen)
  const selectedRoot = rootForScreen(screen)
  const retryScreen = () => {
    if (screen === 'Qibla') prepareQiblaCompassAccess()
    resetFeatureScreen(screen)
    setRetry(current => current + 1)
  }
  const reloadApp = () => {
    void refreshAthanApp(status => setRecoveryMessage(status === 'fallback'
      ? 'Could not check for an update. Your current offline app and saved records are preserved; retry when connected.'
      : status === 'reloading' ? 'Reloading the available app…' : status === 'ready' ? 'Update check complete.' : 'Checking for an update…'))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header with optional Back on secondary screens */}
      <header className="p-4 bg-gray-800 flex items-center justify-between" style={screen === 'Home' ? { direction: 'ltr' } : undefined}>
        {screen === 'Home' ? <button type="button" aria-label="Search app" className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300" onClick={() => go('FeatureSearch')}><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg></button> : !isPrimary(screen) ? (
          <button
            className="min-h-10 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-gray-200 hover:border-teal-600"
            onClick={goBack}
          >
            ← {t('back', language)}
          </button>
        ) : <span className="w-[64px]" />}
        <h1 ref={titleRef} tabIndex={-1} dir={language === 'ar' ? 'rtl' : 'ltr'} className="text-xl font-bold text-center flex-1 outline-none">{title}</h1>
        {screen === 'Home' ? <button type="button" aria-label="Feature Hub" className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg text-gray-300 hover:text-teal-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-300" onClick={() => go('FeatureHub')}><NavIcon tab="FeatureHub" /></button> : <span className="w-[64px]" />}
      </header>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-auto p-4">
        <ScreenBoundary resetKey={screen + ':' + retry} onRetry={retryScreen} onHome={() => goTab('Home')} onSettings={() => go('Settings')} onFeatureHub={() => go('FeatureHub')} onReloadApp={reloadApp} recoveryMessage={recoveryMessage}>
          <Suspense fallback={<ScreenLoading />}>
            <FeatureScreen go={go} initialDate={trackerSelectedDate} onOpenDay={openTrackerDay} navigationIntent={navigationIntent} onNavigate={navigate} onNavigationHandled={() => setNavigationIntent(undefined)} />
          </Suspense>
        </ScreenBoundary>
      </main>

      <nav aria-label="Main navigation" className="flex justify-around bg-gray-800 p-2">
        {primaryTabs.map(destination => (
          <button
            key={destination}
            onClick={() => goTab(destination)}
            aria-current={selectedRoot === destination ? 'page' : undefined}
            className={`flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-1 text-xs transition-colors ${selectedRoot === destination ? 'text-teal-300' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <NavIcon tab={destination} />
            <span className="text-center break-words">{destination === 'Prayer' ? t('prayer', language) : rootFeatureLabel(destination, language)}</span>
          </button>
        ))}
      </nav>
      {sharedDefaults && (
        <SharedDefaultsPrompt defaults={sharedDefaults} onClose={() => setSharedDefaults(null)} />
      )}
    </div>
  )
}

function NavIcon({ tab }: { tab: RootFeatureId }) {
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
  if (tab !== 'Settings') return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
    </svg>
  )
}
