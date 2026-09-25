export type SalahPrayerKey = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'
export type SalahLogStatus = 'completed' | 'missed' | 'not-logged'
export type SalahDayLog = Partial<Record<SalahPrayerKey | 'Sunnah', boolean>> & { Notes?: string }
export type SalahLogStore = Record<string, SalahDayLog>
export type SalahPeriodKey = 'week' | 'month' | 'last-30' | 'all'

export const SALAH_PRAYERS: SalahPrayerKey[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export const SALAH_PERIOD_LABELS: Record<SalahPeriodKey, string> = {
  week: 'This week',
  month: 'This month',
  'last-30': 'Last 30 days',
  all: 'All recorded time'
}

export type SalahPrayerStats = {
  completed: number
  logged: number
  rate: number | null
  currentStreak: number
  longestStreak: number
}

export type SalahTrendPoint = {
  key: string
  label: string
  completed: number
  logged: number
  rate: number | null
}

export type SalahPeriodInsights = {
  period: SalahPeriodKey
  periodLabel: string
  rangeLabel: string
  start: Date
  end: Date
  dayCount: number
  daysWithLogs: number
  prayers: Record<SalahPrayerKey, SalahPrayerStats>
  mostConsistent: {
    prayer: SalahPrayerKey
    completed: number
    logged: number
    rate: number
    coverageDays: number
    coverageRate: number
  } | null
  mostImproved: {
    prayer: SalahPrayerKey
    rateChange: number
    currentCompleted: number
    currentLogged: number
    previousCompleted: number
    previousLogged: number
  } | null
  allFive: {
    completedDays: number
    fullyLoggedDays: number
  }
  strongestWeekday: {
    weekday: string
    completed: number
    logged: number
    rate: number
  } | null
  trendInterval: 'week' | 'month'
  trend: SalahTrendPoint[]
}

/** Preserve every recognizable legacy record while removing malformed values. */
export function normalizeSalahLogStore(value: unknown): SalahLogStore {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  const normalized: SalahLogStore = {}
  for (const [rawDate, rawLog] of Object.entries(value)) {
    const date = parseYmd(rawDate)
    if (!date || !rawLog || typeof rawLog !== 'object' || Array.isArray(rawLog)) continue

    const day: SalahDayLog = {}
    for (const key of [...SALAH_PRAYERS, 'Sunnah' as const]) {
      const status = normalizeStoredStatus((rawLog as Record<string, unknown>)[key])
      if (status !== undefined) day[key] = status
    }
    const notes = (rawLog as Record<string, unknown>).Notes
    if (typeof notes === 'string' && notes.length > 0) day.Notes = notes
    if (Object.keys(day).length > 0) normalized[ymd(date)] = day
  }
  return normalized
}

export function getSalahStatus(log: SalahDayLog | undefined, prayer: SalahPrayerKey): SalahLogStatus {
  if (log?.[prayer] === true) return 'completed'
  if (log?.[prayer] === false) return 'missed'
  return 'not-logged'
}

export function calculateSalahPeriodInsights(
  inputStore: SalahLogStore,
  period: SalahPeriodKey,
  today = new Date()
): SalahPeriodInsights {
  const store = normalizeSalahLogStore(inputStore)
  const { start, end } = getPeriodRange(store, period, today)
  const days = eachDay(start, end)
  const dayCount = days.length
  const daysWithLogs = days.filter((day) => hasObligatoryLog(store[ymd(day)])).length
  const prayers = {} as Record<SalahPrayerKey, SalahPrayerStats>

  for (const prayer of SALAH_PRAYERS) prayers[prayer] = prayerStatsForRange(store, prayer, days)

  const previousDays = eachDay(addDays(start, -dayCount), addDays(start, -1))
  const trendInterval: 'week' | 'month' = period === 'all' && dayCount > 90 ? 'month' : 'week'

  return {
    period,
    periodLabel: SALAH_PERIOD_LABELS[period],
    rangeLabel: formatRange(start, end),
    start,
    end,
    dayCount,
    daysWithLogs,
    prayers,
    mostConsistent: findMostConsistent(prayers, dayCount),
    mostImproved: findMostImproved(store, prayers, previousDays),
    allFive: countCompleteDays(store, days),
    strongestWeekday: findStrongestWeekday(store, days),
    trendInterval,
    trend: buildTrend(store, days, trendInterval)
  }
}

function prayerStatsForRange(store: SalahLogStore, prayer: SalahPrayerKey, days: Date[]): SalahPrayerStats {
  let completed = 0
  let logged = 0
  let longestStreak = 0
  let runningStreak = 0

  for (const day of days) {
    const status = getSalahStatus(store[ymd(day)], prayer)
    if (status !== 'not-logged') logged += 1
    if (status === 'completed') {
      completed += 1
      runningStreak += 1
      longestStreak = Math.max(longestStreak, runningStreak)
    } else {
      runningStreak = 0
    }
  }

  let currentStreak = 0
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (getSalahStatus(store[ymd(days[index])], prayer) !== 'completed') break
    currentStreak += 1
  }

  return { completed, logged, rate: percentage(completed, logged), currentStreak, longestStreak }
}

function findMostConsistent(prayers: Record<SalahPrayerKey, SalahPrayerStats>, dayCount: number) {
  const candidates = SALAH_PRAYERS
    .map((prayer) => ({ prayer, ...prayers[prayer] }))
    .filter((item) => item.rate !== null)
    .sort((left, right) =>
      (right.rate ?? 0) - (left.rate ?? 0) || right.logged - left.logged || SALAH_PRAYERS.indexOf(left.prayer) - SALAH_PRAYERS.indexOf(right.prayer)
    )
  const best = candidates[0]
  if (!best || best.rate === null) return null

  return {
    prayer: best.prayer,
    completed: best.completed,
    logged: best.logged,
    rate: best.rate,
    coverageDays: best.logged,
    coverageRate: percentage(best.logged, dayCount) ?? 0
  }
}

function findMostImproved(
  store: SalahLogStore,
  current: Record<SalahPrayerKey, SalahPrayerStats>,
  previousDays: Date[]
) {
  const candidates = SALAH_PRAYERS.flatMap((prayer) => {
    const previous = prayerStatsForRange(store, prayer, previousDays)
    const currentRate = current[prayer].rate
    if (currentRate === null || previous.rate === null) return []
    return [{
      prayer,
      rateChange: currentRate - previous.rate,
      currentCompleted: current[prayer].completed,
      currentLogged: current[prayer].logged,
      previousCompleted: previous.completed,
      previousLogged: previous.logged
    }]
  }).sort((left, right) => right.rateChange - left.rateChange || right.currentLogged - left.currentLogged)

  return candidates[0] ?? null
}

function countCompleteDays(store: SalahLogStore, days: Date[]) {
  let completedDays = 0
  let fullyLoggedDays = 0
  for (const day of days) {
    const log = store[ymd(day)]
    if (SALAH_PRAYERS.every((prayer) => typeof log?.[prayer] === 'boolean')) fullyLoggedDays += 1
    if (SALAH_PRAYERS.every((prayer) => log?.[prayer] === true)) completedDays += 1
  }
  return { completedDays, fullyLoggedDays }
}

function findStrongestWeekday(store: SalahLogStore, days: Date[]) {
  const weekdays = Array.from({ length: 7 }, () => ({ completed: 0, logged: 0 }))
  for (const day of days) {
    const bucket = weekdays[day.getDay()]
    const log = store[ymd(day)]
    for (const prayer of SALAH_PRAYERS) {
      if (typeof log?.[prayer] !== 'boolean') continue
      bucket.logged += 1
      if (log[prayer]) bucket.completed += 1
    }
  }

  const best = weekdays
    .map((counts, index) => ({ index, ...counts, rate: percentage(counts.completed, counts.logged) }))
    .filter((item) => item.rate !== null)
    .sort((left, right) => (right.rate ?? 0) - (left.rate ?? 0) || right.logged - left.logged)[0]
  if (!best || best.rate === null) return null
  return {
    weekday: new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date(2024, 0, 7 + best.index)),
    completed: best.completed,
    logged: best.logged,
    rate: best.rate
  }
}

function buildTrend(store: SalahLogStore, days: Date[], interval: 'week' | 'month'): SalahTrendPoint[] {
  const buckets = new Map<string, { start: Date; completed: number; logged: number }>()
  for (const day of days) {
    const bucketStart = interval === 'month' ? startOfMonth(day) : startOfWeek(day)
    const key = ymd(bucketStart)
    const bucket = buckets.get(key) ?? { start: bucketStart, completed: 0, logged: 0 }
    const log = store[ymd(day)]
    for (const prayer of SALAH_PRAYERS) {
      if (typeof log?.[prayer] !== 'boolean') continue
      bucket.logged += 1
      if (log[prayer]) bucket.completed += 1
    }
    buckets.set(key, bucket)
  }

  return Array.from(buckets.entries()).map(([key, bucket]) => ({
    key,
    label: interval === 'month'
      ? bucket.start.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      : `Week of ${bucket.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    completed: bucket.completed,
    logged: bucket.logged,
    rate: percentage(bucket.completed, bucket.logged)
  }))
}

function getPeriodRange(store: SalahLogStore, period: SalahPeriodKey, today: Date) {
  const end = startOfDay(today)
  if (period === 'week') return { start: startOfWeek(end), end }
  if (period === 'month') return { start: startOfMonth(end), end }
  if (period === 'last-30') return { start: addDays(end, -29), end }

  const firstRecorded = Object.keys(store)
    .filter((key) => hasObligatoryLog(store[key]))
    .map(parseYmd)
    .filter((date): date is Date => Boolean(date && date <= end))
    .sort((left, right) => localDayNumber(left) - localDayNumber(right))[0]
  return { start: firstRecorded ?? end, end }
}

function hasObligatoryLog(log: SalahDayLog | undefined) {
  return SALAH_PRAYERS.some((prayer) => typeof log?.[prayer] === 'boolean')
}

function normalizeStoredStatus(value: unknown): boolean | undefined {
  if (value === true || value === 'completed' || value === 'true' || value === 1) return true
  if (value === false || value === 'missed' || value === 'false' || value === 0) return false
  return undefined
}

function percentage(numerator: number, denominator: number): number | null {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : null
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfWeek(date: Date) {
  return addDays(startOfDay(date), -date.getDay())
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number) {
  const next = startOfDay(date)
  next.setDate(next.getDate() + days)
  return next
}

function eachDay(from: Date, to: Date) {
  const days: Date[] = []
  const cursor = startOfDay(from)
  const end = startOfDay(to)
  while (localDayNumber(cursor) <= localDayNumber(end)) {
    days.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

function parseYmd(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const parsed = new Date(year, month - 1, day)
  if (parsed.getFullYear() !== year || parsed.getMonth() !== month - 1 || parsed.getDate() !== day) return null
  return parsed
}

function ymd(date: Date) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function localDayNumber(date: Date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000
}

function formatRange(start: Date, end: Date) {
  const format = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  return localDayNumber(start) === localDayNumber(end) ? format(start) : `${format(start)} – ${format(end)}`
}
