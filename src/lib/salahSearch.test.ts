import { describe, expect, it } from 'vitest'
import { explainSalahSearch, matchesSalahSearch, parseSalahSearch, searchSalahDays } from './salahSearch'
import type { SalahLogStore } from './salahInsights'

const store: SalahLogStore = {
  '2026-09-01': { Fajr: true, Dhuhr: true, Asr: false },
  '2026-09-02': { Fajr: true, Dhuhr: false, Isha: false },
  '2026-09-03': { Fajr: false, Dhuhr: false, Asr: true },
  '2026-09-04': { Notes: 'Private note' }
}
const today = new Date(2026, 8, 5)

describe('Salah search grammar', () => {
  it('accepts prayer names and numeric aliases', () => {
    expect(searchSalahDays(store, 'fajr', undefined, today)).toEqual(searchSalahDays(store, '1', undefined, today))
    expect(searchSalahDays(store, 'dhuhr', undefined, today)).toEqual(searchSalahDays(store, '2', undefined, today))
    expect(searchSalahDays(store, 'asr', undefined, today)).toEqual(searchSalahDays(store, '3', undefined, today))
    expect(searchSalahDays(store, 'maghrib', undefined, today)).toEqual(searchSalahDays(store, '4', undefined, today))
    expect(searchSalahDays(store, 'isha', undefined, today)).toEqual(searchSalahDays(store, '5', undefined, today))
  })

  it('distinguishes missed, not logged, and either not completed', () => {
    expect(searchSalahDays(store, '!1', undefined, today)).toEqual(['2026-09-03'])
    expect(searchSalahDays(store, '~1', undefined, today)).toEqual(['2026-09-04'])
    expect(searchSalahDays(store, '/1', undefined, today)).toEqual(['2026-09-04', '2026-09-03'])
  })

  it('uses AND before OR and supports nested parentheses', () => {
    expect(searchSalahDays(store, '1&2,3', undefined, today)).toEqual(['2026-09-03', '2026-09-01'])
    expect(searchSalahDays(store, '1&(!2,!3)', undefined, today)).toEqual(['2026-09-02', '2026-09-01'])
    expect(searchSalahDays(store, '1&((!2;!3))', undefined, today)).toEqual(['2026-09-02', '2026-09-01'])
    expect(explainSalahSearch('1&(!2,!3)')).toBe('Fajr completed and (Dhuhr missed or Asr missed)')
  })

  it('makes brackets an exact set of completed prayers', () => {
    expect(searchSalahDays(store, '[1&2]', undefined, today)).toEqual(['2026-09-01'])
    expect(searchSalahDays(store, '[1]', undefined, today)).toEqual(['2026-09-02'])
    expect(searchSalahDays(store, '1&2', undefined, today)).toEqual(['2026-09-01'])
    expect(matchesSalahSearch(parseSalahSearch('[1&2]'), { Fajr: true, Dhuhr: true, Asr: false })).toBe(true)
    expect(matchesSalahSearch(parseSalahSearch('[1&2]'), { Fajr: true, Dhuhr: true, Asr: true })).toBe(false)
  })

  it('includes blank dates only for an explicit date range', () => {
    expect(searchSalahDays(store, '~1', { from: '2026-09-04', to: '2026-09-05' }, today)).toEqual(['2026-09-05', '2026-09-04'])
    expect(searchSalahDays(store, '~1', undefined, today)).toEqual(['2026-09-04'])
  })

  it('reports malformed expressions rather than silently returning no matches', () => {
    for (const query of ['1&', '1&(!2', '[1,2]', '[1&1]', '6', '!']) {
      expect(() => parseSalahSearch(query)).toThrow()
    }
  })
})

describe('Salah date searches', () => {
  const dateStore: SalahLogStore = {
    '2000-06-23': { Fajr: true },
    '2024-02-29': { Fajr: true },
    '2024-10-30': { Fajr: true },
    '2025-10-30': { Fajr: false },
    '2026-05-27': { Dhuhr: true },
    '2026-06-22': { Fajr: true, Dhuhr: true },
    '2026-06-23': { Fajr: true, Dhuhr: false },
    '2026-06-24': { Notes: 'Private note' },
    '2026-10-30': { Fajr: true },
    '2027-06-23': { Fajr: true }
  }
  const afterRecords = new Date(2028, 0, 1)
  const search = (query: string) => searchSalahDays(dateStore, query, undefined, afterRecords)

  it('matches dotted year/month/day parts in every order', () => {
    for (const query of ['2026y.6m.23d', '6m.2026y.23d', '23d.6m.26y', '23d.26y.6m', '26y.23d.6m', '6m.23d.26y']) {
      expect(search(query)).toEqual(['2026-06-23'])
    }
    expect(search('27d.5m.26y')).toEqual(['2026-05-27'])
  })

  it('accepts full and abbreviated English month names without case sensitivity', () => {
    for (const month of ['June', 'Jun', '6m', 'JUNE', 'jUn']) {
      expect(search(`${month}.23d.26y`)).toEqual(['2026-06-23'])
    }
    for (const month of ['January', 'Jan', 'February', 'Feb', 'March', 'Mar', 'April', 'Apr', 'May', 'July', 'Jul', 'August', 'Aug', 'September', 'Sep', 'Sept', 'October', 'Oct', 'November', 'Nov', 'December', 'Dec']) {
      expect(() => parseSalahSearch(month)).not.toThrow()
    }
  })

  it('finds recurring month/day dates across years', () => {
    expect(search('Oct.30')).toEqual(['2026-10-30', '2025-10-30', '2024-10-30'])
    expect(search('30.Oct')).toEqual(search('Oct.30'))
    expect(search('Oct.30d')).toEqual(search('Oct.30'))
  })

  it('infers a single missing date label from the other two identified parts in any order', () => {
    const october: SalahLogStore = { '2026-10-23': { Fajr: true }, '2023-10-01': { Fajr: false }, '2026-01-23': { Fajr: true } }
    for (const query of ['10m.23d.26', '26.23d.10m', '23d.2026.10m', '10.23d.2026y', '23d.26y.10', '26y.10m.23', '23.October.2026y', 'Oct.23d.26', '23d.2026y.Oct']) {
      expect(searchSalahDays(october, query, undefined, afterRecords), query).toEqual(['2026-10-23'])
    }
    expect(searchSalahDays(october, '23d.2026y.1m', undefined, afterRecords)).toEqual(['2026-01-23'])
    for (const month of ['Oct', 'October', '10m']) {
      expect(searchSalahDays(october, `${month}.23`, undefined, afterRecords)).toEqual(['2026-10-23'])
    }
    for (const query of ['10.23.26', 'Oct.23.26', '23d.26', '2026y.10', '10m.23d.202', '13.23d.26y']) {
      expect(() => parseSalahSearch(query), query).toThrow()
    }
  })

  it('supports month-only, year-only, month/year, and day-only filters', () => {
    expect(search('5m')).toEqual(['2026-05-27'])
    expect(search('5m.26y')).toEqual(['2026-05-27'])
    expect(search('2026y')).toEqual(['2026-10-30', '2026-06-24', '2026-06-23', '2026-06-22', '2026-05-27'])
    expect(search('23d')).toEqual(['2027-06-23', '2026-06-23', '2000-06-23'])
    expect(search('26y.23d')).toEqual(['2026-06-23'])
    expect(search('00y')).toEqual(['2000-06-23'])
    expect(search('26y')).toEqual(search('2026y'))
  })

  it('combines dates with existing prayer operators and exact sets', () => {
    expect(search('(23d.06m.2026y)&fajr')).toEqual(['2026-06-23'])
    expect(search('(6m.23d.26)&!2')).toEqual(['2026-06-23'])
    expect(search('(2026y.6.23d)&[1]')).toEqual(['2026-06-23'])
    expect(search('June.26y&fajr')).toEqual(['2026-06-23', '2026-06-22'])
    expect(search('June.26y&!2')).toEqual(['2026-06-23'])
    expect(search('June.26y&~1')).toEqual(['2026-06-24'])
    expect(search('June.26y&/1')).toEqual(['2026-06-24'])
    expect(search('June.26y&[1&2]')).toEqual(['2026-06-22'])
    expect(search('2026y&(5m,6m)&1')).toEqual(['2026-06-23', '2026-06-22'])
    expect(explainSalahSearch('Jun.23.26y&1')).toBe('dates on June 23 in 2026 and Fajr completed')
  })

  it('handles leap days and reports impossible or repeated date parts', () => {
    expect(search('Feb.29')).toEqual(['2024-02-29'])
    expect(search('Feb.29.24y')).toEqual(['2024-02-29'])
    for (const query of ['Feb.30', 'Apr.31', 'Feb.29.26y', 'Feb.29.2100y', '13m', '0m', '32d', '0d', '0000y', 'June.6m', '26y.2026y', '23d.24d', 'Oct.', '.Oct', 'Oct..30', 'June.fajr', '!Oct', '[June]', '202y', 'constructor', 'constructor.30']) {
      expect(() => parseSalahSearch(query), query).toThrow()
    }
    expect(() => parseSalahSearch('Feb.29.2000y')).not.toThrow()
  })

  it('intersects explicit ranges without treating empty days as missed', () => {
    const range = { from: '2026-06-23', to: '2026-06-25' }
    expect(searchSalahDays(dateStore, 'Jun.26y', range, afterRecords)).toEqual(['2026-06-25', '2026-06-24', '2026-06-23'])
    expect(searchSalahDays(dateStore, 'Jun.26y&~1', range, afterRecords)).toEqual(['2026-06-25', '2026-06-24'])
    expect(searchSalahDays(dateStore, 'Jun.26y&!1', range, afterRecords)).toEqual([])
  })

  it('continues excluding future records even for explicit date searches', () => {
    expect(searchSalahDays(dateStore, 'Oct.30', undefined, new Date(2026, 9, 4))).toEqual(['2025-10-30', '2024-10-30'])
  })
})
