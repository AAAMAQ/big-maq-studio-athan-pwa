import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SALAH_DATA_CHANGE_EVENT, SALAH_LOG_STORAGE_KEY } from './salahStore'
import { useSalahData, useSalahTodayKey } from './useSalahData'

afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); localStorage.clear() })

describe('tracker live local data', () => {
  it('does not rewrite records on mount and reacts to same-tab restore', () => {
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const { result } = renderHook(useSalahData)
    expect(write).not.toHaveBeenCalled()
    act(() => {
      localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify({ '2026-10-05': { Fajr: true, Notes: 'Synthetic' } }))
      window.dispatchEvent(new Event(SALAH_DATA_CHANGE_EVENT))
    })
    expect(result.current.store['2026-10-05']).toEqual({ Fajr: true, Notes: 'Synthetic' })
  })
  it('retains an unsaved draft and exposes failed persistence honestly', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    const { result } = renderHook(useSalahData)
    act(() => { expect(result.current.updateStore(() => ({ '2026-10-05': { Fajr: true } }))).toBe(false) })
    expect(result.current.store['2026-10-05'].Fajr).toBe(true)
    expect(result.current.storageError).toContain('could not be saved')
  })
  it('refreshes relative context at tracker midnight and stops its timer on unmount', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 5, 23, 59, 59))
    const { result, unmount } = renderHook(useSalahTodayKey)
    expect(result.current).toBe('2026-10-05')
    act(() => { vi.advanceTimersByTime(1100) })
    expect(result.current).toBe('2026-10-06')
    unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
