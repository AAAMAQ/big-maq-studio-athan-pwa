import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SalahBrief from './SalahBrief'
import SalahGraphs from './SalahGraphs'
import { SALAH_DATA_CHANGE_EVENT, SALAH_LOG_STORAGE_KEY } from '../lib/salahStore'
import { defaultAppLayout, loadAppLayout, saveAppLayout } from '../lib/appLayout'

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(2026, 9, 8, 12)); localStorage.clear() })
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.restoreAllMocks() })
const full = { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true }

describe('optional weekly Salah Brief', () => {
  it('defaults to the same daily trend as weekly Graph Insights, leaving blank days as gaps', () => {
    localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-04': { Fajr: false }, '2026-10-06': full, '2026-10-08': { Fajr: true, Dhuhr: false } }))
    const brief = render(<SalahBrief />)
    const chart = screen.getByRole('img', { name: /Daily completion rates/ })
    expect(chart.querySelectorAll('circle')).toHaveLength(3)
    expect(chart.querySelectorAll('path')).toHaveLength(3)
    expect(chart.getAttribute('aria-label')).toContain('Up 50 percentage points')
    expect(screen.queryByRole('region', { name: 'Prayer completion' })).toBeNull()
    const markup = chart.innerHTML
    brief.unmount()
    render(<SalahGraphs onOpenDay={vi.fn()} navigationIntent={{ screen: 'SalahGraphs', period: 'week' }} />)
    expect(screen.getByRole('img', { name: /Daily completion rates/ }).innerHTML).toBe(markup)
  })
  it('switches the saved optional choice without altering logs, and reports failed saves', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, homeSections: { salahBrief: true, salahBriefView: 'line' } })
    localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-08': full }))
    const before = localStorage.getItem(SALAH_LOG_STORAGE_KEY)
    const brief = render(<SalahBrief />)
    fireEvent.click(screen.getByRole('button', { name: 'Prayer bars' }))
    expect(loadAppLayout().homeSections).toEqual({ salahBrief: true, salahBriefView: 'bars' })
    brief.rerender(<SalahBrief view="bars" />)
    expect(screen.getByRole('button', { name: 'Prayer bars' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('region', { name: 'Prayer completion' })).toBeTruthy()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    fireEvent.click(screen.getByRole('button', { name: 'Line graph' }))
    expect(screen.getByRole('status')).toHaveTextContent('could not be saved')
    expect(localStorage.getItem(SALAH_LOG_STORAGE_KEY)).toBe(before)
    expect(loadAppLayout().homeSections?.salahBriefView).toBe('bars')
  })
  it('uses identical five-prayer chart data and presentation to weekly Graph Insights', () => {
    localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-04': full, '2026-10-05': { Fajr: false, Dhuhr: true }, '2026-10-09': full }))
    const brief = render(<SalahBrief view="bars" />)
    const markup = screen.getByRole('region', { name: 'Prayer completion' }).innerHTML
    expect(screen.getByText(/2\/5 days with obligatory logs/)).toBeTruthy()
    expect(within(screen.getByRole('region', { name: 'Prayer completion' })).getByText('50% · 1/2 logged')).toBeTruthy()
    brief.unmount()
    render(<SalahGraphs onOpenDay={vi.fn()} navigationIntent={{ screen: 'SalahGraphs', period: 'week' }} />)
    expect((screen.getByLabelText('Time period') as HTMLSelectElement).value).toBe('week')
    expect(screen.getByRole('region', { name: 'Prayer completion' }).innerHTML).toBe(markup)
    expect(screen.getByRole('img', { name: /Daily completion rates/ })).toBeTruthy()
  })
  it('has honest empty/sparse states and opens the weekly graph intent', () => {
    const navigate = vi.fn()
    render(<SalahBrief onNavigate={navigate} view="bars" />)
    expect(screen.getByText('No logged data this week.')).toBeTruthy()
    expect(screen.getAllByRole('img', { name: /no logged data/ })).toHaveLength(5)
    fireEvent.click(screen.getByRole('button', { name: 'View full graphs' }))
    expect(navigate).toHaveBeenCalledWith({ screen: 'SalahGraphs', period: 'week' })
    act(() => {
      localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-08': { Fajr: true } }))
      window.dispatchEvent(new Event(SALAH_DATA_CHANGE_EVENT))
    })
    expect(screen.queryByText('No logged data this week.')).toBeNull()
    expect(screen.getByRole('img', { name: 'Fajr: 1 of 1 logged prayers completed, 100%' })).toBeTruthy()
    expect(screen.getByText(/1\/5 days with obligatory logs/)).toBeTruthy()
  })
  it('refreshes at tracker-local midnight across the Sunday week boundary', () => {
    vi.setSystemTime(new Date(2026, 9, 10, 23, 59, 59))
    localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-10': full }))
    render(<SalahBrief />)
    expect(screen.getByText(/1\/7 days with obligatory logs/)).toBeTruthy()
    act(() => { vi.advanceTimersByTime(1100) })
    expect(screen.getByText('No logged data this week.')).toBeTruthy()
    expect(screen.getByText(/0\/1 days with obligatory logs/)).toBeTruthy()
  })
})
