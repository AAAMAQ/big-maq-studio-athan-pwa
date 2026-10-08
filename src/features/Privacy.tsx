type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

export default function Privacy({ go, backTarget = 'Credits' }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4">
      {go && (
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-700 hover:text-teal-300"
        >
          ← Back to Credits
        </button>
      )}

      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-teal-400">Your data stays yours</p>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="leading-6 text-gray-300">
          Athan PWA is designed to be offline-first and privacy-respecting. Most features run entirely on your device.
        </p>
      </header>

      <section className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <div>
          <h2 className="font-semibold text-teal-300">Stored on your device</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-300">
            <li>Prayer calculation, Iqama, language, and display preferences.</li>
            <li>Quran bookmarks, downloads, and reading progress.</li>
            <li>Saved locations and the last known coordinates used for local calculations.</li>
            <li>Salah, Ramadan, and Masjid profile records that you choose to save.</li>
          </ul>
        </div>
        <div>
          <h2 className="font-semibold text-teal-300">Not collected by Athan PWA</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-gray-300">
            <li>No account, advertising identifier, analytics profile, or tracking history.</li>
            <li>No server-side storage of your personal tracker or preference data.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-lg border border-teal-900 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-teal-300">Share Your Defaults</h2>
        <p className="text-sm leading-6 text-gray-300">
          When you choose Share Your Defaults, Athan PWA creates a consent-based link from a strict allowlist:
          prayer calculation choices, language, time format, optional Sunnahs visibility, and reminder defaults.
          Custom layout is included only when you explicitly select it: enabled state, shortcut order, and Salah Brief visibility/chart choice.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          The link never includes Salah or Ramadan tracker records, Quran progress or bookmarks, coordinates,
          saved cities, mosque profiles, or other personal activity. The recipient sees the included defaults and
          must approve them before they are applied. Applying a shared layout requires a separate choice; opening
          the link changes nothing. Layout links do not include graph values, notes, saved/recent searches, tracker
          reminder preferences, Performance Mode/priorities, or Settings expansion choices. Salah Brief always uses
          the recipient&apos;s own local records.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-amber-900/80 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-amber-200">City and Masjid profile sharing</h2>
        <p className="text-sm leading-6 text-gray-300">
          Profile sharing happens only after you select a specific City or Masjid profile and tap its Share Profile
          button. City profiles can contain coordinates and notes. Masjid profiles can contain an address or location
          note, schedules, and general notes. Review these visible fields before sharing them.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          Sharing one profile does not include any other saved profile or personal worship activity. Imported yearly
          timetable rows are not embedded in City profile messages.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold">Permissions and connectivity</h2>
        <p className="text-sm leading-6 text-gray-300">
          Location is used to calculate prayer times and Qibla direction. Browser notifications are optional, and
          calendar files are generated on your device. You can revoke permissions through your browser at any time.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          Some searches and Quran downloads need an internet connection. Data already saved by the PWA may remain
          available offline through browser storage and app caches.
        </p>
        <p className="text-sm leading-6 text-gray-300">
          Resolving the timezone for a selected saved city may send that city&apos;s coordinates to a timezone service.
          The resulting timezone is saved with the city for future use. Salah logs and daily notes are never sent
          with that request.
        </p>
      </section>

      <section className="rounded-lg border border-teal-900 bg-gray-800 p-4">
        <h2 className="text-lg font-semibold text-teal-300">No Ads</h2>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          This app is completely ad-free. We believe in a respectful user experience without distractions.
          No Ads means no tracking or data collection for advertising purposes.
        </p>
      </section>

      <section className="rounded-lg border border-gray-700 bg-gray-800 p-4">
        <h2 className="font-semibold">Contact</h2>
        <p className="mt-1 text-sm text-gray-300">
          Questions about privacy can be sent to{' '}
          <a className="text-teal-300 underline" href="mailto:aaamaq.contact.us@gmail.com">
            aaamaq.contact.us@gmail.com
          </a>.
        </p>
      </section>
    </div>
  )
}
