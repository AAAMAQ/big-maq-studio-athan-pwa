import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import Home from '../features/Home'
import type { Screen } from '../types/nav'
import { visibleRootFeatures, type AppLayoutPreferences } from './appLayout'
import type { PerformancePreferences } from './performancePreferences'
import { rootForScreen } from './rootFeatures'

export type FeatureScreenProps = {
  go: (screen: string) => void
  initialDate?: string
  onOpenDay: (date: string) => void
}
export type FeatureScreenModule = { default: ComponentType<FeatureScreenProps> }
type Importer = () => Promise<FeatureScreenModule>

// Explicit imports let Vite discover/cache chunks. Importing never mounts a screen.
const importers: Record<Screen, Importer> = {
  // Home is the immediate essential screen; it is not a separate lazy chunk.
  Home: () => Promise.resolve({ default: Home }),
  Prayer: () => import('../features/PrayerTimes'),
  PrayerMonth: () => import('../features/PrayerTimes'),
  Settings: () => import('../features/Settings'),
  Quran: () => import('../features/Quran'),
  QuranSettings: () => import('../features/QuranSettings'),
  Qibla: () => import('../features/Qibla'),
  More: () => import('../features/More'),
  Credits: () => import('../features/Credits'),
  DevNotes: () => import('../features/DevNotes'),
  Privacy: () => import('../features/Privacy'),
  Vision: () => import('../features/Vision'),
  NeedHelp: () => import('../features/NeedHelp'),
  SalahTracker: () => import('../features/SalahTracker'),
  SalahInsights: () => import('../features/SalahInsights'),
  SalahSearch: () => import('../features/SalahSearch'),
  SalahGraphs: () => import('../features/SalahGraphs'),
  AthanEngine: () => import('../features/AthanEngine'),
  SavedCities: () => import('../features/SavedCities'),
  Iqama: () => import('../features/Iqama'),
  MasjidMode: () => import('../features/MasjidMode'),
  BackupRestore: () => import('../features/BackupRestore'),
  RamadanMode: () => import('../features/RamadanMode'),
  Onboarding: () => import('../features/Onboarding'),
  FeatureHub: () => import('../features/FeatureHub'),
  AppLayout: () => import('../features/AppLayout'),
}

const canonicalScreen = (screen: Screen): Screen => screen === 'PrayerMonth' ? 'Prayer' : screen

/** A small factory makes deduplication/recovery testable without importing actual screens. */
export function createScreenLoader(sources: Partial<Record<Screen, Importer>>) {
  const pending = new Map<Screen, Promise<FeatureScreenModule>>()
  const components = new Map<Screen, LazyExoticComponent<ComponentType<FeatureScreenProps>>>()

  function load(screen: Screen): Promise<FeatureScreenModule> {
    const key = canonicalScreen(screen)
    const existing = pending.get(key)
    if (existing) return existing
    const importer = sources[key]
    if (!importer) return Promise.reject(new Error(`Unknown feature screen: ${screen}`))
    // Deferral also converts synchronous importer failures into retryable rejections.
    const promise = Promise.resolve().then(importer)
    pending.set(key, promise)
    void promise.catch(() => {
      if (pending.get(key) === promise) pending.delete(key)
    })
    return promise
  }

  function getLazy(screen: Screen) {
    const key = canonicalScreen(screen)
    let component = components.get(key)
    if (!component) {
      component = lazy(() => load(key))
      components.set(key, component)
    }
    return component
  }

  function reset(screen: Screen) {
    const key = canonicalScreen(screen)
    pending.delete(key)
    // React.lazy retains errors, so an explicit retry must use a fresh lazy wrapper.
    components.delete(key)
  }
  return { load, getLazy, reset }
}

const loader = createScreenLoader(importers)
export const loadFeatureScreen = loader.load
export const getLazyScreen = loader.getLazy
export const resetFeatureScreen = loader.reset

/** Pure policy: preparation is code readiness, not permission/data/background work. */
export function preparationScreens(layout: AppLayoutPreferences, performance: PerformancePreferences): Screen[] {
  const screens = Object.keys(importers).filter((screen) => screen !== 'PrayerMonth') as Screen[]
  if (performance.enabled) {
    const priorities = new Set(['Home', ...performance.priorities])
    return screens.filter((screen) => priorities.has(rootForScreen(screen)))
  }
  if (!layout.enabled) return screens
  const visible = new Set(visibleRootFeatures(layout))
  return screens.filter((screen) => visible.has(rootForScreen(screen)))
}

/** One import at a time, only after Home has had a turn to paint; cleanup stops future jobs. */
export function scheduleFeaturePreparation(
  layout: AppLayoutPreferences,
  performance: PerformancePreferences,
  prepare: (screen: Screen) => Promise<unknown> = loadFeatureScreen,
): () => void {
  if (typeof window === 'undefined') return () => {}
  const queue = preparationScreens(layout, performance)
  let cancelled = false
  let timer: ReturnType<typeof setTimeout> | undefined
  let idle: number | undefined

  const run = () => {
    if (cancelled) return
    const screen = queue.shift()
    if (!screen) return
    // A failed speculative import remains recoverable on a user's later navigation.
    void Promise.resolve().then(() => prepare(screen)).catch(() => {}).finally(schedule)
  }
  function schedule() {
    if (cancelled || queue.length === 0) return
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(run, { timeout: 2000 })
    } else {
      timer = setTimeout(run, 80)
    }
  }
  // This first task yields regardless of requestIdleCallback availability.
  timer = setTimeout(schedule, 80)
  return () => {
    cancelled = true
    if (timer !== undefined) clearTimeout(timer)
    if (idle !== undefined) window.cancelIdleCallback?.(idle)
    // Started native imports cannot be aborted/unloaded; do not claim otherwise.
  }
}
