import { useEffect, useState } from 'react'
import { formatDevNoteDate, loadDevNotes, type DevNote } from '../lib/devNotes'

export default function DevNotes() {
  const [devNotes, setDevNotes] = useState<DevNote[]>([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    loadDevNotes(controller.signal)
      .then(setDevNotes)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        console.error('Failed to load dev notes', error)
        setErrorMessage('Release notes could not be loaded right now.')
      })

    return () => controller.abort()
  }, [])

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-teal-400">Release history</p>
        <h2 className="text-2xl font-bold">Developer Notes</h2>
        <p className="text-sm leading-6 text-gray-300">
          Updates, fixes, and improvements to Athan PWA.
        </p>
      </header>

      {errorMessage && <p role="alert" className="rounded-lg border border-amber-800 bg-gray-800 p-4 text-sm text-amber-300">{errorMessage}</p>}
      {!errorMessage && devNotes.length === 0 && (
        <p role="status" className="rounded-lg border border-gray-700 bg-gray-800 p-4 text-sm text-gray-400">
          Loading release notes…
        </p>
      )}

      <section aria-label="Release notes" className="space-y-4">
        {devNotes.map((note) => (
          <article key={note.id} className="space-y-2 rounded-lg border border-gray-700 bg-gray-800 p-4">
            <p className="text-xs text-gray-400">{formatDevNoteDate(note.date)}</p>
            <h3 className="font-semibold text-teal-300">
              {note.version ? `${note.version} · ` : ''}{note.title}
            </h3>
            <div className="space-y-2">
              {note.summary.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-gray-200">{paragraph}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <footer className="text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} BiG MAQ Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
