export type LastCoords = { latitude: number; longitude: number; accuracy?: number }
const LS_KEY = 'lastLocation'

export async function getUserLocation(options: { allowCachedFallback?: boolean } = {}): Promise<GeolocationPosition | { coords: LastCoords } | null> {
  if ('geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000
        })
      )
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
