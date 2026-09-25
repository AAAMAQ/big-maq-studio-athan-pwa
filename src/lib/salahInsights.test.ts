import { describe, expect, it } from 'vitest'
import { calculateSalahPeriodInsights, normalizeSalahLogStore, type SalahLogStore } from './salahInsights'

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
