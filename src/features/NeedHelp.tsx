import { useEffect, useMemo, useRef, useState } from 'react'
import type { NavigationIntent } from '../types/nav'
import { HELP_SECTION_ALIASES, HELP_TOPICS, type HelpPart, type HelpTopic } from '../lib/helpGuide'

type Props = { go?: (screen: string) => void; navigationIntent?: NavigationIntent }
const actionClass = 'min-h-11 rounded-md border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-teal-200 hover:border-teal-500 focus:outline focus:outline-2 focus:outline-teal-400'
function resolveSection(value: string | undefined): string | undefined {
  if (!value) return undefined
  const id = HELP_SECTION_ALIASES[value] ?? value
  return HELP_TOPICS.some(topic => topic.id === id) ? id : undefined
}

export default function NeedHelp({ go, navigationIntent }: Props) {
  const [query, setQuery] = useState('')
  const [openTopics, setOpenTopics] = useState(() => new Set(['getting-started']))
  const searchRef = useRef<HTMLInputElement>(null)
  const intentSection = navigationIntent?.screen === 'NeedHelp' && 'section' in navigationIntent ? navigationIntent.section : undefined
  const [scrollTarget, setScrollTarget] = useState(() => ({ id: resolveSection(intentSection ?? window.location.hash.slice(1)), request: 0 }))
  const matching = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return needle ? HELP_TOPICS.filter(topic => JSON.stringify(topic).toLowerCase().includes(needle)) : HELP_TOPICS
  }, [query])

  useEffect(() => {
    const id = resolveSection(intentSection)
    if (id) setScrollTarget(current => current.id === id ? current : { id, request: current.request + 1 })
  }, [intentSection])
  useEffect(() => {
    if (!scrollTarget.id) return
    const id = scrollTarget.id
    setQuery('')
    setOpenTopics(current => new Set([...current, id]))
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      document.getElementById(`help-title-${id}`)?.focus({ preventScroll: true })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [scrollTarget])

  function jump(id: string) {
    setScrollTarget(current => ({ id, request: current.request + 1 }))
  }
  function backToTopics() {
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    searchRef.current?.focus({ preventScroll: true })
  }
  const open = (screen: string) => go ? go(screen) : (window.location.hash = `#${screen}`)
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 pb-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Need Help</h1>
        <p className="text-sm text-gray-300">Assalamu alaikum. Need a hand with Athan? Start with your first prayer schedule, or search for the topic you need. We’ll walk through the controls, explain what they mean, and help you troubleshoot without risking your saved records.</p>
        <p className="text-xs text-gray-400">Available as a main feature in Feature Hub, app search and Custom Layout. Release history is in Credits → Developer Notes.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={actionClass} onClick={() => open('FeatureHub')}>Open Feature Hub</button>
          <button type="button" className={actionClass} onClick={() => open('Settings')}>Open Settings</button>
        </div>
      </header>
      <section aria-label="Find a help topic" className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <label className="block text-sm font-semibold">Search this guide<input ref={searchRef} type="search" value={query} maxLength={200} onChange={event => setQuery(event.target.value)} placeholder="Try timezone, backup, notes, or streak" className="mt-2 min-h-11 w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 font-normal text-gray-100" /></label>
        <p className="text-xs text-gray-400">Searches guide text only, never your prayer history, notes or online services.</p>
        <p role="status" className="text-sm text-gray-300">{matching.length} help topic{matching.length === 1 ? '' : 's'}{query.trim() ? (matching.length === 1 ? ' matches this search' : ' match this search') : ' available'}.</p>
        <nav aria-label="Help topics" className="grid gap-2 sm:grid-cols-2">
          {matching.map(topic => <button key={topic.id} type="button" className={`${actionClass} text-start`} onClick={() => jump(topic.id)}>{topic.title}</button>)}
        </nav>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={actionClass} onClick={() => setOpenTopics(new Set(matching.map(topic => topic.id)))}>Expand listed topics</button>
          <button type="button" className={actionClass} onClick={() => setOpenTopics(new Set())}>Collapse all topics</button>
          {query && <button type="button" className={actionClass} onClick={() => setQuery('')}>Clear guide search</button>}
        </div>
        {matching.length === 0 && <p className="text-sm text-gray-300">No matching help topics. Try a shorter word or clear the search. Your app records are unchanged.</p>}
      </section>
      {matching.map(topic => <HelpTopicCard key={topic.id} topic={topic} expanded={openTopics.has(topic.id)} onToggle={() => setOpenTopics(current => { const next = new Set(current); if (next.has(topic.id)) next.delete(topic.id); else next.add(topic.id); return next })} open={open} backToTopics={backToTopics} />)}
      <p className="text-xs text-gray-400">This guide describes current controls, not promised future features. Archived older instructions are not the current guide.</p>
    </div>
  )
}

function HelpTopicCard({ topic, expanded, onToggle, open, backToTopics }: { topic: HelpTopic; expanded: boolean; onToggle: () => void; open: (screen: string) => void; backToTopics: () => void }) {
  return (
    <details id={topic.id} open={expanded} className="scroll-mt-24 rounded-lg border border-gray-700 bg-gray-800">
      <summary onClick={event => { event.preventDefault(); onToggle() }} className="min-h-14 cursor-pointer rounded-lg p-4 focus:outline focus:outline-2 focus:outline-teal-400">
        <span className="font-semibold text-teal-200">{topic.title}</span>
        <span className="mt-1 block text-sm text-gray-400">{topic.summary}</span>
      </summary>
      <section aria-labelledby={`help-title-${topic.id}`} className="space-y-4 border-t border-gray-700 p-4 text-sm leading-6 text-gray-200">
        <h2 id={`help-title-${topic.id}`} tabIndex={-1} className="text-xl font-semibold focus:outline-none">{topic.title}</h2>
        <HelpPartBody part={topic} />
        {topic.parts?.map(part => <div key={part.title} className="space-y-2"><h3 className="font-semibold text-teal-300">{part.title}</h3><HelpPartBody part={part} /></div>)}
        {topic.examples && <div className="space-y-3"><h3 className="font-semibold text-teal-300">Search examples</h3><dl className="space-y-3">{topic.examples.map(([code, meaning]) => <div key={code} className="rounded-md bg-gray-900 p-3"><dt><code className="break-all text-teal-200">{code}</code></dt><dd className="mt-1 text-gray-300">{meaning}</dd></div>)}</dl></div>}
        {topic.id === 'qibla' && expanded && <QiblaStatusPanel />}
        <div className="flex flex-wrap gap-2">
          {topic.screen && <button type="button" className={actionClass} onClick={() => open(topic.screen!)}>{topic.action}</button>}
          <button type="button" className={actionClass} onClick={backToTopics}>Back to help topics</button>
        </div>
      </section>
    </details>
  )
}

function HelpPartBody({ part }: { part: HelpPart }) {
  return <>
    {part.paragraphs?.map(text => <p key={text}>{text}</p>)}
    {part.steps && <ol className="list-decimal space-y-2 ps-5">{part.steps.map(text => <li key={text}>{text}</li>)}</ol>}
    {part.table && <table className="w-full table-fixed border-collapse text-start text-sm">
      <caption className="sr-only">{part.title}</caption>
      <thead><tr>{part.table.headers.map(header => <th key={header} scope="col" className="break-words border border-gray-700 bg-gray-900 p-2 text-start font-semibold text-teal-300">{header}</th>)}</tr></thead>
      <tbody>{part.table.rows.map(([label, detail]) => <tr key={label}><th scope="row" className="break-words border border-gray-700 p-2 text-start font-medium">{label}</th><td className="break-words border border-gray-700 p-2">{detail}</td></tr>)}</tbody>
    </table>}
    {part.prompt && <blockquote aria-label="Timetable conversion prompt" className="select-text whitespace-pre-wrap break-words rounded-md border border-teal-800 bg-gray-900 p-3">{part.prompt}</blockquote>}
    {part.notes && <ul className="list-disc space-y-2 ps-5">{part.notes.map(text => <li key={text}>{text}</li>)}</ul>}
    {part.links && <ul className="list-disc space-y-2 ps-5">{part.links.map(link => <li key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer" className="break-words text-teal-300 underline underline-offset-2">{link.label} (opens website)</a></li>)}</ul>}
  </>
}

type QiblaStoredStatus = {
  compassSupported?: boolean
  compassPermissionNeeded?: boolean
  compassStatus?: string
  locationStatus?: string
  bearing?: number
  heading?: number | null
  headingSource?: 'ios-compass' | 'android-absolute-sensor' | 'android-absolute-orientation' | null
  aligned?: boolean
}

function QiblaStatusPanel() {
  const [status, setStatus] = useState<QiblaStoredStatus | null>(null)
  const [locationPermission, setLocationPermission] = useState('unknown')
  const [orientationSupported, setOrientationSupported] = useState(false)

  useEffect(() => {
    let active = true
    setOrientationSupported(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window)
    try {
      const raw = localStorage.getItem('athan.qibla.status.v1')
      if (raw) {
        const saved: unknown = JSON.parse(raw)
        if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
          const record = saved as Record<string, unknown>
          setStatus({
            compassPermissionNeeded: record.compassPermissionNeeded === true,
            compassStatus: typeof record.compassStatus === 'string' ? record.compassStatus : undefined,
            locationStatus: typeof record.locationStatus === 'string' ? record.locationStatus : undefined,
            bearing: typeof record.bearing === 'number' && Number.isFinite(record.bearing) ? record.bearing : undefined,
            heading: typeof record.heading === 'number' && Number.isFinite(record.heading) ? record.heading : undefined,
            headingSource: record.headingSource === 'ios-compass' || record.headingSource === 'android-absolute-sensor' || record.headingSource === 'android-absolute-orientation' ? record.headingSource : undefined,
          })
        }
      }
    } catch {
      setStatus(null)
    }

    async function readPermission() {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          if (active) setLocationPermission(result.state)
        }
      } catch {
        if (active) setLocationPermission('unknown')
      }
    }

    readPermission()
    return () => { active = false }
  }, [])

  return (
    <div className="rounded-lg border border-teal-800 bg-gray-900 p-4 space-y-3 text-sm">
      <h3 className="font-semibold text-teal-300">Last-recorded Qibla status</h3>
      <p className="text-xs text-gray-400">A saved snapshot, not live sensor readings. Open Qibla to refresh it.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatusLine label="Orientation API (not proof of a compass)" value={orientationSupported ? 'Available' : 'Not detected'} />
        <StatusLine label="Compass permission needed" value={status?.compassPermissionNeeded ? 'Yes on this browser' : 'Usually no / unknown'} />
        <StatusLine label="Compass status" value={status?.compassStatus ?? 'Open Qibla to check'} />
        <StatusLine label="Location permission" value={status?.locationStatus ?? locationPermission} />
        <StatusLine label="Bearing to Ka‘bah" value={typeof status?.bearing === 'number' ? `${status.bearing.toFixed(1)}°` : 'Open Qibla to calculate'} />
        <StatusLine label="Current heading" value={typeof status?.heading === 'number' ? `${status.heading.toFixed(0)}°` : 'Waiting for compass'} />
        <StatusLine label="Heading source" value={formatQiblaHeadingSource(status?.headingSource)} />
      </div>
      <div className="space-y-1 text-gray-300">
        <p>Move your phone in a figure-eight motion to improve compass calibration.</p>
        <p>Keep your phone away from magnets, metal objects, speakers, and electronic devices that may affect compass accuracy.</p>
        <p>If Qibla appears incorrect, check that location and motion/orientation permissions are enabled.</p>
      </div>
    </div>
  )
}

function formatQiblaHeadingSource(source: QiblaStoredStatus['headingSource']) {
  if (source === 'ios-compass') return 'iPhone compass'
  if (source === 'android-absolute-sensor') return 'Android magnetic North sensor'
  if (source === 'android-absolute-orientation') return 'Android absolute orientation'
  return 'No absolute heading recorded'
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-gray-800 p-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-gray-100">{value}</div>
    </div>
  )
}
