import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { defaultAppLayout, saveAppLayout } from './lib/appLayout'
import type { NavigationIntent } from './types/nav'
import { createSharedDefaultsUrl } from './lib/sharedDefaults'

vi.mock('./features/Home', () => ({default: ({go}: {go:(screen:string)=>void}) => <button onClick={()=>go('More')}>Open More</button>}))
vi.mock('./lib/screenLoader', () => ({
  scheduleFeaturePreparation: vi.fn(() => () => {}),
  resetFeatureScreen: vi.fn(),
  getLazyScreen: (name:string) => ({go,onOpenDay,onNavigate,navigationIntent}: {go:(screen:string)=>void;onOpenDay:(date:string)=>void;onNavigate:(intent:NavigationIntent)=>void;navigationIntent?:NavigationIntent}) => <section aria-label={name}>
    <button onClick={()=>go('SalahSearch')}>Open search</button>
    <button onClick={()=>onOpenDay('2026-10-01')}>Open matching day</button>
    <button onClick={()=>onNavigate({screen:'Prayer',view:'month'})}>Open monthly destination</button>
    <output>{navigationIntent ? JSON.stringify(navigationIntent) : 'No intent'}</output>
  </section>
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
  beforeEach(()=>{localStorage.clear();window.history.replaceState(null,'','/')})
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
})
