import { afterEach, describe, expect, it, vi } from 'vitest'
import { createScreenLoader, preparationScreens, scheduleFeaturePreparation, type FeatureScreenModule } from './screenLoader'
import { defaultAppLayout } from './appLayout'
import type { Screen } from '../types/nav'
import type { PerformancePreferences } from './performancePreferences'

const normal: PerformancePreferences = { schemaVersion: 1, enabled: false, priorities: [] }
const component: FeatureScreenModule = { default: () => null }

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

describe('feature imports', () => {
  it('shares the same in-flight and fulfilled import, including child alias', async () => {
    const importer = vi.fn(async () => component)
    const loader = createScreenLoader({ Prayer: importer })
    const first = loader.load('Prayer')
    expect(loader.load('PrayerMonth')).toBe(first)
    await expect(first).resolves.toBe(component)
    expect(loader.load('Prayer')).toBe(first)
    expect(importer).toHaveBeenCalledTimes(1)
  })

  it('evicts rejected imports and can retry without clearing user records', async () => {
    const importer = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(component)
    const loader = createScreenLoader({ Quran: importer })
    localStorage.setItem('salahLogV1', 'untouched')
    await expect(loader.load('Quran')).rejects.toThrow('offline')
    await expect(loader.load('Quran')).resolves.toBe(component)
    expect(importer).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem('salahLogV1')).toBe('untouched')
  })

  it('creates stable lazy components and fresh wrappers on explicit retry', () => {
    const loader = createScreenLoader({ Quran: async () => component })
    const first = loader.getLazy('Quran')
    expect(loader.getLazy('Quran')).toBe(first)
    loader.reset('Quran')
    expect(loader.getLazy('Quran')).not.toBe(first)
  })

  it('unknown destinations fail safely', async () => {
    await expect(createScreenLoader({}).load('Qibla')).rejects.toThrow('Unknown feature screen')
  })

  it('normal policy prepares every feature without making child duplicates', () => {
    const screens = preparationScreens(defaultAppLayout(), normal)
    expect(screens).toContain('Qibla')
    expect(screens).toContain('SalahSearch')
    expect(screens).toContain('AppLayout')
    expect(screens).toContain('FeatureHub')
    expect(screens).not.toContain('PrayerMonth')
    expect(new Set(screens).size).toBe(screens.length)
  })

  it('custom-only policy defers hidden roots and includes visible children/protected access', () => {
    const layout = { ...defaultAppLayout(), enabled: true, navigation: ['Quran' as const], home: [], more: [] }
    const screens = preparationScreens(layout, normal)
    expect(screens).toEqual(['Home', 'Settings', 'Quran', 'QuranSettings', 'FeatureHub', 'AppLayout'])
    expect(screens).not.toContain('SavedCities')
  })

  it('performance-only policy prepares Home and explicitly selected roots/children', () => {
    const performance = { ...normal, enabled: true, priorities: ['SalahTracker' as const] }
    expect(preparationScreens(defaultAppLayout(), performance)).toEqual(['Home', 'SalahTracker', 'SalahInsights', 'SalahSearch', 'SalahGraphs'])
  })

  it('combined policy can prepare a hidden explicitly-prioritized root without mounting it', () => {
    const layout = { ...defaultAppLayout(), enabled: true, navigation: [], home: [], more: [] }
    const performance = { ...normal, enabled: true, priorities: ['Quran' as const] }
    expect(preparationScreens(layout, performance)).toEqual(['Home', 'Quran', 'QuranSettings'])
  })
})

describe('bounded preparation queue', () => {
  it('yields before preparing, waits for each import, and stops pending jobs on cleanup', async () => {
    vi.useFakeTimers()
    let resolve!: () => void
    const prepare = vi.fn<(screen: Screen) => Promise<void>>(() => new Promise<void>((done) => { resolve = done }))
    const stop = scheduleFeaturePreparation(defaultAppLayout(), normal, prepare)
    expect(prepare).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(160)
    expect(prepare).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(5000)
    expect(prepare).toHaveBeenCalledTimes(1)
    resolve()
    await vi.advanceTimersByTimeAsync(80)
    expect(prepare).toHaveBeenCalledTimes(2)
    stop()
    resolve()
    await vi.runAllTimersAsync()
    expect(prepare).toHaveBeenCalledTimes(2)
  })

  it('continues after speculative failure, without unhandled rejection or automatic retry', async () => {
    vi.useFakeTimers()
    const prepare = vi.fn<(screen: Screen) => Promise<void>>(async () => { throw new Error('unavailable') })
    scheduleFeaturePreparation(defaultAppLayout(), { ...normal, enabled: true, priorities: ['Quran'] }, prepare)
    await vi.runAllTimersAsync()
    expect(prepare.mock.calls.map(([screen]) => screen)).toEqual(['Home', 'Quran', 'QuranSettings'])
  })

  it('cancelled preparation does not import anything', async () => {
    vi.useFakeTimers()
    const prepare = vi.fn(async () => {})
    scheduleFeaturePreparation(defaultAppLayout(), normal, prepare)()
    await vi.runAllTimersAsync()
    expect(prepare).not.toHaveBeenCalled()
  })

  it('uses idle scheduling where available and cancels the scheduled callback', async () => {
    vi.useFakeTimers()
    const requestIdle = vi.fn(() => 17)
    const cancelIdle = vi.fn()
    vi.stubGlobal('requestIdleCallback', requestIdle)
    vi.stubGlobal('cancelIdleCallback', cancelIdle)
    const prepare = vi.fn(async () => {})
    const stop = scheduleFeaturePreparation(defaultAppLayout(), normal, prepare)
    await vi.advanceTimersByTimeAsync(80)
    expect(requestIdle).toHaveBeenCalledWith(expect.any(Function), { timeout: 2000 })
    expect(prepare).not.toHaveBeenCalled()
    stop()
    expect(cancelIdle).toHaveBeenCalledWith(17)
  })
})
