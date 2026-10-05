import { describe, expect, it } from 'vitest'
import { calculateSalahPeriodInsights, calculateSalahRangeInsights, normalizeSalahLogStore, summarizeSalahDay, type SalahLogStore } from './salahInsights'

describe('normalizeSalahLogStore', () => {
  it('preserves completed, missed, Sunnah, daily notes, and legacy status values', () => {
    expect(normalizeSalahLogStore({
      '2026-9-2': { Fajr: true, Dhuhr: false, Asr: 'completed', Maghrib: 'missed', Isha: 1, Sunnah: true, Notes: 'A private reflection', junk: true },
      'not-a-date': { Fajr: true }
    })).toEqual({
      '2026-09-02': { Fajr: true, Dhuhr: false, Asr: true, Maghrib: false, Isha: true, Sunnah: true, Notes: 'A private reflection' }
    })
  })

  it('does not count a notes-only date as an obligatory logging day', () => {
    const result = calculateSalahPeriodInsights({
      '2026-09-25': { Notes: 'Notes without prayer statuses' }
    }, 'all', new Date(2026, 8, 25))

    expect(result.daysWithLogs).toBe(0)
    expect(result.prayers.Fajr.logged).toBe(0)
  })
})

describe('calculateSalahPeriodInsights', () => {
  it('uses explicit logs only for rates and treats missing days as streak breaks', () => {
    const store: SalahLogStore = {
      '2026-09-20': { Fajr: true, Dhuhr: false },
      '2026-09-21': { Fajr: true },
      '2026-09-23': { Fajr: true, Dhuhr: true },
      '2026-09-24': { Fajr: true, Dhuhr: false },
      '2026-09-25': { Fajr: true }
    }
    const result = calculateSalahPeriodInsights(store, 'week', new Date(2026, 8, 25))

    expect(result.daysWithLogs).toBe(5)
    expect(result.prayers.Fajr).toEqual({ completed: 5, logged: 5, rate: 100, currentStreak: 3, longestStreak: 3 })
    expect(result.prayers.Dhuhr).toEqual({ completed: 1, logged: 3, rate: 33, currentStreak: 0, longestStreak: 1 })
    expect(result.prayers.Asr.rate).toBeNull()
  })

  it('handles month and year boundaries without counting unknown days as missed', () => {
    const store: SalahLogStore = {
      '2025-12-31': { Isha: true },
      '2026-01-01': { Isha: true },
      '2026-01-02': { Isha: false },
      '2026-01-03': { Isha: true }
    }
    const result = calculateSalahPeriodInsights(store, 'last-30', new Date(2026, 0, 3))

    expect(result.prayers.Isha.completed).toBe(3)
    expect(result.prayers.Isha.logged).toBe(4)
    expect(result.prayers.Isha.rate).toBe(75)
    expect(result.prayers.Isha.currentStreak).toBe(1)
    expect(result.prayers.Isha.longestStreak).toBe(2)
  })

  it('reports fully logged days and compares the immediately preceding equal-length period', () => {
    const complete = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
    const store: SalahLogStore = {
      '2026-09-16': { Fajr: false },
      '2026-09-17': { Fajr: true },
      '2026-09-21': { Fajr: true },
      '2026-09-22': complete,
      '2026-09-23': { ...complete, Isha: false }
    }
    const result = calculateSalahPeriodInsights(store, 'week', new Date(2026, 8, 23))

    expect(result.allFive).toEqual({ completedDays: 1, fullyLoggedDays: 2 })
    expect(result.mostImproved).toMatchObject({ prayer: 'Fajr', rateChange: 50, currentLogged: 3, previousLogged: 2 })
  })
})

describe('selected ranges', () => {
  const store: SalahLogStore = {
    '2025-12-31': { Fajr: true },
    '2026-01-01': { Fajr: false, Isha: true },
    '2026-01-02': { Fajr: true, Isha: true },
    '2026-02-01': { Fajr: true }
  }

  it('selects a calendar month through its last applicable day', () => {
    const result = calculateSalahRangeInsights(store, { kind: 'month', month: '2026-01' }, new Date(2026, 1, 2))
    expect(result.dayCount).toBe(31)
    expect(result.daysWithLogs).toBe(2)
    expect(result.prayers.Fajr).toMatchObject({ completed: 1, logged: 2, rate: 50, currentStreak: 0 })
  })

  it('uses inclusive custom dates across a year boundary', () => {
    const result = calculateSalahRangeInsights(store, { kind: 'custom', from: '2025-12-31', to: '2026-01-02' }, new Date(2026, 0, 2))
    expect(result.dayCount).toBe(3)
    expect(result.prayers.Fajr).toMatchObject({ completed: 2, logged: 3, rate: 67, currentStreak: 1, longestStreak: 1 })
    expect(result.prayers.Isha.logged).toBe(2)
  })

  it('caps an active custom range at today without counting future days', () => {
    const result = calculateSalahRangeInsights(store, { kind: 'custom', from: '2026-01-01', to: '2026-02-01' }, new Date(2026, 0, 2))
    expect(result.dayCount).toBe(2)
    expect(result.prayers.Fajr.logged).toBe(2)
  })
})

describe('fixed-capacity stars', () => {
  it('has no all-recorded average before the first obligatory record', () => {
    expect(calculateSalahPeriodInsights({ '2026-10-01': { Notes: 'Note' }, '2027-01-01': { Fajr: true } }, 'all', new Date(2026, 9, 5)).stars).toEqual({ total: 0, possible: 0, elapsedDays: 0, averagePerDay: null })
  })
  it('does not show a five-slot star trend before any recorded time exists', () => {
    const result = calculateSalahPeriodInsights({}, 'all', new Date(2026, 9, 5))
    expect(result.trend.reduce((total, point) => total + point.possibleStars, 0)).toBe(result.stars.possible)
  })
  it('uses elapsed Sunday-start week days, never future slots', () => {
    const result = calculateSalahPeriodInsights({ '2026-10-04': { Fajr: true }, '2026-10-05': { Fajr: true }, '2026-10-06': { Fajr: true } }, 'week', new Date(2026, 9, 5))
    expect(result.stars).toEqual({ total: 2, possible: 10, averagePerDay: 1, elapsedDays: 2 })
  })
  it('includes the leap-day slot and calendar days through DST changes', () => {
    const leap = calculateSalahRangeInsights({ '2024-02-29': { Fajr: true } }, { kind: 'custom', from: '2024-02-28', to: '2024-03-01' }, new Date(2024, 2, 1))
    expect(leap.stars).toEqual({ total: 1, possible: 15, averagePerDay: 1 / 3, elapsedDays: 3 })
    const dst = calculateSalahRangeInsights({}, { kind: 'custom', from: '2026-03-07', to: '2026-03-10' }, new Date(2026, 2, 10))
    expect(dst.stars).toEqual({ total: 0, possible: 20, averagePerDay: 0, elapsedDays: 4 })
  })
  it('derives all six daily values without changing unknown or Sunnah statuses', () => {
    const keys = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    for (let stars = 0; stars <= 5; stars += 1) {
      const log = Object.fromEntries(keys.slice(0, stars).map((key) => [key, true]))
      expect(summarizeSalahDay({ ...log, Sunnah: true })).toMatchObject({ stars, possibleStars: 5, notLogged: 5 - stars })
    }
    expect(summarizeSalahDay({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: false })).toEqual({ completed: 3, missed: 1, logged: 4, notLogged: 1, stars: 3, possibleStars: 5 })
  })
  it('counts blank past days in capacity and average while keeping logged rates', () => {
    const result = calculateSalahRangeInsights({
      '2026-10-01': { Fajr: true, Dhuhr: true, Asr: true, Maghrib: false },
      '2026-10-03': { Fajr: true },
      '2026-10-04': { Fajr: true }
    }, { kind: 'custom', from: '2026-10-01', to: '2026-10-04' }, new Date(2026, 9, 3))
    expect(result.stars).toEqual({ total: 4, possible: 15, averagePerDay: 4 / 3, elapsedDays: 3 })
    expect(result.prayers.Maghrib).toMatchObject({ completed: 0, logged: 1, rate: 0 })
    expect(result.trend[0]).toMatchObject({ stars: 4, possibleStars: 15, elapsedDays: 3 })
  })
})
