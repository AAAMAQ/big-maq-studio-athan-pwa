export type QuranProgress = {
  lastReadSurah: number | null
  lastReadAyah: number | null
  updatedAt: string | null
  perSurahProgress: Record<string, {
    lastAyah: number
    totalAyahs?: number
    progressPercent?: number
    completedAt?: string
    updatedAt: string
  }>
  recentlyRead: Array<{
    surah: number
    ayah: number
    title?: string
    surahName?: string
    updatedAt: string
  }>
  favoriteSurahs: number[]
}

export const QURAN_PROGRESS_KEY = 'athan.quran.progress.v1'

export const DEFAULT_QURAN_PROGRESS: QuranProgress = {
  lastReadSurah: null,
  lastReadAyah: null,
  updatedAt: null,
  perSurahProgress: {},
  recentlyRead: [],
  favoriteSurahs: []
}

export function loadQuranProgress(): QuranProgress {
  try {
    const raw = localStorage.getItem(QURAN_PROGRESS_KEY)
    if (!raw) return cloneProgress(DEFAULT_QURAN_PROGRESS)
    return normalizeProgress(JSON.parse(raw))
  } catch {
    return cloneProgress(DEFAULT_QURAN_PROGRESS)
  }
}

export function saveQuranProgress(progress: QuranProgress): void {
  try {
    localStorage.setItem(QURAN_PROGRESS_KEY, JSON.stringify(normalizeProgress(progress)))
  } catch {
    // Keep Quran usable if storage is unavailable.
  }
}

export function markAyahRead(surah: number, ayah: number, title?: string, totalAyahs?: number): QuranProgress {
  const current = loadQuranProgress()
  const now = new Date().toISOString()
  const safeSurah = Math.max(1, Math.round(surah))
  const safeAyah = Math.max(1, Math.round(ayah))
  const recent = {
    surah: safeSurah,
    ayah: safeAyah,
    title,
    surahName: title,
    updatedAt: now
  }
  const progressPercent = totalAyahs ? Math.min(100, Math.round((safeAyah / totalAyahs) * 100)) : undefined
  const recentlyRead = [
    recent,
    ...current.recentlyRead.filter((item) => item.surah !== safeSurah)
  ].slice(0, 8)

  const next: QuranProgress = {
    ...current,
    lastReadSurah: safeSurah,
    lastReadAyah: safeAyah,
    updatedAt: now,
    perSurahProgress: {
      ...current.perSurahProgress,
      [String(safeSurah)]: {
        ...current.perSurahProgress[String(safeSurah)],
        lastAyah: safeAyah,
        totalAyahs,
        progressPercent,
        completedAt: totalAyahs && safeAyah < totalAyahs
          ? undefined
          : current.perSurahProgress[String(safeSurah)]?.completedAt,
        updatedAt: now
      }
    },
    recentlyRead
  }
  saveQuranProgress(next)
  return next
}

export function completeSurah(surah: number, totalAyahs: number, title?: string): QuranProgress {
  const current = loadQuranProgress()
  const now = new Date().toISOString()
  const safeSurah = Math.max(1, Math.round(surah))
  const safeTotalAyahs = Math.max(1, Math.round(totalAyahs))
  const prior = current.perSurahProgress[String(safeSurah)]
  const recent = {
    surah: safeSurah,
    ayah: safeTotalAyahs,
    title,
    surahName: title,
    updatedAt: now
  }
  const next: QuranProgress = {
    ...current,
    lastReadSurah: safeSurah,
    lastReadAyah: safeTotalAyahs,
    updatedAt: now,
    perSurahProgress: {
      ...current.perSurahProgress,
      [String(safeSurah)]: {
        ...prior,
        lastAyah: safeTotalAyahs,
        totalAyahs: safeTotalAyahs,
        progressPercent: 100,
        completedAt: now,
        updatedAt: now
      }
    },
    recentlyRead: [recent, ...current.recentlyRead.filter((item) => item.surah !== safeSurah)].slice(0, 8)
  }
  saveQuranProgress(next)
  return next
}

export function getContinueReadingTarget(): { surah: number; ayah: number } | null {
  const progress = loadQuranProgress()
  return progress.lastReadSurah && progress.lastReadAyah
    ? { surah: progress.lastReadSurah, ayah: progress.lastReadAyah }
    : null
}

export function getSurahProgress(surah: number): { lastAyah: number; updatedAt: string } | null {
  const progress = loadQuranProgress()
  return progress.perSurahProgress[String(surah)] ?? null
}

export function toggleFavoriteSurah(surah: number): QuranProgress {
  const progress = loadQuranProgress()
  const safeSurah = Math.max(1, Math.round(surah))
  const favoriteSurahs = progress.favoriteSurahs.includes(safeSurah)
    ? progress.favoriteSurahs.filter((item) => item !== safeSurah)
    : [...progress.favoriteSurahs, safeSurah].sort((a, b) => a - b)
  const next = { ...progress, favoriteSurahs }
  saveQuranProgress(next)
  return next
}

export function clearQuranProgress(): QuranProgress {
  const next = cloneProgress(DEFAULT_QURAN_PROGRESS)
  saveQuranProgress(next)
  return next
}

function normalizeProgress(value: unknown): QuranProgress {
  const maybe = value && typeof value === 'object' ? value as Partial<QuranProgress> : {}
  return {
    lastReadSurah: normalizeNumber(maybe.lastReadSurah),
    lastReadAyah: normalizeNumber(maybe.lastReadAyah),
    updatedAt: typeof maybe.updatedAt === 'string' ? maybe.updatedAt : null,
    perSurahProgress: normalizePerSurahProgress(maybe.perSurahProgress),
    recentlyRead: Array.isArray(maybe.recentlyRead) ? maybe.recentlyRead.map(normalizeRecent).filter(Boolean).slice(0, 8) as QuranProgress['recentlyRead'] : [],
    favoriteSurahs: Array.isArray(maybe.favoriteSurahs)
      ? [...new Set(maybe.favoriteSurahs.map(normalizeNumber).filter((item): item is number => item !== null))].sort((a, b) => a - b)
      : []
  }
}

function normalizePerSurahProgress(value: unknown): QuranProgress['perSurahProgress'] {
  if (!value || typeof value !== 'object') return {}
  const result: QuranProgress['perSurahProgress'] = {}
  for (const [key, item] of Object.entries(value as Record<string, { lastAyah?: unknown; totalAyahs?: unknown; progressPercent?: unknown; completedAt?: unknown; updatedAt?: unknown }>)) {
    const lastAyah = normalizeNumber(item.lastAyah)
    const totalAyahs = normalizeNumber(item.totalAyahs)
    const progressPercent = normalizeNumber(item.progressPercent)
    if (!lastAyah) continue
    result[key] = {
      lastAyah,
      totalAyahs: totalAyahs ?? undefined,
      progressPercent: progressPercent ?? undefined,
      completedAt: typeof item.completedAt === 'string' ? item.completedAt : undefined,
      updatedAt: typeof item.updatedAt === 'string' ? item.updatedAt : new Date().toISOString()
    }
  }
  return result
}

function normalizeRecent(value: unknown) {
  const maybe = value && typeof value === 'object' ? value as QuranProgress['recentlyRead'][number] : null
  if (!maybe) return null
  const surah = normalizeNumber(maybe.surah)
  const ayah = normalizeNumber(maybe.ayah)
  if (!surah || !ayah) return null
  return {
    surah,
    ayah,
    title: typeof maybe.title === 'string' ? maybe.title : undefined,
    surahName: typeof maybe.surahName === 'string' ? maybe.surahName : typeof maybe.title === 'string' ? maybe.title : undefined,
    updatedAt: typeof maybe.updatedAt === 'string' ? maybe.updatedAt : new Date().toISOString()
  }
}

function normalizeNumber(value: unknown): number | null {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : null
}

function cloneProgress(progress: QuranProgress): QuranProgress {
  return {
    ...progress,
    perSurahProgress: { ...progress.perSurahProgress },
    recentlyRead: progress.recentlyRead.map((item) => ({ ...item })),
    favoriteSurahs: [...progress.favoriteSurahs]
  }
}
