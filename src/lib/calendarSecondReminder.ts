export const DEEP_SEARCH_SECOND_REMINDER_KEY = 'athan.engine.secondReminder.v1'
export const SETTINGS_SECOND_REMINDER_KEY = 'athan.calendar.secondReminder.v1'

export type SecondReminderPreference = {
  enabled: boolean
  minutesBefore: number
}

const DEFAULT_SECOND_REMINDER: SecondReminderPreference = { enabled: false, minutesBefore: 15 }

export function loadSecondReminder(key: string): SecondReminderPreference {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || 'null')
    return normalizeSecondReminder(parsed)
  } catch {
    return { ...DEFAULT_SECOND_REMINDER }
  }
}

export function saveSecondReminder(key: string, value: SecondReminderPreference): SecondReminderPreference {
  const normalized = normalizeSecondReminder(value)
  try {
    localStorage.setItem(key, JSON.stringify(normalized))
  } catch {
    // Keep calendar controls usable when storage is unavailable.
  }
  return normalized
}

export function normalizeSecondReminder(value: unknown): SecondReminderPreference {
  if (!value || typeof value !== 'object') return { ...DEFAULT_SECOND_REMINDER }
  const input = value as Partial<SecondReminderPreference>
  const minutes = Number(input.minutesBefore)
  return {
    enabled: input.enabled === true,
    minutesBefore: Number.isInteger(minutes) && minutes >= 0 && minutes <= 1440
      ? minutes
      : DEFAULT_SECOND_REMINDER.minutesBefore
  }
}

export function validateSecondReminder(primaryMinutes: number, second: SecondReminderPreference): void {
  if (!second.enabled) return
  if (!Number.isInteger(primaryMinutes) || primaryMinutes < 0 || primaryMinutes > 1440) {
    throw new Error('Choose a valid first reminder time.')
  }
  if (!Number.isInteger(second.minutesBefore) || second.minutesBefore < 0 || second.minutesBefore > 1440) {
    throw new Error('Choose a valid second reminder time.')
  }
  if (primaryMinutes === second.minutesBefore) {
    throw new Error('Choose two different reminder times so each event has distinct alerts.')
  }
}
