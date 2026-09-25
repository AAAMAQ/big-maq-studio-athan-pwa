import { beforeEach, describe, expect, it } from 'vitest'
import { createBackup, importBackup } from './backup'

describe('Backup and Restore Salah privacy data', () => {
  beforeEach(() => localStorage.clear())

  it('includes tracker notes and all Settings calendar reminder preferences in the local backup', () => {
    localStorage.setItem('salahLogV1', '{"2026-09-25":{"Fajr":true,"Dhuhr":false,"Notes":"Private daily note"}}')
    localStorage.setItem('athan.salah.reminder.v1', '{"enabled":true,"time":"20:30"}')
    localStorage.setItem('athan.calendar.fixedIsha.enabled.v1', 'false')
    localStorage.setItem('athan.iqama.jumuahReminder.v1', '{"include":true,"time":"09:30"}')

    const backup = createBackup()
    expect(backup.localStorage.salahLogV1).toContain('Private daily note')
    expect(backup.localStorage['athan.salah.reminder.v1']).toBe('{"enabled":true,"time":"20:30"}')
    expect(backup.localStorage['athan.calendar.fixedIsha.enabled.v1']).toBe('false')
    expect(backup.localStorage['athan.iqama.jumuahReminder.v1']).toBe('{"include":true,"time":"09:30"}')

    localStorage.clear()
    expect(importBackup(backup)).toBe(4)
    expect(localStorage.getItem('salahLogV1')).toContain('Private daily note')
    expect(localStorage.getItem('athan.salah.reminder.v1')).toBe('{"enabled":true,"time":"20:30"}')
    expect(localStorage.getItem('athan.calendar.fixedIsha.enabled.v1')).toBe('false')
    expect(localStorage.getItem('athan.iqama.jumuahReminder.v1')).toBe('{"include":true,"time":"09:30"}')
  })
})
