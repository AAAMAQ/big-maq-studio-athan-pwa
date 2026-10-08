import { Component, lazy, Suspense, useMemo, useState, type ReactNode } from 'react'
import type { NavigationIntent } from '../types/nav'
import type { SalahBriefView } from '../lib/appLayout'

class BriefBoundary extends Component<{ children: ReactNode; onRetry: () => void; onNavigate?: (intent: NavigationIntent) => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section role="alert" className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">Salah Brief couldn’t open</h2>
        <p className="text-sm text-gray-400">Your prayer preview and saved records are unaffected. Uncached files may need a connection. If retrying doesn’t help after an update, check for an update in Settings.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={this.props.onRetry} className="min-h-11 rounded-md bg-teal-700 px-3 text-sm font-semibold">Retry Salah Brief</button>
          {this.props.onNavigate && <button type="button" onClick={() => this.props.onNavigate?.({ screen: 'SalahGraphs', period: 'week' })} className="min-h-11 rounded-md border border-gray-600 px-3 text-sm">View full graphs</button>}
        </div>
      </section>
    )
  }
}

/** Optional widget failures must not replace Home's essential prayer card. */
export default function SalahBriefSlot({ onNavigate, view }: { onNavigate?: (intent: NavigationIntent) => void; view?: SalahBriefView }) {
  const [attempt, setAttempt] = useState(0)
  const Brief = useMemo(() => {
    // A fresh lazy wrapper releases React's cached rejection on an explicit retry.
    void attempt
    return lazy(() => import('../features/SalahBrief'))
  }, [attempt])
  return (
    <BriefBoundary key={attempt} onRetry={() => setAttempt((value) => value + 1)} onNavigate={onNavigate}>
      <Suspense fallback={<p role="status" className="text-sm text-gray-400">Loading Salah Brief…</p>}>
        <Brief onNavigate={onNavigate} view={view} />
      </Suspense>
    </BriefBoundary>
  )
}
