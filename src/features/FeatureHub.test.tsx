import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeatureHub from './FeatureHub'
import { defaultAppLayout, loadAppLayout, saveAppLayout } from '../lib/appLayout'
import { ROOT_FEATURE_IDS, rootFeatureLabel } from '../lib/rootFeatures'

beforeEach(() => localStorage.clear())
afterEach(cleanup)
describe('navigation-only Feature Hub', () => {
  it('keeps Settings first and every nonrecursive root accessible without editing layout', () => {
    saveAppLayout({ ...defaultAppLayout(), enabled: true, navigation: [], home: [], more: [] })
    const before = loadAppLayout()
    const go = vi.fn()
    const writes = vi.spyOn(Storage.prototype, 'setItem')
    render(<FeatureHub go={go} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(ROOT_FEATURE_IDS.length - 1)
    expect(buttons[0]).toHaveTextContent('Settings')
    expect(screen.getByRole('button', { name: 'Need Help' })).toBeInTheDocument()
    for (const id of ROOT_FEATURE_IDS.filter((id) => id !== 'FeatureHub')) {
      fireEvent.click(screen.getByRole('button', { name: rootFeatureLabel(id, 'en') }))
      expect(go).toHaveBeenLastCalledWith(id)
    }
    expect(screen.queryByRole('button', { name: /customize|add to/i })).not.toBeInTheDocument()
    expect(writes).not.toHaveBeenCalled()
    expect(loadAppLayout()).toEqual(before)
    writes.mockRestore()
  })
})
