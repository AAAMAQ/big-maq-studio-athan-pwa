import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchSurah, fetchSurahs, QURAN_API } from './quran'

const list = [{ number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7 }]
const text = { code: 200, status: 'OK', data: { ayahs: [{ numberInSurah: 1, text: 'Test verse' }] } }
const response = (value: unknown) => new Response(JSON.stringify(value), { status: 200, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => { localStorage.clear() })
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear() })

describe('bounded concurrent Quran text reads', () => {
  it('shares concurrent list reads and preserves the existing persistent list cache', async () => {
    const fetch = vi.fn(async () => response({ code: 200, status: 'OK', data: list }))
    vi.stubGlobal('fetch', fetch)
    expect(await Promise.all([fetchSurahs(), fetchSurahs()])).toEqual([list, list])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(await fetchSurahs()).toEqual(list)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('shares identical concurrent Surah requests and retains Arabic/translation output', async () => {
    const fetch = vi.fn(async () => response(text))
    vi.stubGlobal('fetch', fetch)
    const result = await Promise.all([fetchSurah(1), fetchSurah(1)])
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(result[0]).toEqual({ arabic: [{ number: 1, text: 'Test verse' }], english: [{ number: 1, text: 'Test verse' }] })
    expect(result[1]).toEqual(result[0])
  })

  it('shares Arabic text across editions without combining translations', async () => {
    const fetch = vi.fn(async (url: string) => response({ ...text, data: { ayahs: [{ numberInSurah: 1, text: url.endsWith('en.pickthall') ? 'Pickthall text' : 'Other text' }] } }))
    vi.stubGlobal('fetch', fetch)
    const [asad, pickthall] = await Promise.all([fetchSurah(1, 'en.asad'), fetchSurah(1, 'en.pickthall')])
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(asad.arabic).toEqual(pickthall.arabic)
    expect(asad.english[0].text).toBe('Other text')
    expect(pickthall.english[0].text).toBe('Pickthall text')
  })

  it('evicts completed requests rather than retaining a second in-memory data cache', async () => {
    const fetch = vi.fn(async () => response(text))
    vi.stubGlobal('fetch', fetch)
    await fetchSurah(1)
    localStorage.clear()
    await fetchSurah(1)
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('evicts failed requests so a subsequent attempt can succeed', async () => {
    const fetch = vi.fn().mockRejectedValueOnce(new Error('offline')).mockRejectedValueOnce(new Error('offline')).mockImplementation(async () => response(text))
    vi.stubGlobal('fetch', fetch)
    await expect(fetchSurah(1)).rejects.toThrow('offline')
    await expect(fetchSurah(1)).resolves.toHaveProperty('arabic')
    expect(fetch).toHaveBeenCalledTimes(4)
  })

  it('retains offline Cache Storage fallback and does not clear any cache', async () => {
    const match = vi.fn(async () => response(text))
    const remove = vi.fn()
    vi.stubGlobal('caches', { match, delete: remove })
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('offline') }))
    await expect(fetchSurah(1)).resolves.toHaveProperty('english')
    expect(match).toHaveBeenCalledWith(`${QURAN_API}/surah/1/ar.uthmani`)
    expect(match).toHaveBeenCalledWith(`${QURAN_API}/surah/1/en.asad`)
    expect(remove).not.toHaveBeenCalled()
  })

  it('can read text when localStorage access is denied', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Denied', 'SecurityError') })
    vi.stubGlobal('fetch', vi.fn(async () => response(text)))
    await expect(fetchSurah(1)).resolves.toHaveProperty('arabic')
  })

  it('preserves existing Bismillah separation for non-Fatihah/non-Tawbah surahs', async () => {
    const prefix = 'ب'.repeat(38)
    vi.stubGlobal('fetch', vi.fn(async () => response({ ...text, data: { ayahs: [{ numberInSurah: 1, text: `${prefix} Rest of verse` }] } })))
    const result = await fetchSurah(2)
    expect(result.bismillah).toBe(prefix)
    expect(result.arabic[0].text).toBe('Rest of verse')
  })

  it('bounds tracked pending requests without rejecting additional feature reads', async () => {
    const releases: (() => void)[] = []
    const fetch = vi.fn(() => new Promise<Response>((resolve) => { releases.push(() => resolve(response(text))) }))
    vi.stubGlobal('fetch', fetch)
    const first = Array.from({ length: 9 }, (_, index) => fetchSurah(index + 1))
    const untrackedRepeat = fetchSurah(9)
    expect(fetch).toHaveBeenCalledTimes(20)
    releases.forEach((release) => release())
    await expect(Promise.all([...first, untrackedRepeat])).resolves.toHaveLength(10)
  })
})
