import { describe, expect, it } from 'vitest'
import { calculateSalahRangeInsights, deriveSalahStreakRuns, indexSalahStreakRuns, type SalahLogStore } from './salahInsights'
import { explainSalahSearch, parseSalahSearch, searchSalahDays, searchSalahDaysWithStreaks } from './salahSearch'
import { deriveScopedSalahStreakRuns, findSalahStreakRun } from './salahStreaks'
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

describe('scoped prayer streaks', () => {
  const today = new Date(2026, 9, 20)
  const store: SalahLogStore = {
    '2026-10-01': { Fajr: true, Dhuhr: true },
    '2026-10-02': { Fajr: true, Dhuhr: true },
    '2026-10-03': { Fajr: true, Dhuhr: false },
    '2026-10-04': { Fajr: false, Dhuhr: true },
    '2026-10-05': { Fajr: true, Dhuhr: true, Notes: 'Reflection' },
    '2026-10-06': { Fajr: true, Dhuhr: true },
    '2026-10-07': { Fajr: true, Dhuhr: true },
    '2026-10-08': { Fajr: true },
    '2026-10-10': { Fajr: true, Dhuhr: true },
    '2026-10-11': { Fajr: true, Dhuhr: true, Asr: false, Sunnah: true }
  }
  it('uses prayer names, numbers and existing spelling aliases interchangeably', () => {
    expect(parseSalahSearch('Streak(Fajr):MAX')).toEqual(parseSalahSearch('streak(1):max'))
    expect(parseSalahSearch('streak(duhur&Magrib):5+')).toEqual(parseSalahSearch('streak(2&4):5+'))
    expect(searchSalahDays(store, 'streak(1):max', undefined, today)).toEqual(['2026-10-08', '2026-10-07', '2026-10-06', '2026-10-05'])
    expect(explainSalahSearch('streak(1&2):5')).toContain('Fajr and Dhuhr together')
    expect(explainSalahSearch('streak(1,2):max')).toContain('independent streaks')
  })
  it('reports independent longest runs rather than requiring all selected prayers together', () => {
    const result = searchSalahDaysWithStreaks(store, 'streak(1,2):max', undefined, today)
    expect(result.dates).toEqual(['2026-10-08', '2026-10-07', '2026-10-06', '2026-10-05', '2026-10-04'])
    expect(result.streaks).toEqual([
      { key: 'Fajr', label: 'Fajr', prayers: ['Fajr'], runs: [{ start: '2026-10-05', end: '2026-10-08', length: 4 }] },
      { key: 'Dhuhr', label: 'Dhuhr', prayers: ['Dhuhr'], runs: [{ start: '2026-10-04', end: '2026-10-07', length: 4 }] }
    ])
    const together = searchSalahDaysWithStreaks(store, 'streak(1&2):max', undefined, today)
    expect(together.dates).toEqual(['2026-10-07', '2026-10-06', '2026-10-05'])
    expect(together.streaks[0]).toMatchObject({ label: 'Fajr + Dhuhr together', runs: [{ start: '2026-10-05', end: '2026-10-07', length: 3 }] })
  })
  it('matches exact maximal lengths, not shorter windows, and keeps all maximum ties', () => {
    expect(searchSalahDays(store, 'streak(1&2):2', undefined, today)).toEqual(['2026-10-11', '2026-10-10', '2026-10-02', '2026-10-01'])
    expect(searchSalahDays(store, 'streak(1&2):2+', undefined, today)).toHaveLength(7)
    const tied = { ...store, '2026-10-12': { Fajr: true, Dhuhr: true } }
    expect(searchSalahDaysWithStreaks(tied, 'streak(2&1):max', undefined, today).streaks[0].runs).toHaveLength(2)
    expect(searchSalahDays(complete('2026-10-01', 6), 'streak(1&2):5', undefined, today)).toEqual([])
    expect(searchSalahDays(complete('2026-10-01', 6), 'streak(1&2):5+', undefined, today)).toHaveLength(6)
  })
  it('selected missed, absent and unlogged entries break while unrelated statuses never do', () => {
    expect(deriveScopedSalahStreakRuns(store, ['Fajr'], today).map((run) => run.length)).toEqual([3, 4, 2])
    expect(deriveScopedSalahStreakRuns(store, ['Dhuhr'], today).map((run) => run.length)).toEqual([2, 4, 2])
    expect(deriveScopedSalahStreakRuns(store, ['Asr'], today)).toEqual([])
    expect(deriveScopedSalahStreakRuns(store, [], today)).toEqual([])
    expect(searchSalahDays(store, 'streak:max', undefined, today)).toEqual([])
    expect(searchSalahDays(store, 'streak(1&2):2&!asr', undefined, today)).toEqual(['2026-10-11'])
    expect(store['2026-10-08'].Dhuhr).toBeUndefined()
  })
  it('finds sorted run membership efficiently and does not fill gaps', () => {
    const runs = deriveScopedSalahStreakRuns(store, ['Fajr'], today)
    expect(findSalahStreakRun(runs, '2026-10-08')).toEqual({ start: '2026-10-05', end: '2026-10-08', length: 4 })
    for (const date of ['2026-09-30', '2026-10-04', '2026-10-09', '2026-10-12']) expect(findSalahStreakRun(runs, date)).toBeUndefined()
    expect(findSalahStreakRun([], '2026-10-01')).toBeUndefined()
  })
  it('preserves full run length and rankings across filters and fixed ranges', () => {
    const filtered = searchSalahDaysWithStreaks(store, '(streak(1,2):max)&(notes)&Oct.5', undefined, today)
    expect(filtered.dates).toEqual(['2026-10-05'])
    expect(filtered.streaks.map((scope) => scope.runs[0].length)).toEqual([4, 4])
    expect(searchSalahDays(store, 'streak(1&2):max&notes&mon', undefined, today)).toEqual(['2026-10-05'])
    expect(searchSalahDays(store, 'streak(1):max&Oct.10', undefined, today)).toEqual([])
    const bounded = searchSalahDaysWithStreaks(store, 'streak(1&2):max', { from: '2026-10-10', to: '2026-10-10' }, today)
    expect(bounded.dates).toEqual(['2026-10-10'])
    expect(bounded.streaks[0].runs).toEqual([{ start: '2026-10-10', end: '2026-10-11', length: 2 }])
  })
  it('keeps outer AND/OR grouping and multiple streak terms separate', () => {
    expect(searchSalahDays(store, 'streak(1):max&streak(2):max', undefined, today)).toEqual(['2026-10-07', '2026-10-06', '2026-10-05'])
    expect(searchSalahDays(store, '(streak(1&2):2),notes', undefined, today)).toHaveLength(5)
    expect(searchSalahDays(store, 'streak(1&2,3):max', undefined, today)).toEqual(searchSalahDays(store, 'streak(1&2):max', undefined, today))
    const multi = searchSalahDaysWithStreaks(store, 'streak(1):2,streak(fajr):max', undefined, today)
    expect(multi.streaks).toHaveLength(1)
    expect(multi.streaks[0].runs.map((run) => run.length)).toEqual([4, 2])
  })
  it('crosses year, leap and DST dates and excludes future days without filling sparse gaps', () => {
    for (const start of ['2024-02-28', '2025-12-30', '2026-03-07', '2026-10-31']) {
      const records = complete(start, 4)
      for (const log of Object.values(records)) { delete log.Asr; log.Isha = false }
      expect(deriveScopedSalahStreakRuns(records, ['Fajr', 'Dhuhr'], new Date(2027, 0, 1))).toEqual([{ start, end: Object.keys(records).at(-1), length: 4 }])
    }
    expect(deriveScopedSalahStreakRuns(complete('2026-10-19', 4), ['Fajr'], today)[0].length).toBe(2)
    expect(deriveScopedSalahStreakRuns({ '1900-01-01': { Fajr: true }, '2099-01-01': { Fajr: true } }, ['Fajr'], new Date(2100, 0, 1))).toHaveLength(2)
  })
  it('rejects malformed or duplicate scoped operands without changing legacy grammar', () => {
    for (const query of ['streak():max', 'streak(1,):max', 'streak(1&):max', 'streak(6):max', 'streak(!1):max', 'streak(1|2):max', 'streak(1;2):max', 'streak(1&fajr):max', 'streak(1,1):max', 'streak(1)max', 'streak(1):0', 'streak(1):max+', 'streak((1)):max']) expect(() => parseSalahSearch(query), query).toThrow()
    expect(searchSalahDays(store, 'streak(1):999999', undefined, today)).toEqual([])
    expect(searchSalahDaysWithStreaks({}, 'streak(1,2):max', undefined, today).streaks.map((scope) => scope.runs)).toEqual([[], []])
    expect(searchSalahDays(store, 'streak(1&2&3&4&5):max', undefined, today)).toEqual(searchSalahDays(store, 'streak:max', undefined, today))
  })
  it('saved scoped queries retain syntax and recompute lengths against restored/new records', () => {
    const query = 'streak(1,2):max'
    const saved = normalizeSavedSalahSearches({ schemaVersion: 1, searches: [{ id: 'scoped', name: 'My prayers', query, scope: { kind: 'recorded' } }] })
    expect(saved.searches[0].query).toBe(query)
    expect(searchSalahDays(store, saved.searches[0].query, undefined, today)).toHaveLength(5)
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
