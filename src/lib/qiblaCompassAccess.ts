export type QiblaCompassAccess = 'granted' | 'denied' | 'unavailable' | 'requires-tap'
export type QiblaNavigationCompassRequest = { result: Promise<QiblaCompassAccess> }

let pending: Promise<QiblaCompassAccess> | null = null
let navigationRequest: QiblaNavigationCompassRequest | null = null

/** Must be invoked directly from the navigation/retry tap, before any await/import. */
export function requestQiblaCompassAccess(): Promise<QiblaCompassAccess> {
  if (pending) return pending
  if (typeof window.DeviceOrientationEvent?.requestPermission !== 'function') {
    return Promise.resolve('unavailable')
  }
  let result: Promise<QiblaCompassAccess>
  try {
    // Do not defer invocation through a Promise callback: iOS needs this gesture.
    const permission = window.DeviceOrientationEvent.requestPermission()
    result = Promise.resolve(permission).then(value => value === 'granted' ? 'granted' : 'denied', () => 'requires-tap')
  } catch {
    result = Promise.resolve('requires-tap')
  }
  pending = result
  void result.then(() => { if (pending === result) pending = null })
  return result
}

export function prepareQiblaCompassAccess(): void {
  navigationRequest = { result: requestQiblaCompassAccess() }
}

export function getQiblaNavigationCompassRequest(): QiblaNavigationCompassRequest | null {
  return navigationRequest
}

export function clearQiblaNavigationCompassRequest(request: QiblaNavigationCompassRequest | null): void {
  if (navigationRequest === request) navigationRequest = null
}
