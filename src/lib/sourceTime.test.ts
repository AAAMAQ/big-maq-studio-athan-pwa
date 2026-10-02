import { describe, expect, it } from 'vitest'
import { addDateKeyDays, formatUtcOffset, sourceWeekday, zonedDateKey, zonedWallClockToInstant } from './sourceTime'
import { createSavedCity } from './savedCities'
import { prayerTimesForPrimarySourceDate, sourceDateKey, type PrimaryPrayerSource } from './primaryPrayerSource'

describe('source-local prayer dates and instants', () => {
  it('keeps the saved city on its own calendar date across a device date rollover', () => {
    const instant = new Date('2026-10-01T16:30:00Z')
    expect(zonedDateKey(instant, 'Asia/Kolkata')).toBe('2026-10-01')
    expect(zonedDateKey(instant, 'Asia/Shanghai')).toBe('2026-10-02')
    expect(sourceDateKey(citySource(), instant)).toBe('2026-10-01')
    expect(sourceWeekday('2026-10-02')).toBe(5)
    expect(addDateKeyDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('converts an imported Chennai wall-clock row to the correct instant', () => {
    const source = citySource()
    const times = prayerTimesForPrimarySourceDate(source, '2026-10-02', {
      requireTimezone: true, requireTimetableRow: true
    })
    expect(times.maghrib.toISOString()).toBe('2026-10-02T12:29:00.000Z')
    expect(formatUtcOffset(times.maghrib, 'Asia/Kolkata')).toBe('UTC+5:30')
    expect(zonedDateKey(times.maghrib, 'Asia/Kolkata')).toBe('2026-10-02')
  })

  it('uses the offset for each daylight-saving date and rejects ambiguous wall times', () => {
    expect(zonedWallClockToInstant('2026-03-07', '12:00', 'America/New_York').toISOString())
      .toBe('2026-03-07T17:00:00.000Z')
    expect(zonedWallClockToInstant('2026-03-08', '12:00', 'America/New_York').toISOString())
      .toBe('2026-03-08T16:00:00.000Z')
    expect(() => zonedWallClockToInstant('2026-03-08', '02:30', 'America/New_York')).toThrow('does not exist')
    expect(() => zonedWallClockToInstant('2026-11-01', '01:30', 'America/New_York')).toThrow('occurs twice')
  })

  it('does not silently use calculated times when an imported row is missing in a strict export', () => {
    expect(() => prayerTimesForPrimarySourceDate(citySource(), '2026-10-03', {
      requireTimezone: true, requireTimetableRow: true
    })).toThrow('no row')
  })
})

function citySource(): PrimaryPrayerSource {
  const city = createSavedCity({
    name: 'Chennai Standard', city: 'Chennai', country: 'India', countryCode: 'IN',
    latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata'
  })
  city.calculationMode = 'manual-timetable'
  city.manualTimetable = {
    formatVersion: 1, sourceFileName: 'chennai.csv', sourceSheetName: 'CSV',
    importedAt: '2026-01-01T00:00:00Z', rowCount: 1,
    rows: { '10-02': {
      fajr: '05:18', sunrise: '06:28', dhuhr: '12:30', asr: '15:48', maghrib: '17:59', isha: '19:39'
    } }
  }
  return {
    kind: 'saved-city', savedCity: city, locationLabel: 'Chennai Standard, India',
    sourceLabel: 'Imported timetable', settings: { method: 'Karachi', madhab: 'Shafi', highLatRule: 'MiddleOfTheNight' },
    timezone: 'Asia/Kolkata', latitude: city.latitude, longitude: city.longitude
  }
}
