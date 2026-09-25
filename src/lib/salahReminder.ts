export const SALAH_REMINDER_KEY = 'athan.salah.reminder.v1'
export const DEFAULT_SALAH_REMINDER = { enabled: false, time: '20:30' } as const

export type SalahReminderPreferences = {
  enabled: boolean
  time: string
}

export function loadSalahReminderPreferences(): SalahReminderPreferences {
  try {
    const raw = localStorage.getItem(SALAH_REMINDER_KEY)
    return raw ? normalizeSalahReminderPreferences(JSON.parse(raw)) : { ...DEFAULT_SALAH_REMINDER }
  } catch {
    return { ...DEFAULT_SALAH_REMINDER }
  }
}

export function saveSalahReminderPreferences(preferences: SalahReminderPreferences) {
  const normalized = normalizeSalahReminderPreferences(preferences)
  try {
    localStorage.setItem(SALAH_REMINDER_KEY, JSON.stringify(normalized))
  } catch {
    // Keep the tracker usable when localStorage is unavailable.
  }
  return normalized
}

export function normalizeSalahReminderPreferences(value: unknown): SalahReminderPreferences {
  const maybe = value && typeof value === 'object' ? value as Partial<SalahReminderPreferences> : {}
  const time = typeof maybe.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(maybe.time)
    ? maybe.time
    : DEFAULT_SALAH_REMINDER.time
  return { enabled: maybe.enabled === true, time }
}
