import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { applySharedDefaults, createSharedDefaults, createSharedDefaultsUrl, parseSharedDefaultsUrl } from './sharedDefaults'
import { APP_LAYOUT_EVENT, APP_LAYOUT_KEY, defaultAppLayout, loadAppLayout, saveAppLayout } from './appLayout'
import { QIBLA_AUTO_LOCATION_KEY, loadAutomaticQiblaLocation } from './qiblaPreferences'

afterEach(() => vi.restoreAllMocks())

function link(value: unknown) { return `https://athan.example/#share-defaults=${btoa(JSON.stringify(value))}` }

describe('shared defaults', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState(null, '', '/')
  })

  it('shares only the explicit non-personal allowlist', () => {
    localStorage.setItem('method', 'Karachi')
    localStorage.setItem('madhab', 'Hanafi')
    localStorage.setItem('highLatRule', 'TwilightAngle')
    localStorage.setItem('athan.language.v1', 'ar')
    localStorage.setItem('athan.preference.timeFormat.v1', '12h')
    localStorage.setItem('athan.preference.showSunnah.v1', 'true')
    localStorage.setItem('reminderOffsetMin', '15')
    localStorage.setItem('ishaFixedTime', '21:45')
    localStorage.setItem('salahLogV1', '{"private":"worship data"}')
    for (const key of ['athan.layout.v1', 'athan.performance.v1', 'athan.settings.sections.v1', 'salahSavedSearchesV1', 'salahRecentSearchesV1']) localStorage.setItem(key, 'PRIVATE_V4_SENTINEL')
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.calendar.fixedIsha.enabled.v1', 'false')
    localStorage.setItem('athan.calendar.secondReminder.v1', '{"enabled":true,"minutesBefore":15}')
    localStorage.setItem('athan.engine.secondReminder.v1', '{"enabled":true,"minutesBefore":25}')
    localStorage.setItem('athan.preference.savedCityTimeView.v1', 'utc')
    localStorage.setItem('athan.iqama.jumuahReminder.v1', '{"include":true,"time":"09:30"}')
    localStorage.setItem('athan.ramadan.fasts.v1', '[{"private":true}]')
    localStorage.setItem('athan.quran.progress.v1', '{"lastReadAyah":7}')
    localStorage.setItem('athan.location.cache.v1', '{"latitude":1,"longitude":2}')
    localStorage.setItem(QIBLA_AUTO_LOCATION_KEY, 'true')

    const url = createSharedDefaultsUrl('https://athan.example/app')
    const parsed = parseSharedDefaultsUrl(url)

    expect(parsed).toEqual({
      app: 'Athan PWA defaults',
      version: 1,
      prayer: { method: 'Karachi', madhab: 'Hanafi', highLatRule: 'TwilightAngle' },
      preferences: { language: 'ar', timeFormat: '12h', showSunnah: true },
      reminders: { offsetMinutes: 15, fixedIshaTime: '21:45' }
    })
    expect(url).not.toContain('private')
    expect(JSON.stringify(parsed)).not.toContain('PRIVATE_V4_SENTINEL')
    expect(JSON.stringify(parsed)).not.toMatch(/layout|priorities|queries|searches|sections/)
    expect(url).not.toContain('latitude')
    expect(JSON.stringify(parsed)).not.toContain('20:30')
    expect(JSON.stringify(parsed)).not.toContain('09:30')
    expect(JSON.stringify(parsed)).not.toContain('minutesBefore')
    expect(JSON.stringify(parsed)).not.toContain('savedCityTimeView')
    expect(JSON.stringify(parsed)).not.toMatch(/autoLocation|qibla/)
    expect(Object.keys(parsed ?? {})).toEqual(['app', 'version', 'prayer', 'preferences', 'reminders'])
  })

  it('applies safe defaults without touching personal worship data', () => {
    localStorage.setItem('salahLogV1', '{"2026-08-05":{"Fajr":true}}')
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.ramadan.fasts.v1', '[{"date":"2026-03-01"}]')
    localStorage.setItem('athan.quran.progress.v1', '{"lastReadAyah":7}')
    localStorage.setItem(QIBLA_AUTO_LOCATION_KEY, 'true')

    applySharedDefaults({
      app: 'Athan PWA defaults',
      version: 1,
      prayer: { method: 'Singapore', madhab: 'Shafi', highLatRule: 'MiddleOfTheNight' },
      preferences: { language: 'en', timeFormat: '24h', showSunnah: false },
      reminders: { offsetMinutes: 20, fixedIshaTime: '22:00' }
    })

    expect(localStorage.getItem('method')).toBe('Singapore')
    expect(localStorage.getItem('athan.prayer.calculationMode.v1')).toBe('manual')
    expect(localStorage.getItem('athan.preference.timeFormat.v1')).toBe('24h')
    expect(localStorage.getItem('salahLogV1')).toBe('{"2026-08-05":{"Fajr":true}}')
    expect(localStorage.getItem('athan.salah.reminder.v1')).toBe('{"enabled":true,"time":"20:30"}')
    expect(localStorage.getItem('athan.ramadan.fasts.v1')).toBe('[{"date":"2026-03-01"}]')
    expect(localStorage.getItem('athan.quran.progress.v1')).toBe('{"lastReadAyah":7}')
    expect(loadAutomaticQiblaLocation()).toBe(true)
  })

  it('rejects malformed and unsupported links', () => {
    expect(parseSharedDefaultsUrl('https://athan.example/#share-defaults=not-valid')).toBeNull()
    expect(parseSharedDefaultsUrl('https://athan.example/')).toBeNull()
  })

  it('shares a strict v2 arrangement only when selected, excluding injected personal fields', () => {
    const layout = { ...defaultAppLayout(), enabled: true, navigation: ['Quran', 'Iqama'], home: [], more: ['SalahTracker'], homeSections: { salahBrief: true, salahBriefView: 'bars', graph: 'PRIVATE_SENTINEL' }, notes: 'PRIVATE_SENTINEL' }
    localStorage.setItem(APP_LAYOUT_KEY, JSON.stringify(layout))
    for (const key of ['salahLogV1', 'salahSavedSearchesV1', 'salahRecentSearchesV1', 'athan.performance.v1', 'athan.settings.sections.v1', 'athan.salah.reminder.v1', 'athan.quran.progress.v1', 'athan.location.cache.v1', QIBLA_AUTO_LOCATION_KEY]) localStorage.setItem(key, 'PRIVATE_SENTINEL')
    expect(createSharedDefaults().version).toBe(1)
    expect(createSharedDefaults().layout).toBeUndefined()
    const parsed = parseSharedDefaultsUrl(createSharedDefaultsUrl('https://athan.example', { includeLayout: true }))!
    expect(parsed.version).toBe(2)
    expect(parsed.layout).toEqual({ schemaVersion: 1, enabled: true, navigation: ['Quran', 'Iqama'], home: [], more: ['SalahTracker'], homeSections: { salahBrief: true, salahBriefView: 'bars' } })
    expect(JSON.stringify(parsed)).not.toContain('PRIVATE_SENTINEL')
    expect(Object.keys(parsed)).toEqual(['app', 'version', 'prayer', 'preferences', 'reminders', 'layout'])
  })

  it('strips unknown nested fields from all ordinary defaults, and ignores layout injected in v1', () => {
    const raw = createSharedDefaults()
    const parsed = parseSharedDefaultsUrl(link({ ...raw, prayer: { ...raw.prayer, logs: 'PRIVATE' }, preferences: { ...raw.preferences, history: 'PRIVATE' }, reminders: { ...raw.reminders, tracker: 'PRIVATE' }, layout: defaultAppLayout(), layoutWarnings: ['PRIVATE'] }))
    expect(parsed).toEqual(raw)
    expect(JSON.stringify(parsed)).not.toContain('PRIVATE')
  })

  it('does not apply offered layout without separate recipient consent, and dispatches on explicit consent', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: ['Iqama'], homeSections: { salahBrief: true } })
    const offered = createSharedDefaults({ includeLayout: true })
    saveAppLayout({ ...defaultAppLayout(), enabled: false, navigation: ['Settings'] })
    const existing = localStorage.getItem(APP_LAYOUT_KEY)
    applySharedDefaults(offered)
    expect(localStorage.getItem(APP_LAYOUT_KEY)).toBe(existing)
    const listener = vi.fn()
    window.addEventListener(APP_LAYOUT_EVENT, listener)
    applySharedDefaults(offered, { applyLayout: true })
    expect(loadAppLayout()).toEqual(offered.layout)
    expect(listener).toHaveBeenCalledTimes(1)
    window.removeEventListener(APP_LAYOUT_EVENT, listener)
  })

  it('preserves disabled custom arrangements and empty lists', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: false, navigation: [], home: [], more: [], homeSections: { salahBrief: true } })
    const parsed = parseSharedDefaultsUrl(createSharedDefaultsUrl('https://athan.example', { includeLayout: true }))!
    expect(parsed.layout).toEqual(loadAppLayout())
    expect(parsed.layout?.enabled).toBe(false)
    expect(parsed.layout?.homeSections?.salahBrief).toBe(true)
  })

  it.each([undefined, null, [], { schemaVersion: 99 }, { ...defaultAppLayout(), navigation: 'Iqama' }, { ...defaultAppLayout(), homeSections: { salahBrief: 'true' } }, { ...defaultAppLayout(), homeSections: { salahBrief: true, salahBriefView: 'bad' } }])('omits malformed layout %j without resetting recipient layout', (layout) => {
    const existing = { ...defaultAppLayout(), enabled: true, navigation: ['Quran'] as const }
    localStorage.setItem(APP_LAYOUT_KEY, JSON.stringify(existing))
    const parsed = parseSharedDefaultsUrl(link({ ...createSharedDefaults(), version: 2, layout }))!
    expect(parsed).not.toBeNull()
    expect(parsed.layout).toBeUndefined()
    expect(parsed.layoutWarnings?.length).toBeGreaterThan(0)
    applySharedDefaults(parsed, { applyLayout: true })
    expect(JSON.parse(localStorage.getItem(APP_LAYOUT_KEY)!)).toEqual(existing)
  })

  it('normalizes unknown IDs, duplicate/forbidden placements and excess tabs with visible feedback', () => {
    const layout = { ...defaultAppLayout(), navigation: ['Home', 'Quran', 'Quran', 'UnknownFutureFeature', 'Iqama', 'Qibla', 'Credits', 'More'], home: ['Home', 'Iqama'], more: ['More', 'Quran'] }
    const parsed = parseSharedDefaultsUrl(link({ ...createSharedDefaults(), version: 2, layout }))!
    expect(parsed.layout?.navigation).toEqual(['Quran', 'Iqama', 'Qibla', 'Credits'])
    expect(parsed.layout?.home).toEqual(['Iqama'])
    expect(parsed.layout?.more).toEqual(['Quran'])
    expect(parsed.layoutWarnings?.join(' ')).toMatch(/unrecognized/)
    expect(parsed.layoutWarnings?.join(' ')).toMatch(/four extras/)
  })

  it('never changes a layout or personal records when applying an older link', () => {
    const offered = createSharedDefaults()
    const keys = [APP_LAYOUT_KEY, 'salahLogV1', 'salahSavedSearchesV1', 'athan.salah.reminder.v1', 'athan.performance.v1', 'athan.settings.sections.v1']
    keys.forEach((key) => localStorage.setItem(key, 'PRIVATE_RECIPIENT'))
    applySharedDefaults(offered, { applyLayout: true })
    keys.forEach((key) => expect(localStorage.getItem(key)).toBe('PRIVATE_RECIPIENT'))
  })

  it('reports a first-write failure without falsely claiming success', () => {
    const offered = createSharedDefaults()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    expect(() => applySharedDefaults(offered)).toThrow(/Nothing was changed/)
  })

  it('reports partial writes and preserves existing layout and records when layout storage fails', () => {
    const offered = createSharedDefaults({ includeLayout: true })
    localStorage.setItem(APP_LAYOUT_KEY, 'RECIPIENT_LAYOUT')
    localStorage.setItem('salahLogV1', 'PRIVATE_RECORDS')
    const write = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === APP_LAYOUT_KEY) throw new Error('quota')
      write.call(this, key, value)
    })
    expect(() => applySharedDefaults(offered, { applyLayout: true })).toThrow(/Some defaults were saved/)
    expect(localStorage.getItem(APP_LAYOUT_KEY)).toBe('RECIPIENT_LAYOUT')
    expect(localStorage.getItem('salahLogV1')).toBe('PRIVATE_RECORDS')
    expect(localStorage.getItem('method')).toBe(offered.prayer.method)
  })

  it('notifies the active UI when language was saved before a later write failed', () => {
    const offered = createSharedDefaults()
    offered.preferences.language = 'ar'
    const listener = vi.fn()
    window.addEventListener('athan-language-change', listener)
    const write = Storage.prototype.setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (this: Storage, key, value) {
      if (key === 'athan.preference.timeFormat.v1') throw new Error('quota')
      write.call(this, key, value)
    })
    expect(() => applySharedDefaults(offered)).toThrow(/Some defaults were saved/)
    expect(localStorage.getItem('athan.language.v1')).toBe('ar')
    expect(document.documentElement.dir).toBe('rtl')
    expect(listener).toHaveBeenCalledOnce()
    window.removeEventListener('athan-language-change', listener)
  })

  it('rejects oversized or unsupported ordinary payloads', () => {
    expect(parseSharedDefaultsUrl(link({ ...createSharedDefaults(), version: 3 }))).toBeNull()
    expect(parseSharedDefaultsUrl(link({ ...createSharedDefaults(), ignored: 'x'.repeat(12000) }))).toBeNull()
  })
})
