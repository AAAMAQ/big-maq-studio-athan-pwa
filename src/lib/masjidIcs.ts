import { buildIcsCalendar, downloadICS, type IcsCalendarEvent } from './ics'
import {
  DEFAULT_INCLUDED_IQAMA_PRAYERS,
  getIqamaRowsForDateRange,
  makeFixedRule,
  makeOffsetRule,
  parseTimeToMinutes,
  type IqamaSettings
} from './iqama'
import type { MasjidProfile } from './masjid'
import type { PrayerSettings } from './prayer'

type PrayerTimes = {
  fajr: Date
  dhuhr: Date
  asr: Date
  maghrib: Date
  isha: Date
}

export type MasjidIqamaExportOptions = {
  profile: MasjidProfile
  fromDate: Date
  toDate: Date
  coords: { latitude: number; longitude: number }
  sourceLabel: string
  prayerSettings?: PrayerSettings
  prayerTimesForDate?: (date: Date) => PrayerTimes
}

export type MasjidIqamaExport = {
  ics: string
  filename: string
  eventCount: number
}

export function buildMasjidIqamaExport(options: MasjidIqamaExportOptions): MasjidIqamaExport {
  const settings = profileIqamaSettings(options.profile)
  const iqamaRows = getIqamaRowsForDateRange({
    coords: options.coords,
    fromDate: options.fromDate,
    toDate: options.toDate,
    settings,
    includedPrayers: DEFAULT_INCLUDED_IQAMA_PRAYERS,
    prayerSettings: options.prayerSettings,
    prayerTimesForDate: options.prayerTimesForDate
  })
  const location = options.profile.address || options.profile.city || options.profile.name
  const events: IcsCalendarEvent[] = iqamaRows.map((row) => ({
    title: `${row.prayer} Iqama — ${options.profile.name || 'Masjid'}`,
    start: row.date,
    end: new Date(row.date.getTime() + 10 * 60 * 1000),
    uid: `${formatDate(row.date)}-${row.prayer.toLowerCase()}-${options.profile.id}@athan-pwa-masjid`,
    description: `Iqama time for ${options.profile.name || 'this masjid'}. Athan source: ${options.sourceLabel}. Calendar alerts are handled by your calendar app.`,
    location,
    categories: ['Iqama', options.profile.name || 'Masjid'],
    alarms: [{ minutesBefore: 10 }]
  }))

  for (const day of eachDate(options.fromDate, options.toDate)) {
    if (day.getDay() !== 5) continue
    for (const slot of options.profile.jummahSlots) {
      const time = parseTimeToMinutes(slot.iqamaTime) !== null ? slot.iqamaTime : slot.khutbahTime
      const minutes = parseTimeToMinutes(time)
      if (minutes === null) continue
      const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), Math.floor(minutes / 60), minutes % 60)
      const details = [
        slot.khutbahTime ? `Khutbah: ${slot.khutbahTime}.` : '',
        slot.iqamaTime ? `Iqama: ${slot.iqamaTime}.` : '',
        slot.notes
      ].filter(Boolean).join(' ')
      events.push({
        title: `${slot.label || 'Jumu’ah'} — ${options.profile.name || 'Masjid'}`,
        start,
        end: new Date(start.getTime() + 45 * 60 * 1000),
        uid: `${formatDate(start)}-jumuah-${slot.id}-${options.profile.id}@athan-pwa-masjid`,
        description: `${details}${details ? ' ' : ''}Calendar alerts are handled by your calendar app.`,
        location,
        categories: ['Jumuah', options.profile.name || 'Masjid'],
        alarms: [{ minutesBefore: 10 }]
      })
    }
  }

  const profileName = options.profile.name || 'Masjid'
  return {
    ics: buildIcsCalendar(events, {
      name: `${profileName} Iqama Times`,
      description: `${profileName} Iqama and Jumu’ah schedule. Athan source: ${options.sourceLabel}.`,
      groupId: `ATHAN-PWA-MASJID-${safeFilename(options.profile.id)}`,
      defaultReminderMin: 10
    }),
    filename: `athan-pwa-iqama-${safeFilename(profileName)}-${formatDate(options.fromDate)}-to-${formatDate(options.toDate)}.ics`,
    eventCount: events.length
  }
}

export function downloadMasjidIqamaExport(result: MasjidIqamaExport) {
  downloadICS(result.filename, result.ics)
}

function profileIqamaSettings(profile: MasjidProfile): IqamaSettings {
  return {
    Fajr: toIqamaRule(profile.iqamaRules.Fajr),
    Dhuhr: toIqamaRule(profile.iqamaRules.Dhuhr),
    Asr: toIqamaRule(profile.iqamaRules.Asr),
    Maghrib: toIqamaRule(profile.iqamaRules.Maghrib),
    Isha: toIqamaRule(profile.iqamaRules.Isha)
  }
}

function toIqamaRule(rule: MasjidProfile['iqamaRules']['Fajr']) {
  return rule.mode === 'fixed' ? makeFixedRule(rule.fixedTime) : makeOffsetRule(rule.offsetMinutes)
}

function eachDate(fromDate: Date, toDate: Date) {
  const dates: Date[] = []
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate())
  const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate())
  while (cursor <= end) {
    dates.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function safeFilename(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'masjid'
}
