import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
let getUserLocation: typeof import('./location').getUserLocation
let getRecentPhysicalPosition: typeof import('./location').getRecentPhysicalPosition

const getCurrentPosition = vi.fn()
beforeEach(async () => {
  vi.resetModules()
  ;({ getUserLocation, getRecentPhysicalPosition } = await import('./location'))
  localStorage.clear()
  getCurrentPosition.mockReset()
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('location freshness for Qibla', () => {
  it('allows other screens to keep their cached fallback but lets Qibla require live location', async () => {
    localStorage.setItem('lastLocation', JSON.stringify({ latitude: 13, longitude: 80 }))
    getCurrentPosition.mockImplementation((_success, error) => error(new Error('Denied')))
    expect(await getUserLocation()).toEqual({ coords: { latitude: 13, longitude: 80 } })
    expect(await getUserLocation({ allowCachedFallback: false })).toBeNull()
  })
  it('uses granted coordinates even when localStorage is unavailable', async () => {
    const position = { coords: { latitude: 31, longitude: 121, accuracy: 10 } }
    getCurrentPosition.mockImplementation((success) => success(position))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Storage full') })
    expect(await getUserLocation({ allowCachedFallback: false })).toBe(position)
  })
  it('shares an in-flight physical request while retaining each caller’s fallback rules', async () => {
    let fail!: () => void
    getCurrentPosition.mockImplementation((_success, error) => { fail = () => error(new Error('Denied')) })
    localStorage.setItem('lastLocation', JSON.stringify({ latitude: 13, longitude: 80 }))
    const normal = getUserLocation()
    const qibla = getUserLocation({ allowCachedFallback: false })
    expect(getCurrentPosition).toHaveBeenCalledOnce()
    fail()
    expect(await normal).toEqual({ coords: { latitude: 13, longitude: 80 } })
    expect(await qibla).toBeNull()
    expect(getRecentPhysicalPosition()).toBeNull()
  })
  it('reuses only session-verified fixes for at most 60 seconds, not persisted coordinates', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000)
    localStorage.setItem('lastLocation', JSON.stringify({ latitude: 13, longitude: 80 }))
    expect(getRecentPhysicalPosition()).toBeNull()
    const position = { coords: { latitude: 31, longitude: 121 }, timestamp: 100_000 }
    getCurrentPosition.mockImplementation(success => success(position))
    await getUserLocation({ allowCachedFallback: false })
    expect(getRecentPhysicalPosition()).toBe(position)
    vi.spyOn(Date, 'now').mockReturnValue(160_001)
    expect(getRecentPhysicalPosition()).toBeNull()
  })
  it('uses the actual fix timestamp instead of extending an old browser fix', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(100_000)
    getCurrentPosition.mockImplementation(success => success({ coords: { latitude: 31, longitude: 121 }, timestamp: 39_999 }))
    await getUserLocation({ allowCachedFallback: false })
    expect(getRecentPhysicalPosition()).toBeNull()
  })
  it('clears request deduplication after failure so a later explicit retry can succeed', async () => {
    getCurrentPosition.mockImplementationOnce((_success, error) => error(new Error('Denied')))
    expect(await getUserLocation({ allowCachedFallback: false })).toBeNull()
    const position = { coords: { latitude: 31, longitude: 121 } }
    getCurrentPosition.mockImplementationOnce(success => success(position))
    expect(await getUserLocation({ allowCachedFallback: false })).toBe(position)
    expect(getCurrentPosition).toHaveBeenCalledTimes(2)
  })
})
