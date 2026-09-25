import { beforeEach, describe, expect, it } from 'vitest'
import { applySharedDefaults, createSharedDefaultsUrl, parseSharedDefaultsUrl } from './sharedDefaults'

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
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.calendar.fixedIsha.enabled.v1', 'false')
    localStorage.setItem('athan.iqama.jumuahReminder.v1', '{"include":true,"time":"09:30"}')
    localStorage.setItem('athan.ramadan.fasts.v1', '[{"private":true}]')
    localStorage.setItem('athan.quran.progress.v1', '{"lastReadAyah":7}')
    localStorage.setItem('athan.location.cache.v1', '{"latitude":1,"longitude":2}')

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
    expect(url).not.toContain('latitude')
    expect(JSON.stringify(parsed)).not.toContain('20:30')
    expect(JSON.stringify(parsed)).not.toContain('09:30')
    expect(Object.keys(parsed ?? {})).toEqual(['app', 'version', 'prayer', 'preferences', 'reminders'])
  })

  it('applies safe defaults without touching personal worship data', () => {
    localStorage.setItem('salahLogV1', '{"2026-08-05":{"Fajr":true}}')
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.ramadan.fasts.v1', '[{"date":"2026-03-01"}]')
    localStorage.setItem('athan.quran.progress.v1', '{"lastReadAyah":7}')

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
  })

  it('rejects malformed and unsupported links', () => {
    expect(parseSharedDefaultsUrl('https://athan.example/#share-defaults=not-valid')).toBeNull()
    expect(parseSharedDefaultsUrl('https://athan.example/')).toBeNull()
  })
})
