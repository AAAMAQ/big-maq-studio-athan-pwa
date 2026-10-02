/** Civil dates are kept as YYYY-MM-DD so they never inherit the device timezone. */
export function isValidTimezone(timezone: unknown): timezone is string {
  if (typeof timezone !== 'string' || !timezone) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(0)
    return true
  } catch {
    return false
  }
}

export function deviceTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function zonedDateKey(instant: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(instant)
  const part = (type: string) => parts.find((item) => item.type === type)?.value || ''
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function dateKeyForDevice(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function dateKeyAnchor(key: string): Date {
  const [year, month, day] = parseDateKey(key)
  // Adhan reads the date's local calendar fields, then computes UTC solar instants.
  return new Date(year, month - 1, day, 12)
}

export function addDateKeyDays(key: string, days: number): string {
  const [year, month, day] = parseDateKey(key)
  const date = new Date(Date.UTC(year, month - 1, day + days))
  return date.toISOString().slice(0, 10)
}

export function sourceWeekday(key: string): number {
  const [year, month, day] = parseDateKey(key)
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay()
}

export function zonedWallClockToInstant(key: string, hhmm: string, timezone: string): Date {
  if (!isValidTimezone(timezone)) throw new Error('A valid source timezone is required.')
  const [year, month, day] = parseDateKey(key)
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new Error(`Invalid source clock time: ${hhmm}`)
  }
  const target = Date.UTC(year, month - 1, day, Number(match[1]), Number(match[2]))
  // Sample all distinct offsets around this date. This handles half-hour zones and
  // DST transitions without extending one day's offset across a date range.
  const offsets = new Set<number>()
  for (let hour = -36; hour <= 36; hour += 6) {
    offsets.add(timezoneOffsetMinutes(new Date(target + hour * 3_600_000), timezone))
  }
  const matches = [...offsets]
    .map((offset) => new Date(target - offset * 60_000))
    .filter((candidate) => zonedDateKey(candidate, timezone) === key
      && zonedHourMinute(candidate, timezone) === hhmm)
    .sort((a, b) => a.getTime() - b.getTime())
  if (matches.length !== 1) {
    throw new Error(matches.length === 0
      ? `The source time ${key} ${hhmm} does not exist in ${timezone}.`
      : `The source time ${key} ${hhmm} occurs twice in ${timezone}; choose an unambiguous time.`)
  }
  return matches[0]
}

export function timezoneOffsetMinutes(instant: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, timeZoneName: 'shortOffset'
  }).formatToParts(instant)
  const name = parts.find((part) => part.type === 'timeZoneName')?.value || ''
  const match = /^(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(name)
  if (name === 'GMT' || name === 'UTC') return 0
  if (!match) throw new Error(`Cannot read timezone offset for ${timezone}.`)
  return (match[1] === '-' ? -1 : 1) * (Number(match[2]) * 60 + Number(match[3] || 0))
}

export function formatUtcOffset(instant: Date, timezone: string): string {
  const minutes = timezoneOffsetMinutes(instant, timezone)
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  return `UTC${sign}${Math.floor(absolute / 60)}:${String(absolute % 60).padStart(2, '0')}`
}

function zonedHourMinute(instant: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, hourCycle: 'h23', hour: '2-digit', minute: '2-digit'
  }).formatToParts(instant)
  const part = (type: string) => parts.find((item) => item.type === type)?.value || ''
  return `${part('hour')}:${part('minute')}`
}

function parseDateKey(key: string): [number, number, number] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) throw new Error(`Invalid date: ${key}`)
  const [year, month, day] = key.split('-').map(Number)
  const actual = new Date(Date.UTC(year, month - 1, day))
  if (actual.getUTCFullYear() !== year || actual.getUTCMonth() + 1 !== month || actual.getUTCDate() !== day) {
    throw new Error(`Invalid date: ${key}`)
  }
  return [year, month, day]
}
