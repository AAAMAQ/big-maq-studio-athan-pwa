import { describe, expect, it } from 'vitest'
import { buildSettingsRichCalendar, type SettingsRichOptions } from './settingsRichCalendar'

const start = new Date('2026-10-02T12:29:00.000Z')
const options: SettingsRichOptions = {
  source: {
    identity: 'chennai-standard',
    locationLabel: 'Chennai Standard, India',
    sourceLabel: 'Imported yearly timetable (chennai.csv)',
    timezone: 'Asia/Kolkata',
    latitude: 13.0827,
    longitude: 80.2707,
    settings: { method: 'Karachi', madhab: 'Hanafi', highLatRule: 'MiddleOfTheNight' }
  },
  days: [{
    dateKey: '2026-10-02',
    times: { fajr: start, sunrise: start, dhuhr: start, asr: start, maghrib: start, isha: start }
  }],
  label: '1-day',
  reminderMinutes: 20,
  secondReminder: { enabled: false, minutesBefore: 15 },
  fixedIshaEnabled: true,
  fixedIshaTime: '22:00',
  jumuah: { include: true, time: '09:30' },
  salahReview: { enabled: true, time: '20:30' }
}

describe('rich Settings calendar', () => {
  it('uses UTC prayer instants, source metadata, and single alerts for extras', () => {
    const ics = buildSettingsRichCalendar(options)
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(9)
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(9)
    expect(ics).toContain('DTSTART:20261002T122900Z')
    expect(ics).toContain('DTSTART:20261002T163000Z') // 22:00 Chennai fixed Isha
    expect(ics).toContain('DTSTART:20261002T040000Z') // Friday Jumu’ah
    expect(ics).toContain('DTSTART:20261002T150000Z') // Private tracker review
    expect(ics).toContain('Imported yearly timetable')
    expect(ics).toContain('Timezone: Asia/Kolkata')
    expect(ics).not.toMatch(/completed|missed|daily note/i)
  })

  it('adds the second alarm only to six daily events', () => {
    const ics = buildSettingsRichCalendar({ ...options, secondReminder: { enabled: true, minutesBefore: 15 } })
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(9)
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(15)
    expect(ics.match(/TRIGGER:-PT15M/g)).toHaveLength(6)
    expect(ics.match(/TRIGGER:PT0M/g)).toHaveLength(1)
  })

  it('rejects duplicate alert offsets', () => {
    expect(() => buildSettingsRichCalendar({ ...options, secondReminder: { enabled: true, minutesBefore: 20 } }))
      .toThrow(/different reminder times/i)
  })
})
