import { describe, expect, it } from 'vitest'
import { buildMasjidIqamaExport } from './masjidIcs'
import { createMasjidProfile } from './masjid'

describe('Masjid Iqama export', () => {
  it('uses profile rules and adds saved Jumuah slots on Fridays only', () => {
    const profile = createMasjidProfile()
    profile.id = 'test-masjid'
    profile.name = 'Central Masjid'
    profile.address = '1 Main Street'
    for (const prayer of ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const) {
      profile.iqamaRules[prayer] = { mode: 'fixed', fixedTime: '13:00', offsetMinutes: 20 }
    }
    profile.jummahSlots = [{ id: 'first', label: 'First Jumu’ah', khutbahTime: '12:30', iqamaTime: '13:00', notes: '' }]

    const result = buildMasjidIqamaExport({
      profile,
      fromDate: new Date(2026, 8, 25), // Friday
      toDate: new Date(2026, 8, 26),
      coords: { latitude: 35, longitude: -78 },
      sourceLabel: 'Test city profile',
      prayerTimesForDate: (date) => ({
        fajr: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 5),
        dhuhr: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12),
        asr: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15),
        maghrib: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18),
        isha: new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20)
      })
    })

    expect(result.eventCount).toBe(11)
    expect(result.ics.match(/SUMMARY:First Jumu’ah/g)).toHaveLength(1)
    expect(result.ics).toContain('X-WR-CALNAME:Central Masjid Iqama Times')
    expect(result.ics.match(/TRIGGER:-PT10M/g)).toHaveLength(11)
    expect(result.filename).toBe('athan-pwa-iqama-central-masjid-2026-09-25-to-2026-09-26.ics')
  })
})
