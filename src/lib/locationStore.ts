import { getUserLocation } from './location'

export type AppLocation = {
  latitude: number
  longitude: number
  city?: string
  country?: string
  countryCode?: string
  timezone?: string
  source: 'device' | 'saved-city' | 'manual'
  updatedAt: string
}

export type LocationState = {
  location: AppLocation | null
  loading: boolean
  permission: 'unknown' | 'granted' | 'denied' | 'unavailable'
  error: string
}

export type LocationAddress = {
  city?: string
  region?: string
  country?: string
  countryCode?: string
  label: string
}

export const LOCATION_CACHE_KEY = 'athan.location.cache.v1'

let memoryState: LocationState = {
  location: loadCachedLocation(),
  loading: false,
  permission: 'unknown',
  error: ''
}

const listeners = new Set<(state: LocationState) => void>()

export function subscribeLocation(listener: (state: LocationState) => void): () => void {
  listeners.add(listener)
  listener(memoryState)
  return () => listeners.delete(listener)
}

export function getLocationState(): LocationState {
  return memoryState
}

export async function refreshDeviceLocation(options: { allowCachedFallback?: boolean } = {}): Promise<LocationState> {
  setState({ ...memoryState, loading: true, error: '' })
  try {
    const loc = await getUserLocation(options)
    if (!loc) {
      setState({ ...memoryState, loading: false, permission: 'denied', error: 'Location permission was not granted.' })
      return memoryState
    }
    const next: AppLocation = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      source: 'device',
      updatedAt: new Date().toISOString()
    }
    saveCachedLocation(next)
    setState({ location: next, loading: false, permission: 'granted', error: '' })
  } catch {
    setState({ ...memoryState, loading: false, permission: 'denied', error: 'Could not refresh device location.' })
  }
  return memoryState
}

export function setManualLocation(location: AppLocation | null): LocationState {
  if (location) saveCachedLocation(location)
  setState({ location, loading: false, permission: location ? 'granted' : 'unknown', error: '' })
  return memoryState
}

export function loadCachedLocation(): AppLocation | null {
  try {
    const raw = localStorage.getItem(LOCATION_CACHE_KEY)
    if (!raw) return null
    return normalizeLocation(JSON.parse(raw))
  } catch {
    return null
  }
}

export function saveCachedLocation(location: AppLocation): void {
  try {
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(normalizeLocation(location)))
  } catch {
    // Ignore storage failures.
  }
}

export async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<LocationAddress> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}&zoom=10&addressdetails=1`
  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) throw new Error('Unable to identify this location.')

  const data = await response.json()
  const address = data?.address ?? {}
  const city = address.city || address.town || address.village || address.hamlet || address.municipality || address.county
  const region = address.state || address.region
  const country = address.country
  const countryCode = typeof address.country_code === 'string' ? address.country_code.toUpperCase() : undefined
  const parts = [city, region, country].filter(Boolean)

  return {
    city: typeof city === 'string' ? city : undefined,
    region: typeof region === 'string' ? region : undefined,
    country: typeof country === 'string' ? country : undefined,
    countryCode,
    label: parts.length > 0 ? parts.join(', ') : data?.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
  }
}

function setState(next: LocationState) {
  memoryState = next
  listeners.forEach((listener) => listener(memoryState))
}

function normalizeLocation(value: unknown): AppLocation | null {
  const maybe = value && typeof value === 'object' ? value as Partial<AppLocation> : null
  const latitude = Number(maybe?.latitude)
  const longitude = Number(maybe?.longitude)
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  return {
    latitude,
    longitude,
    city: typeof maybe?.city === 'string' ? maybe.city : undefined,
    country: typeof maybe?.country === 'string' ? maybe.country : undefined,
    countryCode: typeof maybe?.countryCode === 'string' ? maybe.countryCode : undefined,
    timezone: typeof maybe?.timezone === 'string' ? maybe.timezone : undefined,
    source: maybe?.source === 'saved-city' || maybe?.source === 'manual' ? maybe.source : 'device',
    updatedAt: typeof maybe?.updatedAt === 'string' ? maybe.updatedAt : new Date().toISOString()
  }
}
