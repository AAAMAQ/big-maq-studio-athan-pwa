import { SALAH_PERIOD_LABELS, type SalahPeriodKey, type SalahRangeSelection } from '../lib/salahInsights'

const PERIODS = Object.keys(SALAH_PERIOD_LABELS) as SalahPeriodKey[]

export default function SalahRangePicker({ value, onChange }: { value: SalahRangeSelection; onChange: (value: SalahRangeSelection) => void }) {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const currentMonth = todayKey.slice(0, 7)
  const mode = value.kind === 'preset' ? value.period : value.kind === 'month' ? 'selected-month' : 'custom'
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 space-y-3">
      <label className="block text-sm font-semibold">Time period
        <select value={mode} onChange={(event) => {
          const next = event.target.value
          if (next === 'selected-month') onChange({ kind: 'month', month: currentMonth })
          else if (next === 'custom') onChange({ kind: 'custom', from: `${currentMonth}-01`, to: todayKey })
          else onChange({ kind: 'preset', period: next as SalahPeriodKey })
        }} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100">
          {PERIODS.map((period) => <option key={period} value={period}>{SALAH_PERIOD_LABELS[period]}</option>)}
          <option value="selected-month">Choose a month</option>
          <option value="custom">Choose dates</option>
        </select>
      </label>
      {value.kind === 'month' ? (
        <label className="block text-sm">Month
          <input type="month" value={value.month} max={currentMonth} onChange={(event) => onChange({ kind: 'month', month: event.target.value })} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100" />
        </label>
      ) : null}
      {value.kind === 'custom' ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">From
            <input type="date" value={value.from} max={todayKey} onChange={(event) => onChange({ ...value, from: event.target.value })} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100" />
          </label>
          <label className="block text-sm">Through
            <input type="date" value={value.to} max={todayKey} onChange={(event) => onChange({ ...value, to: event.target.value })} className="mt-1 block w-full rounded border border-gray-700 bg-gray-900 px-3 py-2 text-gray-100" />
          </label>
        </div>
      ) : null}
    </div>
  )
}
