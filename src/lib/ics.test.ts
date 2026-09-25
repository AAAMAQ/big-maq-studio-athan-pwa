import { describe, expect, it } from 'vitest'
import { buildIcsCalendar } from './ics'

describe('buildIcsCalendar', () => {
  const generatedAt = new Date(Date.UTC(2026, 8, 25, 12, 0, 0))

  it('supports local floating and UTC times with multiple alarms including event time', () => {
    const local = new Date(2026, 8, 25, 20, 30, 0)
    const utc = new Date(Date.UTC(2026, 8, 25, 12, 30, 0))
    const ics = buildIcsCalendar([
      { title: 'Local', start: local, uid: 'local@test', alarms: [{ minutesBefore: 10 }, { minutesBefore: 0 }] },
      { title: 'UTC', start: utc, timeMode: 'utc', uid: 'utc@test', alarms: [{ minutesBefore: 5 }] }
    ], { generatedAt })

    expect(ics).toContain('DTSTART:20260925T203000\r\n')
    expect(ics).toContain('DTSTART:20260925T123000Z\r\n')
    expect(ics).toContain('TRIGGER:-PT10M')
    expect(ics).toContain('TRIGGER:PT0M')
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(3)
  })

  it('escapes text, folds UTF-8 lines, and resolves duplicate UIDs deterministically', () => {
    const start = new Date(2026, 8, 25, 20, 30, 0)
    const ics = buildIcsCalendar([
      { title: `Review, plan; ${'界'.repeat(40)}`, start, uid: 'same@test', description: 'one\\two\nthree' },
      { title: 'Second', start, uid: 'same@test' }
    ], { generatedAt })

    expect(ics).toContain('UID:same@test')
    expect(ics).toContain('UID:same-2@test')
    expect(ics).toContain('DESCRIPTION:one\\\\two\\nthree')
    expect(ics).toContain('SUMMARY:Review\\, plan\\;')
    for (const line of ics.split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })
})
