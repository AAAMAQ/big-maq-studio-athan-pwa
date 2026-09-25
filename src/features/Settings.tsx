import { useEffect, useState } from 'react'
import PwaStatus from '../components/PwaStatus'
import {
  COUNTRY_PRAYER_CONFIGS,
  detectCountryCode,
  getCountryPrayerConfig
} from '../data/countryPrayerMethods'
import { buildIcsForDates, downloadICS } from '../lib/ics'
import { LANGUAGE_LABELS, loadLanguage, saveLanguage, t, type AppLanguage } from '../lib/i18n'
import {
  loadCachedLocation,
  refreshDeviceLocation,
  reverseGeocodeCoordinates,
  saveCachedLocation
} from '../lib/locationStore'
import {
  computePrayerTimes,
  loadSettings,
  saveSettings,
  type HighLatKey,
  type MadhabKey,
  type MethodKey,
  type PrayerSettings
} from '../lib/prayer'
import {
  loadShowSunnah,
  loadTimeFormatPreference,
  saveShowSunnah,
  saveTimeFormatPreference,
  type TimeFormatPreference
} from '../lib/preferences'
import {
  loadSavedCities,
  loadTravelDestinationId,
  setTravelDestinationId
} from '../lib/savedCities'
import {
  clampJumuahTime,
  loadJumuahReminderSettings,
  saveJumuahReminderSettings,
  type JumuahReminderSettings
} from '../lib/iqama'
import {
  loadSalahReminderPreferences,
  saveSalahReminderPreferences,
  type SalahReminderPreferences
} from '../lib/salahReminder'
import {
  buildSettingsExtraReminderItems,
  loadFixedIshaEnabled,
  saveFixedIshaEnabled,
  type SettingsCalendarItem
} from '../lib/settingsCalendar'

const METHODS: MethodKey[] = [
  'MuslimWorldLeague',
  'UmmAlQura',
  'Egyptian',
  'Karachi',
  'Dubai',
  'Qatar',
  'Kuwait',
  'MoonsightingCommittee',
  'NorthAmerica',
  'Singapore',
  'Tehran',
  'Turkey'
]
const MADHABS: MadhabKey[] = ['Shafi', 'Hanafi']
const HIGHLATS: HighLatKey[] = ['MiddleOfTheNight', 'SeventhOfTheNight', 'TwilightAngle']
const REMINDER_OFFSETS = [5, 10, 15, 20, 30, 45, 50]
const COUNTRIES = [...COUNTRY_PRAYER_CONFIGS].sort((a, b) => a.countryName.localeCompare(b.countryName))

const LS_OFFSET = 'reminderOffsetMin'
const LS_ISHA_FIXED = 'ishaFixedTime'
const LS_CALCULATION_MODE = 'athan.prayer.calculationMode.v1'
const LS_AUTO_COUNTRY = 'athan.prayer.autoCountry.v1'

type CalculationMode = 'auto' | 'manual'

type Props = {
  go?: (screen: string) => void
}

type InitialPrayerState = {
  calculationMode: CalculationMode
  countryCode: string
  manualSettings: PrayerSettings
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Keep Settings usable in restricted browsing modes.
  }
}

function settingsForCountry(countryCode: string): PrayerSettings {
  const config = getCountryPrayerConfig(countryCode)
  return {
    method: config.defaultMethod,
    madhab: config.defaultMadhab,
    highLatRule: config.highLatitudeRule
  }
}

function loadInitialPrayerState(): InitialPrayerState {
  const storedMode = readStorage(LS_CALCULATION_MODE)
  const hasLegacyManualSettings = Boolean(
    readStorage('method') || readStorage('madhab') || readStorage('highLatRule')
  )
  const calculationMode: CalculationMode = storedMode === 'auto'
    ? 'auto'
    : storedMode === 'manual' || hasLegacyManualSettings
      ? 'manual'
      : 'auto'
  const cachedCountry = loadCachedLocation()?.countryCode
  const storedCountry = readStorage(LS_AUTO_COUNTRY)
  const countryCode = (
    cachedCountry
      ? detectCountryCode(cachedCountry)
      : storedCountry
        ? detectCountryCode(storedCountry)
        : null
  ) || ''

  return {
    calculationMode,
    countryCode,
    manualSettings: loadSettings()
  }
}

function methodLabel(method: MethodKey): string {
  const labels: Record<MethodKey, string> = {
    MuslimWorldLeague: 'Muslim World League',
    UmmAlQura: 'Umm al-Qura',
    Egyptian: 'Egyptian General Authority',
    Karachi: 'University of Islamic Sciences, Karachi',
    Dubai: 'Dubai',
    Qatar: 'Qatar',
    Kuwait: 'Kuwait',
    MoonsightingCommittee: 'Moonsighting Committee',
    NorthAmerica: 'Islamic Society of North America',
    Singapore: 'Singapore',
    Tehran: 'Tehran',
    Turkey: 'Turkey'
  }
  return labels[method]
}

function countryLabel(countryCode: string, fallback: string, language: AppLanguage): string {
  try {
    return new Intl.DisplayNames([language], { type: 'region' }).of(countryCode) || fallback
  } catch {
    return fallback
  }
}

export default function Settings({ go }: Props) {
  const [initial] = useState(loadInitialPrayerState)
  const [manualSettings, setManualSettings] = useState(initial.manualSettings)
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(initial.calculationMode)
  const [countryCode, setCountryCode] = useState(initial.countryCode)
  const [language, setLanguage] = useState<AppLanguage>(() => loadLanguage())
  const [timeFormat, setTimeFormat] = useState<TimeFormatPreference>(() => loadTimeFormatPreference())
  const [showSunnah, setShowSunnah] = useState(() => loadShowSunnah())
  const [savedCities] = useState(loadSavedCities)
  const [homeCityId, setHomeCityId] = useState(loadTravelDestinationId)
  const [offsetMin, setOffsetMin] = useState(() => {
    const raw = readStorage(LS_OFFSET) ?? readStorage('reminderMinutesBefore') ?? '20'
    const value = Number.parseInt(raw, 10)
    return Number.isFinite(value) ? Math.max(1, value) : 20
  })
  const [ishaTime, setIshaTime] = useState(() => readStorage(LS_ISHA_FIXED) || '22:00')
  const [fixedIshaEnabled, setFixedIshaEnabled] = useState(loadFixedIshaEnabled)
  const [jumuahReminder, setJumuahReminder] = useState<JumuahReminderSettings>(loadJumuahReminderSettings)
  const [salahReminder, setSalahReminder] = useState<SalahReminderPreferences>(loadSalahReminderPreferences)
  const [message, setMessage] = useState('')

  const autoConfig = getCountryPrayerConfig(countryCode)
  const effectiveSettings = calculationMode === 'auto'
    ? settingsForCountry(countryCode)
    : manualSettings

  useEffect(() => {
    if (calculationMode !== 'auto') return
    saveSettings(settingsForCountry(countryCode))
  }, [calculationMode, countryCode])

  useEffect(() => {
    writeStorage(LS_OFFSET, String(Math.max(1, offsetMin)))
  }, [offsetMin])

  useEffect(() => {
    writeStorage(LS_ISHA_FIXED, ishaTime)
  }, [ishaTime])

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [message])

  useEffect(() => {
    if (calculationMode !== 'auto') return
    let cancelled = false

    resolveCurrentDeviceCountry()
      .then((result) => {
        if (!result || cancelled) return
        setCountryCode(result.countryCode)
        writeStorage(LS_AUTO_COUNTRY, result.countryCode)
        saveSettings(settingsForCountry(result.countryCode))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [calculationMode])

  function updateManualSetting<K extends keyof PrayerSettings>(key: K, value: PrayerSettings[K]) {
    const next = { ...manualSettings, [key]: value }
    setManualSettings(next)
    saveSettings(next)
  }

  function changeCalculationMode(mode: CalculationMode) {
    if (mode === calculationMode) return
    if (mode === 'manual') {
      const currentAutoSettings = settingsForCountry(countryCode)
      setManualSettings(currentAutoSettings)
      saveSettings(currentAutoSettings)
    }
    setCalculationMode(mode)
    writeStorage(LS_CALCULATION_MODE, mode)
    setMessage(mode === 'auto' ? t('autoApplied', language) : t('manualOverride', language))
  }

  function changeAutoCountry(nextCountryCode: string) {
    setCountryCode(nextCountryCode)
    writeStorage(LS_AUTO_COUNTRY, nextCountryCode)
    if (calculationMode === 'auto') {
      saveSettings(settingsForCountry(nextCountryCode))
      setMessage(t('autoApplied', language))
    }
  }

  async function useCurrentLocationCountry() {
    setMessage(t('identifyingCountry', language))
    let result: Awaited<ReturnType<typeof resolveCurrentDeviceCountry>>
    try {
      result = await resolveCurrentDeviceCountry()
    } catch {
      setMessage(t('countryLookupUnavailable', language))
      return
    }
    if (!result) {
      setMessage(t('locationPermissionRequired', language))
      return
    }

    if (!result.countryCode) {
      setMessage(t('countryLookupUnavailable', language))
      return
    }

    changeAutoCountry(result.countryCode)
    const config = getCountryPrayerConfig(result.countryCode)
    setMessage(`${t('countryDetected', language)}: ${countryLabel(result.countryCode, config.countryName, language)}`)
  }

  function updateLanguage(value: AppLanguage) {
    setLanguage(value)
    saveLanguage(value)
    setMessage(t('languageSaved', value))
  }

  function updateTimeFormat(value: TimeFormatPreference) {
    setTimeFormat(value)
    saveTimeFormatPreference(value)
    setMessage(t('timeFormatSaved', language))
  }

  function updateShowSunnah(value: boolean) {
    setShowSunnah(value)
    saveShowSunnah(value)
    setMessage(t('sunnahPreferenceSaved', language))
  }

  function updateHomePrayerSource(cityId: string) {
    setHomeCityId(cityId)
    setTravelDestinationId(cityId)
    setMessage(t('homePrayerSourceSaved', language))
  }

  function updateFixedIsha(value: boolean) {
    setFixedIshaEnabled(saveFixedIshaEnabled(value))
  }

  function updateJumuahReminder(next: Partial<JumuahReminderSettings>) {
    const updated = {
      ...jumuahReminder,
      ...next,
      time: clampJumuahTime(next.time ?? jumuahReminder.time)
    }
    setJumuahReminder(updated)
    saveJumuahReminderSettings(updated)
  }

  function updateSalahReminder(next: Partial<SalahReminderPreferences>) {
    setSalahReminder(saveSalahReminderPreferences({ ...salahReminder, ...next }))
  }

  async function exportIcs(days: number, label: string) {
    const locationState = await refreshDeviceLocation()
    if (!locationState.location) {
      setMessage(t('locationPermissionRequired', language))
      return
    }

    const base = new Date()
    const all: SettingsCalendarItem[] = []
    for (let dayIndex = 0; dayIndex < days; dayIndex += 1) {
      const day = new Date(base)
      day.setDate(day.getDate() + dayIndex)
      const times = computePrayerTimes(
        {
          latitude: locationState.location.latitude,
          longitude: locationState.location.longitude
        },
        day,
        effectiveSettings
      )
      all.push(
        { title: 'Fajr', when: times.fajr },
        { title: 'Sunrise', when: times.sunrise },
        { title: 'Dhuhr', when: times.dhuhr },
        { title: 'Asr', when: times.asr },
        { title: 'Maghrib', when: times.maghrib },
        { title: 'Isha', when: times.isha }
      )
      all.push(...buildSettingsExtraReminderItems(day, {
        fixedIshaEnabled,
        fixedIshaTime: ishaTime,
        jumuah: jumuahReminder,
        salahReview: salahReminder
      }))
    }

    const effectiveOffset = Math.max(1, offsetMin)
    const ics = buildIcsForDates(all, `Athan Reminders (${label})`, 'ATHAN-PWA', effectiveOffset)
    downloadICS(
      `athan-reminders-${label}_${locationState.location.latitude.toFixed(3)}_${locationState.location.longitude.toFixed(3)}.ics`,
      ics
    )
    setMessage(t('calendarDownloaded', language))
  }

  function openBackupRestore() {
    if (go) go('BackupRestore')
    else window.location.hash = '#BackupRestore'
  }

  const selectClass = 'mt-2 w-full rounded-md border border-gray-700 bg-gray-950 px-3 py-3 text-sm text-gray-100 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20'
  const sectionClass = 'rounded-lg border border-gray-700/80 bg-gray-800/90 p-4 shadow-sm sm:p-5'

  return (
    <div className="mx-auto max-w-2xl space-y-4 pb-6">
      <header className="space-y-1 px-1">
        <h1 className="text-2xl font-bold text-white">{t('settings', language)}</h1>
        <p className="text-sm text-gray-400">{t('settingsSubtitle', language)}</p>
      </header>

      <section className={sectionClass}>
        <div className="mb-4">
          <h2 className="font-semibold text-white">{t('languageAndLayout', language)}</h2>
          <p className="mt-1 text-xs leading-5 text-gray-400">{t('preferencesHelp', language)}</p>
        </div>
        <label className="block text-sm font-medium text-gray-300" htmlFor="app-language">
          {t('language', language)}
        </label>
        <select
          id="app-language"
          className={selectClass}
          value={language}
          onChange={(event) => updateLanguage(event.target.value as AppLanguage)}
        >
          {(Object.keys(LANGUAGE_LABELS) as AppLanguage[]).map((key) => (
            <option key={key} value={key}>{LANGUAGE_LABELS[key]}</option>
          ))}
        </select>

        <label className="mt-4 block text-sm font-medium text-gray-300" htmlFor="time-format">
          {t('timeFormat', language)}
        </label>
        <select
          id="time-format"
          className={selectClass}
          value={timeFormat}
          onChange={(event) => updateTimeFormat(event.target.value as TimeFormatPreference)}
        >
          <option value="device">{t('deviceDefault', language)}</option>
          <option value="12h">{t('amPm', language)}</option>
          <option value="24h">{t('twentyFourHour', language)}</option>
        </select>
        <p className="mt-2 text-xs leading-5 text-gray-400">{t('timeFormatHelp', language)}</p>

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-md border border-gray-700 bg-gray-950/60 p-3">
          <input
            type="checkbox"
            checked={showSunnah}
            onChange={(event) => updateShowSunnah(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-teal-500"
          />
          <span>
            <span className="block text-sm font-medium text-gray-200">{t('showSunnah', language)}</span>
            <span className="mt-1 block text-xs leading-5 text-gray-400">{t('showSunnahHelp', language)}</span>
          </span>
        </label>
      </section>

      <section className={sectionClass}>
        <div>
          <h2 className="font-semibold text-white">{t('homePrayerSource', language)}</h2>
          <p className="mt-1 text-xs leading-5 text-gray-400">{t('homePrayerSourceHelp', language)}</p>
        </div>
        <label className="mt-4 block text-sm font-medium text-gray-300" htmlFor="home-prayer-source">
          {t('homePrayerSource', language)}
        </label>
        <select
          id="home-prayer-source"
          className={selectClass}
          value={homeCityId}
          onChange={(event) => updateHomePrayerSource(event.target.value)}
        >
          <option value="">{t('currentDeviceLocation', language)}</option>
          {savedCities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name || city.city || 'Saved city'}{city.country ? `, ${city.country}` : ''}
            </option>
          ))}
        </select>
        {savedCities.length === 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-gray-700 bg-gray-950/60 p-3">
            <p className="text-xs text-gray-400">{t('noSavedCitiesForHome', language)}</p>
            <button
              type="button"
              onClick={() => go?.('SavedCities')}
              className="min-h-9 rounded-md border border-teal-800 px-3 text-xs font-semibold text-teal-300"
            >
              {t('openCityMode', language)}
            </button>
          </div>
        )}
      </section>

      <section className={sectionClass}>
        <div className="mb-4">
          <h2 className="font-semibold text-white">{t('prayerCalculation', language)}</h2>
          <p className="mt-1 text-xs leading-5 text-gray-400">{t('prayerCalculationHelp', language)}</p>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-300">{t('calculationMode', language)}</span>
          <div className="mt-2 grid grid-cols-2 rounded-md border border-gray-700 bg-gray-950 p-1">
            {(['auto', 'manual'] as CalculationMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => changeCalculationMode(mode)}
                aria-pressed={calculationMode === mode}
                className={`min-h-10 rounded px-3 text-sm font-semibold transition ${
                  calculationMode === mode
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {t(mode, language)}
              </button>
            ))}
          </div>
        </div>

        {calculationMode === 'auto' ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300" htmlFor="auto-country">
                {t('autoCountry', language)}
              </label>
              <select
                id="auto-country"
                className={selectClass}
                value={countryCode}
                onChange={(event) => changeAutoCountry(event.target.value)}
              >
                {!countryCode && <option value="">Global fallback</option>}
                {COUNTRIES.map((country) => (
                  <option key={country.countryCode} value={country.countryCode}>
                    {countryLabel(country.countryCode, country.countryName, language)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={useCurrentLocationCountry}
                className="mt-2 min-h-10 rounded-md border border-teal-700 bg-teal-950/40 px-3 text-sm font-semibold text-teal-200 transition hover:bg-teal-900/60"
              >
                {t('useCurrentLocation', language)}
              </button>
              <p className="mt-2 text-xs leading-5 text-gray-400">{t('autoCountryHelp', language)}</p>
            </div>

            <dl className="grid gap-2 rounded-md border border-teal-900/70 bg-gray-950/70 p-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-gray-500">{t('calculationMethod', language)}</dt>
                <dd className="mt-1 font-medium text-teal-200">{methodLabel(autoConfig.defaultMethod)}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">{t('asrTiming', language)}</dt>
                <dd className="mt-1 font-medium text-teal-200">
                  {t(autoConfig.defaultMadhab === 'Hanafi' ? 'lateAsr' : 'earlyAsr', language)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">{t('highLatitudeRule', language)}</dt>
                <dd className="mt-1 font-medium text-teal-200">
                  {t(highLatitudeTranslationKey(autoConfig.highLatitudeRule), language)}
                </dd>
              </div>
            </dl>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('calculationMethod', language)}
              <select
                className={selectClass}
                value={manualSettings.method}
                onChange={(event) => updateManualSetting('method', event.target.value as MethodKey)}
              >
                {METHODS.map((method) => <option key={method} value={method}>{methodLabel(method)}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-300">
              {t('asrTiming', language)}
              <select
                className={selectClass}
                value={manualSettings.madhab}
                onChange={(event) => updateManualSetting('madhab', event.target.value as MadhabKey)}
              >
                {MADHABS.map((madhab) => (
                  <option key={madhab} value={madhab}>
                    {t(madhab === 'Hanafi' ? 'lateAsr' : 'earlyAsr', language)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-gray-300 sm:col-span-2">
              {t('highLatitudeRule', language)}
              <select
                className={selectClass}
                value={manualSettings.highLatRule}
                onChange={(event) => updateManualSetting('highLatRule', event.target.value as HighLatKey)}
              >
                {HIGHLATS.map((rule) => (
                  <option key={rule} value={rule}>{t(highLatitudeTranslationKey(rule), language)}</option>
                ))}
              </select>
            </label>
          </div>
        )}
        <p className="mt-4 text-xs leading-5 text-amber-200/80">{t('regionalGuidance', language)}</p>
      </section>

      <section className={sectionClass}>
        <div className="mb-4">
          <h2 className="font-semibold text-white">{t('calendarReminders', language)}</h2>
          <p className="mt-1 text-xs leading-5 text-gray-400">{t('calendarRemindersHelp', language)}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-300">
            {t('reminderOffset', language)}
            <select
              className={selectClass}
              value={offsetMin}
              onChange={(event) => setOffsetMin(Math.max(1, Number.parseInt(event.target.value || '20', 10)))}
            >
              {REMINDER_OFFSETS.map((value) => (
                <option key={value} value={value}>{value} {t('minutes', language)}</option>
              ))}
            </select>
          </label>
          <div className="rounded-md border border-gray-700 bg-gray-900 p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <input type="checkbox" checked={fixedIshaEnabled} onChange={(event) => updateFixedIsha(event.target.checked)} className="h-4 w-4 accent-teal-600" />
              {t('fixedIshaReminder', language)}
            </label>
            <input
              aria-label={t('fixedIshaReminder', language)}
              className={selectClass}
              type="time"
              value={ishaTime}
              disabled={!fixedIshaEnabled}
              onChange={(event) => setIshaTime(event.target.value)}
            />
            <span className="mt-2 block text-xs leading-5 text-gray-400">{t('fixedIshaHelp', language)}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-md border border-gray-700 bg-gray-900 p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <input type="checkbox" checked={jumuahReminder.include} onChange={(event) => updateJumuahReminder({ include: event.target.checked })} className="h-4 w-4 accent-teal-600" />
              {t('jumuahCalendarReminder', language)}
            </label>
            <input
              aria-label={t('jumuahCalendarReminderTime', language)}
              className={selectClass}
              type="time"
              min="05:00"
              max="11:00"
              value={jumuahReminder.time}
              disabled={!jumuahReminder.include}
              onChange={(event) => updateJumuahReminder({ time: event.target.value })}
            />
            <p className="mt-2 text-xs leading-5 text-gray-400">{t('jumuahCalendarReminderHelp', language)}</p>
          </div>

          <div className="rounded-md border border-gray-700 bg-gray-900 p-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-200">
              <input type="checkbox" checked={salahReminder.enabled} onChange={(event) => updateSalahReminder({ enabled: event.target.checked })} className="h-4 w-4 accent-teal-600" />
              {t('salahTrackerCalendarReminder', language)}
            </label>
            <input
              aria-label={t('salahTrackerCalendarReminderTime', language)}
              className={selectClass}
              type="time"
              value={salahReminder.time}
              disabled={!salahReminder.enabled}
              onChange={(event) => updateSalahReminder({ time: event.target.value })}
            />
            <p className="mt-2 text-xs leading-5 text-gray-400">{t('salahTrackerCalendarReminderHelp', language)}</p>
          </div>
        </div>

        <p className="mt-3 text-xs leading-5 text-gray-400">{t('optionalCalendarReminderHelp', language)}</p>

        <button
          type="button"
          onClick={() => {
            writeStorage(LS_OFFSET, String(Math.max(1, offsetMin)))
            writeStorage(LS_ISHA_FIXED, ishaTime)
            saveFixedIshaEnabled(fixedIshaEnabled)
            saveJumuahReminderSettings(jumuahReminder)
            saveSalahReminderPreferences(salahReminder)
            setMessage(t('reminderUpdated', language))
          }}
          className="mt-4 min-h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          {t('updateReminder', language)}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <ExportButton label={t('exportOneDay', language)} onClick={() => exportIcs(1, '1-day')} />
          <ExportButton label={t('exportSevenDays', language)} onClick={() => exportIcs(7, '7-days')} />
          <ExportButton label={t('exportThirtyDays', language)} onClick={() => exportIcs(30, '30-days')} />
          <ExportButton label={t('exportOneYear', language)} onClick={() => exportIcs(365, '1-year')} />
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-400">{t('calendarTestHelp', language)}</p>
        <p className="text-xs leading-5 text-gray-400">{t('calendarTravelHelp', language)}</p>
      </section>

      <section className={sectionClass}>
        <h2 className="font-semibold text-white">{t('localData', language)}</h2>
        <p className="mt-1 text-xs leading-5 text-gray-400">{t('localDataHelp', language)}</p>
        <button
          type="button"
          onClick={openBackupRestore}
          className="mt-4 min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-600"
        >
          {t('backupRestore', language)}
        </button>
      </section>

      <PwaStatus language={language} />

      {message && (
        <div
          role="status"
          aria-live="polite"
          className="sticky bottom-20 rounded-md border border-teal-800 bg-gray-950 px-4 py-3 text-sm text-teal-200 shadow-lg"
        >
          {message}
        </div>
      )}
    </div>
  )
}

async function resolveCurrentDeviceCountry() {
  const state = await refreshDeviceLocation()
  if (!state.location) return null
  const resolved = await reverseGeocodeCoordinates(state.location.latitude, state.location.longitude)
  const countryCode = resolved.countryCode ? detectCountryCode(resolved.countryCode) : null
  if (!countryCode) throw new Error('The coordinate lookup did not return a supported country.')
  saveCachedLocation({
    ...state.location,
    city: resolved.city,
    country: resolved.country,
    countryCode
  })
  return { countryCode, resolved }
}

function highLatitudeTranslationKey(rule: HighLatKey): string {
  if (rule === 'SeventhOfTheNight') return 'seventhOfNight'
  if (rule === 'TwilightAngle') return 'twilightAngle'
  return 'middleOfNight'
}

function ExportButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-md border border-gray-700 bg-gray-900 px-3 text-xs font-semibold text-gray-200 transition hover:border-teal-700 hover:bg-gray-700"
    >
      {label}
    </button>
  )
}
