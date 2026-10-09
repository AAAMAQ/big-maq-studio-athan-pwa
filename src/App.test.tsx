import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { defaultAppLayout, saveAppLayout } from './lib/appLayout'
import type { NavigationIntent } from './types/nav'
import { createSharedDefaultsUrl } from './lib/sharedDefaults'
import { QIBLA_AUTO_LOCATION_KEY, saveAutomaticQiblaLocation } from './lib/qiblaPreferences'
import { clearQiblaNavigationCompassRequest, getQiblaNavigationCompassRequest } from './lib/qiblaCompassAccess'

const startup = vi.hoisted(() => ({ refresh: vi.fn(), recent: vi.fn(), request: vi.fn(), renderScreen: vi.fn() }))
vi.mock('./lib/locationStore', () => ({ refreshDeviceLocation: startup.refresh, getRecentDeviceLocation: startup.recent }))

vi.mock('./features/Home', () => ({default: ({go}: {go:(screen:string)=>void}) => <><button onClick={()=>go('More')}>Open More</button><button onClick={()=>go('Qibla')}>Open Qibla shortcut</button></>}))
vi.mock('./lib/screenLoader', () => ({
  scheduleFeaturePreparation: vi.fn(() => () => {}),
  resetFeatureScreen: vi.fn(),
  getLazyScreen: (name:string) => { startup.renderScreen(name); return ({go,onOpenDay,onNavigate,navigationIntent}: {go:(screen:string)=>void;onOpenDay:(date:string)=>void;onNavigate:(intent:NavigationIntent)=>void;navigationIntent?:NavigationIntent}) => <section aria-label={name}>
    <button onClick={()=>go('SalahSearch')}>Open search</button>
    <button onClick={()=>go('Qibla')}>Open Qibla feature</button>
    <button onClick={()=>onNavigate({screen:'Qibla'})}>Open Qibla result</button>
    <button onClick={()=>onOpenDay('2026-10-01')}>Open matching day</button>
    <button onClick={()=>onNavigate({screen:'Prayer',view:'month'})}>Open monthly destination</button>
    <output>{navigationIntent ? JSON.stringify(navigationIntent) : 'No intent'}</output>
  </section> }
}))

describe('integrated navigation contracts', () => {
  it('protects physical Home search/Hub and dispatches/restores typed internal intents', () => {
    saveAppLayout({...defaultAppLayout(),enabled:true,navigation:[],home:[],more:[]})
    render(<App />)
    fireEvent.click(screen.getByRole('button',{name:'Search app'}))
    expect(screen.getByRole('heading',{name:'Search app'})).toBeVisible()
    fireEvent.click(screen.getByRole('button',{name:'Open monthly destination'}))
    expect(screen.getByText('{"screen":"Prayer","view":"month"}')).toBeVisible()
    fireEvent.click(screen.getByRole('button',{name:'Open search'}))
    fireEvent.click(screen.getByRole('button',{name:'← Back'}))
    expect(screen.getByText('{"screen":"Prayer","view":"month"}')).toBeVisible()
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button',{name:'Home'}))
    fireEvent.click(screen.getByRole('button',{name:'Feature Hub'}))
    expect(screen.getByRole('heading',{name:'Feature Hub'})).toBeVisible()
  })
  beforeEach(()=>{
    localStorage.clear();window.history.replaceState(null,'','/')
    vi.resetAllMocks()
    startup.recent.mockReturnValue(null)
    startup.refresh.mockResolvedValue({location:null,permission:'denied'})
    startup.request.mockResolvedValue('granted')
    clearQiblaNavigationCompassRequest(getQiblaNavigationCompassRequest())
    vi.stubGlobal('DeviceOrientationEvent', { requestPermission: startup.request })
  })
  afterEach(()=>vi.unstubAllGlobals())
  it('does not steal focus from a shared-defaults consent dialog', () => {
    window.history.replaceState(null,'',createSharedDefaultsUrl(window.location.href))
    render(<App />)
    expect(screen.getByRole('dialog')).toHaveFocus()
    fireEvent.click(screen.getByRole('button',{name:'Not now'}))
    expect(screen.getByRole('heading',{name:'Home'})).toHaveFocus()
  })
  it('keeps the default three destinations when customization is off',()=>{
    render(<App />)
    const nav=screen.getByRole('navigation',{name:'Main navigation'})
    expect(within(nav).getAllByRole('button').map(button=>button.textContent)).toEqual(['Home','Prayer','Settings'])
  })
  it('supports promoted roots and their child history without losing active navigation',()=>{
    saveAppLayout({...defaultAppLayout(),enabled:true,navigation:['SalahTracker','Quran','Iqama','More']})
    render(<App />)
    const nav=screen.getByRole('navigation')
    fireEvent.click(within(nav).getByRole('button',{name:'Salah Tracker'}))
    fireEvent.click(screen.getByRole('button',{name:'Open search'}))
    expect(within(nav).getByRole('button',{name:'Salah Tracker'})).toHaveAttribute('aria-current','page')
    expect(screen.getByRole('button',{name:'← Back'})).toBeVisible()
    fireEvent.click(screen.getByRole('button',{name:'Open matching day'}))
    expect(screen.getByRole('heading',{level:1,name:'Salah Tracker'})).toBeVisible()
    fireEvent.click(within(nav).getByRole('button',{name:'Home'}))
    expect(screen.queryByRole('button',{name:'← Back'})).toBeNull()
  })
  it('updates navigation on a successful saved layout without remounting the app',()=>{
    render(<App />)
    fireEvent.click(screen.getByRole('button',{name:'Open More'}))
    expect(screen.getByRole('button',{name:'← Back'})).toBeVisible()
    // Wrap the same-window storage notification as a user action in act.
    fireEvent.click(screen.getByRole('button',{name:'Open search'}))
    const next={...defaultAppLayout(),enabled:true,navigation:[]}
    const persist=screen.getByRole('button',{name:'Open matching day'})
    persist.addEventListener('click',()=>saveAppLayout(next),{once:true})
    fireEvent.click(persist)
    expect(within(screen.getByRole('navigation')).getAllByRole('button')).toHaveLength(1)
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button',{name:'Home'}))
    expect(screen.getByRole('heading',{level:1,name:'Home'})).toBeVisible()
  })
  it('does not prepare location at launch until opted in, then starts one strict request', async ()=>{
    const view = render(<App />)
    expect(startup.refresh).not.toHaveBeenCalled()
    act(()=>{ saveAutomaticQiblaLocation(true) })
    expect(startup.refresh).toHaveBeenCalledWith({allowCachedFallback:false})
    act(()=>{ window.dispatchEvent(new Event('storage')) })
    expect(startup.refresh).toHaveBeenCalledOnce()
    await act(async()=>{})
    view.unmount()
  })
  it('prepares on opted-in launch without changing layout or prayer source, and reuses a ready fix', async ()=>{
    localStorage.setItem(QIBLA_AUTO_LOCATION_KEY,'true')
    const view=render(<App />)
    expect(startup.refresh).toHaveBeenCalledOnce()
    expect(within(screen.getByRole('navigation')).getAllByRole('button').map(button=>button.textContent)).toEqual(['Home','Prayer','Settings'])
    await act(async()=>{})
    view.unmount()
    startup.refresh.mockClear()
    startup.recent.mockReturnValue({latitude:31,longitude:121,source:'device'})
    render(<App />)
    expect(startup.refresh).not.toHaveBeenCalled()
  })
  it('requests motion synchronously on a Home Qibla tap before resolving/loading the screen', async ()=>{
    const order:string[]=[]
    startup.request.mockImplementation(()=>{order.push('permission');return Promise.resolve('granted')})
    startup.renderScreen.mockImplementation(name=>{if(name==='Qibla')order.push('screen')})
    render(<App />)
    fireEvent.click(screen.getByRole('button',{name:'Open Qibla shortcut'}))
    expect(order[0]).toBe('permission')
    expect(order).toContain('screen')
    expect(startup.request).toHaveBeenCalledOnce()
    expect(await getQiblaNavigationCompassRequest()!.result).toBe('granted')
  })
  it('prepares permission for Hub, search, custom navigation and Back to Qibla', async ()=>{
    saveAppLayout({...defaultAppLayout(),enabled:true,navigation:['Qibla']})
    render(<App />)
    const home=()=>fireEvent.click(within(screen.getByRole('navigation')).getByRole('button',{name:'Home'}))
    fireEvent.click(screen.getByRole('button',{name:'Feature Hub'}))
    fireEvent.click(screen.getByRole('button',{name:'Open Qibla feature'}))
    await act(async()=>{})
    expect(startup.request).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button',{name:'Open search'}))
    fireEvent.click(screen.getByRole('button',{name:'← Back'}))
    await act(async()=>{})
    expect(startup.request).toHaveBeenCalledTimes(2)
    home()
    fireEvent.click(screen.getByRole('button',{name:'Search app'}))
    fireEvent.click(screen.getByRole('button',{name:'Open Qibla result'}))
    await act(async()=>{})
    expect(startup.request).toHaveBeenCalledTimes(3)
    home()
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button',{name:'Qibla'}))
    await act(async()=>{})
    expect(startup.request).toHaveBeenCalledTimes(4)
  })
})
