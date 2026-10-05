import { formatSalahDate, parseSalahDate } from './salahInsights'
import { MAX_SALAH_QUERY_LENGTH, MAX_SALAH_SEARCH_RANGE_DAYS, parseSalahSearch } from './salahSearch'

export const SALAH_SAVED_SEARCHES_STORAGE_KEY = 'salahSavedSearchesV1'
export const SALAH_RECENT_SEARCHES_STORAGE_KEY = 'salahRecentSearchesV1'
export const SALAH_SEARCHES_CHANGE_EVENT = 'athan-salah-searches-change'
export const MAX_SAVED_SALAH_SEARCHES = 30
export const MAX_RECENT_SALAH_SEARCHES = 8
export type SalahSearchScope = { kind: 'recorded' } | { kind: 'absolute'; from: string; to: string; includeBlankDates: boolean }
export type SavedSalahSearch = { id: string; name: string; query: string; scope: SalahSearchScope }
export type SavedSalahSearches = { schemaVersion: 1; searches: SavedSalahSearch[] }
export type RecentSalahSearches = { schemaVersion: 1; queries: string[] }

export function normalizeSalahSearchScope(input: unknown): SalahSearchScope | null {
  if (!input || typeof input !== 'object') return null
  const value = input as Record<string, unknown>
  if (value.kind === 'recorded') return { kind: 'recorded' }
  if (value.kind !== 'absolute' || typeof value.from !== 'string' || typeof value.to !== 'string' || typeof value.includeBlankDates !== 'boolean') return null
  const from = parseSalahDate(value.from)
  const to = parseSalahDate(value.to)
  if (!from || !to || from > to) return null
  const span = (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86_400_000
  if (span > MAX_SALAH_SEARCH_RANGE_DAYS) return null
  return { kind: 'absolute', from: formatSalahDate(from), to: formatSalahDate(to), includeBlankDates: value.includeBlankDates }
}

function validQuery(input: unknown): input is string {
  if (typeof input !== 'string' || input.length > MAX_SALAH_QUERY_LENGTH) return false
  try { parseSalahSearch(input); return true } catch { return false }
}

export function normalizeSavedSalahSearches(input: unknown): SavedSalahSearches {
  const empty: SavedSalahSearches = { schemaVersion: 1, searches: [] }
  if (!input || typeof input !== 'object') return empty
  const value = input as Record<string, unknown>
  if (value.schemaVersion !== 1 || !Array.isArray(value.searches)) return empty
  const ids = new Set<string>()
  for (const item of value.searches.slice(0, MAX_SAVED_SALAH_SEARCHES * 10)) {
    if (empty.searches.length >= MAX_SAVED_SALAH_SEARCHES) break
    if (!item || typeof item !== 'object') continue
    const search = item as Record<string, unknown>
    const scope = normalizeSalahSearchScope(search.scope)
    if (typeof search.id !== 'string' || !search.id.trim() || search.id.length > 100 || ids.has(search.id) || typeof search.name !== 'string' || !search.name.trim() || search.name.trim().length > 80 || !validQuery(search.query) || !scope) continue
    ids.add(search.id)
    empty.searches.push({ id: search.id, name: search.name.trim(), query: search.query.trim(), scope })
  }
  return empty
}

export function normalizeRecentSalahSearches(input: unknown): RecentSalahSearches {
  const empty: RecentSalahSearches = { schemaVersion: 1, queries: [] }
  if (!input || typeof input !== 'object') return empty
  const value = input as Record<string, unknown>
  if (value.schemaVersion !== 1 || !Array.isArray(value.queries)) return empty
  for (const query of value.queries.slice(0, MAX_RECENT_SALAH_SEARCHES * 10)) {
    if (validQuery(query) && !empty.queries.includes(query.trim())) empty.queries.push(query.trim())
    if (empty.queries.length >= MAX_RECENT_SALAH_SEARCHES) break
  }
  return empty
}

export function loadSavedSalahSearches(): SavedSalahSearches {
  try { return normalizeSavedSalahSearches(JSON.parse(localStorage.getItem(SALAH_SAVED_SEARCHES_STORAGE_KEY) || 'null')) } catch { return { schemaVersion: 1, searches: [] } }
}
export function loadRecentSalahSearches(): RecentSalahSearches {
  try { return normalizeRecentSalahSearches(JSON.parse(localStorage.getItem(SALAH_RECENT_SEARCHES_STORAGE_KEY) || 'null')) } catch { return { schemaVersion: 1, queries: [] } }
}
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new Event(SALAH_SEARCHES_CHANGE_EVENT))
    return true
  } catch { return false }
}
export function saveSavedSalahSearches(value: SavedSalahSearches): boolean { return write(SALAH_SAVED_SEARCHES_STORAGE_KEY, normalizeSavedSalahSearches(value)) }
export function saveRecentSalahSearches(value: RecentSalahSearches): boolean { return write(SALAH_RECENT_SEARCHES_STORAGE_KEY, normalizeRecentSalahSearches(value)) }
export function describeSalahSearchScope(scope: SalahSearchScope): string {
  return scope.kind === 'recorded' ? 'Recorded dates through today; relative dates roll when reopened.' : `${scope.from} through ${scope.to} · ${scope.includeBlankDates ? 'includes blank dates' : 'recorded dates only'} · fixed scope`
}
