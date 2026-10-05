import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEffect, useState } from 'react'
import SettingsSection from './SettingsSection'
import { saveSettingsSections } from '../lib/appLayout'

beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Universal Settings disclosure', () => {
  it('starts expanded, preserves mounted state across collapse, and remembers the choice', () => {
    const stop = vi.fn()
    function Child() {
      const [value, setValue] = useState('original')
      useEffect(() => () => stop(), [])
      return <input aria-label="Draft" value={value} onChange={(event) => setValue(event.target.value)} />
    }
    const first = render(<SettingsSection id="calendar" title="Calendar"><Child /></SettingsSection>)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'edited' } })
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Calendar' }))
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(stop).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Expand Calendar' }))
    expect(screen.getByRole('textbox')).toHaveValue('edited')
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Calendar' }))
    first.unmount()
    render(<SettingsSection id="calendar" title="Calendar"><input aria-label="New draft" /></SettingsSection>)
    expect(screen.getByRole('button', { name: 'Expand Calendar' })).toHaveAttribute('aria-expanded', 'false')
  })

  it('refreshes restored preferences and reports write failure honestly', () => {
    render(<SettingsSection id="preferences" title="Preferences"><p>Fields</p></SettingsSection>)
    act(() => { saveSettingsSections({ preferences: false }) })
    expect(screen.getByRole('button', { name: 'Expand Preferences' })).toBeInTheDocument()
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('full') })
    fireEvent.click(screen.getByRole('button', { name: 'Expand Preferences' }))
    expect(screen.getByRole('status')).toHaveTextContent('could not be saved')
    expect(screen.getByText('Fields')).toBeVisible()
  })
})
