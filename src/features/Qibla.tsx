import { useEffect, useMemo, useRef, useState } from 'react'
import { refreshDeviceLocation, reverseGeocodeCoordinates, saveCachedLocation } from '../lib/locationStore'
import {
  isQiblaCompassSupported,
  qiblaHeadingSourceLabel,
  startQiblaCompassEngine,
  type QiblaHeadingSource
} from '../lib/qiblaHeading'

type QiblaMode = 'simple' | 'advanced'
type PermissionStatusText = 'unknown' | 'granted' | 'denied' | 'unavailable'
type Props = {
  go?: (screen: string) => void
}

const KAABA = { lat: 21.4225, lon: 39.8262 }
const MODE_KEY = 'athan.qibla.mode.v1'
const HAPTICS_KEY = 'athan.qibla.haptics.v1'
const STATUS_KEY = 'athan.qibla.status.v1'
const ALIGNMENT_THRESHOLD = 5

function bearingToKaaba(lat: number, lon: number) {
  const phi1 = (lat * Math.PI) / 180
  const phi2 = (KAABA.lat * Math.PI) / 180
  const deltaLambda = ((KAABA.lon - lon) * Math.PI) / 180
  const y = Math.sin(deltaLambda) * Math.cos(phi2)
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda)
  const theta = (Math.atan2(y, x) * 180) / Math.PI
  return normalizeDeg(theta)
}

function distanceToKaabaKm(lat: number, lon: number) {
  const earthKm = 6371
  const dLat = ((KAABA.lat - lat) * Math.PI) / 180
  const dLon = ((KAABA.lon - lon) * Math.PI) / 180
  const phi1 = (lat * Math.PI) / 180
  const phi2 = (KAABA.lat * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLon / 2) ** 2
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function normalizeDeg(degrees: number) {
  const normalized = degrees % 360
  return normalized < 0 ? normalized + 360 : normalized
}

function signedAngle(degrees: number) {
  const normalized = normalizeDeg(degrees)
  return normalized > 180 ? normalized - 360 : normalized
}

function loadMode(): QiblaMode {
  try {
    return localStorage.getItem(MODE_KEY) === 'advanced' ? 'advanced' : 'simple'
  } catch {
    return 'simple'
  }
}

function loadHaptics() {
  try {
    return localStorage.getItem(HAPTICS_KEY) === 'true'
  } catch {
    return false
  }
}

function formatCoordsLabel(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
}

function formatCachedLocationLabel(location: { latitude: number; longitude: number; city?: string; country?: string }) {
  const place = [location.city, location.country].filter(Boolean).join(', ')
  return place || formatCoordsLabel(location.latitude, location.longitude)
}

export default function Qibla({ go }: Props) {
  const [mode, setMode] = useState<QiblaMode>(() => loadMode())
  const [haptics, setHaptics] = useState(() => loadHaptics())
  const [bearing, setBearing] = useState<number | null>(null)
  const [heading, setHeading] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [locationLabel, setLocationLabel] = useState('Finding location…')
  const [status, setStatus] = useState('Finding your location…')
  const [locationStatus, setLocationStatus] = useState<PermissionStatusText>('unknown')
  const [locationAttempt, setLocationAttempt] = useState(0)
  const [compassStatus, setCompassStatus] = useState<PermissionStatusText>('unknown')
  const [needsCompassPermission, setNeedsCompassPermission] = useState(false)
  const [compassEnabled, setCompassEnabled] = useState(false)
  const [headingSource, setHeadingSource] = useState<QiblaHeadingSource | null>(null)
  const [compassDetail, setCompassDetail] = useState('Waiting for an absolute compass heading.')
  const alignedRef = useRef(false)
  const watchIdRef = useRef<number | null>(null)
  const compassReadingRef = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(MODE_KEY, mode)
    } catch {
      // Ignore localStorage failures.
    }
  }, [mode])

  useEffect(() => {
    try {
      localStorage.setItem(HAPTICS_KEY, String(haptics))
    } catch {
      // Ignore localStorage failures.
    }
  }, [haptics])

  useEffect(() => {
    const cancelled = { current: false }
    setLocationStatus('unknown')
    setLocationLabel('Finding location…')
    setStatus('Finding your location…')
    setBearing(null)
    setDistanceKm(null)

    async function initLocation() {
      try {
        if (!('geolocation' in navigator)) {
          setLocationStatus('unavailable')
          setLocationLabel('Location unavailable')
          setStatus('Location is unavailable in this browser.')
          return
        }
        const locState = await refreshDeviceLocation({ allowCachedFallback: false })
        if (cancelled.current) return
        if (!locState.location || locState.permission !== 'granted') {
          setLocationStatus('denied')
          setLocationLabel('Location unavailable')
          setStatus('Could not get your location. Allow location access and tap Enable Location to try again.')
          return
        }

        const updateFromCoords = (latitude: number, longitude: number, label?: string) => {
          const nextBearing = bearingToKaaba(latitude, longitude)
          setBearing(nextBearing)
          setDistanceKm(distanceToKaabaKm(latitude, longitude))
          if (label) setLocationLabel(label)
          setLocationStatus('granted')
          setStatus('Location ready. Waiting for compass heading.')
        }

        if (!cancelled.current) {
          updateFromCoords(
            locState.location.latitude,
            locState.location.longitude,
            formatCachedLocationLabel(locState.location)
          )
          reverseGeocodeCoordinates(locState.location.latitude, locState.location.longitude)
            .then((resolved) => {
              if (!cancelled.current) {
                setLocationLabel(resolved.label)
                saveCachedLocation({
                  ...locState.location!,
                  city: resolved.city,
                  country: resolved.country,
                  countryCode: resolved.countryCode
                })
              }
            })
            .catch(() => {
              // Coordinates are already visible as a fallback.
            })
        }

        if ('geolocation' in navigator) {
          watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
              if (cancelled.current) return
              updateFromCoords(pos.coords.latitude, pos.coords.longitude)
            },
            () => {
              if (cancelled.current) return
              setLocationStatus('denied')
              setStatus('Could not update your location. Tap Enable Location to try again.')
            },
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 }
          )
        }
      } catch {
        if (cancelled.current) return
        setLocationStatus('denied')
        setLocationLabel('Location unavailable')
        setStatus('Could not access location. Check browser permissions and tap Enable Location to try again.')
      }
    }

    initLocation()
    return () => {
      cancelled.current = true
      if (watchIdRef.current != null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      watchIdRef.current = null
    }
  }, [locationAttempt])

  useEffect(() => {
    let active = true
    const needsPermission = !!(window.DeviceOrientationEvent &&
      typeof window.DeviceOrientationEvent.requestPermission === 'function')
    if (!isQiblaCompassSupported()) {
      setCompassStatus('unavailable')
      setCompassDetail('Compass sensors are not available in this browser. Use the numeric Qibla bearing.')
      return
    }

    // Attach the listener on every visit so an already-authorized iPhone can
    // immediately deliver headings without another button press.
    setCompassEnabled(true)
    if (needsPermission) {
      async function reuseCompassPermission() {
        try {
          const permission = await window.DeviceOrientationEvent.requestPermission!()
          if (!active || compassReadingRef.current) return
          setNeedsCompassPermission(permission !== 'granted')
          if (permission !== 'granted') {
            setCompassStatus('denied')
            setCompassDetail('Tap Enable Compass to allow motion access.')
          }
        } catch {
          if (!active || compassReadingRef.current) return
          // Safari requires a tap for a new permission grant. Keep the manual
          // action as a fallback while listening for existing authorization.
          setNeedsCompassPermission(true)
          setCompassDetail('Tap Enable Compass if the direction does not appear.')
        }
      }
      void reuseCompassPermission()
    }
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!compassEnabled) return

    const controller = startQiblaCompassEngine({
      onReading(reading) {
        compassReadingRef.current = true
        setHeading(reading.heading)
        setHeadingSource(reading.source)
        setCompassStatus('granted')
        setNeedsCompassPermission(false)
        setCompassDetail(`${qiblaHeadingSourceLabel(reading.source)} ready. Hold the phone flat and away from magnets or metal.`)
      },
      onUnavailable(detail) {
        setCompassStatus('unavailable')
        setNeedsCompassPermission(typeof window.DeviceOrientationEvent?.requestPermission === 'function')
        setCompassDetail(detail)
      }
    })

    return () => controller.stop()
  }, [compassEnabled])

  const turn = useMemo(() => {
    if (bearing === null || heading === null) return null
    return signedAngle(bearing - heading)
  }, [bearing, heading])

  const aligned = turn !== null && Math.abs(turn) <= ALIGNMENT_THRESHOLD
  const instruction = makeInstruction(turn)

  useEffect(() => {
    if (bearing === null) return
    const nextStatus = {
      compassSupported: isQiblaCompassSupported(),
      compassPermissionNeeded: needsCompassPermission,
      compassStatus,
      locationStatus,
      bearing,
      heading,
      headingSource,
      aligned
    }
    try {
      localStorage.setItem(STATUS_KEY, JSON.stringify(nextStatus))
    } catch {
      // Ignore status persistence failures.
    }
  }, [aligned, bearing, compassStatus, heading, headingSource, locationStatus, needsCompassPermission])

  useEffect(() => {
    if (!haptics || !('vibrate' in navigator)) return
    if (aligned && !alignedRef.current) {
      navigator.vibrate?.(60)
      alignedRef.current = true
    }
    if (!aligned) alignedRef.current = false
  }, [aligned, haptics])

  async function enableCompass() {
    try {
      const permission = await window.DeviceOrientationEvent?.requestPermission?.()
      if (permission === 'granted') {
        setNeedsCompassPermission(false)
        setCompassStatus('unknown')
        setCompassDetail('Motion access granted. Waiting for an absolute compass heading.')
        setCompassEnabled(true)
      } else {
        setCompassStatus('denied')
        setCompassDetail('Compass permission denied. You can still follow the numeric Qibla bearing.')
        setStatus('Compass permission denied. You can still follow the numeric Qibla bearing.')
      }
    } catch {
      setCompassStatus('denied')
      setCompassDetail('Compass permission failed. Check motion/orientation permissions.')
      setStatus('Compass permission failed. Check motion/orientation permissions.')
    }
  }

  function openQiblaHelp() {
    window.location.hash = 'qibla'
    if (go) go('NeedHelp')
    else window.location.hash = '#qibla'
  }

  const displayStatus = locationStatus === 'granted' ? compassDetail : status

  return (
    <div className="mx-auto max-w-3xl p-2 space-y-4">
      <div className="mx-auto flex w-fit rounded-full border border-gray-700 bg-gray-900 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('simple')}
          aria-pressed={mode === 'simple'}
          className={`rounded-full px-4 py-2 ${mode === 'simple' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          {mode === 'simple' ? '✓ ' : ''}Simple
        </button>
        <button
          type="button"
          onClick={() => setMode('advanced')}
          aria-pressed={mode === 'advanced'}
          className={`rounded-full px-4 py-2 ${mode === 'advanced' ? 'bg-teal-700 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
        >
          {mode === 'advanced' ? '✓ ' : ''}Advanced
        </button>
      </div>

      {(locationStatus === 'denied' || locationStatus === 'unavailable') && (
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p role="status" className="mb-3 text-sm text-gray-300">{status}</p>
          <button type="button" onClick={() => setLocationAttempt((attempt) => attempt + 1)} className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-600">
            Enable Location
          </button>
        </div>
      )}

      {mode === 'simple' ? (
        <SimpleQibla
          aligned={aligned}
          bearing={bearing}
          distanceKm={distanceKm}
          enableCompass={enableCompass}
          haptics={haptics}
          heading={heading}
          headingSource={headingSource}
          instruction={instruction}
          locationLabel={locationLabel}
          needsCompassPermission={needsCompassPermission}
          openQiblaHelp={openQiblaHelp}
          setHaptics={setHaptics}
          status={displayStatus}
          turn={turn}
        />
      ) : (
        <AdvancedQibla
          bearing={bearing}
          compassStatus={compassStatus}
          enableCompass={enableCompass}
          heading={heading}
          headingSource={headingSource}
          needsCompassPermission={needsCompassPermission}
          status={displayStatus}
        />
      )}
    </div>
  )
}

function SimpleQibla({
  aligned,
  bearing,
  distanceKm,
  enableCompass,
  haptics,
  heading,
  headingSource,
  instruction,
  locationLabel,
  needsCompassPermission,
  openQiblaHelp,
  setHaptics,
  status,
  turn
}: {
  aligned: boolean
  bearing: number | null
  distanceKm: number | null
  enableCompass: () => void
  haptics: boolean
  heading: number | null
  headingSource: QiblaHeadingSource | null
  instruction: { muted: string; strong: string }
  locationLabel: string
  needsCompassPermission: boolean
  openQiblaHelp: () => void
  setHaptics: (enabled: boolean) => void
  status: string
  turn: number | null
}) {
  const markerRotation = turn ?? bearing ?? 0
  const compassRotation = heading === null ? 0 : -heading

  return (
    <div className="rounded-lg bg-gray-800 px-4 py-5 text-white">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-400">Location</div>
          <div className="mt-1 inline-flex rounded-lg bg-gray-900 px-3 py-2 text-xl font-bold text-gray-100">
            {locationLabel}
          </div>
        </div>
        <button
          type="button"
          onClick={openQiblaHelp}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-teal-300 hover:bg-gray-700"
          title="Qibla help"
        >
          i
        </button>
      </div>

      <div className="mt-10 flex flex-col items-center gap-6">
        <div className={`relative h-64 w-64 rounded-full border ${aligned ? 'border-teal-300 shadow-[0_0_28px_rgba(20,184,166,0.35)]' : 'border-amber-100/80'} bg-gray-50 text-gray-300 transition-all ring-8 ${aligned ? 'ring-teal-500/15' : 'ring-amber-200/25'}`}>
          <div
            className="absolute inset-7 rounded-full"
            style={{ transform: `rotate(${compassRotation}deg)` }}
          >
            <CompassLetter label="N" className="left-1/2 top-2 -translate-x-1/2" />
            <CompassLetter label="E" className="right-3 top-1/2 -translate-y-1/2" />
            <CompassLetter label="S" className="bottom-2 left-1/2 -translate-x-1/2" />
            <CompassLetter label="W" className="left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div
            className="absolute left-1/2 top-1/2 h-[224px] w-[224px] -translate-x-1/2 -translate-y-1/2"
            style={{ transform: `translate(-50%, -50%) rotate(${markerRotation}deg)` }}
          >
            <div className="absolute left-1/2 top-2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-lg shadow-lg shadow-gray-950/40">🕋</div>
          </div>

          <div className="absolute left-1/2 top-1/2 h-32 w-14 -translate-x-1/2 -translate-y-[46%]">
            <QiblaNeedle className="h-full w-full" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-400">
            {instruction.muted} <span className="text-teal-300">{instruction.strong}</span>
          </p>
          <p className="mt-2 text-sm text-gray-300">
            {bearing !== null ? `Qibla ${bearing.toFixed(1)}°` : 'Qibla bearing appears after location is available'}
            {heading !== null ? ` · Heading ${heading.toFixed(0)}°` : ''}
          </p>
          <p className="text-xs text-gray-500">{qiblaHeadingSourceLabel(headingSource)}</p>
          <p className="text-sm text-gray-400">
            {distanceKm !== null ? `${Math.round(distanceKm).toLocaleString()} km to the Ka‘bah` : 'Distance appears after location is available'}
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {needsCompassPermission && heading === null && (
            <button
              type="button"
              onClick={enableCompass}
              className="w-full rounded bg-teal-600 px-4 py-3 font-semibold hover:bg-teal-500"
            >
              Enable Compass
            </button>
          )}

          <label className="flex items-center justify-between rounded bg-gray-900 px-4 py-3 text-sm text-gray-200">
            <span>Haptic feedback when aligned</span>
            <input
              type="checkbox"
              checked={haptics}
              onChange={(event) => setHaptics(event.target.checked)}
              className="h-4 w-4 accent-teal-500"
            />
          </label>

          <p className="rounded bg-gray-900 p-3 text-xs text-gray-400">
            {status}
          </p>
        </div>
      </div>
    </div>
  )
}

function AdvancedQibla({
  bearing,
  compassStatus,
  enableCompass,
  heading,
  headingSource,
  needsCompassPermission,
  status
}: {
  bearing: number | null
  compassStatus: PermissionStatusText
  enableCompass: () => void
  heading: number | null
  headingSource: QiblaHeadingSource | null
  needsCompassPermission: boolean
  status: string
}) {
  const needleRotation = (() => {
    if (bearing == null) return 0
    if (heading == null) return normalizeDeg(bearing)
    return normalizeDeg(bearing - heading)
  })()

  return (
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Qibla Direction</h2>

      {bearing === null ? (
        <p role="status">{status}</p>
      ) : (
        <>
          <p>
            🕋 Qibla: <strong>{bearing.toFixed(1)}°</strong> from True North
            {heading != null && (
              <>
                {' '}· Your heading: <strong>{heading.toFixed(0)}°</strong>
              </>
            )}
          </p>

          <div className="mx-auto w-56 h-56 rounded-full border border-gray-600 relative select-none">
            <div className="absolute inset-2 rounded-full border border-gray-700" />
            <div className="absolute left-1/2 -top-3 -translate-x-1/2 text-xs font-semibold text-gray-400">N</div>
            <div
              className="absolute left-1/2 top-1/2 w-1 h-24 bg-teal-400 origin-bottom rounded"
              style={{ transform: `translate(-50%,-100%) rotate(${needleRotation}deg)` }}
            />
            <div
              className="absolute left-1/2 top-1/2 w-1 h-10 bg-gray-500 origin-top rounded"
              style={{ transform: `translate(-50%,0) rotate(${needleRotation}deg)` }}
            />
          </div>

          {needsCompassPermission && heading == null && (
            <button
              onClick={enableCompass}
              className="px-4 py-2 rounded bg-teal-600 hover:bg-teal-500 text-white"
            >
              Enable Compass
            </button>
          )}

          <p className="text-xs text-gray-400">
            Compass status: {compassStatus} · {qiblaHeadingSourceLabel(headingSource)}.
            Hold the device flat and away from metal; recalibrate compass if asked.
          </p>
          {status && <p className="text-xs text-amber-500">{status}</p>}
        </>
      )}
    </div>
  )
}

function CompassLetter({ label, className }: { label: string; className: string }) {
  return <span className={`absolute text-xl font-semibold text-gray-300/80 ${className}`}>{label}</span>
}

function QiblaNeedle({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 150"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="qiblaNeedleFill" x1="16" y1="10" x2="50" y2="140" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#99f6e4" />
          <stop offset="0.5" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="qiblaNeedleShine" x1="18" y1="18" x2="38" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.55" stopColor="#ccfbf1" stopOpacity="0.16" />
          <stop offset="1" stopColor="#ccfbf1" stopOpacity="0" />
        </linearGradient>
        <filter id="qiblaNeedleShadow" x="-35%" y="-20%" width="170%" height="145%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.28" />
        </filter>
      </defs>
      <path
        d="M32 4C46 4 57 68 59 104C60.5 132 49 146 32 146C15 146 3.5 132 5 104C7 68 18 4 32 4Z"
        fill="url(#qiblaNeedleFill)"
        filter="url(#qiblaNeedleShadow)"
      />
      <path
        d="M32 10C41 14 48 66 50 101C51 124 44 137 32 137C21 137 13 125 14 104C16 72 23 20 32 10Z"
        fill="url(#qiblaNeedleShine)"
      />
    </svg>
  )
}

function makeInstruction(turn: number | null) {
  if (turn === null) return { muted: 'Enable compass to', strong: 'align' }
  const abs = Math.abs(turn)
  if (abs <= ALIGNMENT_THRESHOLD) return { muted: 'You’re facing', strong: 'Makkah' }
  if (abs <= 18) return { muted: 'Turn slightly', strong: turn > 0 ? 'right' : 'left' }
  return { muted: 'Turn to your', strong: turn > 0 ? 'right' : 'left' }
}
