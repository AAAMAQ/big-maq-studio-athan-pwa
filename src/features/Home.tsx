// src/features/Home.tsx
import { useEffect, useState } from 'react'
import type { Screen } from '../types/nav'
import { formatHijri } from '../lib/hijri'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { formatPrimaryPrayerTime, getPrimaryPrayerContext, loadPrimarySavedCity, primaryTimeViewLabel, sourceDateKey } from '../lib/primaryPrayerSource'
import { getRamadanDay, getRamadanStatus, loadRamadanSettings } from '../lib/ramadan'
import { loadSavedCityTimeView, type SavedCityTimeView } from '../lib/preferences'
import { getPrayerProgress, getPrayerWindow, type PrayerWindow } from '../lib/prayerWindow'
import { dateKeyAnchor, sourceWeekday } from '../lib/sourceTime'


export default function Home({ go }: { go: (tab: Screen) => void }) {
  const [language] = useState<AppLanguage>(() => loadLanguage())
  const [hijri, setHijri] = useState(() => formatHijri(new Date(), language))
  const [savedCity] = useState(loadPrimarySavedCity)
  const [locationLabel, setLocationLabel] = useState('Location not available')
  const [prayerWindow, setPrayerWindow] = useState<PrayerWindow | null>(null)
  const [prayerSchedule, setPrayerSchedule] = useState<Awaited<ReturnType<typeof getPrimaryPrayerContext>> | null>(null)
  const [timeView] = useState<SavedCityTimeView>(loadSavedCityTimeView)
  const [countdown, setCountdown] = useState('—:—:—')
  const [ramadanDay] = useState(() => {
    const settings = loadRamadanSettings()
    return getRamadanStatus(settings) === 'active' ? getRamadanDay(settings) : null
  })
  const isFriday = prayerSchedule ? sourceWeekday(prayerSchedule.dateKey) === 5 : new Date().getDay() === 5
  

  // Compute the active prayer source selected in Settings.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const context = await getPrimaryPrayerContext()
        if (cancelled) return
        setLocationLabel(context.locationLabel)
        setPrayerSchedule(context)
        setHijri(formatHijri(dateKeyAnchor(context.dateKey), language))
      } catch {
        if (!cancelled) setLocationLabel('Location not available')
        // silently ignore; UI will show dashes
      }
    })()
    return () => { cancelled = true }
  }, [savedCity, language])

  useEffect(() => {
    if (!prayerSchedule) return
    const updatePrayerWindow = () => {
      const window = getPrayerWindow(prayerSchedule.times, new Date(), prayerSchedule.nextFajr)
      setPrayerWindow(window)
      if (sourceDateKey(prayerSchedule, new Date()) !== prayerSchedule.dateKey) {
        getPrimaryPrayerContext().then((context) => {
          setPrayerSchedule(context)
          setHijri(formatHijri(dateKeyAnchor(context.dateKey), language))
        }).catch(() => { /* Keep the last known schedule visible. */ })
      }
    }
    updatePrayerWindow()
    const interval = window.setInterval(updatePrayerWindow, 30_000)
    return () => window.clearInterval(interval)
  }, [prayerSchedule, language])

  // live countdown
  useEffect(() => {
    if (!prayerWindow) return
    const updateCountdown = () => {
      const diff = Math.max(0, prayerWindow.nextTime.getTime() - Date.now())
      const h = Math.floor(diff / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      const s = Math.floor((diff % 60_000) / 1_000)
      const pad = (n: number) => n.toString().padStart(2, '0')
      setCountdown(`${pad(h)}:${pad(m)}:${pad(s)}`)
    }
    updateCountdown()
    const id = setInterval(updateCountdown, 1000)
    return () => clearInterval(id)
  }, [prayerWindow])

  // simple hard-nav for static pages (no router required)
 // const goPath = (path: string) => { window.location.href = path }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">Athan App</h1>
        <p className="text-sm text-gray-300">{hijri}</p>
        {prayerSchedule && <p className="mt-1 text-xs text-gray-500">{prayerSchedule.savedCity ? 'Saved city date' : 'Prayer source date'}: {prayerSchedule.dateKey}</p>}
        {isFriday && (
          <p className="mt-2 rounded-lg border border-teal-700 bg-teal-950/40 px-3 py-2 text-sm font-semibold text-teal-200">
            Jumu’ah Mubarak
          </p>
        )}
        <p className={`mt-1 text-sm ${savedCity ? 'font-semibold text-teal-300' : 'text-gray-400'}`}>
          {savedCity ? `Saved City: ${locationLabel}` : locationLabel}
        </p>
        {prayerSchedule && <p className="mt-1 text-xs text-gray-400">{primaryTimeViewLabel(prayerSchedule, timeView)}</p>}
      </div>

      <section className="rounded-lg border border-gray-700 bg-gray-800 p-4" aria-labelledby="current-prayer-title">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div id="current-prayer-title" className="text-xs font-semibold uppercase text-gray-400">Current Prayer</div>
            <div className="mt-1 text-2xl font-bold text-white">
              {prayerWindow ? prayerWindow.currentName : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">Next: {prayerWindow?.nextName ?? '—'} {prayerWindow && prayerSchedule && `at ${formatPrimaryPrayerTime(prayerSchedule, prayerWindow.nextTime, timeView)}`}</div>
            <div className="font-mono text-lg text-teal-300" aria-live="polite">{countdown}</div>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-700">
          <div
            className="h-full rounded-full bg-teal-400 transition-[width] duration-1000"
            style={{ width: `${getPrayerProgress(prayerWindow)}%` }}
          />
        </div>
      </section>

      {ramadanDay && (
        <button
          type="button"
          onClick={() => go('RamadanMode')}
          className="w-full rounded-lg border border-teal-700 bg-teal-950/40 p-4 text-left hover:bg-teal-900/40"
        >
          <div className="text-sm text-teal-200">Ramadan Mode</div>
          <div className="text-xl font-bold">Ramadan Day {ramadanDay}</div>
          <div className="text-xs text-gray-300">Open Ramadan Mode for Suhoor, Iftar, fasting, and Eid tracking.</div>
        </button>
      )}

      {/* Simple vertical actions */}
      <div className="space-y-3">
        <HomeButton label={t('quran', language)} onClick={() => go('Quran')} />
        <HomeButton label={t('qibla', language)} onClick={() => go('Qibla')} />
        <HomeButton label="More" onClick={() => go('More')} />
        <HomeButton label={t('credits', language)} onClick={() => go('Credits')} />
        
      </div>
    </div>
  )
}

function HomeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-gray-800 rounded-lg p-4 text-center font-semibold hover:bg-gray-700"
    > 
      {label}
    </button>
  )
}
