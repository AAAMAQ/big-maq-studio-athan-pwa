import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import SharedDefaultsPrompt from './SharedDefaultsPrompt'
import { defaultAppLayout, saveAppLayout } from '../lib/appLayout'
import { applySharedDefaults, createSharedDefaults } from '../lib/sharedDefaults'

vi.mock('../lib/sharedDefaults', async (original) => {
  const module = await original<typeof import('../lib/sharedDefaults')>()
  return { ...module, applySharedDefaults: vi.fn(() => { throw new Error('Synthetic storage failure') }) }
})

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); window.history.replaceState(null, '', '/') })
afterEach(() => cleanup())

describe('Shared defaults consent', () => {
  it('previews offered layout, never applies on opening, and defaults to ordinary defaults only', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: ['Quran'], home: [], more: [], homeSections: { salahBrief: true } })
    const defaults = createSharedDefaults({ includeLayout: true })
    render(<SharedDefaultsPrompt defaults={defaults} onClose={vi.fn()} />)
    expect(screen.getByRole('region', { name: 'Shared layout preview' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Apply shared layout' })).not.toBeChecked()
    expect(screen.getByText('Home → Quran')).toBeInTheDocument()
    expect(screen.getByText('Shown when Custom Layout is enabled — Line graph using your own records')).toBeInTheDocument()
    expect(applySharedDefaults).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Apply defaults' }))
    expect(applySharedDefaults).toHaveBeenCalledWith(defaults, { applyLayout: false })
    expect(screen.getByRole('alert')).toHaveTextContent('Synthetic storage failure')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('passes separate layout consent only after checking the recipient control', () => {
    const defaults = createSharedDefaults({ includeLayout: true })
    render(<SharedDefaultsPrompt defaults={defaults} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Apply shared layout' }))
    fireEvent.click(screen.getByRole('button', { name: 'Apply defaults' }))
    expect(applySharedDefaults).toHaveBeenCalledWith(defaults, { applyLayout: true })
  })

  it('shows no layout option for legacy defaults and dismisses without writes', () => {
    const onClose = vi.fn()
    window.history.replaceState(null, '', '/?source=test#share-defaults=test')
    render(<SharedDefaultsPrompt defaults={createSharedDefaults()} onClose={onClose} />)
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Not now' }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(applySharedDefaults).not.toHaveBeenCalled()
    expect(window.location.hash).toBe('')
    expect(window.location.search).toBe('?source=test')
  })

  it('shows invalid-layout feedback but cannot offer that layout for application', () => {
    const defaults = { ...createSharedDefaults(), version: 2 as const, layoutWarnings: ['Shared layout invalid; your layout stays unchanged.'] }
    render(<SharedDefaultsPrompt defaults={defaults} onClose={vi.fn()} />)
    expect(screen.getByRole('status')).toHaveTextContent('layout stays unchanged')
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  })

  it('keeps keyboard focus inside consent and allows Escape to dismiss without application', () => {
    const onClose = vi.fn()
    render(<SharedDefaultsPrompt defaults={createSharedDefaults()} onClose={onClose} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Tab' })
    expect(screen.getByRole('button', { name: 'Not now' })).toHaveFocus()
    fireEvent.keyDown(screen.getByRole('button', { name: 'Not now' }), { key: 'Tab', shiftKey: true })
    expect(screen.getByRole('button', { name: 'Apply defaults' })).toHaveFocus()
    fireEvent.keyDown(dialog, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()
    expect(applySharedDefaults).not.toHaveBeenCalled()
  })
})
