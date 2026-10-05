import { act, cleanup, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PrayerTimes from './PrayerTimes'

const mocks = vi.hoisted(() => ({ context: vi.fn(), dateKey: vi.fn(), nextPrayer: vi.fn() }))
vi.mock('../lib/primaryPrayerSource', () => ({
  getPrimaryPrayerContext: mocks.context,
  loadPrimarySavedCity: () => null,
  sourceDateKey: mocks.dateKey,
  formatPrimaryPrayerTime: () => '12:00 PM',
  primaryTimeViewLabel: () => 'Device time',
}))
vi.mock('../lib/prayer', () => ({ nextPrayer: mocks.nextPrayer }))
vi.mock('./PrayerMonth', () => ({ default: () => null }))

const times = Object.fromEntries(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'].map((name) => [name, new Date('2026-10-05T12:00:00Z')]))
const context = { times, nextFajr: new Date('2026-10-06T05:00:00Z'), dateKey: '2026-10-05', locationLabel: 'Test city', sourceLabel: 'Test method', savedCity: null }

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-05T10:00:00Z'))
  vi.resetAllMocks()
  mocks.context.mockResolvedValue(context)
  mocks.dateKey.mockReturnValue('2026-10-05')
  mocks.nextPrayer.mockReturnValue({ name: 'dhuhr', time: new Date('2026-10-05T12:00:00Z') })
})
afterEach(() => { cleanup(); vi.useRealTimers() })

describe('Prayer Times request lifecycle', () => {
  it('ignores initial calculation arriving after screen close', async () => {
    let resolve!: (value: typeof context) => void
    mocks.context.mockReturnValue(new Promise((done) => { resolve = done }))
    const view = render(<PrayerTimes />)
    view.unmount()
    await act(async () => { resolve(context) })
    expect(mocks.nextPrayer).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('deduplicates midnight refresh while pending and ignores completion after unmount', async () => {
    const view = render(<PrayerTimes />)
    await act(async () => { await Promise.resolve() })
    let resolve!: (value: typeof context) => void
    mocks.dateKey.mockReturnValue('2026-10-06')
    mocks.context.mockReturnValue(new Promise((done) => { resolve = done }))
    await act(async () => { await vi.advanceTimersByTimeAsync(90_000) })
    expect(mocks.context).toHaveBeenCalledTimes(2)
    const calculations = mocks.nextPrayer.mock.calls.length
    view.unmount()
    await act(async () => { resolve({ ...context, dateKey: '2026-10-06' }) })
    expect(mocks.nextPrayer).toHaveBeenCalledTimes(calculations)
    expect(vi.getTimerCount()).toBe(0)
  })
})
