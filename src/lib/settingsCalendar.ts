import type { JumuahReminderSettings } from './iqama'
import type { SalahReminderPreferences } from './salahReminder'

export const FIXED_ISHA_ENABLED_KEY = 'athan.calendar.fixedIsha.enabled.v1'

export type SettingsCalendarItem = {
  title: string
  when: Date
  remindMinutes?: number
  summarySuffix?: string
}

export type SettingsExtraReminderOptions = {
  fixedIshaEnabled: boolean
  fixedIshaTime: string
  jumuah: JumuahReminderSettings
  salahReview: SalahReminderPreferences
}

export function loadFixedIshaEnabled() {
  try {
    return localStorage.getItem(FIXED_ISHA_ENABLED_KEY) !== 'false'
  } catch {
    return true
  }
}

export function saveFixedIshaEnabled(enabled: boolean) {
  try {
    localStorage.setItem(FIXED_ISHA_ENABLED_KEY, String(enabled))
  } catch {
    // Keep Settings usable when localStorage is unavailable.
  }
  return enabled
}

export function buildSettingsExtraReminderItems(day: Date, options: SettingsExtraReminderOptions): SettingsCalendarItem[] {
  const items: SettingsCalendarItem[] = []

  if (options.fixedIshaEnabled) {
    const fixedIsha = dateAtTime(day, options.fixedIshaTime)
    if (fixedIsha) items.push({ title: 'Isha Reminder (custom time)', when: fixedIsha })
  }

  if (options.jumuah.include && day.getDay() === 5) {
    const jumuah = dateAtTime(day, options.jumuah.time)
    if (jumuah) items.push({ title: 'Today is Jumu’ah', when: jumuah, remindMinutes: 10, summarySuffix: '' })
  }

  if (options.salahReview.enabled) {
    const salahReview = dateAtTime(day, options.salahReview.time)
    if (salahReview) items.push({ title: 'Review today’s Salah Tracker', when: salahReview, remindMinutes: 0, summarySuffix: '' })
  }

  return items
}

function dateAtTime(day: Date, time: string) {
  const match = time.match(/^([01]\d|2[0-3]):([0-5]\d)$/)
  if (!match) return null
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), Number(match[1]), Number(match[2]), 0, 0)
}
