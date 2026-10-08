import { useEffect, useMemo, useRef, useState } from 'react'
import { appDestinations, searchAppDestinations } from '../lib/destinationSearch'
import { loadLanguage } from '../lib/i18n'
import type { NavigationIntent } from '../types/nav'

export default function FeatureSearch({ onNavigate }: { onNavigate?: (intent: NavigationIntent) => void }) {
  const [language] = useState(loadLanguage)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const catalog = useMemo(() => appDestinations(language), [language])
  const matches = useMemo(() => searchAppDestinations(query, catalog), [query, catalog])
  const arabic = language === 'ar'
  useEffect(() => { input.current?.focus() }, [])

  return (
    <section className="mx-auto max-w-2xl space-y-4 pb-8" aria-labelledby="feature-search-title">
      <header>
        <h2 id="feature-search-title" className="text-2xl font-bold">{arabic ? 'البحث في التطبيق' : 'Search app'}</h2>
        <p id="feature-search-hint" className="mt-2 text-sm text-gray-400">{arabic ? 'ابحث عن شاشة أو سورة. الميزات المخفية متاحة أيضًا. لا يتم البحث في سجلاتك الشخصية.' : 'Find a screen or Surah, including hidden features. This searches app destinations, not your personal records.'}</p>
      </header>
      <label htmlFor="feature-search-input" className="block text-sm font-semibold text-gray-200">{arabic ? 'الشاشة أو السورة' : 'Screen or Surah'}</label>
      <input ref={input} id="feature-search-input" role="combobox" aria-autocomplete="list" aria-expanded={matches.length > 0} aria-controls="feature-search-results" aria-activedescendant={matches[active] ? `destination-${matches[active].id}` : undefined} aria-describedby="feature-search-hint" autoComplete="off" maxLength={200} value={query}
        placeholder={arabic ? 'مثال: القبلة، الشهر، الكهف' : 'Try Iqama, month, Al-Kahf…'}
        onChange={(event) => { setQuery(event.target.value); setActive(0) }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') { event.preventDefault(); onNavigate?.({ screen: 'Home' }) }
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (matches.length) setActive((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + matches.length) % matches.length)
          }
          if (event.key === 'Enter' && matches[active]) { event.preventDefault(); onNavigate?.(matches[active].intent) }
        }}
        className="min-h-11 w-full rounded-md border border-gray-600 bg-gray-950 px-3 py-3 text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30" />
      <p role="status" className="text-xs text-gray-400">{matches.length ? (arabic ? `${matches.length} اقتراحات. استخدم الأسهم ثم الإدخال للاختيار.` : `${matches.length} suggestions. Use arrow keys and Enter to open.`) : (arabic ? 'لا توجد شاشة مطابقة. جرّب اسمًا آخر.' : 'No matching screen. Try another name.')}</p>
      <div id="feature-search-results" role="listbox" aria-label={arabic ? 'شاشات التطبيق' : 'App destinations'} className="space-y-2">
        {matches.map((destination, index) => (
          <button key={destination.id} id={`destination-${destination.id}`} role="option" aria-label={`${destination.label} — ${destination.breadcrumb}`} aria-selected={active === index} tabIndex={-1} type="button" onMouseEnter={() => setActive(index)} onClick={() => onNavigate?.(destination.intent)}
            className={`min-h-14 w-full rounded-lg border px-4 py-3 text-start focus:outline-none focus:ring-2 focus:ring-teal-400 ${active === index ? 'border-teal-500 bg-teal-950/40' : 'border-gray-700 bg-gray-800 hover:border-teal-600'}`}>
            <span className="block font-semibold text-teal-200">{destination.label}</span>
            <span className="mt-1 block text-xs text-gray-400">{destination.breadcrumb}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">{arabic ? 'اقتراحات محلية دون اتصال. قد تتطلب الشاشة التي تفتحها اتصالًا أو إذنًا حسب وظيفتها.' : 'Suggestions work locally and offline. The screen you open may need a connection or permission for its own features.'}</p>
    </section>
  )
}
