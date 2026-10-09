import { useEffect, useState } from 'react'
import { defaultAppLayout, loadAppLayout, saveAppLayout, type AppLayoutPreferences, type LayoutSurface } from '../lib/appLayout'
import { loadPerformancePreferences, savePerformancePreferences } from '../lib/performancePreferences'
import { ROOT_FEATURE_IDS, rootFeatureLabel, type RootFeatureId } from '../lib/rootFeatures'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { loadShowSunnah, saveShowSunnah } from '../lib/preferences'

type Props = { go?: (screen: string) => void }
const buttonClass = 'min-h-11 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-gray-200 hover:border-teal-600 disabled:opacity-40'
const surfaces: { id: LayoutSurface; title: string }[] = [{ id: 'navigation', title: 'Navigation hub' }, { id: 'home', title: 'Home shortcuts' }, { id: 'more', title: 'More shortcuts' }]

export default function AppLayout({ go }: Props) {
  const [language] = useState(loadLanguage)
  const [draft, setDraft] = useState(loadAppLayout)
  const [performance, setPerformance] = useState(loadPerformancePreferences)
  const [preview, setPreview] = useState(false)
  const [message, setMessage] = useState('')
  const [showSunnah, setShowSunnah] = useState(loadShowSunnah)
  useEffect(() => {
    const refresh = () => setShowSunnah(loadShowSunnah())
    window.addEventListener('athan-preferences-change', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('athan-preferences-change', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])
  const open = (screen: string) => go ? go(screen) : (window.location.hash = `#${screen}`)
  function updateList(surface: LayoutSurface, list: RootFeatureId[]) {
    setDraft((current) => ({ ...current, [surface]: list }))
    setMessage('')
  }
  function saveLayout() {
    if (!saveAppLayout(draft)) { setMessage('Layout could not be saved. Your draft is still here; try again.'); return }
    setMessage('Layout saved. Your records and feature settings are unchanged.')
  }
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-6">
      <header><h1 className="text-2xl font-bold">Performance & App Layout</h1><p className="mt-2 text-sm text-gray-400">Arrange shortcuts without removing features or changing their data.</p></header>
      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">{language === 'ar' ? 'عرض متتبع الصلاة' : 'Salah Tracker display'}</h2>
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" checked={showSunnah} onChange={(event) => {
            const enabled = event.target.checked
            saveShowSunnah(enabled)
            const saved = loadShowSunnah()
            setShowSunnah(saved)
            setMessage(saved === enabled ? t('sunnahPreferenceSaved', language) : 'Tracker display preference could not be saved. Try again.')
          }} className="h-5 w-5 accent-teal-600" />
          {t('showSunnah', language)}
        </label>
        <p className="text-xs leading-5 text-gray-400">{t('showSunnahHelp', language)}</p>
        <p className="text-xs leading-5 text-gray-400">{language === 'ar' ? 'يُحفظ هذا الخيار فورًا، حتى عند إيقاف التخطيط المخصص. لا يؤثر إلغاء تعديلات التخطيط عليه.' : 'Saved immediately, even when Custom Layout is off. Canceling layout edits does not undo this display preference.'}</p>
      </section>
      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">Custom Layout</h2>
        <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))} className="h-5 w-5 accent-teal-600" />Enable Custom Layout when saved</label>
        <p className="text-xs leading-5 text-gray-400">Off restores the standard arrangement while retaining your custom lists. Changes below remain a draft until Save layout.</p>
        <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={draft.homeSections?.salahBrief === true} onChange={(event) => setDraft(current => ({ ...current, homeSections: { ...current.homeSections, salahBrief: event.target.checked } }))} className="h-5 w-5 accent-teal-600" />Show Salah Brief below Home's prayer preview</label>
        <p className="text-xs text-gray-400">This week's tracker graphs use your local records. Visible only with Custom Layout enabled; no prayer history is included when sharing layout.</p>
        <label className="block text-sm">Salah Brief chart<select value={draft.homeSections?.salahBriefView ?? 'line'} disabled={!draft.homeSections?.salahBrief} onChange={event => { const view = event.target.value === 'bars' ? 'bars' : 'line'; setDraft(current => ({ ...current, homeSections: { ...current.homeSections, salahBrief: current.homeSections?.salahBrief === true, salahBriefView: view } })) }} className="mt-2 min-h-11 w-full rounded-md border border-gray-600 bg-gray-950 p-2 disabled:opacity-40"><option value="line">Line graph — daily trend this week</option><option value="bars">Prayer bars — per-prayer rates this week</option></select></label>
        {surfaces.map(({ id, title }) => <ShortcutEditor key={id} surface={id} title={title} list={draft[id]} language={language} onChange={(list) => updateList(id, list)} />)}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} aria-expanded={preview} onClick={() => setPreview((value) => !value)}>{preview ? 'Hide preview' : 'Preview layout'}</button>
          <button type="button" className={buttonClass} onClick={() => { setDraft(defaultAppLayout()); setMessage('Default layout is in the draft. Save to apply or Cancel to discard.'); }}>Reset layout draft</button>
          <button type="button" className="min-h-11 rounded-md bg-teal-700 px-4 text-sm font-semibold hover:bg-teal-600" onClick={saveLayout}>Save layout</button>
          <button type="button" className={buttonClass} onClick={() => { setDraft(loadAppLayout()); setPreview(false); setMessage('Unsaved layout changes discarded.'); open('Settings'); }}>Cancel layout edits</button>
        </div>
        {preview && <LayoutPreview draft={draft} language={language} />}
      </section>
      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">Performance Mode</h2>
        <label className="flex min-h-11 items-center gap-3"><input type="checkbox" checked={performance.enabled} onChange={(event) => setPerformance((current) => ({ ...current, enabled: event.target.checked }))} className="h-5 w-5 accent-teal-600" />Enable Performance Mode</label>
        <p className="text-xs leading-5 text-gray-400">Changes internal loading only. Appearance, animations, prayer calculations, and all features stay the same. Independent of Custom Layout.</p>
        <h3 className="text-sm font-semibold text-teal-200">Prepare these features first</h3>
        <p className="text-xs text-gray-400">After Home is ready, selected features can prepare their code. This does not open them, request permissions, or start downloads. Priority does not mean continuously running.</p>
        <div className="grid gap-1 sm:grid-cols-2">{ROOT_FEATURE_IDS.filter((id) => id !== 'Home').map((id) => <label key={id} className="flex min-h-11 items-center gap-3 rounded-md px-2 hover:bg-gray-700"><input type="checkbox" className="h-4 w-4 accent-teal-600" checked={performance.priorities.includes(id)} onChange={(event) => setPerformance((current) => ({ ...current, priorities: event.target.checked ? [...current.priorities, id] : current.priorities.filter((value) => value !== id) }))} />{rootFeatureLabel(id, language)}</label>)}</div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={buttonClass} onClick={() => setMessage(savePerformancePreferences(performance) ? 'Performance preferences saved.' : 'Performance preferences could not be saved. Try again.')}>Save performance preferences</button>
          <button type="button" className={buttonClass} onClick={() => { setPerformance(loadPerformancePreferences()); setMessage('Unsaved performance changes discarded.'); }}>Discard performance edits</button>
        </div>
      </section>
      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">All features</h2><p className="text-xs text-gray-400">Every root feature remains available, even without a shortcut. Monthly view and other child controls stay inside their parent feature.</p>
        <div className="grid gap-2 sm:grid-cols-2">{ROOT_FEATURE_IDS.map((id) => <button key={id} type="button" className={buttonClass} onClick={() => open(id)}>Open {rootFeatureLabel(id, language)}</button>)}</div>
      </section>
      {message && <p role="status" className="rounded-md border border-teal-800 bg-gray-950 p-3 text-sm text-teal-200">{message}</p>}
    </div>
  )
}

function ShortcutEditor({ surface, title, list, language, onChange }: { surface: LayoutSurface; title: string; list: RootFeatureId[]; language: AppLanguage; onChange: (list: RootFeatureId[]) => void }) {
  const eligible = ROOT_FEATURE_IDS.filter((id) => id !== (surface === 'more' ? 'More' : 'Home') && !list.includes(id))
  const move = (index: number, direction: number) => {
    const next = [...list]
    ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
    onChange(next)
  }
  return (
    <fieldset className="space-y-3 rounded-md border border-gray-700 p-3"><legend className="px-1 text-sm font-semibold">{title}</legend>
      {surface === 'navigation' && <p className="text-xs text-gray-400">Home is always first and cannot be removed. {list.length}/4 extra buttons.</p>}
      {surface === 'home' && <p className="text-xs text-gray-400">Prayer preview and source information are protected. Search and Feature Hub remain in Home's header; Settings is always available inside the Hub.</p>}
      {list.length === 0 && <p className="text-sm text-gray-400">No optional shortcuts. Features remain accessible through Feature Hub.</p>}
      <ol className="space-y-2">{list.map((id, index) => <li key={id} className="rounded-md bg-gray-900 p-2"><span className="block px-1 pb-2 text-sm font-medium">{index + 1}. {rootFeatureLabel(id, language)}</span><div className="flex flex-wrap gap-2"><button type="button" className={buttonClass} disabled={index === 0} aria-label={`Move ${rootFeatureLabel(id, language)} up in ${title}`} onClick={() => move(index, -1)}>↑ Up</button><button type="button" className={buttonClass} disabled={index === list.length - 1} aria-label={`Move ${rootFeatureLabel(id, language)} down in ${title}`} onClick={() => move(index, 1)}>↓ Down</button><button type="button" className={buttonClass} aria-label={`Remove ${rootFeatureLabel(id, language)} from ${title}`} onClick={() => onChange(list.filter((value) => value !== id))}>Remove</button></div></li>)}</ol>
      <label className="block text-sm">Add a shortcut<select aria-label={`Add shortcut to ${title}`} className="mt-2 min-h-11 w-full rounded-md border border-gray-600 bg-gray-950 p-2" value="" disabled={surface === 'navigation' && list.length >= 4} onChange={(event) => { if (event.target.value) onChange([...list, event.target.value as RootFeatureId]) }}><option value="">Choose a feature</option>{eligible.map((id) => <option key={id} value={id}>{rootFeatureLabel(id, language)}</option>)}</select></label>
    </fieldset>
  )
}

function LayoutPreview({ draft, language }: { draft: AppLayoutPreferences; language: AppLanguage }) {
  const displayed = draft.enabled ? draft : defaultAppLayout()
  return (
    <section aria-label="Draft layout preview" className="space-y-4 rounded-md border border-teal-700 bg-gray-950 p-3">
      <h3 className="font-semibold text-teal-200">Preview — not applied</h3>
      <p className="text-xs text-gray-400">{draft.enabled ? 'Custom layout' : 'Standard layout (custom lists retained)'}</p>
      <p className="text-xs text-teal-200">Home header: Search · Home · Feature Hub. Settings remains inside Feature Hub.</p>
      <div className="space-y-3" aria-label="Home shortcut preview">
        <h4 className="text-sm font-semibold">Home</h4>
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <p className="font-semibold">Protected prayer preview</p>
          <p className="mt-1 text-xs text-gray-400">Current prayer, next prayer, countdown, date, and source remain unchanged.</p>
        </div>
        {displayed.homeSections?.salahBrief && <div className="rounded-lg border border-teal-800 bg-gray-800 p-4 text-sm text-teal-200">Salah Brief — this week's tracker graphs · {displayed.homeSections.salahBriefView === 'bars' ? 'Prayer bars' : 'Line graph'}</div>}
        {displayed.home.map((id) => <div key={id} className="rounded-lg bg-gray-800 p-4 text-center text-sm font-semibold">{rootFeatureLabel(id, language)}</div>)}
      </div>
      <div className="space-y-2" aria-label="More shortcut preview">
        <h4 className="text-sm font-semibold">More</h4>
        {displayed.more.length ? displayed.more.map((id) => <div key={id} className="rounded-lg bg-gray-800 p-4 text-sm font-semibold text-teal-300">{rootFeatureLabel(id, language)}</div>) : <p className="text-xs text-gray-400">No optional shortcuts.</p>}
      </div>
      <div className="grid gap-1 rounded-lg bg-gray-800 p-2" style={{ gridTemplateColumns: `repeat(${displayed.navigation.length + 1}, minmax(0, 1fr))` }} aria-label="Navigation hub preview">
        {(['Home', ...displayed.navigation] as RootFeatureId[]).map((id) => <span key={id} className={`break-words p-2 text-center text-xs ${id === 'Home' ? 'text-teal-300' : 'text-gray-400'}`}>{rootFeatureLabel(id, language)}</span>)}
      </div>
      {draft.enabled && <p className="text-xs text-teal-200">Protected Feature Hub access remains on Home and More.</p>}
    </section>
  )
}
