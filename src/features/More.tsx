import { loadLanguage, t, type AppLanguage } from '../lib/i18n'

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
        {items.map((item) => (
          <button
            key={item.screen}
            type="button"
            onClick={() => open(item.screen)}
            className="w-full rounded-lg bg-gray-800 hover:bg-gray-700 p-4 text-left"
          >
            <div className="font-semibold text-teal-300">{t(item.titleKey, language)}</div>
            <div className="text-sm text-gray-400">{t(item.descriptionKey, language)}</div>
          </button>
        ))}
      </section>
    </div>
  )
}
