import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defaultAppLayout, effectiveLayout, loadAppLayout, navigationFeatures, normalizeAppLayout, normalizeSettingsSections, saveAppLayout, visibleRootFeatures } from './appLayout'
import { normalizePerformancePreferences } from './performancePreferences'
import { rootForScreen } from './rootFeatures'

beforeEach(() => { localStorage.clear(); vi.restoreAllMocks() })
describe('optional layout contracts', () => {
  it('defaults legacy briefs to a line and preserves a selected chart while disabled', () => {
    expect(normalizeAppLayout({ homeSections: { salahBrief: true } }).homeSections?.salahBriefView).toBe('line')
    expect(normalizeAppLayout({ homeSections: { salahBrief: true, salahBriefView: 'bad' } }).homeSections?.salahBriefView).toBe('line')
    const prefs = normalizeAppLayout({ enabled: false, homeSections: { salahBrief: true, salahBriefView: 'bars' } })
    expect(saveAppLayout(prefs)).toBe(true)
    expect(loadAppLayout().homeSections?.salahBriefView).toBe('bars')
    expect(effectiveLayout(prefs).homeSections?.salahBrief).toBe(false)
  })
  it('validates optional Salah Brief, retaining it while disabled without private fields', () => {
    const prefs = normalizeAppLayout({ ...defaultAppLayout(), homeSections: { salahBrief: true, notes: 'private' } })
    expect(prefs.homeSections).toEqual({ salahBrief: true, salahBriefView: 'line' })
    expect(effectiveLayout(prefs).homeSections).toEqual({ salahBrief: false, salahBriefView: 'line' })
    expect(normalizeAppLayout({ homeSections: { salahBrief: 'true' } }).homeSections?.salahBrief).toBe(false)
    expect(saveAppLayout(prefs)).toBe(true)
    expect(loadAppLayout().homeSections?.salahBrief).toBe(true)
  })
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
  it('allows Need Help on every custom surface and as a performance priority without changing defaults', () => {
    const prefs = normalizeAppLayout({ enabled: true, navigation: ['NeedHelp'], home: ['NeedHelp'], more: ['NeedHelp'] })
    expect(rootForScreen('NeedHelp')).toBe('NeedHelp')
    expect(navigationFeatures(prefs)).toEqual(['Home', 'NeedHelp'])
    expect(prefs.home).toEqual(['NeedHelp'])
    expect(prefs.more).toEqual(['NeedHelp'])
    expect(saveAppLayout(prefs)).toBe(true)
    expect(loadAppLayout()).toEqual(prefs)
    expect(normalizePerformancePreferences({ enabled: true, priorities: ['NeedHelp'] }).priorities).toEqual(['NeedHelp'])
    expect(defaultAppLayout().navigation).toEqual(['Prayer', 'Settings'])
    expect(defaultAppLayout().home).toEqual(['Quran', 'Qibla', 'More', 'Credits'])
    expect(defaultAppLayout().more).not.toContain('NeedHelp')
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
