import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

let access: typeof import('./qiblaCompassAccess')
const request = vi.fn()
beforeEach(async () => {
  vi.resetModules()
  request.mockReset().mockResolvedValue('granted')
  vi.stubGlobal('DeviceOrientationEvent', { requestPermission: request })
  access = await import('./qiblaCompassAccess')
})
afterEach(() => { vi.unstubAllGlobals() })

describe('Qibla gesture permission broker', () => {
  it('invokes the native request synchronously before navigation/lazy loading can consume the tap', async () => {
    access.prepareQiblaCompassAccess()
    expect(request).toHaveBeenCalledOnce() // No microtask awaited before native invocation.
    const prepared = access.getQiblaNavigationCompassRequest()!
    expect(await prepared.result).toBe('granted')
    access.clearQiblaNavigationCompassRequest(prepared)
    expect(access.getQiblaNavigationCompassRequest()).toBeNull()
    access.prepareQiblaCompassAccess()
    expect(request).toHaveBeenCalledTimes(2)
    await access.getQiblaNavigationCompassRequest()!.result
  })
  it('shares a pending request rather than creating multiple popups from rapid taps', async () => {
    let complete!: (permission: string) => void
    request.mockReturnValue(new Promise(resolve => { complete = resolve }))
    access.prepareQiblaCompassAccess()
    const first = access.getQiblaNavigationCompassRequest()!
    access.prepareQiblaCompassAccess()
    const latest = access.getQiblaNavigationCompassRequest()!
    expect(latest.result).toBe(first.result)
    expect(request).toHaveBeenCalledOnce()
    access.clearQiblaNavigationCompassRequest(first)
    expect(access.getQiblaNavigationCompassRequest()).toBe(latest)
    complete('granted')
    expect(await latest.result).toBe('granted')
  })
  it('settles denial/rejection/throws safely and allows later direct retry', async () => {
    request.mockResolvedValueOnce('denied').mockRejectedValueOnce(new DOMException('Tap required', 'NotAllowedError')).mockImplementationOnce(() => { throw new Error('No access') })
    expect(await access.requestQiblaCompassAccess()).toBe('denied')
    expect(await access.requestQiblaCompassAccess()).toBe('requires-tap')
    expect(await access.requestQiblaCompassAccess()).toBe('requires-tap')
    expect(await access.requestQiblaCompassAccess()).toBe('granted')
  })
  it('does not request iOS permission in browsers without that API or persist authorization', async () => {
    vi.stubGlobal('DeviceOrientationEvent', {})
    const set = vi.spyOn(Storage.prototype, 'setItem')
    expect(await access.requestQiblaCompassAccess()).toBe('unavailable')
    expect(request).not.toHaveBeenCalled()
    expect(set).not.toHaveBeenCalled()
    set.mockRestore()
  })
})
