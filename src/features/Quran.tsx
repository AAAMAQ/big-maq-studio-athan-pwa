import { useEffect, useMemo, useState } from 'react'
import { fetchSurah, fetchSurahs } from '../lib/quran'
import { completeSurah, loadQuranProgress, markAyahRead, toggleFavoriteSurah, type QuranProgress } from '../lib/quranProgress'
import { isQuranTranslation, type QuranTranslation } from '../lib/quranProviders'
import { formatAppTime } from '../lib/preferences'

type SurahItem = {
  number: number
  name: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
}

type Ayah = { number: number; text: string }
type ViewMode = 'ar' | 'ar-en'
type HubPanel = 'surahs' | 'juz' | 'bookmarks' | 'search' | 'daily' | null
type Props = { go?: (screen: string) => void }

const BOOKMARKS_KEY = 'quranBookmarks'
const FONT_SIZE_KEY = 'quranFontPct'
const VIEW_MODE_KEY = 'quranViewMode'
const TRANSLATION_KEY = 'athan.quran.translation.v1'
const READ_AYAHS_KEY = 'athan.quran.readAyahs.v1'

const JUZ_STARTS = [
  [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111],
  [7, 88], [8, 41], [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75],
  [21, 1], [23, 1], [25, 21], [27, 56], [29, 46], [33, 31], [36, 28], [39, 32],
  [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]
] as const

const clamp = (number: number, min: number, max: number) => Math.min(max, Math.max(min, number))
const bookmarkKey = (surah: number, ayah: number) => `${surah}:${ayah}`

function loadBookmarks(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

function saveBookmarks(bookmarks: Set<string>) {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...bookmarks]))
  } catch {
    // Reading remains available if browser storage is unavailable.
  }
}

function loadReadAyahs(): Set<string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(READ_AYAHS_KEY) || '[]')
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [])
  } catch {
    return new Set()
  }
}

function loadTranslation(): QuranTranslation['id'] {
  const stored = localStorage.getItem(TRANSLATION_KEY) || 'en.asad'
  return isQuranTranslation(stored) ? stored : 'en.asad'
}

function formatRecentDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const today = new Date()
  if (date.toDateString() === today.toDateString()) {
    return formatAppTime(date)
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function percentFor(lastAyah: number, totalAyahs?: number) {
  if (!totalAyahs) return 0
  return clamp(Math.round((lastAyah / totalAyahs) * 100), 0, 100)
}

export default function Quran({ go }: Props) {
  const [surahs, setSurahs] = useState<SurahItem[]>([])
  const [selected, setSelected] = useState<number>(1)
  const [arabic, setArabic] = useState<Ayah[]>([])
  const [english, setEnglish] = useState<Ayah[]>([])
  const [bismillah, setBismillah] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [edition] = useState<QuranTranslation['id']>(loadTranslation)
  const [mode] = useState<ViewMode>(() => (
    localStorage.getItem(VIEW_MODE_KEY) === 'ar' ? 'ar' : 'ar-en'
  ))
  const [progress, setProgress] = useState<QuranProgress>(loadQuranProgress)
  const [bookmarks, setBookmarks] = useState<Set<string>>(loadBookmarks)
  const [readAyahs, setReadAyahs] = useState<Set<string>>(loadReadAyahs)
  const [showOnlyBookmarks, setShowOnlyBookmarks] = useState(false)
  const [fontPct] = useState(() => {
    const stored = Number(localStorage.getItem(FONT_SIZE_KEY))
    return Number.isFinite(stored) && stored > 0 ? clamp(stored, 80, 180) : 100
  })
  const [panel, setPanel] = useState<HubPanel>(null)
  const [readerOpen, setReaderOpen] = useState(false)
  const [loadedSurah, setLoadedSurah] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [dailyAyah, setDailyAyah] = useState<{ surah: SurahItem; arabic: string; english: string; ayah: number } | null>(null)
  const [pendingAyah, setPendingAyah] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    fetchSurahs()
      .then((result) => { if (active) setSurahs(result) })
      .catch(() => { if (active) setLoadError('Could not load the Surah list. Connect once and try again.') })
    return () => { active = false }
  }, [])

  useEffect(() => {
    setLoading(true)
    setLoadedSurah(null)
    setLoadError('')
    let active = true
    fetchSurah(selected, edition)
      .then((result) => {
        if (!active) return
        setArabic(result.arabic)
        setEnglish(result.english)
        setBismillah(result.bismillah ?? null)
        setLoadedSurah(selected)
      })
      .catch(() => {
        if (!active) return
        setArabic([])
        setEnglish([])
        setBismillah(null)
        setLoadError('This Surah is not available offline yet. Connect and try again.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [selected, edition])

  useEffect(() => {
    if (!surahs.length) return
    let active = true
    const dateKey = new Date().toLocaleDateString('en-CA')
    const seed = [...dateKey].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 17)
    const surah = surahs[seed % surahs.length]
    const ayah = ((seed >>> 8) % surah.numberOfAyahs) + 1
    fetchSurah(surah.number, edition)
      .then((result) => {
        if (!active) return
        setDailyAyah({
          surah,
          ayah,
          arabic: result.arabic.find((item) => item.number === ayah)?.text ?? '',
          english: result.english.find((item) => item.number === ayah)?.text ?? ''
        })
      })
      .catch(() => { if (active) setDailyAyah(null) })
    return () => { active = false }
  }, [edition, surahs])

  useEffect(() => {
    if (!readerOpen || loading || loadedSurah !== selected || pendingAyah === null) return
    let firstFrame = 0
    let secondFrame = 0
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        const target = document.getElementById(`ayah-${selected}-${pendingAyah}`)
        if (!target) return
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setPendingAyah(null)
      })
    })
    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [loadedSurah, loading, pendingAyah, readerOpen, selected])

  const selectedSurah = surahs.find((surah) => surah.number === selected)
  const continueSurah = progress.lastReadSurah
    ? surahs.find((surah) => surah.number === progress.lastReadSurah)
    : undefined
  const continueEntry = progress.lastReadSurah
    ? progress.perSurahProgress[String(progress.lastReadSurah)]
    : undefined
  const continuePercent = progress.lastReadAyah
    ? percentFor(progress.lastReadAyah, continueEntry?.totalAyahs ?? continueSurah?.numberOfAyahs)
    : 0
  const selectedProgress = progress.perSurahProgress[String(selected)]

  const recentSurahs = useMemo(() => {
    const seen = new Set<number>()
    return progress.recentlyRead.filter((item) => {
      if (seen.has(item.surah)) return false
      seen.add(item.surah)
      return true
    }).slice(0, 5)
  }, [progress.recentlyRead])

  const parsedBookmarks = useMemo(() => [...bookmarks].map((key) => {
    const [surah, ayah] = key.split(':').map(Number)
    return Number.isFinite(surah) && Number.isFinite(ayah) ? { surah, ayah } : null
  }).filter((item): item is { surah: number; ayah: number } => Boolean(item)), [bookmarks])

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return []
    const reference = query.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/)
    if (reference) {
      const surah = Number(reference[1])
      const ayah = Number(reference[2])
      const match = surahs.find((item) => item.number === surah && ayah <= item.numberOfAyahs)
      return match ? [{ type: 'ayah' as const, surah: match, ayah }] : []
    }
    const surahMatches = surahs
      .filter((surah) => (
        String(surah.number) === query
        || surah.englishName.toLowerCase().includes(query)
        || surah.englishNameTranslation.toLowerCase().includes(query)
        || surah.name.includes(searchQuery.trim())
      ))
      .slice(0, 8)
      .map((surah) => ({ type: 'surah' as const, surah }))
    const ayahMatches = english
      .filter((ayah) => ayah.text.toLowerCase().includes(query))
      .slice(0, 5)
      .map((ayah) => ({ type: 'ayah' as const, surah: selectedSurah, ayah: ayah.number }))
      .filter((item): item is { type: 'ayah'; surah: SurahItem; ayah: number } => Boolean(item.surah))
    return [...surahMatches, ...ayahMatches]
  }, [english, searchQuery, selectedSurah, surahs])

  function openReader(surah: number, ayah?: number) {
    const surahInfo = surahs.find((item) => item.number === surah)
    const resumeAyah = ayah ?? progress.perSurahProgress[String(surah)]?.lastAyah ?? 1
    const targetAyah = surahInfo
      ? clamp(Math.round(resumeAyah), 1, surahInfo.numberOfAyahs)
      : Math.max(1, Math.round(resumeAyah))
    setSelected(surah)
    setPendingAyah(targetAyah)
    setReaderOpen(true)
    setPanel(null)
    setShowOnlyBookmarks(false)
  }

  function continueReading() {
    if (!progress.lastReadSurah || !progress.lastReadAyah) return
    openReader(progress.lastReadSurah, progress.lastReadAyah)
  }

  function recordRead(ayah: number) {
    const surah = surahs.find((item) => item.number === selected)
    if (!surah) return
    const next = markAyahRead(selected, ayah, surah.englishName, surah.numberOfAyahs)
    setProgress(next)
    const nextReadAyahs = new Set(readAyahs).add(bookmarkKey(selected, ayah))
    setReadAyahs(nextReadAyahs)
    try {
      localStorage.setItem(READ_AYAHS_KEY, JSON.stringify([...nextReadAyahs]))
    } catch {
      // Keep this reading session usable if browser storage is full.
    }
    setStatusMessage(`Last read saved: ${surah.englishName}, Ayah ${ayah}.`)
  }

  function recordSurahComplete() {
    const surah = surahs.find((item) => item.number === selected)
    if (!surah) return
    setProgress(completeSurah(selected, surah.numberOfAyahs, surah.englishName))
    setStatusMessage(`${surah.englishName} marked complete.`)
  }

  function toggleBookmark(surah: number, ayah: number) {
    const key = bookmarkKey(surah, ayah)
    const next = new Set(bookmarks)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setBookmarks(next)
    saveBookmarks(next)
    setStatusMessage(next.has(key) ? 'Ayah bookmarked.' : 'Bookmark removed.')
  }

  function clearBookmarks() {
    if (bookmarks.size === 0) {
      setStatusMessage('There are no bookmarks to clear.')
      return
    }
    if (!window.confirm(`Clear all ${bookmarks.size} Quran bookmark${bookmarks.size === 1 ? '' : 's'}?`)) return
    const empty = new Set<string>()
    saveBookmarks(empty)
    setBookmarks(empty)
    setShowOnlyBookmarks(false)
    setStatusMessage('All Quran bookmarks were cleared.')
  }

  function toggleFavorite() {
    const next = toggleFavoriteSurah(selected)
    setProgress(next)
    setStatusMessage(next.favoriteSurahs.includes(selected) ? 'Surah saved.' : 'Surah removed from saved Surahs.')
  }

  const visibleArabic = showOnlyBookmarks
    ? arabic.filter((ayah) => bookmarks.has(bookmarkKey(selected, ayah.number)))
    : arabic
  const visibleEnglish = showOnlyBookmarks
    ? english.filter((ayah) => bookmarks.has(bookmarkKey(selected, ayah.number)))
    : english

  if (readerOpen) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 pb-8">
        <header className="sticky top-0 z-10 -mx-2 flex items-center justify-between border-b border-gray-700/80 bg-gray-900/95 px-3 py-3 backdrop-blur">
          <button type="button" onClick={() => setReaderOpen(false)} className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:bg-gray-700">
            ← Quran
          </button>
          <div className="min-w-0 px-3 text-center">
            <h2 className="truncate font-semibold text-white">{selectedSurah?.englishName ?? `Surah ${selected}`}</h2>
            <p className="text-xs text-gray-400">{selectedSurah?.name}</p>
          </div>
          <span className="w-16" aria-hidden="true" />
        </header>

        <section className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-800 pb-3">
          <select
            aria-label="Select Surah"
            value={selected}
            onChange={(event) => openReader(Number(event.target.value))}
            className="min-w-0 flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white"
          >
            {surahs.map((surah) => <option key={surah.number} value={surah.number}>{surah.number}. {surah.englishName}</option>)}
          </select>
          <button type="button" onClick={() => setShowOnlyBookmarks((value) => !value)} className={`rounded-md px-3 py-2 text-sm ${showOnlyBookmarks ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-300'}`}>
            {showOnlyBookmarks ? 'All Ayahs' : `Bookmarks ${bookmarks.size ? `(${bookmarks.size})` : ''}`}
          </button>
          <button type="button" onClick={toggleFavorite} className={`rounded-md px-3 py-2 text-sm ${progress.favoriteSurahs.includes(selected) ? 'bg-yellow-500/20 text-yellow-200' : 'bg-gray-800 text-gray-300'}`}>
            {progress.favoriteSurahs.includes(selected) ? '★ Saved' : '☆ Save Surah'}
          </button>
        </section>

        {selectedProgress && (
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-teal-400" style={{ width: `${percentFor(selectedProgress.lastAyah, selectedProgress.totalAyahs ?? selectedSurah?.numberOfAyahs)}%` }} />
            </div>
            <span>Last read · Ayah {selectedProgress.lastAyah}</span>
          </div>
        )}
        {selectedProgress?.completedAt && <p className="text-xs text-teal-300">Completed {formatRecentDate(selectedProgress.completedAt)}</p>}

        {statusMessage && <p role="status" className="rounded-md border border-teal-700/40 bg-teal-950/30 px-3 py-2 text-sm text-teal-200">{statusMessage}</p>}
        {loadError && <p className="rounded-md border border-red-800/50 bg-red-950/30 p-3 text-sm text-red-200">{loadError}</p>}

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">Loading Surah…</p>
        ) : visibleArabic.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No bookmarked Ayahs in this Surah.</p>
        ) : (
          <div className="space-y-3">
            {bismillah && <p dir="rtl" className="py-3 text-center text-2xl leading-loose text-teal-100" style={{ fontSize: `${fontPct + 20}%` }}>{bismillah}</p>}
            {visibleArabic.map((ayah) => {
              const translation = visibleEnglish.find((item) => item.number === ayah.number)
              const bookmarked = bookmarks.has(bookmarkKey(selected, ayah.number))
              const readBefore = readAyahs.has(bookmarkKey(selected, ayah.number))
              const isLastRead = progress.lastReadSurah === selected && progress.lastReadAyah === ayah.number
              return (
                <article key={ayah.number} id={`ayah-${selected}-${ayah.number}`} className="border-b border-gray-800 py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-teal-700/70 text-xs text-teal-200">{ayah.number}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => toggleBookmark(selected, ayah.number)} className={`h-9 w-9 rounded-md bg-gray-800 text-lg ${bookmarked ? 'text-yellow-300' : 'text-gray-400'}`} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark Ayah'}>
                        {bookmarked ? '★' : '☆'}
                      </button>
                      <button type="button" onClick={() => recordRead(ayah.number)} title={readBefore ? 'Read before' : undefined} aria-label={isLastRead ? 'Current last read Ayah' : `${readBefore ? 'Previously read. ' : ''}Set as last read`} className={`rounded-md px-3 py-2 text-xs font-semibold transition ${isLastRead ? 'bg-teal-400 text-gray-950' : 'bg-teal-950/70 text-teal-100'}`}>
                        {isLastRead ? 'Last read ✓' : 'Set as last read'}
                      </button>
                    </div>
                  </div>
                  <p dir="rtl" className="text-right leading-[2.25]" style={{ fontSize: `${fontPct + 20}%` }}>{ayah.text}</p>
                  {mode === 'ar-en' && translation && <p className="mt-4 leading-7 text-gray-300" style={{ fontSize: `${fontPct}%` }}>{translation.text}</p>}
                </article>
              )
            })}
            {!showOnlyBookmarks && selectedSurah && (
              <section className="border-t border-gray-700 pt-5" aria-label="Surah completion">
                <p className="mb-3 text-center text-sm text-gray-400">Finished reading all {selectedSurah.numberOfAyahs} Ayahs?</p>
                <button type="button" onClick={recordSurahComplete} className="w-full rounded-md border border-teal-700 bg-teal-950/50 px-4 py-3 text-sm font-semibold text-teal-100 transition hover:border-teal-400 hover:bg-teal-900/60">
                  Complete Surah · {selectedSurah.englishName}
                </button>
              </section>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-8">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-teal-400">Read at your pace</p>
          <h2 className="text-2xl font-bold text-white">Quran</h2>
        </div>
        <button type="button" onClick={() => go?.('QuranSettings')} className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-600">
          Quran Settings
        </button>
      </header>

      <section className="flex items-center gap-4 border-y border-gray-800 py-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-teal-500/70 bg-teal-950/40 text-2xl">☾</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">The Holy Quran</h3>
          <p className="text-sm text-gray-400">Read with a clear, focused view.</p>
        </div>
        {progress.lastReadSurah && (
          <button type="button" onClick={continueReading} className="shrink-0 text-right text-xs text-teal-300">
            <span className="block font-semibold">Last read</span>
            <span className="text-gray-400">{continueSurah?.englishName ?? `Surah ${progress.lastReadSurah}`} {progress.lastReadAyah}</span>
          </button>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-semibold text-white">Quick Access</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { id: 'surahs' as const, icon: '114', label: 'Surah', detail: 'Browse all' },
            { id: 'juz' as const, icon: '30', label: 'Juz', detail: '30 parts' },
            { id: 'bookmarks' as const, icon: '☆', label: 'Surah Bookmarks', detail: `${bookmarks.size} saved` },
            { id: null, icon: '↗', label: 'Last Read Ayah', detail: progress.lastReadAyah ? `Ayah ${progress.lastReadAyah}` : 'Not set' },
            { id: 'search' as const, icon: '⌕', label: 'Search', detail: 'Surah or Ayah' },
            { id: 'daily' as const, icon: '✦', label: 'Ayah of the Day', detail: 'A daily reflection' }
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => item.id ? setPanel(panel === item.id ? null : item.id) : continueReading()}
              disabled={!item.id && !progress.lastReadSurah}
              className={`min-h-24 rounded-md border px-3 py-3 text-left transition ${panel === item.id && item.id ? 'border-teal-500 bg-teal-950/40' : 'border-gray-700 bg-gray-800/70 hover:border-gray-600'} disabled:opacity-50`}
            >
              <span className="mb-2 block text-lg font-semibold text-teal-300">{item.icon}</span>
              <span className="block text-sm font-medium text-white">{item.label}</span>
              <span className="mt-1 block text-xs text-gray-500">{item.detail}</span>
            </button>
          ))}
        </div>
      </section>

      {panel === 'surahs' && (
        <section className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
          <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
            {surahs.map((surah) => {
              const saved = progress.perSurahProgress[String(surah.number)]
              return (
                <button key={surah.number} type="button" onClick={() => openReader(surah.number, saved?.lastAyah ?? 1)} className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left hover:bg-gray-700/70">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-800 text-xs text-teal-200">{surah.number}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{surah.englishName}</span>
                    <span className="block text-xs text-gray-500">{surah.numberOfAyahs} Ayahs{saved ? ` · Last read ${saved.lastAyah}` : ''}</span>
                  </span>
                  <span dir="rtl" className="text-sm text-gray-400">{surah.name}</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {panel === 'juz' && (
        <section className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
          <p className="mb-3 text-xs text-gray-400">Open a Juz at its first Ayah.</p>
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {JUZ_STARTS.map(([surah, ayah], index) => (
              <button key={index + 1} type="button" onClick={() => openReader(surah, ayah)} className="aspect-square rounded-full border border-gray-600 text-sm text-gray-200 hover:border-teal-400 hover:text-teal-200">
                {index + 1}
              </button>
            ))}
          </div>
        </section>
      )}

      {panel === 'bookmarks' && (
        <section className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Saved Quran Places</h3>
            <button type="button" onClick={clearBookmarks} className="rounded-md bg-gray-700 px-3 py-2 text-xs text-gray-200 hover:bg-red-900/50">Clear Bookmarks</button>
          </div>
          {statusMessage && <p role="status" className="mb-3 text-xs text-teal-300">{statusMessage}</p>}
          {progress.favoriteSurahs.length === 0 && parsedBookmarks.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">Bookmarks will appear here as you read.</p>
          ) : (
            <div className="space-y-1">
              {progress.favoriteSurahs.map((surahNumber) => {
                const surah = surahs.find((item) => item.number === surahNumber)
                return <button key={`surah-${surahNumber}`} type="button" onClick={() => openReader(surahNumber, progress.perSurahProgress[String(surahNumber)]?.lastAyah ?? 1)} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-700"><span className="text-yellow-300">★</span> {surah?.englishName ?? `Surah ${surahNumber}`}</button>
              })}
              {parsedBookmarks.map((item) => {
                const surah = surahs.find((entry) => entry.number === item.surah)
                return <button key={bookmarkKey(item.surah, item.ayah)} type="button" onClick={() => openReader(item.surah, item.ayah)} className="block w-full rounded-md px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700">☆ {surah?.englishName ?? `Surah ${item.surah}`}, Ayah {item.ayah}</button>
              })}
            </div>
          )}
        </section>
      )}

      {panel === 'search' && (
        <section className="rounded-md border border-gray-700 bg-gray-800/60 p-3">
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search Al-Baqarah, 2, or 2:255"
            className="w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
          />
          <p className="mt-2 text-xs text-gray-500">Keywords search the currently loaded translation.</p>
          <div className="mt-3 space-y-1">
            {searchQuery && searchResults.length === 0 && <p className="py-4 text-center text-sm text-gray-400">No matching Surah or Ayah found.</p>}
            {searchResults.map((result) => (
              <button key={`${result.type}-${result.surah.number}-${result.type === 'ayah' ? result.ayah : 0}`} type="button" onClick={() => result.type === 'ayah' ? openReader(result.surah.number, result.ayah) : openReader(result.surah.number)} className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-700">
                <span className="text-sm text-white">{result.surah.number}. {result.surah.englishName}</span>
                <span className="text-xs text-gray-400">{result.type === 'ayah' ? `Ayah ${result.ayah}` : `${result.surah.numberOfAyahs} Ayahs`}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {panel === 'daily' && (
        <section className="rounded-md border border-teal-800/60 bg-gray-800/60 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-semibold text-white">Ayah of the Day</h3>
            {dailyAyah && <span className="text-xs text-teal-300">{dailyAyah.surah.englishName} {dailyAyah.ayah}</span>}
          </div>
          {dailyAyah ? (
            <button type="button" onClick={() => openReader(dailyAyah.surah.number, dailyAyah.ayah)} className="mt-4 block w-full text-left">
              <p dir="rtl" className="text-right text-2xl leading-loose text-gray-100">{dailyAyah.arabic}</p>
              <p className="mt-4 text-sm leading-7 text-gray-300">{dailyAyah.english}</p>
              <span className="mt-4 block text-xs font-semibold text-teal-300">Open in Quran →</span>
            </button>
          ) : (
            <p className="mt-3 text-sm text-gray-400">Connect once to prepare today’s Ayah.</p>
          )}
        </section>
      )}

      <section>
        <h3 className="mb-3 font-semibold text-white">Continue Reading</h3>
        {progress.lastReadSurah && progress.lastReadAyah ? (
          <button type="button" onClick={continueReading} className="w-full rounded-md border border-gray-700 bg-gray-800/70 p-4 text-left hover:border-teal-600">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-500 text-sm font-semibold text-teal-200">{progress.lastReadSurah}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-teal-300">{continueSurah?.englishName ?? `Surah ${progress.lastReadSurah}`}</span>
                <span className="block text-sm text-gray-400">Ayah {progress.lastReadAyah}</span>
              </span>
              <span className="text-sm text-gray-400">{continuePercent}%</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-700">
              <div className="h-full rounded-full bg-teal-400" style={{ width: `${continuePercent}%` }} />
            </div>
          </button>
        ) : (
          <button type="button" onClick={() => openReader(1)} className="w-full rounded-md border border-dashed border-gray-700 px-4 py-6 text-center text-sm text-gray-400 hover:border-teal-700">
            Begin with Al-Fatihah
          </button>
        )}
      </section>

      <section>
        <h3 className="mb-3 font-semibold text-white">Recently Read</h3>
        {recentSurahs.length ? (
          <div className="divide-y divide-gray-800 border-y border-gray-800">
            {recentSurahs.map((item) => {
              const surah = surahs.find((entry) => entry.number === item.surah)
              const saved = progress.perSurahProgress[String(item.surah)]
              const percent = percentFor(item.ayah, saved?.totalAyahs ?? surah?.numberOfAyahs)
              return (
                <button key={item.surah} type="button" onClick={() => openReader(item.surah, item.ayah)} className="flex w-full items-center gap-3 py-3 text-left">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-teal-800 text-xs text-teal-200">{item.surah}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{surah?.englishName ?? item.surahName ?? `Surah ${item.surah}`}</span>
                    <span className="block text-xs text-gray-500">Ayah {item.ayah} · {percent}% complete</span>
                  </span>
                  <span className="text-xs text-gray-500">{formatRecentDate(item.updatedAt)}</span>
                </button>
              )
            })}
          </div>
        ) : <p className="text-sm text-gray-400">Your recently read Surahs will appear here.</p>}
      </section>

      <p className="text-center text-xs text-gray-500">Bookmarks, reading progress, and Quran settings stay on this device.</p>
    </div>
  )

}
