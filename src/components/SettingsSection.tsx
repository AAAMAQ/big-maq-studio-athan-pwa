import { useEffect, useId, useState, type ReactNode } from 'react'
import { APP_LAYOUT_EVENT, loadSettingsSections, saveSettingsSections, type SettingsSectionId } from '../lib/appLayout'

type Props = { id: SettingsSectionId; title: string; description?: ReactNode; children: ReactNode }

/** Disclosure only: children stay mounted so drafts and intentional work survive collapse. */
export default function SettingsSection({ id, title, description, children }: Props) {
  const contentId = useId()
  const [expanded, setExpanded] = useState(() => loadSettingsSections()[id] !== false)
  const [error, setError] = useState('')
  useEffect(() => {
    const refresh = () => setExpanded(loadSettingsSections()[id] !== false)
    window.addEventListener(APP_LAYOUT_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(APP_LAYOUT_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [id])
  function toggle() {
    const next = !expanded
    setExpanded(next)
    setError(saveSettingsSections({ ...loadSettingsSections(), [id]: next }) ? '' : 'This section changed for this visit, but its preference could not be saved.')
  }
  return (
    <section className="rounded-lg border border-gray-700/80 bg-gray-800/90 p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        <button type="button" onClick={toggle} aria-expanded={expanded} aria-controls={contentId} aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`} className="min-h-11 min-w-11 rounded-md border border-gray-600 text-xl text-teal-200 hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-400">{expanded ? '−' : '+'}</button>
      </div>
      {error && <p role="status" className="mt-2 text-xs text-amber-200">{error}</p>}
      <div id={contentId} hidden={!expanded}>
        {description && <p className="mt-1 text-xs leading-5 text-gray-400">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </section>
  )
}
