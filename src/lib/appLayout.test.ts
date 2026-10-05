import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultAppLayout, effectiveLayout, loadAppLayout, navigationFeatures, normalizeAppLayout, normalizeSettingsSections, saveAppLayout, visibleRootFeatures } from './appLayout'
import { normalizePerformancePreferences } from './performancePreferences'
import { rootForScreen } from './rootFeatures'

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })
describe('optional layout contracts', () => {
  it('preserves the default layout and ignores a disabled saved arrangement', () => {
    expect(navigationFeatures(loadAppLayout())).toEqual(['Home', 'Prayer', 'Settings'])
    expect(effectiveLayout({ ...defaultAppLayout(), home: [] }).home).toEqual(['Quran', 'Qibla', 'More', 'Credits'])
  })
  it('protects Home, limits extras, and deduplicates each surface but permits cross-surface copies', () => {
    const prefs = normalizeAppLayout({ enabled: true, navigation: ['Home', 'Quran', 'Quran', 'Qibla', 'Iqama', 'Credits', 'Settings', 'invalid'], home: ['Quran', 'Quran', 'Home'], more: ['Quran', 'More'] })
    expect(navigationFeatures(prefs)).toEqual(['Home', 'Quran', 'Qibla', 'Iqama', 'Credits'])
    expect(prefs.home).toEqual(['Quran']); expect(prefs.more).toEqual(['Quran'])
    expect(visibleRootFeatures(prefs)).toContain('Settings'); expect(visibleRootFeatures(prefs)).toContain('FeatureHub')
  })
  it('allows Home alone and empty shortcut lists without losing protected paths', () => {
    const prefs = normalizeAppLayout({ enabled: true, navigation: [], home: [], more: [] })
    expect(navigationFeatures(prefs)).toEqual(['Home'])
    expect(visibleRootFeatures(prefs)).toEqual(['Home', 'Settings', 'FeatureHub'])
  })
  it('round-trips a saved custom arrangement', () => {
    const prefs = { ...defaultAppLayout(), enabled: true, navigation: ['SalahTracker' as const] }
    expect(saveAppLayout(prefs)).toBe(true); expect(loadAppLayout()).toEqual(prefs)
  })
  it('reports write failures and handles malformed/future schemas', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(saveAppLayout(defaultAppLayout())).toBe(false)
    expect(normalizeAppLayout({ schemaVersion: 99, enabled: true })).toEqual(defaultAppLayout())
    expect(normalizeSettingsSections({ preferences: false, other: false, calendar: 'false' })).toEqual({ preferences: false })
  })
  it('normalizes independent performance choices and child ownership', () => {
    expect(normalizePerformancePreferences({ enabled: true, priorities: ['Quran', 'bad', 'Quran'] })).toEqual({ schemaVersion: 1, enabled: true, priorities: ['Quran'] })
    expect(rootForScreen('SalahSearch')).toBe('SalahTracker'); expect(rootForScreen('QuranSettings')).toBe('Quran')
  })
})
