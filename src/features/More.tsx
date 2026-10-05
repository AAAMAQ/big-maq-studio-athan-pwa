import { useEffect, useState } from 'react'
import { loadLanguage, t, type AppLanguage } from '../lib/i18n'
import { APP_LAYOUT_EVENT, effectiveLayout, loadAppLayout } from '../lib/appLayout'
import { rootFeatureLabel } from '../lib/rootFeatures'

type Props = {
  go?: (screen: string) => void
}

const items = [
  {
    titleKey: 'deepSearchAthan',
    descriptionKey: 'deepSearchAthanDescription',
    screen: 'AthanEngine'
  },
  {
    titleKey: 'savedCitiesTravel',
    descriptionKey: 'savedCitiesDescription',
    screen: 'SavedCities'
  },

  {
    titleKey: 'iqamaTimes',
    descriptionKey: 'iqamaTimesDescription',
    screen: 'Iqama'
  },
  {
    titleKey: 'masjidMode',
    descriptionKey: 'mosqueProfilesDescription',
    screen: 'MasjidMode'
  },
  {
    titleKey: 'salahTracker',
    descriptionKey: 'salahInsightsDescription',
    screen: 'SalahTracker'
  },
  {
    titleKey: 'ramadanMode',
    descriptionKey: 'ramadanModeDescription',
    screen: 'RamadanMode'
  },
  {
    titleKey: 'backupRestore',
    descriptionKey: 'backupRestoreDescription',
    screen: 'BackupRestore'
  },
  {
    titleKey: 'onboarding',
    descriptionKey: 'onboardingDescription',
    screen: 'Onboarding'
  }
]

export default function More({ go }: Props) {
  const language: AppLanguage = loadLanguage()
  const [layout, setLayout] = useState(loadAppLayout)
  const shortcuts = effectiveLayout(layout).more
  useEffect(() => {
    const refresh = () => setLayout(loadAppLayout())
    window.addEventListener(APP_LAYOUT_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => { window.removeEventListener(APP_LAYOUT_EVENT, refresh); window.removeEventListener('storage', refresh) }
  }, [])

  function open(screen: string) {
    if (go) go(screen)
    else window.location.hash = `#${screen}`
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">{t('more', language)}</h1>
        <p className="text-sm text-gray-300">{t('extraTools', language)}</p>
      </header>

      <section className="space-y-3">
        {shortcuts.map((id) => {
          const item = items.find((entry) => entry.screen === id)
          return (
          <button
            key={id}
            type="button"
            onClick={() => open(id)}
            className="w-full rounded-lg bg-gray-800 hover:bg-gray-700 p-4 text-left"
          >
            <div className="font-semibold text-teal-300">{item ? t(item.titleKey, language) : rootFeatureLabel(id, language)}</div>
            {item && <div className="text-sm text-gray-400">{t(item.descriptionKey, language)}</div>}
          </button>
        )})}
        {shortcuts.length === 0 && <p className="text-sm text-gray-400">No shortcuts selected. All features remain available in Feature Hub.</p>}
        {layout.enabled && <div className="flex flex-wrap gap-2"><button type="button" onClick={() => open('FeatureHub')} className="min-h-11 rounded-md border border-gray-700 px-3 text-sm text-teal-200">Feature Hub</button><button type="button" onClick={() => open('AppLayout')} className="min-h-11 rounded-md border border-gray-700 px-3 text-sm text-teal-200">Customize layout</button></div>}
      </section>
    </div>
  )
}
