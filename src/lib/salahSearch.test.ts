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
