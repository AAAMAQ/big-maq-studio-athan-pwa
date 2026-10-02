import { describe, expect, it } from 'vitest'
import { generateEngineIcs, type EnginePrayerRow } from './engine'

const row: EnginePrayerRow = {
  date: '2026-10-02', displayDate: 'Fri, Oct 2, 2026',
  Fajr: '05:00', Sunrise: '06:00', Dhuhr: '12:00', Asr: '15:00', Maghrib: '18:00', Isha: '19:00'
}

const base = {
  location: { label: 'Chennai, India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  fromDate: row.date,
  toDate: row.date,
  method: 'MWL' as const,
  madhab: 'Shafi' as const,
  rows: [row],
  reminderMinutes: 10
}

describe('Deep Search calendar alerts', () => {
  it('keeps one event and one alert per included time when second reminder is disabled', () => {
    const ics = generateEngineIcs(base)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(6)
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(6)
    expect(ics).toContain('DTSTART:20261001T233000Z')
  })

  it('adds a second independent alarm without duplicating an event', () => {
    const ics = generateEngineIcs({ ...base, secondReminder: { enabled: true, minutesBefore: 15 } })
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(6)
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(12)
    expect(ics.match(/TRIGGER:-PT15M/g)).toHaveLength(6)
  })

  it('rejects identical active offsets', () => {
    expect(() => generateEngineIcs({ ...base, secondReminder: { enabled: true, minutesBefore: 10 } }))
      .toThrow(/different reminder times/i)
  })

  it('uses saved-profile instants directly rather than converting device-formatted preview text', () => {
    const savedRow: EnginePrayerRow = {
      ...row,
      Fajr: '08:29',
      instants: { Fajr: new Date('2026-10-02T12:29:00.000Z') }
    }
    const ics = generateEngineIcs({ ...base, rows: [savedRow], includePrayers: { Fajr: true } })
    expect(ics).toContain('DTSTART:20261002T122900Z')
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1)
  })
})
