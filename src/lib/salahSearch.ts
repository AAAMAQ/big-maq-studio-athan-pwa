import { deriveSalahStreakRuns, indexSalahStreakRuns, formatSalahDate, getSalahStatus, normalizeSalahLogStore, parseSalahDate, SALAH_PRAYERS, summarizeSalahDay, type SalahDayLog, type SalahLogStore, type SalahPrayerKey, type SalahStreakRun } from './salahInsights'

type DateValue = number | [number, number]
export type SearchNode =
  | { kind: 'status'; prayer: SalahPrayerKey; status: 'completed' | 'missed' | 'not-logged' | 'not-completed' }
  | { kind: 'date'; year?: DateValue; month?: DateValue; day?: DateValue }
  | { kind: 'count'; field: 'stars' | 'logged'; min: number; max: number }
  | { kind: 'notes' }
  | { kind: 'weekday'; value: number }
  | { kind: 'relative'; days: number }
  | { kind: 'streak'; value: number | 'max'; minimum: boolean }
  | { kind: 'not'; node: SearchNode }
  | { kind: 'and'; nodes: SearchNode[] }
  | { kind: 'or'; nodes: SearchNode[] }
  | { kind: 'exact'; prayers: SalahPrayerKey[] }

const ALIASES: Record<string, SalahPrayerKey> = {
  '1': 'Fajr', fajr: 'Fajr',
  '2': 'Dhuhr', dhuhr: 'Dhuhr', duhur: 'Dhuhr',
  '3': 'Asr', asr: 'Asr',
  '4': 'Maghrib', maghrib: 'Maghrib', magrib: 'Maghrib',
  '5': 'Isha', isha: 'Isha'
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_ALIASES: Record<string, number> = Object.fromEntries(MONTH_NAMES.flatMap((name, index) => [
  [name.toLowerCase(), index + 1], [name.slice(0, 3).toLowerCase(), index + 1]
]))
MONTH_ALIASES.sept = 9
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_ALIASES: Record<string, number> = Object.fromEntries(WEEKDAY_NAMES.flatMap((name, index) => [[name.toLowerCase(), index], [name.slice(0, 3).toLowerCase(), index]]))
export const MAX_SALAH_QUERY_LENGTH = 2048
export const MAX_SALAH_SEARCH_RANGE_DAYS = 3660

const dateMin = (value: DateValue) => Array.isArray(value) ? value[0] : value
const dateMax = (value: DateValue) => Array.isArray(value) ? value[1] : value
const hasOwn = (object: object, key: string) => Object.prototype.hasOwnProperty.call(object, key)

function datePart(token: string): { field: 'year' | 'month' | 'day'; value: DateValue } | null {
  const range = /^\((\d{1,4})-(\d{1,4})\)([ymd])$/.exec(token)
  if (range) {
    const first = datePart(`${range[1]}${range[3]}`)
    const last = datePart(`${range[2]}${range[3]}`)
    if (!first || !last) throw new Error('Label date ranges with m, d, or y; years use two or four digits.')
    if (dateMin(first.value) > dateMin(last.value)) throw new Error('Date ranges must run from smaller to larger values.')
    return { field: first.field, value: [dateMin(first.value), dateMin(last.value)] }
  }
  if (Object.prototype.hasOwnProperty.call(MONTH_ALIASES, token)) return { field: 'month', value: MONTH_ALIASES[token] }
  if (/^(\d{2}|\d{4})y$/.test(token)) {
    const digits = token.slice(0, -1)
    return { field: 'year', value: digits.length === 2 ? 2000 + Number(digits) : Number(digits) }
  }
  if (/^\d{1,2}[md]$/.test(token)) return { field: token.endsWith('m') ? 'month' : 'day', value: Number(token.slice(0, -1)) }
  return null
}

function parseDateParts(tokens: string[]): Extract<SearchNode, { kind: 'date' }> {
  const node: Extract<SearchNode, { kind: 'date' }> = { kind: 'date' }
  const unmarked: string[] = []
  for (const token of tokens) {
    const part = datePart(token)
    if (!part && /^\d{1,4}$/.test(token)) {
      unmarked.push(token)
      continue
    }
    if (!part) throw new Error(`Unknown date part “${token}”. Use month names, 6m, 23d, or 2026y.`)
    if (node[part.field] !== undefined) throw new Error(`Use each date part only once: ${part.field}.`)
    node[part.field] = part.value
  }
  if (unmarked.length) {
    const fields = ['year', 'month', 'day'] as const
    const known = fields.filter((field) => node[field] !== undefined)
    // Two identified parts determine the remaining part in any position.
    // Month + number is the one two-part exception: Oct.23 means October 23.
    const inferredField = unmarked.length === 1 && tokens.length === 3 && known.length === 2
      ? fields.find((field) => node[field] === undefined)
      : unmarked.length === 1 && tokens.length === 2 && known.length === 1 && node.month !== undefined
        ? 'day'
        : undefined
    if (!inferredField) throw new Error('Ambiguous date. Label parts with m, d, or y; one unmarked part is allowed when the other two are identified. Month.day, such as Oct.23, is also supported.')
    const suffix = inferredField === 'year' ? 'y' : inferredField === 'month' ? 'm' : 'd'
    const inferred = datePart(`${unmarked[0]}${suffix}`)
    if (!inferred) throw new Error('Use one or two digits for a month/day, and two or four digits for a year.')
    node[inferredField] = inferred.value
  }
  if (node.year !== undefined && (dateMin(node.year) < 1 || dateMax(node.year) > 9999)) throw new Error('Use a year from 0001y to 9999y; 00y–99y mean 2000–2099.')
  if (node.month !== undefined && (dateMin(node.month) < 1 || dateMax(node.month) > 12)) throw new Error('Use a month from 1m to 12m, or its name.')
  if (node.day !== undefined && (dateMin(node.day) < 1 || dateMax(node.day) > 31)) throw new Error('Use a day from 1d to 31d.')
  if (typeof node.month === 'number' && typeof node.day === 'number') {
    // Exact month/day must exist in at least one permitted year (Feb 29 ranges included).
    const possibleYears = node.year === undefined ? [2000] : Array.isArray(node.year)
      ? Array.from({ length: node.year[1] - node.year[0] + 1 }, (_, index) => dateMin(node.year!) + index)
      : [node.year]
    const year = possibleYears.find((value) => node.month !== 2 || node.day !== 29 || (value % 4 === 0 && (value % 100 !== 0 || value % 400 === 0))) ?? possibleYears[0]
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][node.month - 1]
    if (node.day > daysInMonth) throw new Error('That day does not exist in the selected month/year.')
  }
  return node
}

export function parseSalahSearch(query: string): SearchNode {
  if (query.length > MAX_SALAH_QUERY_LENGTH) throw new Error(`Keep searches within ${MAX_SALAH_QUERY_LENGTH} characters.`)
  let index = 0
  let depth = 0
  const skipSpace = () => { while (/\s/.test(query[index] ?? '')) index += 1 }
  const fail = (message: string): never => { throw new Error(`${message} at character ${index + 1}.`) }
  const consume = (symbol: string) => {
    skipSpace()
    if (query[index] !== symbol) return false
    index += 1
    return true
  }
  const token = (): string => {
    skipSpace()
    const start = index
    while (/[a-z0-9]/i.test(query[index] ?? '')) index += 1
    const result = query.slice(start, index).toLowerCase()
    if (!result) fail('Enter a prayer name, number 1–5, or a date part')
    return result
  }
  const prayer = (): SalahPrayerKey => {
    const name = token()
    const result = Object.prototype.hasOwnProperty.call(ALIASES, name) ? ALIASES[name] : undefined
    if (!result) return fail(`Unknown prayer “${name}”`)
    return result
  }
  const dateToken = (): string => {
    skipSpace()
    const range = /^\(\d{1,4}-\d{1,4}\)[ymd]/i.exec(query.slice(index))
    if (range) { index += range[0].length; return range[0].toLowerCase() }
    return token()
  }
  const factor = (): SearchNode => {
    skipSpace()
    const startsDateRange = /^\(\d{1,4}-\d{1,4}\)[ymd]/i.test(query.slice(index))
    if (!startsDateRange && consume('(')) {
      depth += 1
      if (depth > 32) fail('Use at most 32 nested groups')
      const inner = or()
      if (!consume(')')) fail('Close the parenthesis with )')
      depth -= 1
      return inner
    }
    if (consume('[')) {
      const exact = [prayer()]
      while (consume('&')) exact.push(prayer())
      if (!consume(']')) fail('Use only prayer names or numbers joined by & inside [ ]')
      if (new Set(exact).size !== exact.length) fail('List each prayer only once inside [ ]')
      return { kind: 'exact', prayers: exact }
    }
    skipSpace()
    const prefix = query[index]
    if (prefix === '!' || prefix === '~' || prefix === '/') {
      index += 1
      const operand = factor()
      if (operand.kind === 'status' && operand.status === 'completed') {
        const status = prefix === '!' ? 'missed' : prefix === '~' ? 'not-logged' : 'not-completed'
        return { kind: 'status', prayer: operand.prayer, status }
      }
      if (prefix === '!' && ['notes', 'count', 'weekday', 'relative'].includes(operand.kind)) return { kind: 'not', node: operand }
      return fail('Use !, ~ or / with prayers; ! can also negate notes, counts, weekdays or relative dates')
    }
    const first = dateToken()
    if (first === 'streak') {
      if (!consume(':')) return fail('Use streak:5, streak:5+, or streak:max')
      const value = token()
      const minimum = consume('+')
      if (value === 'max' && !minimum) return { kind: 'streak', value: 'max', minimum: false }
      const number = Number(value)
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number <= 0) return fail('Use a positive whole-day streak length, or streak:max')
      return { kind: 'streak', value: number, minimum }
    }
    const count = /^(star|stars|logged|done)(\d*)$/.exec(first)
    if (count) {
      let min: number
      let max: number
      if (count[2]) {
        min = Number(count[2])
        max = consume('-') ? Number(token()) : min
      } else {
        if (!consume('(')) return fail('Add a count, such as star3 or star(3-5)')
        min = Number(token())
        if (!consume('-')) return fail('Use a count range such as star(3-5)')
        max = Number(token())
        if (!consume(')')) return fail('Close the count range with )')
      }
      if (!Number.isInteger(min) || !Number.isInteger(max) || min < 0 || max > 5 || min > max) return fail('Counts must be between 0 and 5, in increasing order')
      return { kind: 'count', field: count[1] === 'logged' ? 'logged' : 'stars', min, max }
    }
    if (first === 'note' || first === 'notes') return { kind: 'notes' }
    if (hasOwn(WEEKDAY_ALIASES, first)) return { kind: 'weekday', value: WEEKDAY_ALIASES[first] }
    if (first === 'last30days') return { kind: 'relative', days: 30 }
    const parts = [first]
    while (consume('.')) parts.push(dateToken())
    if (parts.length > 1 || datePart(first)) return parseDateParts(parts)
    const name = Object.prototype.hasOwnProperty.call(ALIASES, first) ? ALIASES[first] : undefined
    if (!name) return fail(`Unknown prayer or date “${first}”`)
    return { kind: 'status', prayer: name, status: 'completed' }
  }
  const and = (): SearchNode => {
    const nodes = [factor()]
    while (consume('&')) nodes.push(factor())
    return nodes.length === 1 ? nodes[0] : { kind: 'and', nodes }
  }
  const or = (): SearchNode => {
    const nodes = [and()]
    while (consume(',') || consume(';')) nodes.push(and())
    return nodes.length === 1 ? nodes[0] : { kind: 'or', nodes }
  }
  skipSpace()
  if (!query.trim()) throw new Error('Enter a prayer or date to search, such as fajr or Oct.30.')
  const result = or()
  skipSpace()
  if (index !== query.length) fail('Unexpected symbol')
  return result
}

export type SalahStreakSearchContext = { byDate: Map<string, SalahStreakRun>; longestLength: number }
export function matchesSalahSearch(node: SearchNode, log: SalahDayLog | undefined, date?: string, today = new Date(), streaks?: SalahStreakSearchContext): boolean {
  if (node.kind === 'and') return node.nodes.every((part) => matchesSalahSearch(part, log, date, today, streaks))
  if (node.kind === 'or') return node.nodes.some((part) => matchesSalahSearch(part, log, date, today, streaks))
  if (node.kind === 'not') return !matchesSalahSearch(node.node, log, date, today, streaks)
  if (node.kind === 'streak') {
    const run = date ? streaks?.byDate.get(date) : undefined
    if (!run) return false
    return node.value === 'max' ? run.length === streaks?.longestLength : node.minimum ? run.length >= node.value : run.length === node.value
  }
  if (node.kind === 'notes') return Boolean(log?.Notes?.trim())
  if (node.kind === 'count') { const counts = summarizeSalahDay(log); return counts[node.field] >= node.min && counts[node.field] <= node.max }
  if (node.kind === 'weekday') return (date ? parseSalahDate(date)?.getDay() : undefined) === node.value
  if (node.kind === 'relative') {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    start.setDate(start.getDate() - node.days + 1)
    return !!date && date >= formatSalahDate(start) && date <= formatSalahDate(today)
  }
  if (node.kind === 'date') {
    const parsed = date ? parseSalahDate(date) : null
    const contains = (value: DateValue | undefined, actual: number) => value === undefined || actual >= dateMin(value) && actual <= dateMax(value)
    return !!parsed && contains(node.year, parsed.getFullYear()) && contains(node.month, parsed.getMonth() + 1) && contains(node.day, parsed.getDate())
  }
  if (node.kind === 'exact') return SALAH_PRAYERS.every((prayer) =>
    (getSalahStatus(log, prayer) === 'completed') === node.prayers.includes(prayer)
  )
  const actual = getSalahStatus(log, node.prayer)
  return node.status === 'not-completed' ? actual !== 'completed' : actual === node.status
}

export function explainSalahSearch(query: string | SearchNode): string {
  const describe = (node: SearchNode, parent: 'and' | 'or' | null = null): string => {
    if (node.kind === 'status') {
      const text = node.status === 'completed' ? 'completed' : node.status === 'missed' ? 'missed' : node.status === 'not-logged' ? 'not logged' : 'missed or not logged'
      return `${node.prayer} ${text}`
    }
    if (node.kind === 'exact') return `only ${node.prayers.join(' and ')} completed`
    if (node.kind === 'notes') return 'a daily note exists'
    if (node.kind === 'not') return `not (${describe(node.node)})`
    if (node.kind === 'weekday') return `${WEEKDAY_NAMES[node.value]} dates`
    if (node.kind === 'relative') return 'dates in the last 30 days, including today'
    if (node.kind === 'streak') return node.value === 'max' ? 'days in the longest all-five completed run(s) intersecting the selected scope, before other query filters' : `days in a full all-five completed run of ${node.minimum ? 'at least' : 'exactly'} ${node.value} days`
    if (node.kind === 'count') return `${node.min === node.max ? `exactly ${node.min}` : `${node.min}–${node.max}`} ${node.field === 'stars' ? 'stars out of 5 (completed prayers)' : 'prayers logged as completed or missed'}`
    if (node.kind === 'date') {
      if ([node.month, node.year, node.day].some(Array.isArray)) {
        const label = (value: DateValue | undefined) => value === undefined ? 'any' : Array.isArray(value) ? `${value[0]}–${value[1]}` : String(value)
        return `dates matching months ${label(node.month)}, days ${label(node.day)}, years ${label(node.year)}`
      }
      const month = typeof node.month !== 'number' ? '' : MONTH_NAMES[node.month - 1]
      if (node.day !== undefined) return `dates on ${month ? `${month} ${node.day}` : `day ${node.day} of any month`}${node.year === undefined ? ' (any year)' : ` in ${node.year}`}`
      return `dates in ${month}${month && node.year !== undefined ? ' ' : ''}${node.year ?? (month ? ' (any year)' : '')}`
    }
    const text = node.nodes.map((part) => describe(part, node.kind)).join(node.kind === 'and' ? ' and ' : ' or ')
    return parent === 'and' && node.kind === 'or' ? `(${text})` : text
  }
  return describe(typeof query === 'string' ? parseSalahSearch(query) : query)
}

export function searchSalahDays(
  storeInput: SalahLogStore,
  query: string | SearchNode,
  range?: { from: string; to: string; includeBlankDates?: boolean },
  today = new Date(),
  verifiedRuns?: SalahStreakRun[]
): string[] {
  const node = typeof query === 'string' ? parseSalahSearch(query) : query
  const store = normalizeSalahLogStore(storeInput)
  const todayKey = formatSalahDate(today)
  let dates: string[]
  if (range) {
    const from = parseSalahDate(range.from)
    const to = parseSalahDate(range.to)
    if (!from || !to || from > to || formatSalahDate(from) > todayKey) {
      throw new Error('Choose a valid date range ending no later than today.')
    }
    const end = formatSalahDate(to) > todayKey ? parseSalahDate(todayKey)! : to
    const span = (Date.UTC(end.getFullYear(), end.getMonth(), end.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86_400_000
    if (span > MAX_SALAH_SEARCH_RANGE_DAYS) throw new Error('Search at most 10 years at a time.')
    dates = []
    if (range.includeBlankDates === false) {
      dates = Object.keys(store).filter((date) => date >= formatSalahDate(from) && date <= formatSalahDate(end))
    } else {
      const cursor = new Date(from)
      while (cursor <= end) {
        dates.push(formatSalahDate(cursor))
        cursor.setDate(cursor.getDate() + 1)
      }
    }
  } else {
    dates = Object.keys(store).filter((date) => date <= todayKey)
  }
  const hasStreak = (part: SearchNode): boolean => part.kind === 'streak' || (part.kind === 'and' || part.kind === 'or') && part.nodes.some(hasStreak) || part.kind === 'not' && hasStreak(part.node)
  const runs = hasStreak(node) ? verifiedRuns ?? deriveSalahStreakRuns(store, today) : []
  let longestLength = 0
  const from = range ? formatSalahDate(parseSalahDate(range.from)!) : undefined
  const toKey = range ? formatSalahDate(parseSalahDate(range.to)!) : undefined
  const to = toKey && toKey > todayKey ? todayKey : toKey
  for (const run of runs) {
    if ((!from || run.end >= from) && (!to || run.start <= to)) longestLength = Math.max(longestLength, run.length)
  }
  const streaks = { byDate: indexSalahStreakRuns(runs), longestLength }
  return dates.filter((date) => matchesSalahSearch(node, store[date], date, today, streaks)).sort().reverse()
}

export function summarizeSalahSearchResults(store: SalahLogStore, dates: string[]) {
  const totals = { days: dates.length, completed: 0, missed: 0, notLogged: 0, logged: 0, stars: 0, possibleStars: dates.length * 5 }
  for (const date of dates) {
    const day = summarizeSalahDay(store[date])
    totals.completed += day.completed
    totals.missed += day.missed
    totals.notLogged += day.notLogged
    totals.logged += day.logged
    totals.stars += day.stars
  }
  return totals
}
