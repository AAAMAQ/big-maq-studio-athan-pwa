import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Suspense } from 'react'
import ScreenBoundary, { ScreenLoading } from './ScreenBoundary'
import { createScreenLoader } from '../lib/screenLoader'

afterEach(() => { cleanup(); vi.restoreAllMocks() })

function BrokenScreen(): never { throw new Error('synthetic render failure') }

describe('screen recovery', () => {
  it('preserves outer shell and offers safe recovery after a render failure', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onRetry = vi.fn(), onHome = vi.fn(), onSettings = vi.fn(), onFeatureHub = vi.fn()
    localStorage.setItem('salahLogV1', 'untouched')
    render(<div><header>App shell</header><ScreenBoundary resetKey="broken" {...{ onRetry, onHome, onSettings, onFeatureHub }}><BrokenScreen /></ScreenBoundary></div>)
    expect(screen.getByText('App shell')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent('This screen couldn’t open')
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
    fireEvent.click(screen.getByRole('button', { name: 'Home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    fireEvent.click(screen.getByRole('button', { name: 'Feature Hub' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    expect(onHome).toHaveBeenCalledTimes(1)
    expect(onSettings).toHaveBeenCalledTimes(1)
    expect(onFeatureHub).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('salahLogV1')).toBe('untouched')
  })

  it('a new retry/navigation reset key restores a healthy screen', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const actions = { onRetry: vi.fn(), onHome: vi.fn(), onSettings: vi.fn(), onFeatureHub: vi.fn() }
    const view = render(<ScreenBoundary resetKey="Quran:0" {...actions}><BrokenScreen /></ScreenBoundary>)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    view.rerender(<ScreenBoundary resetKey="Home:0" {...actions}><p>Prayer preview</p></ScreenBoundary>)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Prayer preview')).toBeInTheDocument()
  })

  it('loading state is announced without replacing the navigation shell', () => {
    render(<ScreenLoading />)
    expect(screen.getByRole('status')).toHaveTextContent('Opening feature')
  })

  it('offers explicit safe app recovery only when configured and displays its feedback', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const onReloadApp = vi.fn()
    const actions = { onRetry: vi.fn(), onHome: vi.fn(), onSettings: vi.fn(), onFeatureHub: vi.fn() }
    render(<ScreenBoundary resetKey="broken" {...actions} onReloadApp={onReloadApp} recoveryMessage="Offline files preserved; try when connected."><BrokenScreen /></ScreenBoundary>)
    expect(onReloadApp).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Check update / reload app' }))
    expect(onReloadApp).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('status')).toHaveTextContent('Offline files preserved')
  })

  it('a rejected lazy import can recover through an explicit retry with a fresh wrapper', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const importer = vi.fn().mockRejectedValueOnce(new Error('offline chunk')).mockResolvedValue({ default: () => <p>Recovered feature</p> })
    const loader = createScreenLoader({ Quran: importer })
    const actions = { onRetry: vi.fn(), onHome: vi.fn(), onSettings: vi.fn(), onFeatureHub: vi.fn() }
    const First = loader.getLazy('Quran')
    const props = { go: vi.fn(), onOpenDay: vi.fn() }
    const view = render(<ScreenBoundary resetKey="Quran:0" {...actions}><Suspense fallback={<ScreenLoading />}><First {...props} /></Suspense></ScreenBoundary>)
    await screen.findByRole('alert')
    loader.reset('Quran')
    const Retried = loader.getLazy('Quran')
    view.rerender(<ScreenBoundary resetKey="Quran:1" {...actions}><Suspense fallback={<ScreenLoading />}><Retried {...props} /></Suspense></ScreenBoundary>)
    await screen.findByText('Recovered feature')
    expect(importer).toHaveBeenCalledTimes(2)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
