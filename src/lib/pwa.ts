import { ATHAN_RELEASE } from './release'

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export type InstallResult = 'accepted' | 'dismissed' | 'unavailable'

export const ATHAN_APP_VERSION = ATHAN_RELEASE.version
export const ATHAN_APP_UPDATED_AT = ATHAN_RELEASE.updatedAt

const INSTALLED_VERSION_KEY = 'athan.pwa.installedVersion.v1'
const LAST_UPDATE_CHECK_KEY = 'athan.pwa.lastUpdateCheck.v1'

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null
const installPromptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>()

function publishInstallPrompt(prompt: BeforeInstallPromptEvent | null) {
  deferredInstallPrompt = prompt
  installPromptListeners.forEach((listener) => listener(prompt))
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    publishInstallPrompt(event as BeforeInstallPromptEvent)
  })
  window.addEventListener('appinstalled', () => publishInstallPrompt(null))
}

export function subscribeInstallPrompt(listener: (prompt: BeforeInstallPromptEvent | null) => void): () => void {
  installPromptListeners.add(listener)
  listener(deferredInstallPrompt)
  return () => installPromptListeners.delete(listener)
}

export function isPwaInstalled(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(display-mode: standalone)').matches === true
    || ('standalone' in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
}

export function getInstalledVersion(): string {
  try {
    // This is the version whose code actually loaded, not a future download claim.
    localStorage.setItem(INSTALLED_VERSION_KEY, ATHAN_APP_VERSION)
  } catch {
    // Version display still works when storage is unavailable.
  }
  return ATHAN_APP_VERSION
}

export function getLastUpdateCheck(): string | null {
  try {
    return localStorage.getItem(LAST_UPDATE_CHECK_KEY)
  } catch {
    return null
  }
}

export async function requestPwaInstall(): Promise<InstallResult> {
  if (!deferredInstallPrompt) return 'unavailable'

  const prompt = deferredInstallPrompt
  await prompt.prompt()
  const choice = await prompt.userChoice
  publishInstallPrompt(null)
  return choice.outcome
}

export async function refreshAthanApp(
  onStatus?: (status: 'checking' | 'reloading' | 'fallback' | 'ready') => void
): Promise<void> {
  onStatus?.('checking')
  try {
    if (navigator.onLine === false) throw new Error('Offline')
    let changed = false
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration(window.location.href)
      if (registration) {
        const previous = registration.active
        await registration.update()
        const candidate = registration.installing || registration.waiting
        if (candidate) {
          if (candidate.state === 'installed') candidate.postMessage({ type: 'SKIP_WAITING' })
          await waitForActivation(candidate)
        }
        // A stale open page may have missed an earlier worker activation. A user's
        // successful check can reload into the already-active, usable cached shell.
        changed = !!registration.active || registration.active !== previous || candidate?.state === 'activated'
      } else {
        await verifyNetworkShell()
        changed = true
      }
    } else {
      await verifyNetworkShell()
      changed = true
    }

    try {
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, new Date().toISOString())
    } catch {
      // Never make an update depend on localStorage.
    }

    if (changed) {
      onStatus?.('reloading')
      window.setTimeout(() => window.location.reload(), 250)
    } else onStatus?.('ready')
  } catch {
    // Never unregister/delete the usable offline shell before replacement succeeds.
    onStatus?.('fallback')
  }
}

function waitForActivation(worker: ServiceWorker): Promise<void> {
  return new Promise((resolve, reject) => {
    const done = (error?: Error) => {
      window.clearTimeout(timeout)
      worker.removeEventListener('statechange', check)
      if (error) reject(error)
      else resolve()
    }
    const check = () => {
      if (worker.state === 'activated') done()
      else if (worker.state === 'redundant') done(new Error('Update installation failed'))
      else if (worker.state === 'installed') worker.postMessage({ type: 'SKIP_WAITING' })
    }
    const timeout = window.setTimeout(() => done(new Error('Update installation timed out')), 15000)
    worker.addEventListener('statechange', check)
    check()
  })
}

async function verifyNetworkShell() {
  const response = await fetch(new URL('index.html', document.baseURI), { cache: 'no-store' })
  if (!response.ok) throw new Error('App host unavailable')
  const html = await response.text()
  const shell = new DOMParser().parseFromString(html, 'text/html')
  const urls = [...shell.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')].map(script => script.getAttribute('src')!)
  if (!shell.getElementById('root') || urls.length === 0) throw new Error('Invalid app shell')
  // A reachable HTML page alone does not prove its entry chunks are reachable.
  await Promise.all(urls.map(async url => {
    const asset = await fetch(new URL(url, response.url || document.baseURI), { cache: 'no-store' })
    if (!asset.ok) throw new Error('App entry unavailable')
  }))
}
