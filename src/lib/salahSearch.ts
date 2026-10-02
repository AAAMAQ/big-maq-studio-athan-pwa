import { formatSalahDate, getSalahStatus, normalizeSalahLogStore, parseSalahDate, SALAH_PRAYERS, type SalahDayLog, type SalahLogStore, type SalahPrayerKey } from './salahInsights'

type SearchNode =
  | { kind: 'status'; prayer: SalahPrayerKey; status: 'completed' | 'missed' | 'not-logged' | 'not-completed' }
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
  const prayer = (): SalahPrayerKey => {
    skipSpace()
    const start = index
    while (/[a-z0-9]/i.test(query[index] ?? '')) index += 1
    const token = query.slice(start, index).toLowerCase()
    if (!token) fail('Enter a prayer name or number 1–5')
    const result = ALIASES[token]
    if (!result) fail(`Unknown prayer “${token}”`)
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
    if (prefix === '!' || prefix === '~' || prefix === '/') index += 1
    const status = prefix === '!' ? 'missed' : prefix === '~' ? 'not-logged' : prefix === '/' ? 'not-completed' : 'completed'
    return { kind: 'status', prayer: prayer(), status }
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
  if (!query.trim()) throw new Error('Enter a prayer to search, such as fajr or 1&2.')
  const result = or()
  skipSpace()
  if (index !== query.length) fail('Unexpected symbol')
  return result
}

export function matchesSalahSearch(node: SearchNode, log: SalahDayLog | undefined): boolean {
  if (node.kind === 'and') return node.nodes.every((part) => matchesSalahSearch(part, log))
  if (node.kind === 'or') return node.nodes.some((part) => matchesSalahSearch(part, log))
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
  return dates.filter((date) => matchesSalahSearch(node, store[date])).sort().reverse()
}
