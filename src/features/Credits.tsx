import { useEffect, useState } from 'react'
import { formatDevNoteDate, loadDevNotes, type DevNote } from '../lib/devNotes'
import { refreshAthanApp } from '../lib/pwa'
import { ATHAN_RELEASE } from '../lib/release'
import { createSharedDefaultsUrl } from '../lib/sharedDefaults'

type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

export default function Credits({ go, backTarget }: Props) {
  const [message, setMessage] = useState<string | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')
  const [devNotes, setDevNotes] = useState<DevNote[]>([])
  const [devNotesError, setDevNotesError] = useState('')
  const [showAllNotes, setShowAllNotes] = useState(false)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const buyMeACoffee = 'https://buymeacoffee.com/bigmaqstudio'
  const visibleNotes = showAllNotes ? devNotes : devNotes.slice(0, 3)

  useEffect(() => {
    const controller = new AbortController()

    loadDevNotes(controller.signal)
      .then(setDevNotes)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to load dev notes', error)
        setDevNotesError('Release notes could not be loaded right now.')
      })

    return () => controller.abort()
  }, [])

  async function shareApp(fallbackMessage = 'Link copied to clipboard.') {
    const shareData = {
      title: 'Athan PWA',
      text: 'Athan PWA keeps prayer times, Qibla, Quran, and daily tracking private and close at hand.',
      url: appUrl,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setMessage('Shared Athan PWA.')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
        setMessage(fallbackMessage)
      } else {
        setMessage(`Open your browser menu to share Athan PWA: ${shareData.url}`)
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage('Sharing is not available right now.')
    }
  }

  async function shareDefaults() {
    const url = createSharedDefaultsUrl(window.location.href)
    const shareData = {
      title: 'Athan PWA defaults',
      text: 'Apply my non-personal Athan PWA prayer and app defaults. Worship history, Quran progress, and location data are not included.',
      url
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        setMessage('Shared your non-personal defaults.')
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setMessage('Defaults link copied. No personal worship data was included.')
      } else {
        setMessage('Sharing is not available in this browser.')
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setMessage('Your defaults could not be shared right now.')
    }
  }

  async function updateApp() {
    await refreshAthanApp((status) => {
      if (status === 'checking') setUpdateStatus('Checking for update…')
      if (status === 'reloading') setUpdateStatus('Reloading latest version…')
      if (status === 'fallback') setUpdateStatus('Could not fully clear cache. Reloading anyway.')
    })
  }

  function goOrHash(screen: string) {
    if (go) {
      go(screen)
      return
    }
    window.location.hash = `#${screen}`
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      {go && backTarget && (
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-700 hover:text-teal-300"
        >
          ← Back
        </button>
      )}

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-teal-400">About the app</p>
        <h1 className="text-2xl font-bold">Credits</h1>
        <p className="text-sm leading-6 text-gray-300">
          Athan PWA is a lightweight Islamic utility for prayer times, Qibla, Quran, Iqama, and daily
          tracking. It is built to remain useful offline without accounts, ads, or analytics.
        </p>
      </header>

      <section className="overflow-hidden rounded-lg border border-teal-900/80 bg-gray-800">
        <dl className="divide-y divide-gray-700 text-sm">
          <CreditRow label="App" value="Athan PWA App" />
          <CreditRow label="Version" value={`v${ATHAN_RELEASE.version.replace(/^v/, '')}`} accent />
          <CreditRow label="Date of Current Version" value={formatDevNoteDate(ATHAN_RELEASE.updatedAt)} />
          <CreditRow
            label="Latest Update"
            value="v3.3.1 adds accurate Salah insights, private daily notes, unified calendar exports, grouped Settings reminders, and Masjid-profile Iqama export."
          />
          <CreditRow label="Company" value="BiG MAQ Studio" />
        </dl>
        <div className="border-t border-gray-700 p-4">
          <p className="text-xs font-semibold uppercase text-gray-400">Copyright</p>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            The content of this software is copyrighted © 2026 by BiG MAQ Studio. All rights reserved.
            The software code and accompanying documentation are protected by copyright law, prohibiting
            unauthorized reproduction or distribution without the explicit permission of the copyright owner.
          </p>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold">Share Athan PWA</h2>
          <p className="mt-1 text-sm text-gray-300">
            Send the web app link to family and friends.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => shareApp()}
            className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
          >
            Share App
          </button>
          <button
            type="button"
            onClick={shareDefaults}
            className="rounded-md border border-teal-600 bg-gray-900 px-4 py-2 text-sm font-semibold text-teal-200 hover:bg-teal-950"
          >
            Share Your Defaults
          </button>
        </div>
        <p className="text-xs leading-5 text-gray-400">
          Shared defaults include prayer calculation and general preferences only. Your Salah and Ramadan trackers,
          Quran activity, locations, and other personal data are never shared.
        </p>
        {message && (
          <p role="status" className="rounded-md bg-gray-900 px-3 py-2 text-sm text-teal-300">
            {message}
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Update</h2>
        <p className="text-sm text-gray-300">
          Check for the latest deployed version and refresh the app shell. Your settings, bookmarks, Iqama rules,
          and tracker data remain on this device.
        </p>
        <button
          type="button"
          onClick={updateApp}
          className="rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-500"
        >
          Check for Update
        </button>
        {updateStatus && <p role="status" className="text-sm text-teal-300">{updateStatus}</p>}
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Explore</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ['NeedHelp', 'Need Help'],
            ['Vision', 'Our Vision'],
            ['Privacy', 'Privacy'],
          ].map(([screen, label]) => (
            <button
              key={screen}
              type="button"
              className="rounded-md bg-gray-700 px-3 py-2 text-sm text-gray-100 hover:bg-gray-600"
              onClick={() => goOrHash(screen)}
            >
              {label}
            </button>
          ))}
          <a
            className="rounded-md bg-gray-700 px-3 py-2 text-center text-sm text-gray-100 hover:bg-gray-600"
            href={buyMeACoffee}
            target="_blank"
            rel="noreferrer"
          >
            Support
          </a>
        </div>
      </section>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="text-lg font-semibold">Dev Notes</h2>
          <p className="mt-1 text-sm text-gray-300">
            Recent releases, fixes, and improvements. Detailed guidance remains available in Need Help.
          </p>
        </div>

        {devNotesError && <p role="alert" className="text-sm text-amber-300">{devNotesError}</p>}
        {!devNotesError && devNotes.length === 0 && (
          <p className="text-sm text-gray-400">Loading release notes…</p>
        )}

        <div className="space-y-4">
          {visibleNotes.map((note) => (
            <article key={note.id} className="space-y-2 border-l-2 border-teal-500 pl-3">
              <p className="text-xs text-gray-400">{formatDevNoteDate(note.date)}</p>
              <h3 className="font-semibold text-teal-300">
                {note.version ? `${note.version} · ` : ''}{note.title}
              </h3>
              {note.summary.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-gray-200">{paragraph}</p>
              ))}
            </article>
          ))}
        </div>

        {devNotes.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAllNotes((current) => !current)}
            aria-expanded={showAllNotes}
            className="rounded-md border border-teal-700 px-4 py-2 text-sm font-semibold text-teal-300 hover:bg-teal-950"
          >
            {showAllNotes ? 'Show Less' : 'Read More'}
          </button>
        )}
      </section>

      <footer className="space-y-1 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved.</p>
        <p>Athan PWA keeps personal app data on your device.</p>
      </footer>
    </div>
  )
}

function CreditRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="grid gap-1 p-4 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-xs font-semibold uppercase text-gray-400">{label}</dt>
      <dd className={`leading-6 ${accent ? 'font-semibold text-teal-300' : 'text-gray-100'}`}>{value}</dd>
    </div>
  )
}
