import { Component, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  resetKey: string
  onRetry: () => void
  onHome: () => void
  onSettings: () => void
  onFeatureHub: () => void
  onReloadApp?: () => void
  recoveryMessage?: string
}
type State = { failed: boolean }

/** Keep header/navigation outside this boundary so a broken feature never strands a user. */
export default class ScreenBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State { return { failed: true } }

  componentDidUpdate(previous: Props) {
    if (previous.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false })
    }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <section role="alert" className="rounded-xl border border-gray-700 bg-gray-800 p-5 space-y-4">
        <h2 className="text-lg font-semibold">This screen couldn’t open</h2>
        <p className="text-gray-300">Try again, or open another feature. If files haven’t been cached yet, you may need a connection. Your saved records have not been cleared.</p>
        {this.props.onReloadApp && <p className="text-sm text-gray-400">If an app update changed its files, trying this screen again may not be enough. Check for an update and safely reload the app when connected.</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 font-semibold" onClick={this.props.onRetry}>Try again</button>
          <button type="button" className="min-h-11 rounded-lg border border-gray-600 px-4 py-2" onClick={this.props.onHome}>Home</button>
          <button type="button" className="min-h-11 rounded-lg border border-gray-600 px-4 py-2" onClick={this.props.onSettings}>Settings</button>
          <button type="button" className="min-h-11 rounded-lg border border-gray-600 px-4 py-2" onClick={this.props.onFeatureHub}>Feature Hub</button>
          {this.props.onReloadApp && <button type="button" className="min-h-11 rounded-lg border border-gray-600 px-4 py-2" onClick={this.props.onReloadApp}>Check update / reload app</button>}
        </div>
        {this.props.recoveryMessage && <p role="status" className="text-sm text-teal-200">{this.props.recoveryMessage}</p>}
      </section>
    )
  }
}

export function ScreenLoading() {
  return <div role="status" className="rounded-xl border border-gray-700 bg-gray-800 p-5 text-gray-300">Opening feature…</div>
}
