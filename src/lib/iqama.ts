

// src/lib/iqama.ts

import { buildIcsCalendar, downloadICS } from './ics'
import { computePrayerTimes, loadSettings, type PrayerSettings } from './prayer'

export type IqamaPrayerName = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'

export type IqamaMode = 'offset' | 'fixed'

export type IqamaTimeFormat = '24h' | '12h'

export type IqamaOffsetPreset = 5 | 10 | 20 | 30 | 60 | 'custom'

export type IqamaRule = {
  mode: IqamaMode

  // Used when mode === 'offset'.
  // Example: Dhuhr Athan + 20 minutes.
  offsetPreset: IqamaOffsetPreset
  offsetMinutes: number

  // Used when mode === 'fixed'.
  // Example: Always 1:30 PM regardless of the Dhuhr Athan time.
  fixedTime: string
}

export type IqamaSettings = Record<IqamaPrayerName, IqamaRule>

export type AthanTimesForIqama = Partial<Record<IqamaPrayerName, string>>

export type IqamaResult = {
  prayer: IqamaPrayerName
  athanTime?: string
  iqamaTime: string
  rule: IqamaRule
}

export type IqamaDayResult = Record<IqamaPrayerName, IqamaResult>

export type IqamaCalendarRow = {
  prayer: IqamaPrayerName
  title: string
  date: Date
  athanDate?: Date
  rule: IqamaRule
}

export type JumuahCalendarRow = {
  prayer: 'Jumuah'
  title: 'Today is Jumu’ah'
  date: Date
}

export type IqamaExportRow = IqamaCalendarRow | JumuahCalendarRow

export type IqamaIncludedPrayers = Record<IqamaPrayerName, boolean>

export type JumuahReminderSettings = {
  include: boolean
  time: string
}

export type IqamaDateRangeOptions = {
  coords: { latitude: number; longitude: number }
  fromDate: Date
  toDate: Date
  settings: IqamaSettings
  includedPrayers: IqamaIncludedPrayers
  prayerSettings?: PrayerSettings
  prayerTimesForDate?: (date: Date) => {
    fajr: Date
    dhuhr: Date
    asr: Date
    maghrib: Date
    isha: Date
  }
  includeJumuah?: boolean
  jumuahTime?: string
}

const IQAMA_SETTINGS_KEY = 'athan.iqama.settings.v1'
const JUMUAH_REMINDER_KEY = 'athan.iqama.jumuahReminder.v1'

export const IQAMA_PRAYERS: IqamaPrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export const IQAMA_OFFSET_PRESETS: IqamaOffsetPreset[] = [5, 10, 20, 30, 60, 'custom']

export const DEFAULT_INCLUDED_IQAMA_PRAYERS: IqamaIncludedPrayers = {
  Fajr: true,
  Dhuhr: true,
  Asr: true,
  Maghrib: true,
  Isha: true
}

export const DEFAULT_JUMUAH_REMINDER: JumuahReminderSettings = {
  include: false,
  time: '09:00'
}

export const DEFAULT_IQAMA_SETTINGS: IqamaSettings = {
  Fajr: makeOffsetRule(20),
  Dhuhr: makeOffsetRule(20),
  Asr: makeOffsetRule(20),
  Maghrib: makeOffsetRule(10),
  Isha: makeOffsetRule(20)
}

export function makeOffsetRule(minutes: number, preset?: IqamaOffsetPreset): IqamaRule {
  const normalizedMinutes = normalizeOffsetMinutes(minutes)

  return {
    mode: 'offset',
    offsetPreset: preset ?? presetFromMinutes(normalizedMinutes),
    offsetMinutes: normalizedMinutes,
    fixedTime: ''
  }
}

export function makeFixedRule(time: string): IqamaRule {
  return {
    mode: 'fixed',
    offsetPreset: 20,
    offsetMinutes: 20,
    fixedTime: normalizeTimeInput(time)
  }
}

export function loadIqamaSettings(): IqamaSettings {
  try {
    const raw = localStorage.getItem(IQAMA_SETTINGS_KEY)
    if (!raw) return cloneIqamaSettings(DEFAULT_IQAMA_SETTINGS)

    const parsed = JSON.parse(raw)
    return normalizeIqamaSettings(parsed)
  } catch {
    return cloneIqamaSettings(DEFAULT_IQAMA_SETTINGS)
  }
}

export function saveIqamaSettings(settings: IqamaSettings) {
  try {
    localStorage.setItem(IQAMA_SETTINGS_KEY, JSON.stringify(normalizeIqamaSettings(settings)))
  } catch {
    // Ignore localStorage failures so the page still works.
  }
}

export function resetIqamaSettings() {
  saveIqamaSettings(DEFAULT_IQAMA_SETTINGS)
  return cloneIqamaSettings(DEFAULT_IQAMA_SETTINGS)
}

export function loadJumuahReminderSettings(): JumuahReminderSettings {
  try {
    const raw = localStorage.getItem(JUMUAH_REMINDER_KEY)
    if (!raw) return { ...DEFAULT_JUMUAH_REMINDER }

    const parsed = JSON.parse(raw) as Partial<JumuahReminderSettings>
    return {
      include: Boolean(parsed.include),
      time: clampJumuahTime(parsed.time ?? DEFAULT_JUMUAH_REMINDER.time)
    }
  } catch {
    return { ...DEFAULT_JUMUAH_REMINDER }
  }
}

export function saveJumuahReminderSettings(settings: JumuahReminderSettings) {
  try {
    localStorage.setItem(JUMUAH_REMINDER_KEY, JSON.stringify({
      include: settings.include,
      time: clampJumuahTime(settings.time)
    }))
  } catch {
    // Ignore localStorage failures so exporting still works.
  }
}

export function updateIqamaRule(
  settings: IqamaSettings,
  prayer: IqamaPrayerName,
  nextRule: Partial<IqamaRule>
): IqamaSettings {
  const current = settings[prayer] ?? DEFAULT_IQAMA_SETTINGS[prayer]
  const updated = normalizeIqamaRule({
    ...current,
    ...nextRule
  })

  return {
    ...settings,
    [prayer]: updated
  }
}

export function calculateIqamaTime(athanTime: string | undefined, rule: IqamaRule): string {
  const normalizedRule = normalizeIqamaRule(rule)

  if (normalizedRule.mode === 'fixed') {
    return normalizeTimeInput(normalizedRule.fixedTime)
  }

  if (!athanTime) return ''

  return addMinutesToTime(athanTime, normalizedRule.offsetMinutes)
}

export function calculateIqamaDay(
  athanTimes: AthanTimesForIqama,
  settings: IqamaSettings
): IqamaDayResult {
  const normalizedSettings = normalizeIqamaSettings(settings)
  const result = {} as IqamaDayResult

  for (const prayer of IQAMA_PRAYERS) {
    const rule = normalizedSettings[prayer]
    result[prayer] = {
      prayer,
      athanTime: athanTimes[prayer],
      iqamaTime: calculateIqamaTime(athanTimes[prayer], rule),
      rule
    }
  }

  return result
}

export function addMinutesToTime(time: string, minutes: number): string {
  const parsed = parseTimeToMinutes(time)
  if (parsed === null) return ''

  const total = wrapMinutes(parsed + normalizeOffsetMinutes(minutes))
  return minutesToTimeString(total, '24h')
}

export function formatIqamaTime(time: string, format: IqamaTimeFormat) {
  const parsed = parseTimeToMinutes(time)
  if (parsed === null) return time

  return minutesToTimeString(parsed, format)
}

export function normalizeTimeInput(time: string): string {
  const parsed = parseTimeToMinutes(time)
  if (parsed === null) return ''

  return minutesToTimeString(parsed, '24h')
}

export function parseTimeToMinutes(time: string | undefined): number | null {
  if (!time) return null

  const cleaned = time
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*\(.*?\)\s*/g, '')

  const match = cleaned.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!match) return null

  let hour = Number(match[1])
  const minute = Number(match[2] ?? '0')
  const period = match[3]?.toUpperCase()

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null
  if (minute < 0 || minute > 59) return null

  if (period) {
    if (hour < 1 || hour > 12) return null
    if (period === 'PM' && hour < 12) hour += 12
    if (period === 'AM' && hour === 12) hour = 0
  } else if (hour < 0 || hour > 23) {
    return null
  }

  return hour * 60 + minute
}

export function minutesToTimeString(totalMinutes: number, format: IqamaTimeFormat = '24h') {
  const normalized = wrapMinutes(totalMinutes)
  const hour24 = Math.floor(normalized / 60)
  const minute = normalized % 60

  if (format === '24h') {
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
  }

  const period = hour24 >= 12 ? 'PM' : 'AM'
  let hour12 = hour24 % 12
  if (hour12 === 0) hour12 = 12

  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`
}

export function isValidTimeInput(time: string) {
  return parseTimeToMinutes(time) !== null
}

export function isFixedRuleReady(rule: IqamaRule) {
  return rule.mode !== 'fixed' || isValidTimeInput(rule.fixedTime)
}

export function getIqamaRuleSummary(rule: IqamaRule, format: IqamaTimeFormat = '12h') {
  const normalizedRule = normalizeIqamaRule(rule)

  if (normalizedRule.mode === 'fixed') {
    const formatted = formatIqamaTime(normalizedRule.fixedTime, format)
    return formatted ? `Fixed at ${formatted}` : 'Fixed time not set'
  }

  if (normalizedRule.offsetMinutes === 60) return '1 hour after Athan'
  return `${normalizedRule.offsetMinutes} minutes after Athan`
}

export function clampJumuahTime(time: string): string {
  const parsed = parseTimeToMinutes(time)
  if (parsed === null) return DEFAULT_JUMUAH_REMINDER.time

  const min = 5 * 60
  const max = 11 * 60
  return minutesToTimeString(Math.max(min, Math.min(max, parsed)), '24h')
}

export function getIqamaRowsForDateRange(options: IqamaDateRangeOptions): IqamaExportRow[] {
  const from = startOfLocalDay(options.fromDate)
  const to = startOfLocalDay(options.toDate)
  if (to < from) return []

  const normalizedSettings = normalizeIqamaSettings(options.settings)
  const prayerSettings = options.prayerSettings ?? loadSettings()
  const rows: IqamaExportRow[] = []

  for (const day of eachLocalDate(from, to)) {
    const prayerTimes = options.prayerTimesForDate
      ? options.prayerTimesForDate(day)
      : computePrayerTimes(options.coords, day, prayerSettings)
    const athanDates: Record<IqamaPrayerName, Date> = {
      Fajr: prayerTimes.fajr,
      Dhuhr: prayerTimes.dhuhr,
      Asr: prayerTimes.asr,
      Maghrib: prayerTimes.maghrib,
      Isha: prayerTimes.isha
    }

    for (const prayer of IQAMA_PRAYERS) {
      if (!options.includedPrayers[prayer]) continue

      const rule = normalizedSettings[prayer]
      const iqamaDate = calculateIqamaDate(athanDates[prayer], day, rule)
      if (!iqamaDate) continue

      rows.push({
        prayer,
        title: `${prayer} Iqama`,
        date: iqamaDate,
        athanDate: athanDates[prayer],
        rule
      })
    }

    if (options.includeJumuah && day.getDay() === 5) {
      rows.push({
        prayer: 'Jumuah',
        title: 'Today is Jumu’ah',
        date: dateWithLocalTime(day, clampJumuahTime(options.jumuahTime ?? DEFAULT_JUMUAH_REMINDER.time))
      })
    }
  }

  return rows.sort((a, b) => a.date.getTime() - b.date.getTime())
}

export function generateIqamaIcs(options: IqamaDateRangeOptions): string {
  const rows = getIqamaRowsForDateRange(options)
  return buildIcsCalendar(rows.map((row) => {
    const dateKey = formatDateInput(row.date)
    const description = row.prayer === 'Jumuah'
      ? 'Remember Surah Al-Kahf and prepare for Jumu’ah. Generated by Athan PWA.'
      : 'Generated by Athan PWA. Calendar alerts are handled by your calendar app.'

    return {
      title: row.title,
      start: row.date,
      end: new Date(row.date.getTime() + 10 * 60 * 1000),
      uid: `${dateKey}-${row.prayer.toLowerCase()}@athan-pwa-iqama`,
      description,
      categories: ['Iqama'],
      remindMinutes: 10
    }
  }), {
    name: 'Athan PWA Iqama',
    description: 'Generated by Athan PWA',
    groupId: 'ATHAN-PWA-IQAMA',
    defaultReminderMin: 10
  })
}

export function downloadIqamaIcs(options: IqamaDateRangeOptions) {
  const ics = generateIqamaIcs(options)
  const filename = makeIqamaIcsFilename(options.fromDate, options.toDate)
  downloadICS(filename, ics)
}

export function makeIqamaIcsFilename(fromDate: Date, toDate: Date) {
  return `athan-pwa-iqama-${formatDateInput(fromDate)}-to-${formatDateInput(toDate)}.ics`
}

export function formatDateInput(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number)
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return startOfLocalDay(new Date())
  }

  return new Date(year, month - 1, day)
}

function normalizeIqamaSettings(value: unknown): IqamaSettings {
  const maybeSettings = value && typeof value === 'object' ? value as Partial<IqamaSettings> : {}
  const settings = {} as IqamaSettings

  for (const prayer of IQAMA_PRAYERS) {
    settings[prayer] = normalizeIqamaRule(maybeSettings[prayer] ?? DEFAULT_IQAMA_SETTINGS[prayer])
  }

  return settings
}

function calculateIqamaDate(athanDate: Date, day: Date, rule: IqamaRule): Date | null {
  const normalizedRule = normalizeIqamaRule(rule)

  if (normalizedRule.mode === 'fixed') {
    if (!normalizedRule.fixedTime) return null
    return dateWithLocalTime(day, normalizedRule.fixedTime)
  }

  return new Date(athanDate.getTime() + normalizedRule.offsetMinutes * 60 * 1000)
}

function dateWithLocalTime(day: Date, time: string): Date {
  const parsed = parseTimeToMinutes(time) ?? 0
  const date = startOfLocalDay(day)
  date.setHours(Math.floor(parsed / 60), parsed % 60, 0, 0)
  return date
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function eachLocalDate(from: Date, to: Date): Date[] {
  const days: Date[] = []
  const current = startOfLocalDay(from)
  const end = startOfLocalDay(to)

  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

function normalizeIqamaRule(value: unknown): IqamaRule {
  const maybeRule = value && typeof value === 'object' ? value as Partial<IqamaRule> : {}
  const mode: IqamaMode = maybeRule.mode === 'fixed' ? 'fixed' : 'offset'
  const offsetMinutes = normalizeOffsetMinutes(maybeRule.offsetMinutes ?? 20)
  const offsetPreset = maybeRule.offsetPreset === 'custom'
    ? 'custom'
    : presetFromMinutes(Number(maybeRule.offsetPreset ?? offsetMinutes))
  const fixedTime = normalizeTimeInput(maybeRule.fixedTime ?? '')

  return {
    mode,
    offsetPreset,
    offsetMinutes,
    fixedTime
  }
}

function normalizeOffsetMinutes(minutes: number) {
  if (!Number.isFinite(minutes)) return 20

  // Keep this flexible for custom values while preventing impossible calendar values.
  return Math.max(0, Math.min(24 * 60, Math.round(minutes)))
}

function presetFromMinutes(minutes: number): IqamaOffsetPreset {
  if (minutes === 5 || minutes === 10 || minutes === 20 || minutes === 30 || minutes === 60) {
    return minutes
  }

  return 'custom'
}

function wrapMinutes(minutes: number) {
  const day = 24 * 60
  return ((minutes % day) + day) % day
}

function cloneIqamaSettings(settings: IqamaSettings): IqamaSettings {
  return {
    Fajr: { ...settings.Fajr },
    Dhuhr: { ...settings.Dhuhr },
    Asr: { ...settings.Asr },
    Maghrib: { ...settings.Maghrib },
    Isha: { ...settings.Isha }
  }
}
