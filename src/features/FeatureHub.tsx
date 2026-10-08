import { useState } from 'react'
import { ROOT_FEATURE_IDS, rootFeatureLabel } from '../lib/rootFeatures'
import { loadLanguage } from '../lib/i18n'

export default function FeatureHub({ go }: { go?: (screen: string) => void }) {
  const [language] = useState(loadLanguage)
  const open = (screen: string) => go ? go(screen) : (window.location.hash = `#${screen}`)
  const destinations = ['Settings', ...ROOT_FEATURE_IDS.filter((id) => id !== 'Settings' && id !== 'FeatureHub')] as const
  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-6">
      <header>
        <h2 className="text-2xl font-bold">{language === 'ar' ? 'مركز الميزات' : 'Feature Hub'}</h2>
        <p className="mt-2 text-sm text-gray-400">{language === 'ar' ? 'افتح أي ميزة، حتى لو أخفيتها من الاختصارات. تبقى بياناتك محفوظة.' : 'Open any feature, including those hidden from your shortcuts. Your saved data stays intact.'}</p>
      </header>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {destinations.map((id) => (
          <button key={id} type="button" onClick={() => open(id)} className={`min-h-14 rounded-lg border p-4 text-start font-semibold text-teal-200 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 ${id === 'Settings' ? 'border-teal-700 bg-teal-950/40' : 'border-gray-700 bg-gray-800'}`}>
            {rootFeatureLabel(id, language)}
          </button>
        ))}
      </div>
    </div>
  )
}
