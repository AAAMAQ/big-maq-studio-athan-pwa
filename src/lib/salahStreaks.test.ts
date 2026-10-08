import { describe, expect, it } from 'vitest'
import { calculateSalahRangeInsights, deriveSalahStreakRuns, indexSalahStreakRuns, type SalahLogStore } from './salahInsights'
import { explainSalahSearch, parseSalahSearch, searchSalahDays } from './salahSearch'
import { normalizeSavedSalahSearches } from './salahSavedSearches'

const full = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }
function complete(from: string, days: number): SalahLogStore {
  const store: SalahLogStore = {}
  const cursor = new Date(`${from}T12:00:00`)
  for (let i = 0; i < days; i += 1) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`
    store[key] = { ...full }
    cursor.setDate(cursor.getDate() + 1)
  }
  return store
}

describe('verified all-five maximal runs', () => {
  it('crosses leap, year and DST calendar boundaries', () => {
    for (const start of ['2024-02-28', '2025-12-30', '2026-03-07', '2026-10-31']) {
      const store = complete(start, 4)
      const runs = deriveSalahStreakRuns(store, new Date(2027, 0, 1))
      expect(runs).toEqual([{ start, end: Object.keys(store).at(-1), length: 4 }])
      expect(indexSalahStreakRuns(runs).size).toBe(4)
    }
  })
  it('breaks on missed, unlogged and absent days, ignores Sunnah and future days', () => {
    const store = complete('2026-10-01', 10)
    store['2026-10-03'] = { ...full, Isha: false, Sunnah: true }
    store['2026-10-05'] = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Sunnah: true }
    delete store['2026-10-07']
    expect(deriveSalahStreakRuns(store, new Date(2026, 9, 9)).map((run) => run.length)).toEqual([2, 1, 1, 2])
    expect(store['2026-10-05'].Isha).toBeUndefined()
  })
  it('handles sparse years without generating missing-day records', () => {
    expect(deriveSalahStreakRuns({ '1900-01-01': full, '2099-01-01': full }, new Date(2100, 0, 1))).toHaveLength(2)
  })
  it('clips month analytics, preserves ties and latest-day current verification', () => {
    const store = { ...complete('2026-09-29', 7), ...complete('2026-10-10', 5) }
    const result = calculateSalahRangeInsights(store, { kind: 'month', month: '2026-10' }, new Date(2026, 9, 14))
    expect(result.fullDayStreaks.longestLength).toBe(5)
    expect(result.fullDayStreaks.longest).toEqual([
      { start: '2026-10-01', end: '2026-10-05', length: 5, continuesBefore: true, continuesAfter: false },
      { start: '2026-10-10', end: '2026-10-14', length: 5, continuesBefore: false, continuesAfter: false }
    ])
    expect(result.fullDayStreaks.current?.length).toBe(5)
    expect(calculateSalahRangeInsights(store, { kind: 'month', month: '2026-10' }, new Date(2026, 9, 15)).fullDayStreaks.current).toBeNull()
    const clipped = calculateSalahRangeInsights(store, { kind: 'custom', from: '2026-10-02', to: '2026-10-03' }, new Date(2026, 9, 15))
    expect(clipped.fullDayStreaks.longest[0]).toMatchObject({ length: 2, continuesBefore: true, continuesAfter: true })
  })
})

describe('streak query integration', () => {
  const today = new Date(2026, 9, 20)
  const store = { ...complete('2026-09-29', 7), ...complete('2026-10-10', 5), ...complete('2026-10-16', 4) }
  it('exact length never matches windows inside longer runs', () => {
    expect(searchSalahDays(store, '(Streak:5)', undefined, today)).toHaveLength(5)
    expect(searchSalahDays(store, 'streak:5+', undefined, today)).toHaveLength(12)
    expect(searchSalahDays(store, 'streak:4', undefined, today)).toHaveLength(4)
    expect(searchSalahDays(complete('2026-10-01', 10), 'streak:5', undefined, today)).toEqual([])
    expect(searchSalahDays(complete('2026-10-01', 10), 'streak:10', undefined, today)).toHaveLength(10)
  })
  it('date/notes/weekday filters do not shorten or rerank runs', () => {
    const noted = { ...store, '2026-10-12': { ...full, Notes: 'A note' } }
    expect(searchSalahDays(noted, '(streak:5)&Oct.26y', undefined, today)).toHaveLength(5)
    expect(searchSalahDays(noted, '(streak:7)&Oct.26y', undefined, today)).toHaveLength(5)
    expect(searchSalahDays(noted, 'streak:max&notes', undefined, today)).toEqual([])
    expect(searchSalahDays(noted, 'streak:5&notes&mon', undefined, today)).toEqual(['2026-10-12'])
    expect(searchSalahDays(noted, 'streak:5&[1&2&3&4&5]', undefined, today)).toHaveLength(5)
    expect(searchSalahDays(noted, 'streak:max,notes', undefined, today)).toHaveLength(8)
  })
  it('max ranks complete intersecting runs, includes all ties, returns in-scope dates only', () => {
    const tied = { ...store, ...complete('2026-09-10', 7) }
    expect(searchSalahDays(tied, 'streak:max', undefined, today)).toHaveLength(14)
    expect(searchSalahDays(tied, 'streak:max', { from: '2026-10-01', to: '2026-10-14' }, today)).toHaveLength(5)
    expect(searchSalahDays(tied, 'streak:max', { from: '2026-10-10', to: '2026-10-20' }, today)).toHaveLength(5)
    expect(searchSalahDays({}, 'streak:max', { from: '2026-10-01', to: '2026-10-20' }, today)).toEqual([])
  })
  it('rejects malformed lengths, accepts safe large thresholds, explains the semantics', () => {
    for (const query of ['streak:0', 'streak:-1', 'streak:1.5', 'streak:forever', 'streak:max+', 'streak:9007199254740992', '[streak:5]']) expect(() => parseSalahSearch(query)).toThrow()
    expect(searchSalahDays(store, 'streak:999999', undefined, today)).toEqual([])
    expect(explainSalahSearch('streak:5')).toContain('exactly 5')
    expect(explainSalahSearch('streak:5+')).toContain('at least 5')
  })
  it('saved definitions recompute max against current records', () => {
    const saved = normalizeSavedSalahSearches({ schemaVersion: 1, searches: [{ id: 'run', name: 'Longest', query: 'streak:max', scope: { kind: 'recorded' } }] })
    expect(saved.searches).toHaveLength(1)
    expect(searchSalahDays(store, saved.searches[0].query, undefined, today)).toHaveLength(7)
    expect(searchSalahDays({ ...store, ...complete('2026-10-10', 11) }, saved.searches[0].query, undefined, today)).toHaveLength(11)
  })
})
