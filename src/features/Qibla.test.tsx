import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Qibla from './Qibla'

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(), reverse: vi.fn(), save: vi.fn(), start: vi.fn(),
  stop: vi.fn(), request: vi.fn(), watch: vi.fn(), clearWatch: vi.fn()
}))

vi.mock('../lib/locationStore', () => ({
  refreshDeviceLocation: mocks.refresh, reverseGeocodeCoordinates: mocks.reverse, saveCachedLocation: mocks.save
}))
vi.mock('../lib/qiblaHeading', () => ({
  isQiblaCompassSupported: () => true,
  qiblaHeadingSourceLabel: () => 'iPhone compass',
  startQiblaCompassEngine: mocks.start
}))

const location = { latitude: 31.2, longitude: 121.5, source: 'device', updatedAt: '2026-10-04T00:00:00Z' }
const ready = { location, permission: 'granted', loading: false, error: '' }

beforeEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
  vi.stubGlobal('navigator', { geolocation: { watchPosition: mocks.watch, clearWatch: mocks.clearWatch } })
  vi.stubGlobal('DeviceOrientationEvent', { requestPermission: mocks.request })
  mocks.watch.mockReturnValue(42)
  mocks.refresh.mockResolvedValue(ready)
  mocks.reverse.mockResolvedValue({ label: 'Shanghai, China', city: 'Shanghai', country: 'China', countryCode: 'CN' })
  mocks.request.mockResolvedValue('granted')
  mocks.start.mockImplementation((callbacks) => {
    callbacks.onReading({ heading: 120, source: 'ios-compass' })
    return { stop: mocks.stop }
  })
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('Qibla automatic startup', () => {
  it('automatically requests fresh location and iPhone compass access on each visit', async () => {
    const first = render(<Qibla />)
    await screen.findByText('Shanghai, China')
    expect(mocks.refresh).toHaveBeenCalledWith({ allowCachedFallback: false })
    expect(mocks.request).toHaveBeenCalledOnce()
    expect(screen.queryByRole('button', { name: 'Enable Location' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Enable Compass' })).not.toBeInTheDocument()
    first.unmount()
    expect(mocks.stop).toHaveBeenCalledTimes(1)
    expect(mocks.clearWatch).toHaveBeenCalledWith(42)
    render(<Qibla />)
    await screen.findByText('Shanghai, China')
    expect(mocks.refresh).toHaveBeenCalledTimes(2)
    expect(mocks.start).toHaveBeenCalledTimes(2)
    expect(mocks.request).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Enable Compass' })).not.toBeInTheDocument()
  })

  it('offers a location retry after failure and does not use a stale cached location as current', async () => {
    mocks.refresh.mockResolvedValueOnce({ ...ready, permission: 'denied', error: 'Denied' })
    render(<Qibla />)
    const retry = await screen.findByRole('button', { name: 'Enable Location' })
    expect(mocks.watch).not.toHaveBeenCalled()
    fireEvent.click(retry)
    await screen.findByText('Shanghai, China')
    expect(mocks.refresh).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('button', { name: 'Enable Location' })).not.toBeInTheDocument()
  })

  it('keeps a manual compass action when Safari requires a user gesture for permission', async () => {
    mocks.start.mockReturnValue({ stop: mocks.stop })
    mocks.request.mockRejectedValueOnce(new DOMException('A tap is required', 'NotAllowedError'))
    render(<Qibla />)
    await screen.findByText(/iOS may require this tap/)
    expect(mocks.request).toHaveBeenCalledOnce()
    fireEvent.click(await screen.findByRole('button', { name: 'Enable Compass' }))
    await screen.findByText(/Motion access granted, but the compass is not live yet/)
    expect(mocks.request).toHaveBeenCalledTimes(2)
    // Permission alone is not proof of a live sensor; keep the retry visible.
    expect(screen.getByRole('button', { name: 'Enable Compass' })).toBeEnabled()
    expect(mocks.stop).toHaveBeenCalledOnce()
    expect(mocks.start).toHaveBeenCalledTimes(2)
  })

  it('does not start a location watch after the screen closes during a request', async () => {
    let resolveLocation!: (value: typeof ready) => void
    mocks.refresh.mockReturnValue(new Promise((resolve) => { resolveLocation = resolve }))
    const view = render(<Qibla />)
    view.unmount()
    await act(async () => { resolveLocation(ready) })
    expect(mocks.watch).not.toHaveBeenCalled()
    expect(mocks.reverse).not.toHaveBeenCalled()
  })

  it('keeps a working compass if the automatic permission call rejects after readings arrive', async () => {
    let rejectPermission!: (reason: Error) => void
    mocks.request.mockReturnValue(new Promise((_resolve, reject) => { rejectPermission = reject }))
    mocks.start.mockReturnValue({ stop: mocks.stop })
    render(<Qibla />)
    await screen.findByText('Shanghai, China')
    act(() => { mocks.start.mock.calls[0][0].onReading({ heading: 120, source: 'ios-compass' }) })
    await act(async () => { rejectPermission(new Error('A tap is required')) })
    expect(screen.queryByRole('button', { name: 'Enable Compass' })).not.toBeInTheDocument()
    expect(screen.getByText(/iPhone compass ready/)).toBeInTheDocument()
  })

  it('requests again on entry after denial, and guards duplicate pending taps', async () => {
    mocks.start.mockReturnValue({ stop: mocks.stop })
    let resolvePermission!: (value: string) => void
    mocks.request.mockReturnValue(new Promise(resolve => { resolvePermission = resolve }))
    const view = render(<Qibla />)
    const enable = await screen.findByRole('button', { name: 'Requesting compass access…' })
    expect(enable).toBeDisabled()
    fireEvent.click(enable)
    expect(mocks.request).toHaveBeenCalledOnce()
    await act(async () => { resolvePermission('denied') })
    expect(screen.getByText(/Compass access was not allowed/)).toBeVisible()
    view.unmount()
    render(<Qibla />)
    await screen.findByRole('button', { name: 'Requesting compass access…' })
    expect(mocks.request).toHaveBeenCalledTimes(2)
    await act(async () => { resolvePermission('denied') })
  })

  it('ignores a permission result after leaving the screen', async () => {
    mocks.start.mockReturnValue({ stop: mocks.stop })
    let resolvePermission!: (value: string) => void
    mocks.request.mockReturnValue(new Promise(resolve => { resolvePermission = resolve }))
    const view = render(<Qibla />)
    await screen.findByRole('button', { name: 'Requesting compass access…' })
    view.unmount()
    await act(async () => { resolvePermission('granted') })
    expect(mocks.start).toHaveBeenCalledOnce()
    expect(mocks.stop).toHaveBeenCalledOnce()
  })

  it('shows a live status only after a verified heading and offers retry after no sensor data', async () => {
    mocks.start.mockReturnValue({ stop: mocks.stop })
    render(<Qibla />)
    await screen.findByText(/Motion access granted, but the compass is not live yet/)
    act(() => { mocks.start.mock.calls.at(-1)![0].onUnavailable('No iPhone compass heading was received.') })
    expect(screen.getByText(/No iPhone compass heading was received.*compass is not live/)).toBeVisible()
    fireEvent.click(screen.getByRole('button', { name: 'Enable Compass' }))
    await waitFor(() => expect(mocks.start).toHaveBeenCalledTimes(3))
    act(() => { mocks.start.mock.calls.at(-1)![0].onReading({ heading: 0, source: 'ios-compass' }) })
    expect(screen.getByText(/Live compass.*iPhone compass ready/)).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Enable Compass' })).not.toBeInTheDocument()
  })

  it('shows the same permission fallback in Advanced mode', async () => {
    mocks.start.mockReturnValue({ stop: mocks.stop })
    mocks.request.mockRejectedValue(new DOMException('A tap is required', 'NotAllowedError'))
    render(<Qibla />)
    await screen.findByText('Shanghai, China')
    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }))
    expect(screen.getByText(/iOS may require this tap/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'Enable Compass' })).toBeEnabled()
  })

  it('starts without the iOS permission API in other supported browsers', async () => {
    vi.stubGlobal('DeviceOrientationEvent', {})
    render(<Qibla />)
    await screen.findByText(/Live compass.*iPhone compass ready/)
    expect(mocks.request).not.toHaveBeenCalled()
    expect(mocks.start).toHaveBeenCalledOnce()
  })
})
