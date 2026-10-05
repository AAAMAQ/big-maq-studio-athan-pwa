import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './Home'
import { defaultAppLayout, saveAppLayout } from '../lib/appLayout'

const mocks = vi.hoisted(() => ({ context: vi.fn(), dateKey: vi.fn(), hijri: vi.fn() }))
vi.mock('../lib/primaryPrayerSource', () => ({
  getPrimaryPrayerContext: mocks.context,
  loadPrimarySavedCity: () => null,
  formatPrimaryPrayerTime: () => '—',
  primaryTimeViewLabel: () => 'Device time',
  sourceDateKey: mocks.dateKey
}))
vi.mock('../lib/hijri', () => ({ formatHijri: mocks.hijri }))
vi.mock('../lib/ramadan', () => ({ loadRamadanSettings: () => ({}), getRamadanStatus: () => 'inactive', getRamadanDay: () => null }))

beforeEach(() => {
  localStorage.clear()
  vi.resetAllMocks()
  mocks.context.mockRejectedValue(new Error('No location in fixture'))
  mocks.dateKey.mockReturnValue('2026-10-05')
  mocks.hijri.mockReturnValue('Date fixture')
})
afterEach(() => { cleanup(); vi.useRealTimers() })

describe('Home layout protection', () => {
  it('retains default shortcuts and prayer preview but removes the redundant content title', async () => {
    await act(async () => { render(<Home go={vi.fn()} />) })
    expect(screen.getAllByRole('button').map((button) => button.textContent?.trim())).toEqual(['Quran', 'Qibla', 'More', 'Credits'])
    expect(screen.getByText('Current Prayer')).toBeInTheDocument()
    expect(screen.queryByText('Athan App')).not.toBeInTheDocument()
  })

  it('keeps Settings/Hub reachable with no shortcuts and refreshes a saved arrangement', async () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: [], home: [], more: [] })
    const go = vi.fn()
    await act(async () => { render(<Home go={go} />) })
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(go).toHaveBeenCalledWith('Settings')
    expect(screen.getByRole('button', { name: 'Feature Hub' })).toBeInTheDocument()
    expect(screen.getByText('Current Prayer')).toBeInTheDocument()
    act(() => { saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: ['Settings'], home: ['Iqama'] }) })
    expect(screen.queryByRole('button', { name: 'Settings' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Iqama Times' }))
    expect(go).toHaveBeenCalledWith('Iqama')
  })

  it('does not overlap midnight refreshes or update date state after closing', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'))
    const prayer = new Date('2026-10-05T12:00:00Z')
    const context = { dateKey: '2026-10-05', locationLabel: 'Test city', savedCity: null, times: { fajr: prayer, sunrise: prayer, dhuhr: prayer, asr: prayer, maghrib: prayer, isha: prayer }, nextFajr: new Date('2026-10-06T05:00:00Z') }
    mocks.context.mockResolvedValue(context)
    let view!: ReturnType<typeof render>
    await act(async () => { view = render(<Home go={vi.fn()} />) })
    let resolve!: (value: typeof context) => void
    mocks.dateKey.mockReturnValue('2026-10-06')
    mocks.context.mockReturnValue(new Promise((done) => { resolve = done }))
    await act(async () => { await vi.advanceTimersByTimeAsync(90_000) })
    expect(mocks.context).toHaveBeenCalledTimes(2)
    const dateUpdates = mocks.hijri.mock.calls.length
    view.unmount()
    await act(async () => { resolve({ ...context, dateKey: '2026-10-06' }) })
    expect(mocks.hijri).toHaveBeenCalledTimes(dateUpdates)
    expect(vi.getTimerCount()).toBe(0)
  })
})
