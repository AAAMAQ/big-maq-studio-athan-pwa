import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SalahTracker from './SalahTracker'
import { loadSalahStore, SALAH_LOG_STORAGE_KEY } from '../lib/salahStore'

vi.mock('../lib/locationStore', () => ({ refreshDeviceLocation: () => Promise.resolve({ location: null }) }))
beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 5, 12))
  localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-05': { Fajr: true, Dhuhr: true, Asr: true, Maghrib: false, Sunnah: true, Notes: 'Synthetic reflection' } }))
})
afterEach(() => { cleanup(); localStorage.clear(); vi.useRealTimers(); vi.restoreAllMocks() })

describe('calendar stars and unchanged obligatory actions', () => {
  it('shows 3/4 logged separately from three of five stars and neutral future dates', () => {
    render(<SalahTracker go={vi.fn()} initialDate="2026-10-05" />)
    expect(screen.getByRole('button', { name: /Mon Oct 05 2026: 3 completed of 4 logged; 3 of 5 stars/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Tue Oct 06 2026: .*future date, stars not applicable/ })).toBeTruthy()
    expect(screen.getByText(/3 completed · 1 missed · 1 not logged/)).toBeTruthy()
  })
  it('Mark All and Clear All preserve notes and Sunnahs while stars refresh', () => {
    render(<SalahTracker go={vi.fn()} initialDate="2026-10-05" />)
    fireEvent.click(screen.getByRole('button', { name: 'Mark all completed' }))
    expect(screen.getByRole('button', { name: /Mon Oct 05 2026: 5 completed of 5 logged; 5 of 5 stars/ })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Clear all obligatory' }))
    expect(loadSalahStore()['2026-10-05']).toEqual({ Sunnah: true, Notes: 'Synthetic reflection' })
    expect(screen.getByText('No data for this day')).toBeTruthy()
    expect(screen.getByRole('button', { name: /Mon Oct 05 2026: 0 completed of 0 logged; 0 of 5 stars/ })).toBeTruthy()
  })
})
