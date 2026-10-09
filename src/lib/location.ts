export type LastCoords = { latitude: number; longitude: number; accuracy?: number }
const LS_KEY = 'lastLocation'
let pendingPosition: Promise<GeolocationPosition | null> | null = null
let recentPhysicalPosition: { position: GeolocationPosition; receivedAt: number } | null = null

/** Only a successful fix received in this page session, never persisted/manual data. */
export function getRecentPhysicalPosition(maxAgeMs = 60_000): GeolocationPosition | null {
  if (!recentPhysicalPosition) return null
  const age = Date.now() - recentPhysicalPosition.receivedAt
  return age >= 0 && age <= maxAgeMs ? recentPhysicalPosition.position : null
}

function requestPhysicalPosition(): Promise<GeolocationPosition | null> {
  if (pendingPosition) return pendingPosition
  const request = new Promise<GeolocationPosition | null>((resolve) => {
    try {
      navigator.geolocation.getCurrentPosition(
        position => {
          const now = Date.now()
          // A browser may return an up-to-60-second-old fix. Do not extend that
          // fix's age just because this page received it recently.
          const receivedAt = Number.isFinite(position.timestamp) ? Math.min(now, position.timestamp) : now
          recentPhysicalPosition = { position, receivedAt }
          resolve(position)
        },
        () => resolve(null),
        { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 }
      )
    } catch {
      resolve(null)
    }
  })
  pendingPosition = request
  void request.then(() => { if (pendingPosition === request) pendingPosition = null })
  return request
}

export async function getUserLocation(options: { allowCachedFallback?: boolean } = {}): Promise<GeolocationPosition | { coords: LastCoords } | null> {
  if ('geolocation' in navigator) {
    try {
      const pos = await requestPhysicalPosition()
      if (!pos) throw new Error('Location unavailable')
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({
          latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy
        }))
      } catch { /* Live coordinates remain usable if local storage is unavailable. */ }
      return pos
    } catch { /* fall back to cache */ }
  }
  if (options.allowCachedFallback === false) return null
  const cached = localStorage.getItem(LS_KEY)
  if (cached) return { coords: JSON.parse(cached) as LastCoords }
  return null
}
