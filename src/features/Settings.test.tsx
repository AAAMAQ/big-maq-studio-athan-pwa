import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Settings from './Settings'
import { loadAppLayout } from '../lib/appLayout'
import { loadPerformancePreferences } from '../lib/performancePreferences'
import { QIBLA_AUTO_LOCATION_KEY, loadAutomaticQiblaLocation } from '../lib/qiblaPreferences'

const mocks = vi.hoisted(() => ({ resolve: vi.fn(), build: vi.fn(), download: vi.fn() }))
vi.mock('../components/PwaStatus', () => ({ default: () => <div>PWA fixture</div> }))
vi.mock('../lib/locationStore', () => ({ loadCachedLocation: () => null, refreshDeviceLocation: async () => ({ location: null }), reverseGeocodeCoordinates: vi.fn(), saveCachedLocation: vi.fn() }))
vi.mock('../lib/ics', () => ({ downloadICS: mocks.download }))
vi.mock('../lib/settingsRichCalendar', () => ({ buildSettingsRichCalendar: mocks.build, settingsRichFilename: () => 'fixture.ics' }))
vi.mock('../lib/primaryPrayerSource', () => ({ resolvePrimaryPrayerSource: mocks.resolve, sourceDateKey: () => '2026-10-05', prayerTimesForPrimarySourceDate: () => ({}) }))

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); mocks.build.mockReturnValue('BEGIN:VCALENDAR') })
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Settings integration', () => {
  it('offers automatic location as private opt-in and keeps Sunnah display outside Preferences', async () => {
    localStorage.setItem('athan.preference.showSunnah.v1', 'true')
    localStorage.setItem('athan.travel.currentCityId.v1', 'saved-city-fixture')
    await act(async () => { render(<Settings />) })
    const automaticLocation = screen.getByRole('checkbox', { name: /Prepare device location for Qibla/ })
    expect(automaticLocation).not.toBeChecked()
    expect(screen.queryByRole('checkbox', { name: /Show Sunnahs/ })).not.toBeInTheDocument()
    fireEvent.click(automaticLocation)
    expect(loadAutomaticQiblaLocation()).toBe(true)
    expect(localStorage.getItem('athan.travel.currentCityId.v1')).toBe('saved-city-fixture')
    expect(localStorage.getItem('athan.preference.showSunnah.v1')).toBe('true')
    fireEvent.click(automaticLocation)
    expect(localStorage.getItem(QIBLA_AUTO_LOCATION_KEY)).toBe('false')
  })

  it('keeps automatic location off when preference saving fails', async () => {
    await act(async () => { render(<Settings />) })
    const automaticLocation = screen.getByRole('checkbox', { name: /Prepare device location for Qibla/ })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    fireEvent.click(automaticLocation)
    expect(automaticLocation).not.toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent('Automatic location preference could not be saved')
  })

  it('keeps a calendar export and its selected offset intact while collapsed', async () => {
    let resolve: (value: unknown) => void = () => undefined
    mocks.resolve.mockImplementation(() => new Promise((finish) => { resolve = finish }))
    await act(async () => { render(<Settings />) })
    fireEvent.change(screen.getByRole('combobox', { name: 'Minutes before each prayer' }), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Export 1 day' }))
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Calendar reminders (.ics)' }))
    expect(screen.queryByRole('button', { name: 'Export 1 day' })).not.toBeInTheDocument()
    await act(async () => { resolve({ timezone: 'Asia/Shanghai', locationLabel: 'Fixture City', sourceLabel: 'Fixture source', latitude: 31, longitude: 121, settings: { method: 'MuslimWorldLeague', madhab: 'Shafi', highLatRule: 'MiddleOfTheNight' } }) })
    expect(mocks.build).toHaveBeenCalledWith(expect.objectContaining({ reminderMinutes: 30 }))
    expect(mocks.download).toHaveBeenCalledWith('fixture.ics', 'BEGIN:VCALENDAR')
    fireEvent.click(screen.getByRole('button', { name: 'Expand Calendar reminders (.ics)' }))
    expect(screen.getByRole('combobox', { name: 'Minutes before each prayer' })).toHaveValue('30')
  })

  it('exposes universal disclosure and independent optional modes with protected Hub access', async () => {
    const go = vi.fn()
    await act(async () => { render(<Settings go={go} />) })
    expect(screen.getByRole('button', { name: 'Collapse Preferences' })).toBeInTheDocument()
    expect(loadAppLayout().enabled).toBe(false)
    expect(loadPerformancePreferences().enabled).toBe(false)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Performance Mode' }))
    expect(loadPerformancePreferences().enabled).toBe(true)
    expect(loadAppLayout().enabled).toBe(false)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Custom Layout' }))
    expect(loadAppLayout().enabled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Feature Hub — all features' }))
    expect(go).toHaveBeenCalledWith('FeatureHub')
  })
})
