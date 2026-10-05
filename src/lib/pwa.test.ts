import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { refreshAthanApp, requestPwaInstall } from './pwa'

beforeEach(() => {
  window.dispatchEvent(new Event('appinstalled'))
})

afterEach(() => {
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'serviceWorker')
  Reflect.deleteProperty(navigator, 'onLine')
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('safe PWA updates', () => {
  it('keeps the current shell and data when registration update fails', async () => {
    const unregister = vi.fn()
    const update = vi.fn().mockRejectedValue(new Error('Host blocked'))
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:vi.fn().mockResolvedValue({active:{},update,unregister})}})
    const removeCache = vi.fn()
    vi.stubGlobal('caches',{delete:removeCache})
    localStorage.setItem('salahLogV1','private')
    const status = vi.fn()
    const timers = vi.spyOn(window,'setTimeout')
    await refreshAthanApp(status)
    expect(status.mock.calls.map(call=>call[0])).toEqual(['checking','fallback'])
    expect(unregister).not.toHaveBeenCalled()
    expect(removeCache).not.toHaveBeenCalled()
    expect(timers).not.toHaveBeenCalled()
    expect(localStorage.getItem('salahLogV1')).toBe('private')
    timers.mockRestore()
  })

  it('allows a stale page to reload into an already-active worker after a successful check', async () => {
    vi.useFakeTimers()
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:vi.fn().mockResolvedValue({active:{},update:vi.fn().mockResolvedValue(undefined)})}})
    const status = vi.fn()
    await refreshAthanApp(status)
    expect(status.mock.calls.map(call=>call[0])).toEqual(['checking','reloading'])
    vi.clearAllTimers()
  })

  it('reloads only after a staged worker successfully activates', async () => {
    vi.useFakeTimers()
    vi.clearAllTimers()
    const clear = vi.spyOn(window,'clearTimeout')
    const schedule = vi.spyOn(window,'setTimeout')
    const worker = Object.assign(new EventTarget(),{state:'installing',postMessage:vi.fn()})
    const registration = {active:{},installing:worker,update:vi.fn().mockResolvedValue(undefined)}
    Object.defineProperty(navigator,'serviceWorker',{configurable:true,value:{getRegistration:vi.fn().mockResolvedValue(registration)}})
    const status = vi.fn()
    const updating = refreshAthanApp(status)
    await Promise.resolve()
    await Promise.resolve()
    worker.state='installed'
    worker.dispatchEvent(new Event('statechange'))
    expect(worker.postMessage).toHaveBeenCalledWith({type:'SKIP_WAITING'})
    worker.state='activated'
    worker.dispatchEvent(new Event('statechange'))
    await updating
    expect(status.mock.calls.map(call=>call[0])).toEqual(['checking','reloading'])
    expect(clear).toHaveBeenCalled()
    // JSDOM may schedule a zero-delay task while dispatching its synthetic event.
    expect(schedule.mock.calls.map(call=>call[1]).filter(delay=>delay)).toEqual([15000,250])
    clear.mockRestore()
    schedule.mockRestore()
    vi.clearAllTimers()
  })

  it('reports offline safely without requests or a reload', async () => {
    Object.defineProperty(navigator,'onLine',{configurable:true,value:false})
    const network = vi.fn()
    vi.stubGlobal('fetch',network)
    const status = vi.fn()
    await refreshAthanApp(status)
    expect(status).toHaveBeenLastCalledWith('fallback')
    expect(network).not.toHaveBeenCalled()
  })
})

describe('PWA installation prompt', () => {
  it('opens the real browser install prompt when the browser provides one', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined)
    const event = new Event('beforeinstallprompt', { cancelable: true })
    Object.assign(event, {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const })
    })

    window.dispatchEvent(event)

    await expect(requestPwaInstall()).resolves.toBe('accepted')
    expect(prompt).toHaveBeenCalledOnce()
    expect(event.defaultPrevented).toBe(true)
  })

  it('does not pretend that the generic Share API is an install prompt', async () => {
    const share = vi.fn()
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: share
    })

    await expect(requestPwaInstall()).resolves.toBe('unavailable')
    expect(share).not.toHaveBeenCalled()
  })
})
