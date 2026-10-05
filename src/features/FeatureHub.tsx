import { useEffect, useState } from 'react'
import { APP_LAYOUT_EVENT, loadAppLayout, saveAppLayout, visibleRootFeatures, type LayoutSurface } from '../lib/appLayout'
import { ROOT_FEATURE_IDS, rootFeatureLabel, type RootFeatureId } from '../lib/rootFeatures'
import { loadLanguage } from '../lib/i18n'

export default function FeatureHub({ go }: { go?: (screen: string) => void }) {
  const [layout, setLayout] = useState(loadAppLayout)
  const [language] = useState(loadLanguage)
  const [message, setMessage] = useState('')
  useEffect(() => {
    const refresh = () => setLayout(loadAppLayout())
    window.addEventListener(APP_LAYOUT_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(APP_LAYOUT_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])
  const visible = new Set(visibleRootFeatures(layout))
  const open = (screen: string) => go ? go(screen) : (window.location.hash = `#${screen}`)
  function add(id: RootFeatureId, surface: LayoutSurface) {
    const next = { ...loadAppLayout(), enabled: true }
    next[surface] = [...new Set([...next[surface], id])]
    if (saveAppLayout(next)) { setLayout(next); setMessage(`${rootFeatureLabel(id, language)} added to ${surface === 'home' ? 'Home' : 'More'}. Custom Layout is enabled.`) }
    else setMessage('The shortcut could not be saved. Your existing layout is unchanged.')
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold">Feature Hub</h1>
        <p className="mt-2 text-sm text-gray-400">All features stay available. Hidden features load when opened; their saved data is never removed.</p>
      </header>
      <button type="button" className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold" onClick={() => open('AppLayout')}>Customize layout</button>
      <div className="space-y-3">
        {ROOT_FEATURE_IDS.filter((id) => id !== 'FeatureHub').map((id) => (
          <section key={id} className="rounded-lg border border-gray-700 bg-gray-800 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-teal-300">{rootFeatureLabel(id, language)}</h2>
              <span className="text-xs text-gray-400">{visible.has(id) ? 'Available in your layout' : 'Hidden from shortcuts · opens on demand'}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={() => open(id)} className="min-h-11 rounded-md bg-teal-700 px-3 text-sm">Open {rootFeatureLabel(id, language)}</button>
              {id !== 'Home' && !layout.home.includes(id) && (
                <button type="button" onClick={() => add(id, 'home')} className="min-h-11 rounded-md border border-gray-600 px-3 text-sm">Add to Home</button>
              )}
              {id !== 'More' && !layout.more.includes(id) && (
                <button type="button" onClick={() => add(id, 'more')} className="min-h-11 rounded-md border border-gray-600 px-3 text-sm">Add to More</button>
              )}
            </div>
          </section>
        ))}
      </div>
      <p className="text-xs text-gray-400">Adding a shortcut here enables Custom Layout. Code already opened may remain in memory; hidden does not mean deleted.</p>
      {message && <p role="status" className="rounded-md bg-gray-950 p-3 text-sm text-teal-200">{message}</p>}
    </div>
  )
}
