import { beforeEach, describe, expect, it } from 'vitest'
import { loadSalahReminderPreferences, saveSalahReminderPreferences } from './salahReminder'

describe('Salah reminder', () => {
  beforeEach(() => localStorage.clear())

  it('is opt-in with a sensible evening default and persists locally', () => {
    expect(loadSalahReminderPreferences()).toEqual({ enabled: false, time: '20:30' })
    saveSalahReminderPreferences({ enabled: true, time: '21:15' })
    expect(loadSalahReminderPreferences()).toEqual({ enabled: true, time: '21:15' })
  })
})
