import { useEffect, useRef, useState } from 'react'
import { loadLanguage } from '../lib/i18n'
import { rootFeatureLabel } from '../lib/rootFeatures'
import {
  applySharedDefaults,
  clearSharedDefaultsHash,
  type SharedDefaults
} from '../lib/sharedDefaults'

type Props = {
  defaults: SharedDefaults
  onClose: () => void
}

export default function SharedDefaultsPrompt({ defaults, onClose }: Props) {
  const [error, setError] = useState('')
  const [applyLayout, setApplyLayout] = useState(false)
  const language = loadLanguage()
  const dialogRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialogRef.current?.focus()
    return () => { if (previousFocus?.isConnected) previousFocus.focus() }
  }, [])

  function dismiss() {
    clearSharedDefaultsHash()
    onClose()
  }

  function apply() {
    try {
      applySharedDefaults(defaults, { applyLayout })
      clearSharedDefaultsHash()
      window.location.reload()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'These defaults could not be applied.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" role="presentation">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shared-defaults-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); dismiss(); return }
          if (event.key !== 'Tab') return
          const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), a[href]')
          const first = controls?.[0], last = controls?.[controls.length - 1]
          if (!first || !last) { event.preventDefault(); return }
          if (event.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) { event.preventDefault(); last.focus() }
          else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialogRef.current)) { event.preventDefault(); first.focus() }
        }}
        className="max-h-[90dvh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl border border-teal-800 bg-gray-900 p-5 shadow-2xl"
      >
        <div>
          <p className="text-xs font-semibold uppercase text-teal-400">Private by design</p>
          <h2 id="shared-defaults-title" className="mt-1 text-xl font-bold text-white">Apply shared defaults?</h2>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            This link offers app preferences only. Nothing will change until you apply them. The shared prayer
            calculation will be saved as a Manual choice so it is not replaced by automatic country detection.
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 rounded-lg bg-gray-950 p-4 text-sm">
          <DefaultRow label="Method" value={defaults.prayer.method} />
          <DefaultRow label="Asr" value={defaults.prayer.madhab} />
          <DefaultRow label="High latitude" value={defaults.prayer.highLatRule} />
          <DefaultRow label="Language" value={defaults.preferences.language === 'ar' ? 'Arabic' : 'English'} />
          <DefaultRow label="Clock" value={clockLabel(defaults.preferences.timeFormat)} />
          <DefaultRow label="Sunnahs tile" value={defaults.preferences.showSunnah ? 'Shown' : 'Hidden'} />
          <DefaultRow label="Reminder" value={`${defaults.reminders.offsetMinutes} minutes before`} />
          <DefaultRow label="Fixed Isha" value={defaults.reminders.fixedIshaTime} />
        </dl>

        {defaults.layout && (
          <section aria-label="Shared layout preview" className="space-y-3 rounded-lg border border-teal-900 bg-gray-950 p-4 text-sm">
            <h3 className="font-semibold text-teal-200">Custom layout preview</h3>
            <p>Custom Layout: {defaults.layout.enabled ? 'Enabled' : 'Disabled (saved arrangement retained)'}</p>
            <dl className="space-y-2">
              <DefaultRow label="Navigation" value={[rootFeatureLabel('Home', language), ...defaults.layout.navigation.map((id) => rootFeatureLabel(id, language))].join(' → ')} />
              <DefaultRow label="Home shortcuts" value={defaults.layout.home.map((id) => rootFeatureLabel(id, language)).join(' → ') || 'None'} />
              <DefaultRow label="More shortcuts" value={defaults.layout.more.map((id) => rootFeatureLabel(id, language)).join(' → ') || 'None'} />
              <DefaultRow label="Salah Brief" value={defaults.layout.homeSections?.salahBrief ? `Shown when Custom Layout is enabled — ${defaults.layout.homeSections.salahBriefView === 'bars' ? 'Prayer bars' : 'Line graph'} using your own records` : 'Hidden'} />
            </dl>
            <p className="text-xs text-gray-400">Home and Feature Hub access stay protected. Settings is always available in Feature Hub.</p>
            <label className="flex min-h-11 items-center gap-3 font-semibold text-teal-200">
              <input type="checkbox" checked={applyLayout} onChange={(event) => setApplyLayout(event.target.checked)} className="h-5 w-5 accent-teal-500" />
              Apply shared layout
            </label>
            <p className="text-xs text-gray-400">Unchecked: apply ordinary defaults only and keep your existing layout.</p>
          </section>
        )}
        {defaults.layoutWarnings?.map((warning) => <p key={warning} role="status" className="text-sm text-amber-200">{warning}</p>)}

        <p className="rounded-lg border border-emerald-900 bg-emerald-950/40 p-3 text-xs leading-5 text-emerald-200">
          Salah history, notes, saved searches, tracker reminder preferences, Performance Mode/priorities, Settings expansion, Quran activity, locations, and profiles are never included. A selected layout shares only button order and Salah Brief visibility—not graph values.
        </p>

        {error && <p role="alert" className="text-sm text-amber-200">{error}</p>}

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={dismiss} className="min-h-11 rounded-lg border border-gray-700 bg-gray-800 font-semibold text-gray-200 hover:bg-gray-700">
            Not now
          </button>
          <button type="button" onClick={apply} className="min-h-11 rounded-lg bg-teal-600 font-semibold text-white hover:bg-teal-500">
            Apply defaults
          </button>
        </div>
      </section>
    </div>
  )
}

function DefaultRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="mt-1 break-words font-medium text-gray-100">{value}</dd>
    </div>
  )
}

function clockLabel(value: SharedDefaults['preferences']['timeFormat']) {
  if (value === '12h') return 'AM/PM'
  if (value === '24h') return '24-hour'
  return 'Device default'
}
