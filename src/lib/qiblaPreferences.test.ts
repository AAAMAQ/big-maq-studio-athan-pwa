import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QIBLA_AUTO_LOCATION_KEY, QIBLA_PREFERENCES_EVENT, loadAutomaticQiblaLocation, saveAutomaticQiblaLocation } from './qiblaPreferences'

beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

describe('automatic Qibla location preference', () => {
  it('defaults off and never treats malformed values as consent', () => {
    expect(loadAutomaticQiblaLocation()).toBe(false)
    for (const value of ['false', '1', 'TRUE', '{}']) {
      localStorage.setItem(QIBLA_AUTO_LOCATION_KEY, value)
      expect(loadAutomaticQiblaLocation()).toBe(false)
    }
  })

  it('saves opt-in and opt-out and emits a preference notification', () => {
    const listener = vi.fn()
    window.addEventListener(QIBLA_PREFERENCES_EVENT, listener)
    try {
      expect(saveAutomaticQiblaLocation(true)).toBe(true)
      expect(loadAutomaticQiblaLocation()).toBe(true)
      expect(saveAutomaticQiblaLocation(false)).toBe(true)
      expect(loadAutomaticQiblaLocation()).toBe(false)
      expect(listener).toHaveBeenCalledTimes(2)
    } finally {
      window.removeEventListener(QIBLA_PREFERENCES_EVENT, listener)
    }
  })

  it('fails safely when storage is unavailable without reporting successful consent', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
    expect(loadAutomaticQiblaLocation()).toBe(false)
    expect(saveAutomaticQiblaLocation(true)).toBe(false)
  })
})
