import { formatSalahDate, getSalahStatus, normalizeSalahLogStore, parseSalahDate, SALAH_PRAYERS, type SalahDayLog, type SalahLogStore, type SalahPrayerKey } from './salahInsights'

type SearchNode =
  | { kind: 'status'; prayer: SalahPrayerKey; status: 'completed' | 'missed' | 'not-logged' | 'not-completed' }
  | { kind: 'date'; year?: number; month?: number; day?: number }
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

function datePart(token: string): { field: 'year' | 'month' | 'day'; value: number } | null {
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
  if (node.year !== undefined && (node.year < 1 || node.year > 9999)) throw new Error('Use a year from 0001y to 9999y; 00y–99y mean 2000–2099.')
  if (node.month !== undefined && (node.month < 1 || node.month > 12)) throw new Error('Use a month from 1m to 12m, or its name.')
  if (node.day !== undefined && (node.day < 1 || node.day > 31)) throw new Error('Use a day from 1d to 31d.')
  if (node.month !== undefined && node.day !== undefined) {
    const year = node.year ?? 2000 // Feb.29 can match any leap year.
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][node.month - 1]
    if (node.day > daysInMonth) throw new Error('That day does not exist in the selected month/year.')
  }
  return node
}

export function parseSalahSearch(query: string): SearchNode {
  let index = 0
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
  const factor = (): SearchNode => {
    skipSpace()
    if (consume('(')) {
      const inner = or()
      if (!consume(')')) fail('Close the parenthesis with )')
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
      const status = prefix === '!' ? 'missed' : prefix === '~' ? 'not-logged' : 'not-completed'
      return { kind: 'status', prayer: prayer(), status }
    }
    const first = token()
    const parts = [first]
    while (consume('.')) parts.push(token())
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

export function matchesSalahSearch(node: SearchNode, log: SalahDayLog | undefined, date?: string): boolean {
  if (node.kind === 'and') return node.nodes.every((part) => matchesSalahSearch(part, log, date))
  if (node.kind === 'or') return node.nodes.some((part) => matchesSalahSearch(part, log, date))
  if (node.kind === 'date') {
    const parsed = date ? parseSalahDate(date) : null
    return !!parsed && (node.year === undefined || parsed.getFullYear() === node.year)
      && (node.month === undefined || parsed.getMonth() + 1 === node.month)
      && (node.day === undefined || parsed.getDate() === node.day)
  }
  if (node.kind === 'exact') return SALAH_PRAYERS.every((prayer) =>
    (getSalahStatus(log, prayer) === 'completed') === node.prayers.includes(prayer)
  )
  const actual = getSalahStatus(log, node.prayer)
  return node.status === 'not-completed' ? actual !== 'completed' : actual === node.status
}

export function explainSalahSearch(query: string): string {
  const describe = (node: SearchNode, parent: 'and' | 'or' | null = null): string => {
    if (node.kind === 'status') {
      const text = node.status === 'completed' ? 'completed' : node.status === 'missed' ? 'missed' : node.status === 'not-logged' ? 'not logged' : 'missed or not logged'
      return `${node.prayer} ${text}`
    }
    if (node.kind === 'exact') return `only ${node.prayers.join(' and ')} completed`
    if (node.kind === 'date') {
      const month = node.month === undefined ? '' : MONTH_NAMES[node.month - 1]
      if (node.day !== undefined) return `dates on ${month ? `${month} ${node.day}` : `day ${node.day} of any month`}${node.year === undefined ? ' (any year)' : ` in ${node.year}`}`
      return `dates in ${month}${month && node.year !== undefined ? ' ' : ''}${node.year ?? (month ? ' (any year)' : '')}`
    }
    const text = node.nodes.map((part) => describe(part, node.kind)).join(node.kind === 'and' ? ' and ' : ' or ')
    return parent === 'and' && node.kind === 'or' ? `(${text})` : text
  }
  return describe(parseSalahSearch(query))
}

export function searchSalahDays(
  storeInput: SalahLogStore,
  query: string,
  range?: { from: string; to: string },
  today = new Date()
): string[] {
  const node = parseSalahSearch(query)
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
    if (span > 3660) throw new Error('Search at most 10 years at a time.')
    dates = []
    const cursor = new Date(from)
    while (cursor <= end) {
      dates.push(formatSalahDate(cursor))
      cursor.setDate(cursor.getDate() + 1)
    }
  } else {
    dates = Object.keys(store).filter((date) => date <= todayKey)
  }
  return dates.filter((date) => matchesSalahSearch(node, store[date], date)).sort().reverse()
}
