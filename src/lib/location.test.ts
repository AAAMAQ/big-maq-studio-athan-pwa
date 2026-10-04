import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getUserLocation } from './location'

const getCurrentPosition = vi.fn()
beforeEach(() => {
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
})
