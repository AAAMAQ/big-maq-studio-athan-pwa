import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadSavedSalahSearches, normalizeRecentSalahSearches, normalizeSavedSalahSearches, normalizeSalahSearchScope, saveSavedSalahSearches } from './salahSavedSearches'
import { formatSalahDate } from './salahInsights'
import { searchSalahDays } from './salahSearch'

const example = { id: 'one', name: 'Monday', query: '(mon)&((logged5),(notes))', scope: { kind: 'recorded' } }
afterEach(() => { localStorage.clear(); vi.restoreAllMocks() })
describe('private query definitions', () => {
  it('preserves the existing inclusive blank-date limit in both search and saved scopes', () => {
    const start = new Date(2000, 0, 1)
    const end = new Date(2000, 0, 1)
    end.setDate(end.getDate() + 3660)
    const range = { from: formatSalahDate(start), to: formatSalahDate(end) }
    expect(searchSalahDays({}, 'star0', range, end)).toHaveLength(3661)
    expect(normalizeSalahSearchScope({ kind: 'absolute', ...range, includeBlankDates: true })).not.toBeNull()
    end.setDate(end.getDate() + 1)
    const tooLong = { from: range.from, to: formatSalahDate(end) }
    expect(() => searchSalahDays({}, 'star0', tooLong, end)).toThrow()
    expect(normalizeSalahSearchScope({ kind: 'absolute', ...tooLong, includeBlankDates: true })).toBeNull()
  })
  it('normalizes known schema, bounds names/records, and deduplicates IDs', () => {
    expect(normalizeSavedSalahSearches({ schemaVersion: 1, searches: [example, example, { ...example, id: 'two', query: 'invalid' }, { ...example, id: 'three', name: '   ' }] }).searches).toEqual([example])
    expect(normalizeSavedSalahSearches({ schemaVersion: 2, searches: [example] }).searches).toEqual([])
    expect(normalizeSavedSalahSearches({ schemaVersion: 1, searches: Array.from({ length: 40 }, (_, id) => ({ ...example, id: String(id) })) }).searches).toHaveLength(30)
  })
  it('persists queries rather than result records and round trips fixed/rolling scopes', () => {
    const searches = normalizeSavedSalahSearches({ schemaVersion: 1, searches: [example, { ...example, id: 'rolling', query: '(last30days)&fajr' }, { ...example, id: 'fixed', scope: { kind: 'absolute', from: '2026-06-01', to: '2026-06-30', includeBlankDates: true } }] })
    expect(saveSavedSalahSearches(searches)).toBe(true)
    expect(loadSavedSalahSearches()).toEqual(searches)
    expect(JSON.stringify(searches)).not.toContain('Notes')
    expect(normalizeSalahSearchScope({ kind: 'absolute', from: '2026-06-30', to: '2026-06-01', includeBlankDates: true })).toBeNull()
    expect(normalizeSalahSearchScope({ kind: 'absolute', from: '2000-01-01', to: '2026-06-01', includeBlankDates: true })).toBeNull()
  })
  it('keeps a bounded, deduplicated valid recent list', () => {
    expect(normalizeRecentSalahSearches({ schemaVersion: 1, queries: ['fajr', 'fajr', 'invalid', 'notes', '1', '2', '3', '4', '5', 'star0', 'logged0'] }).queries).toEqual(['fajr', 'notes', '1', '2', '3', '4', '5', 'star0'])
  })
  it('returns honest failures for denied storage without losing a previous definition', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('denied') })
    expect(saveSavedSalahSearches({ schemaVersion: 1, searches: [] })).toBe(false)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(loadSavedSalahSearches()).toEqual({ schemaVersion: 1, searches: [] })
  })
})
