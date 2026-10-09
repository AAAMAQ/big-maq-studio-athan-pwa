import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AppLayout from './AppLayout'
import FeatureHub from './FeatureHub'
import More from './More'
import { APP_LAYOUT_KEY, defaultAppLayout, loadAppLayout, saveAppLayout } from '../lib/appLayout'
import { loadPerformancePreferences } from '../lib/performancePreferences'
import { loadShowSunnah } from '../lib/preferences'

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Layout editor', () => {
  it('preserves the existing Sunnah preference and saves it independently of layout drafts', () => {
    localStorage.setItem('athan.preference.showSunnah.v1', 'true')
    localStorage.setItem('salahLogV1', 'private fixture')
    render(<AppLayout />)
    const sunnah = screen.getByRole('checkbox', { name: 'Show Sunnahs in Salah Tracker' })
    expect(sunnah).toBeChecked()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(sunnah)
    expect(loadShowSunnah()).toBe(false)
    expect(loadAppLayout().enabled).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel layout edits' }))
    expect(loadShowSunnah()).toBe(false)
    expect(localStorage.getItem('salahLogV1')).toBe('private fixture')
  })

  it('does not falsely save Sunnah display when storage is full', () => {
    render(<AppLayout />)
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Show Sunnahs in Salah Tracker' }))
    expect(screen.getByRole('checkbox', { name: 'Show Sunnahs in Salah Tracker' })).not.toBeChecked()
    expect(screen.getByRole('status')).toHaveTextContent('Tracker display preference could not be saved')
  })

  it('previews and saves optional Salah Brief without copying tracker data', () => {
    localStorage.setItem('salahLogV1', 'private fixture')
    render(<AppLayout />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Show Salah Brief/ }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Salah Brief chart' }), { target: { value: 'bars' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview layout' }))
    expect(screen.getByText(/Salah Brief — this week's tracker graphs/)).toBeVisible()
    expect(loadAppLayout().homeSections?.salahBrief).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }))
    expect(loadAppLayout().homeSections?.salahBrief).toBe(true)
    expect(loadAppLayout().homeSections?.salahBriefView).toBe('bars')
    expect(localStorage.getItem('salahLogV1')).toBe('private fixture')
  })
  it('previews drafts without writes, then cancel leaves saved preferences unchanged', () => {
    const go = vi.fn()
    render(<AppLayout go={go} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Settings from Navigation hub' }))
    fireEvent.click(screen.getByRole('button', { name: 'Preview layout' }))
    expect(screen.getByText(/Settings remains inside Feature Hub/)).toBeInTheDocument()
    expect(localStorage.getItem(APP_LAYOUT_KEY)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Cancel layout edits' }))
    expect(loadAppLayout()).toEqual(defaultAppLayout())
    expect(go).toHaveBeenCalledWith('Settings')
  })

  it('saves ordered extras, respects four-extra capacity, and allows cross-surface duplicates', () => {
    render(<AppLayout />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move Settings up in Navigation hub' }))
    const select = screen.getByRole('combobox', { name: 'Add shortcut to Navigation hub' })
    fireEvent.change(select, { target: { value: 'Quran' } })
    fireEvent.change(select, { target: { value: 'SalahTracker' } })
    expect(select).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }))
    expect(loadAppLayout().navigation).toEqual(['Settings', 'Prayer', 'Quran', 'SalahTracker'])
    expect(loadAppLayout().home).toContain('Quran')
    expect(screen.queryByRole('button', { name: 'Remove Home from Navigation hub' })).not.toBeInTheDocument()
  })

  it('keeps customization when disabled and resets only a draft until Save', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: ['Quran'] })
    localStorage.setItem('salahLogV1', 'private fixture')
    render(<AppLayout />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }))
    expect(loadAppLayout()).toMatchObject({ enabled: false, navigation: ['Quran'] })
    fireEvent.click(screen.getByRole('button', { name: 'Reset layout draft' }))
    expect(loadAppLayout().navigation).toEqual(['Quran'])
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }))
    expect(loadAppLayout()).toEqual(defaultAppLayout())
    expect(localStorage.getItem('salahLogV1')).toBe('private fixture')
  })

  it('saves performance independently from the unsaved layout', () => {
    render(<AppLayout />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Performance Mode' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Quran' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save performance preferences' }))
    expect(loadPerformancePreferences()).toMatchObject({ enabled: true, priorities: ['Quran'] })
    expect(loadAppLayout().enabled).toBe(false)
  })

  it('reports storage failure and keeps the current draft', () => {
    render(<AppLayout />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' }))
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    fireEvent.click(screen.getByRole('button', { name: 'Save layout' }))
    expect(screen.getByRole('status')).toHaveTextContent('could not be saved')
    expect(screen.getByRole('checkbox', { name: 'Enable Custom Layout when saved' })).toBeChecked()
    expect(loadAppLayout().enabled).toBe(false)
  })
})

describe('Feature Hub and More', () => {
  it('opens hidden roots without editing layouts or feature records', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: [], home: [], more: [] })
    localStorage.setItem('iqamaRules', 'saved fixture')
    const go = vi.fn()
    render(<FeatureHub go={go} />)
    fireEvent.click(screen.getByRole('button', { name: 'Iqama Times' }))
    expect(go).toHaveBeenCalledWith('Iqama')
    expect(screen.queryByRole('button', { name: 'Add to Home' })).toBeNull()
    expect(loadAppLayout().home).toEqual([])
    expect(localStorage.getItem('iqamaRules')).toBe('saved fixture')
  })

  it('uses custom More ordering and preserves protected access with an empty list', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, more: ['Quran', 'Iqama'] })
    const go = vi.fn()
    const first = render(<More go={go} />)
    expect(screen.getAllByRole('button').slice(0, 2).map((button) => button.textContent)).toEqual(['Quran', expect.stringContaining('Iqama Times')])
    fireEvent.click(screen.getByRole('button', { name: 'Quran' }))
    expect(go).toHaveBeenCalledWith('Quran')
    first.unmount()
    saveAppLayout({ ...defaultAppLayout(), enabled: true, more: [] })
    render(<More go={go} />)
    expect(screen.getByText(/No shortcuts selected/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Feature Hub' })).toBeInTheDocument()
  })
})
