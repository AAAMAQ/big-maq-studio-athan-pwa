import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Quran from './Quran'
import { markAyahRead } from '../lib/quranProgress'

const mocks = vi.hoisted(() => ({ list: vi.fn(), content: vi.fn() }))
vi.mock('../lib/quran', () => ({ fetchSurahs: mocks.list, fetchSurah: mocks.content }))
const surahs = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatihah', englishNameTranslation: 'The Opening', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', englishNameTranslation: 'The Cave', numberOfAyahs: 110 },
]
const content = (length: number) => ({ arabic: Array.from({ length }, (_, index) => ({ number: index + 1, text: `Arabic ${index + 1}` })), english: Array.from({ length }, (_, index) => ({ number: index + 1, text: `Translation ${index + 1}` })) })
let scroll: ReturnType<typeof vi.fn>
beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  mocks.list.mockResolvedValue(surahs)
  mocks.content.mockImplementation((number: number) => Promise.resolve(content(number === 2 ? 286 : number === 18 ? 110 : 7)))
  scroll = vi.fn()
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', { value: scroll, writable: true, configurable: true })
})
afterEach(() => { cleanup(); vi.useRealTimers() })

describe('Quran navigation intents', () => {
  it('opens a searched Surah at its existing last-read verse after the intended content arrives', async () => {
    markAyahRead(18, 6, 'Al-Kahf', 110)
    let resolve!: (value: ReturnType<typeof content>) => void
    mocks.content.mockReturnValue(new Promise((done) => { resolve = done }))
    await act(async () => { render(<Quran navigationIntent={{ screen: 'Quran', surah: 18 }} />) })
    expect(mocks.content.mock.calls[0][0]).toBe(18)
    expect(scroll).not.toHaveBeenCalled()
    await act(async () => { resolve(content(110)) })
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).id === 'ayah-18-6')).toBe(true))
    expect(screen.getByRole('button', { name: 'Current last read Ayah' })).toHaveTextContent('Last read')
    expect(screen.getByText('Al-Kahf')).toBeInTheDocument()
  })

  it('Continue Reading uses the saved global verse, or begins Al-Fatihah when nothing was read', async () => {
    markAyahRead(2, 4, 'Al-Baqarah', 286)
    await act(async () => { render(<Quran navigationIntent={{ screen: 'Quran', view: 'continue' }} />) })
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).id === 'ayah-2-4')).toBe(true))
    cleanup()
    localStorage.clear()
    scroll.mockClear()
    await act(async () => { render(<Quran navigationIntent={{ screen: 'Quran', view: 'continue' }} />) })
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).id === 'ayah-1-1')).toBe(true))
  })

  it('opens Juz at its explicit start rather than overriding it with last-read progress', async () => {
    markAyahRead(2, 5, 'Al-Baqarah', 286)
    await act(async () => { render(<Quran navigationIntent={{ screen: 'Quran', juz: 2 }} />) })
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).id === 'ayah-2-142')).toBe(true))
    expect(mocks.content.mock.calls[0][0]).toBe(2)
  })

  it('opens saved/search/list/Juz/daily/recent panels without replaying an intent after local actions', async () => {
    const view = render(<Quran navigationIntent={{ screen: 'Quran', view: 'saved' }} />)
    await screen.findByText('Saved Quran Places')
    view.rerender(<Quran navigationIntent={{ screen: 'Quran', view: 'search' }} />)
    expect(screen.getByRole('textbox', { name: 'Search Quran verses' })).toBeInTheDocument()
    view.rerender(<Quran navigationIntent={{ screen: 'Quran', view: 'surahs' }} />)
    fireEvent.click(screen.getByRole('button', { name: /18.*Al-Kahf/ }))
    expect(screen.getByRole('button', { name: '← Quran' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '← Quran' }))
    expect(screen.queryByRole('button', { name: '← Quran' })).not.toBeInTheDocument()
    view.rerender(<Quran navigationIntent={{ screen: 'Quran', view: 'juz' }} />)
    expect(screen.getByText('Open a Juz at its first Ayah.')).toBeInTheDocument()
    view.rerender(<Quran navigationIntent={{ screen: 'Quran', view: 'daily' }} />)
    expect(screen.getByRole('heading', { name: 'Ayah of the Day' })).toBeInTheDocument()
    view.rerender(<Quran navigationIntent={{ screen: 'Quran', view: 'recent' }} />)
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).textContent?.startsWith('Recently Read'))).toBe(true))
  })

  it('does not scroll a pending verse after leaving the reader', async () => {
    let resolve!: (value: ReturnType<typeof content>) => void
    mocks.content.mockReturnValue(new Promise((done) => { resolve = done }))
    const view = render(<Quran navigationIntent={{ screen: 'Quran', surah: 18 }} />)
    view.unmount()
    await act(async () => { resolve(content(110)) })
    expect(scroll).not.toHaveBeenCalled()
  })

  it('consumes reader/panel entry intents, retaining pending content scroll after parent clears them', async () => {
    const handled = vi.fn()
    const view = render(<Quran navigationIntent={{ screen: 'Quran', view: 'search' }} onNavigationHandled={handled} />)
    expect(handled).toHaveBeenCalledTimes(1)
    view.rerender(<Quran onNavigationHandled={handled} />)
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Search Quran verses' })).toHaveFocus())
    expect(handled).toHaveBeenCalledTimes(1)
    cleanup()
    handled.mockClear()
    markAyahRead(18, 6, 'Al-Kahf', 110)
    const reader = render(<Quran navigationIntent={{ screen: 'Quran', surah: 18 }} onNavigationHandled={handled} />)
    expect(handled).toHaveBeenCalledTimes(1)
    reader.rerender(<Quran onNavigationHandled={handled} />)
    await waitFor(() => expect(scroll.mock.instances.some((element) => (element as HTMLElement).id === 'ayah-18-6')).toBe(true))
  })
})
