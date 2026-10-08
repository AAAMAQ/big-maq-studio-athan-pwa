import { describe, expect, it, vi } from 'vitest'
import { appDestinations, searchAppDestinations } from './destinationSearch'
import { ROOT_FEATURE_IDS } from './rootFeatures'
import { QURAN_DESTINATION_NAMES } from './quranDestinations'

describe('local app destination catalog', () => {
  it('lists Need Help once as a main destination with its own Qibla help breadcrumb', () => {
    const catalog = appDestinations()
    expect(catalog.filter((entry) => entry.id === 'NeedHelp')).toEqual([
      expect.objectContaining({ label: 'Need Help', breadcrumb: 'App', intent: { screen: 'NeedHelp' } }),
    ])
    for (const query of ['help', 'faq', 'how to use', 'user guide', 'المساعدة']) {
      expect(searchAppDestinations(query, catalog)[0].intent).toEqual({ screen: 'NeedHelp' })
    }
    expect(catalog.find((entry) => entry.id === 'QiblaHelp')?.breadcrumb).toBe('Need Help')
    const arabic = appDestinations('ar')
    expect(searchAppDestinations('help', arabic)[0].label).toBe('المساعدة')
    expect(arabic.find((entry) => entry.id === 'QiblaHelp')?.breadcrumb).toBe('المساعدة')
  })

  it('includes every root, distinct child/view, all 114 numbered Surahs and 30 Juz starts', () => {
    const catalog = appDestinations()
    expect(new Set(catalog.map((item) => item.id)).size).toBe(catalog.length)
    for (const id of ROOT_FEATURE_IDS) expect(catalog.some((item) => item.id === id)).toBe(true)
    expect(catalog.filter((item) => item.id.startsWith('Surah'))).toHaveLength(114)
    expect(catalog.filter((item) => /^Juz\d/.test(item.id))).toHaveLength(30)
    expect(QURAN_DESTINATION_NAMES).toHaveLength(114)
    expect(searchAppDestinations('month', catalog)[0].intent).toEqual({ screen: 'Prayer', view: 'month' })
    expect(searchAppDestinations('continue reading', catalog)[0].intent).toEqual({ screen: 'Quran', view: 'continue' })
    expect(searchAppDestinations('qibla help', catalog)[0].intent).toEqual({ screen: 'NeedHelp', section: 'qibla' })
    expect(searchAppDestinations('juz 30', catalog)[0].intent).toEqual({ screen: 'Quran', juz: 30 })
  })

  it('ranks exact matches above prefixes/substrings with useful aliases and bounded suggestions', () => {
    const catalog = appDestinations()
    expect(searchAppDestinations('iq', catalog)[0].id).toBe('Iqama')
    expect(searchAppDestinations('saved cities', catalog)[0].id).toBe('SavedCities')
    expect(searchAppDestinations('2', catalog)[0].intent).toEqual({ screen: 'Quran', surah: 2 })
    expect(searchAppDestinations('Al Baqarah', catalog)[0].intent).toEqual({ screen: 'Quran', surah: 2 })
    expect(searchAppDestinations('Surah Al-Kahf', catalog)[0].intent).toEqual({ screen: 'Quran', surah: 18 })
    expect(searchAppDestinations('  IKHLAS ', catalog)[0].intent).toEqual({ screen: 'Quran', surah: 112 })
    expect(searchAppDestinations('not a real destination', catalog)).toEqual([])
    expect(searchAppDestinations('', catalog)).toHaveLength(10)
    expect(searchAppDestinations('a', catalog, 100)).toHaveLength(12)
  })

  it('matches Arabic labels without needing vocalization and never reads records or fetches', () => {
    const storage = vi.spyOn(Storage.prototype, 'getItem')
    const fetch = vi.spyOn(globalThis, 'fetch')
    const catalog = appDestinations('ar')
    expect(searchAppDestinations('الفاتحة', catalog)[0].intent).toEqual({ screen: 'Quran', surah: 1 })
    expect(searchAppDestinations('القبلة', catalog)[0].id).toBe('Qibla')
    expect(searchAppDestinations('إعدادات القرآن', catalog)[0].id).toBe('QuranSettings')
    expect(storage).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    storage.mockRestore()
    fetch.mockRestore()
  })
})
