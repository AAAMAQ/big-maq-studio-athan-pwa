import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let store: typeof import('./locationStore')
const position = { coords: { latitude: 31.2, longitude: 121.5 }, timestamp: 100_000 }
const getCurrentPosition = vi.fn()

beforeEach(async () => {
  vi.resetModules()
  localStorage.clear()
  getCurrentPosition.mockReset()
  vi.spyOn(Date, 'now').mockReturnValue(100_000)
  vi.stubGlobal('navigator', { geolocation: { getCurrentPosition } })
  store = await import('./locationStore')
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('prepared Qibla physical location', () => {
  it('does not promote persisted device/manual/saved-city data to a prepared physical fix', () => {
    for (const source of ['device', 'manual', 'saved-city'] as const) {
      store.setManualLocation({ ...position.coords, source, updatedAt: new Date().toISOString() })
      expect(store.getRecentDeviceLocation()).toBeNull()
    }
  })
  it('exposes a launch fix immediately and preserves only matching device-address labels', async () => {
    getCurrentPosition.mockImplementation(success => success(position))
    await store.refreshDeviceLocation({ allowCachedFallback: false })
    expect(store.getRecentDeviceLocation()).toMatchObject({ ...position.coords, source: 'device' })
    const fresh = store.getRecentDeviceLocation()!
    store.saveCachedLocation({ ...fresh, city: 'Shanghai', country: 'China' })
    expect(store.getRecentDeviceLocation()?.city).toBe('Shanghai')
    store.saveCachedLocation({ ...fresh, source: 'saved-city', city: 'Wrong profile label' })
    expect(store.getRecentDeviceLocation()?.city).toBeUndefined()
    vi.spyOn(Date, 'now').mockReturnValue(160_001)
    expect(store.getRecentDeviceLocation()).toBeNull()
  })
  it('joins concurrent startup and Qibla location requests instead of prompting twice', async () => {
    let complete!: (value: typeof position) => void
    getCurrentPosition.mockImplementation(success => { complete = success })
    const startup = store.refreshDeviceLocation({ allowCachedFallback: false })
    const qibla = store.refreshDeviceLocation({ allowCachedFallback: false })
    expect(getCurrentPosition).toHaveBeenCalledOnce()
    complete(position)
    expect((await startup).permission).toBe('granted')
    expect((await qibla).location).toMatchObject(position.coords)
  })
})
