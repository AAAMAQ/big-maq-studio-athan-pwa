import { SALAH_PRAYERS, type SalahPeriodInsights } from '../lib/salahInsights'

/** Shared logged-data presentation for Graph Insights and the optional Home brief. */
export default function SalahPrayerCompletionChart({ prayers }: { prayers: SalahPeriodInsights['prayers'] }) {
  return <section aria-label="Prayer completion" className="rounded-lg bg-gray-800 p-4 space-y-4">
    <h2 className="text-lg font-semibold">Prayer completion</h2>
    {SALAH_PRAYERS.map((prayer) => {
      const item = prayers[prayer]
      return <div key={prayer}>
        <div className="flex justify-between gap-2 text-sm"><span>{prayer}</span><span className="text-gray-300">{item.rate === null ? 'No logged data' : `${item.rate}% · ${item.completed}/${item.logged} logged`}</span></div>
        <div role="img" aria-label={`${prayer}: ${item.rate === null ? 'no logged data' : `${item.completed} of ${item.logged} logged prayers completed, ${item.rate}%`}`} className={`mt-1 h-4 rounded ${item.rate === null ? 'border border-dashed border-gray-500 bg-gray-900' : 'bg-gray-700'}`}><div className="h-full rounded bg-teal-500" style={{ width: `${item.rate ?? 0}%` }} /></div>
      </div>
    })}
  </section>
}
