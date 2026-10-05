import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import App from './App'
import { defaultAppLayout, saveAppLayout } from './lib/appLayout'

vi.mock('./features/Home', () => ({default: ({go}: {go:(screen:string)=>void}) => <button onClick={()=>go('More')}>Open More</button>}))
vi.mock('./lib/screenLoader', () => ({
  scheduleFeaturePreparation: vi.fn(() => () => {}),
  resetFeatureScreen: vi.fn(),
  getLazyScreen: (name:string) => ({go,onOpenDay}: {go:(screen:string)=>void;onOpenDay:(date:string)=>void}) => <section aria-label={name}>
    <button onClick={()=>go('SalahSearch')}>Open search</button>
    <button onClick={()=>onOpenDay('2026-10-01')}>Open matching day</button>
  </section>
}))

describe('integrated navigation contracts', () => {
  beforeEach(()=>localStorage.clear())
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
