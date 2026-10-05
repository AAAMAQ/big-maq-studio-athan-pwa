import { useEffect, useState } from 'react'
import SettingsSection from './SettingsSection'
import { t, type AppLanguage } from '../lib/i18n'
import {
  ATHAN_APP_UPDATED_AT,
  ATHAN_APP_VERSION,
  getInstalledVersion,
  isPwaInstalled,
  refreshAthanApp,
  requestPwaInstall,
  subscribeInstallPrompt
} from '../lib/pwa'

type Props = {
  language?: AppLanguage
}

export default function PwaStatus({ language = 'en' }: Props) {
  const [online, setOnline] = useState(() => navigator.onLine)
  const [installed, setInstalled] = useState(isPwaInstalled)
  const [installedVersion] = useState(getInstalledVersion)
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(false)
  const [installAvailable, setInstallAvailable] = useState(false)

  useEffect(() => {
    const onOnline = () => setOnline(true)
    const onOffline = () => setOnline(false)
    const onInstalled = () => {
      setInstalled(true)
      setMessage(t('installedSuccessfully', language))
    }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [language])

  useEffect(() => subscribeInstallPrompt((prompt) => {
    setInstallAvailable(prompt !== null)
  }), [])

  useEffect(() => {
    if (!message) return
    const timeout = window.setTimeout(() => setMessage(''), 4500)
    return () => window.clearTimeout(timeout)
  }, [message])

  async function installApp() {
    try {
      const result = await requestPwaInstall()
      if (result === 'accepted') setMessage(t('installStarted', language))
      if (result === 'dismissed') setMessage(t('installDismissed', language))
      if (result === 'unavailable') setMessage(t('installGuidance', language))
    } catch {
      // Native share cancellation is not an app error.
    }
  }

  async function updateApp() {
    setChecking(true)
    try {
      await refreshAthanApp((status) => {
        if (status === 'checking') setMessage(t('checkingForUpdate', language))
        if (status === 'reloading') setMessage(t('reloadingLatest', language))
        if (status === 'ready') setMessage('Update check completed. Your current app is ready.')
        if (status === 'fallback') setMessage('Could not check for an update. Your current app and offline files are preserved; try again when connected.')
      })
    } catch {
      setMessage('Could not check for an update. Your current app and offline files are preserved; try again when connected.')
    } finally {
      setChecking(false)
    }
  }

  const releaseDate = new Intl.DateTimeFormat(language === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(`${ATHAN_APP_UPDATED_AT}T12:00:00`))
  const versionsMatch = installedVersion === ATHAN_APP_VERSION

  return (
    <SettingsSection id="pwa" title={t('pwaStatus', language)}>
      <div>
        <p className="mt-1 text-xs leading-5 text-gray-400">
          {online ? t('onlineReady', language) : t('offlineReady', language)}
          {' · '}
          {installed ? t('installedMode', language) : t('browserMode', language)}
        </p>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-gray-700 bg-gray-700 text-sm">
        <StatusItem label={t('currentVersion', language)} value={`v${ATHAN_APP_VERSION}`} />
        <StatusItem label={t('installedVersion', language)} value={`v${installedVersion}`} />
        <StatusItem label={t('lastUpdated', language)} value={releaseDate} />
        <StatusItem
          label={t('updateStatus', language)}
          value={versionsMatch ? t('latestVersionLoaded', language) : t('updateAvailable', language)}
          accent={!versionsMatch}
        />
      </dl>

      {!installed && !installAvailable && (
        <p className="mt-4 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-xs leading-5 text-gray-300">
          {isAppleMobileDevice()
            ? t('iosInstallGuidance', language)
            : t('installGuidance', language)}
        </p>
      )}

      <div className={`mt-4 grid gap-2 ${installAvailable && !installed ? 'sm:grid-cols-2' : ''}`}>
        {installAvailable && !installed && (
          <button
            type="button"
            onClick={installApp}
            className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-600"
          >
            {t('installAthan', language)}
          </button>
        )}
        <button
          type="button"
          onClick={updateApp}
          disabled={checking || !online}
          className="min-h-11 rounded-md border border-gray-600 bg-gray-900 px-4 text-sm font-semibold text-gray-100 transition hover:border-teal-700 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {checking ? t('checkingForUpdate', language) : t('checkForUpdate', language)}
        </button>
      </div>

      <p className="mt-3 text-xs leading-5 text-gray-400">{t('pwaDataSafe', language)}</p>
      {message && (
        <p role="status" aria-live="polite" className="mt-3 rounded-md bg-gray-950 px-3 py-2 text-xs text-teal-200">
          {message}
        </p>
      )}
    </SettingsSection>
  )
}

function isAppleMobileDevice() {
  if (/iPad|iPhone|iPod/i.test(navigator.userAgent)) return true
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

function StatusItem({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-h-20 bg-gray-900 p-3">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className={`mt-1 text-sm font-semibold ${accent ? 'text-amber-300' : 'text-gray-100'}`}>{value}</dd>
    </div>
  )
}
