/** Local, opt-in permission preparation. This never changes the primary prayer source. */
export const QIBLA_AUTO_LOCATION_KEY = 'athan.qibla.autoLocation.v1'
export const QIBLA_PREFERENCES_EVENT = 'athan-qibla-preferences-change'

export function loadAutomaticQiblaLocation(): boolean {
  try {
    return localStorage.getItem(QIBLA_AUTO_LOCATION_KEY) === 'true'
  } catch {
    return false
  }
}

export function saveAutomaticQiblaLocation(enabled: boolean): boolean {
  try {
    localStorage.setItem(QIBLA_AUTO_LOCATION_KEY, String(enabled))
    window.dispatchEvent(new Event(QIBLA_PREFERENCES_EVENT))
    return true
  } catch {
    return false
  }
}
