import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import PwaStatus from './PwaStatus'

const mocks = vi.hoisted(() => ({ refresh: vi.fn() }))
vi.mock('../lib/pwa', () => ({
  ATHAN_APP_UPDATED_AT: '2026-10-05', ATHAN_APP_VERSION: '4.0.0',
  getInstalledVersion: () => '4.0.0', isPwaInstalled: () => true,
  refreshAthanApp: mocks.refresh, requestPwaInstall: vi.fn(), subscribeInstallPrompt: () => () => undefined
}))

beforeEach(() => { localStorage.clear(); mocks.refresh.mockReset(); vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true) })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('PWA update status', () => {
  it('allows retry after a failed update check and explains cache preservation', async () => {
    mocks.refresh.mockImplementation(async (callback) => callback('fallback'))
    render(<PwaStatus />)
    fireEvent.click(screen.getByRole('button', { name: 'Check for update' }))
    await screen.findByText(/Your current app and offline files are preserved/)
    await waitFor(() => expect(screen.getByRole('button', { name: 'Check for update' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'Check for update' }))
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledTimes(2))
  })

  it('keeps an initiated check alive while its disclosure is collapsed', async () => {
    let finish: () => void = () => undefined
    mocks.refresh.mockImplementation(() => new Promise<void>((resolve) => { finish = resolve }))
    render(<PwaStatus />)
    fireEvent.click(screen.getByRole('button', { name: 'Check for update' }))
    fireEvent.click(screen.getByRole('button', { name: 'Collapse PWA status' }))
    expect(mocks.refresh).toHaveBeenCalledTimes(1)
    await act(async () => { finish() })
    fireEvent.click(screen.getByRole('button', { name: 'Expand PWA status' }))
    expect(screen.getByRole('button', { name: 'Check for update' })).toBeEnabled()
  })
})
