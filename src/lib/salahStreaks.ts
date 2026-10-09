import { formatSalahDate, getSalahStatus, normalizeSalahLogStore, parseSalahDate, SALAH_PRAYERS, type SalahLogStore, type SalahPrayerKey, type SalahStreakRun } from './salahInsights'

/** Stable scope keys share work between repeated/reordered query terms. */
export function salahStreakScopeKey(prayers: readonly SalahPrayerKey[]): string {
  return SALAH_PRAYERS.filter((prayer) => prayers.includes(prayer)).join('&')
}

/** Sorted nonoverlapping runs support cheap card lookups without expanding extra dates. */
export function findSalahStreakRun(runs: readonly SalahStreakRun[], date: string): SalahStreakRun | undefined {
  let low = 0
  let high = runs.length - 1
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const run = runs[middle]
    if (date < run.start) high = middle - 1
    else if (date > run.end) low = middle + 1
    else return run
  }
  return undefined
}

/** Sparse, maximal runs: every selected prayer must be completed on each calendar day. */
export function deriveScopedSalahStreakRuns(input: SalahLogStore, prayers: readonly SalahPrayerKey[], today = new Date()): SalahStreakRun[] {
  if (!prayers.length || prayers.some((prayer) => !SALAH_PRAYERS.includes(prayer))) return []
  const store = normalizeSalahLogStore(input)
  const todayKey = formatSalahDate(today)
  const runs: SalahStreakRun[] = []
  let previous: number | null = null
  for (const date of Object.keys(store).filter((key) => key <= todayKey).sort()) {
    if (!prayers.every((prayer) => getSalahStatus(store[date], prayer) === 'completed')) { previous = null; continue }
    const parsed = parseSalahDate(date)!
    // UTC ordinal for the local calendar date, not elapsed hours (DST-safe).
    const ordinalDate = new Date(0)
    ordinalDate.setUTCFullYear(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
    const ordinal = ordinalDate.getTime() / 86_400_000
    if (previous !== null && ordinal === previous + 1) {
      const run = runs[runs.length - 1]
      run.end = date
      run.length += 1
    } else runs.push({ start: date, end: date, length: 1 })
    previous = ordinal
  }
  return runs
}
