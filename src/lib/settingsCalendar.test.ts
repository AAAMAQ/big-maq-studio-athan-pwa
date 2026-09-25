import { beforeEach, describe, expect, it } from 'vitest'
import {
  buildSettingsExtraReminderItems,
  loadFixedIshaEnabled,
  saveFixedIshaEnabled
} from './settingsCalendar'

describe('Settings calendar extras', () => {
  beforeEach(() => localStorage.clear())

  it('keeps fixed Isha enabled by default for backward compatibility', () => {
    expect(loadFixedIshaEnabled()).toBe(true)
    saveFixedIshaEnabled(false)
    expect(loadFixedIshaEnabled()).toBe(false)
  })

  it('adds enabled fixed Isha, Friday Jumuah, and tracker review items with their alert behavior', () => {
    const items = buildSettingsExtraReminderItems(new Date(2026, 8, 25), {
      fixedIshaEnabled: true,
      fixedIshaTime: '22:00',
      jumuah: { include: true, time: '09:30' },
      salahReview: { enabled: true, time: '20:30' }
    })

    expect(items.map((item) => item.title)).toEqual([
      'Isha Reminder (custom time)',
      'Today is Jumu’ah',
      'Review today’s Salah Tracker'
    ])
    expect(items.map((item) => `${item.when.getHours()}:${String(item.when.getMinutes()).padStart(2, '0')}`)).toEqual(['22:00', '9:30', '20:30'])
    expect(items[1].remindMinutes).toBe(10)
    expect(items[2].remindMinutes).toBe(0)
  })

  it('does not add Jumuah outside Friday or any disabled optional item', () => {
    const items = buildSettingsExtraReminderItems(new Date(2026, 8, 26), {
      fixedIshaEnabled: false,
      fixedIshaTime: '22:00',
      jumuah: { include: true, time: '09:30' },
      salahReview: { enabled: false, time: '20:30' }
    })

    expect(items).toEqual([])
  })
})
