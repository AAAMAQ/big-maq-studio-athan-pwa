import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Credits from './Credits'
import { parseSharedDefaultsUrl } from '../lib/sharedDefaults'
import { defaultAppLayout, saveAppLayout } from '../lib/appLayout'

const share = vi.fn<(data: { url: string }) => Promise<void>>().mockResolvedValue(undefined)
beforeEach(() => {
  localStorage.clear()
  share.mockClear()
  vi.stubGlobal('navigator', { share })
})
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('Credits defaults sharing', () => {
  it('keeps custom layout off by default and creates legacy ordinary links', async () => {
    render(<Credits />)
    expect(screen.getByRole('checkbox', { name: 'Include custom layout in shared defaults' })).not.toBeChecked()
    fireEvent.click(screen.getByRole('button', { name: 'Share Your Defaults' }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    const parsed = parseSharedDefaultsUrl(share.mock.calls[0][0].url)
    expect(parsed?.version).toBe(1)
    expect(parsed?.layout).toBeUndefined()
    expect(screen.getByRole('status')).toHaveTextContent('non-personal defaults')
  })

  it('includes only selected layout metadata, with no private tracker values', async () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, homeSections: { salahBrief: true } })
    localStorage.setItem('salahLogV1', 'PRIVATE_HISTORY')
    render(<Credits />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Include custom layout in shared defaults' }))
    fireEvent.click(screen.getByRole('button', { name: 'Share Your Defaults' }))
    await waitFor(() => expect(share).toHaveBeenCalledOnce())
    const parsed = parseSharedDefaultsUrl(share.mock.calls[0][0].url)
    expect(parsed?.version).toBe(2)
    expect(parsed?.layout?.homeSections?.salahBrief).toBe(true)
    expect(JSON.stringify(parsed)).not.toContain('PRIVATE_HISTORY')
    expect(screen.getByRole('status')).toHaveTextContent('custom layout')
  })

  it('reports link-creation errors without triggering a share', async () => {
    render(<Credits />)
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('unavailable') })
    fireEvent.click(screen.getByRole('button', { name: 'Share Your Defaults' }))
    await screen.findByText('Your defaults could not be shared right now.')
    expect(share).not.toHaveBeenCalled()
  })
})
