import { useMemo, useState } from 'react'
import { formatDateInput, IQAMA_PRAYERS, parseDateInput, type IqamaPrayerName } from '../lib/iqama'
import {
  createJummahSlot,
  createMasjidProfile,
  deleteMasjidProfile,
  loadMasjidProfiles,
  updateMasjidProfile,
  type MasjidIqamaRule,
  type MasjidProfile
} from '../lib/masjid'
import { refreshDeviceLocation } from '../lib/locationStore'
import { buildMasjidIqamaExport, downloadMasjidIqamaExport } from '../lib/masjidIcs'
import { loadSettings } from '../lib/prayer'
import { loadSavedCities, prayerTimesForSavedCity } from '../lib/savedCities'
import { buildMasjidProfileText, shareProfileText } from '../lib/profileSharing'

type Props = {
  go?: (screen: string) => void
}

export default function MasjidMode({ go }: Props) {
  const [profiles, setProfiles] = useState<MasjidProfile[]>(() => loadMasjidProfiles())
  const [selectedId, setSelectedId] = useState<string>(() => profiles[0]?.id ?? '')
  const [message, setMessage] = useState('')
  const [exportMessage, setExportMessage] = useState('')
  const [savedCities] = useState(loadSavedCities)
  const [exportFrom, setExportFrom] = useState(() => formatDateInput(new Date()))
  const [exportTo, setExportTo] = useState(() => formatDateInput(new Date()))

  const selected = useMemo(() => {
    return profiles.find((profile) => profile.id === selectedId) ?? profiles[0] ?? null
  }, [profiles, selectedId])

  function setSelected(profile: MasjidProfile) {
    setProfiles((current) => current.map((item) => item.id === profile.id ? profile : item))
  }

  function addProfile() {
    const profile = createMasjidProfile()
    setProfiles((current) => [...current, profile])
    setSelectedId(profile.id)
    setMessage('New masjid profile ready. Add details and save.')
  }

  function saveProfile() {
    if (!selected) return
    const next = updateMasjidProfile(selected, profiles)
    setProfiles(next)
    setSelectedId(selected.id)
    setMessage('Masjid profile saved on this device.')
  }

  function removeProfile(profileId: string) {
    if (!window.confirm('Delete this masjid profile from this device?')) return
    const next = deleteMasjidProfile(profileId, profiles)
    setProfiles(next)
    setSelectedId(next[0]?.id ?? '')
    setMessage('Masjid profile deleted.')
  }

  function updateField<K extends keyof MasjidProfile>(key: K, value: MasjidProfile[K]) {
    if (!selected) return
    setSelected({ ...selected, [key]: value })
  }

  function linkCityProfile(cityProfileId: string) {
    if (!selected) return
    const city = savedCities.find((profile) => profile.id === cityProfileId)
    setSelected({
      ...selected,
      cityProfileId: city?.id,
      city: city ? (city.name || city.city) : selected.city
    })
    setMessage(city
      ? `Linked ${city.name || city.city} as this masjid's Athan source.`
      : 'Masjid returned to an unlinked city note.')
  }

  function updateIqamaRule(prayer: IqamaPrayerName, nextRule: Partial<MasjidIqamaRule>) {
    if (!selected) return
    setSelected({
      ...selected,
      iqamaRules: {
        ...selected.iqamaRules,
        [prayer]: {
          ...selected.iqamaRules[prayer],
          ...nextRule
        }
      }
    })
  }

  function addJummahSlot() {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: [
        ...selected.jummahSlots,
        createJummahSlot(`${ordinalLabel(selected.jummahSlots.length + 1)} Jumu’ah`)
      ]
    })
  }

  function updateJummahSlot(slotId: string, key: 'label' | 'khutbahTime' | 'iqamaTime' | 'notes', value: string) {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: selected.jummahSlots.map((slot) => slot.id === slotId ? { ...slot, [key]: value } : slot)
    })
  }

  function removeJummahSlot(slotId: string) {
    if (!selected) return
    setSelected({
      ...selected,
      jummahSlots: selected.jummahSlots.filter((slot) => slot.id !== slotId)
    })
  }

  function goBack() {
    if (go) go('More')
    else window.location.hash = '#More'
  }

  async function shareMasjidProfile() {
    if (!selected) return
    const result = await shareProfileText(
      `Athan PWA masjid profile — ${selected.name || 'Masjid'}`,
      buildMasjidProfileText(selected)
    )
    if (result === 'cancelled') return
    setMessage(result === 'shared'
      ? 'Masjid profile shared.'
      : result === 'copied'
        ? 'Masjid profile copied to the clipboard.'
        : 'Profile sharing is not available in this browser.')
  }

  function setExportRange(days: number) {
    const from = new Date()
    const to = new Date(from)
    to.setDate(to.getDate() + Math.max(0, days - 1))
    setExportFrom(formatDateInput(from))
    setExportTo(formatDateInput(to))
  }

  async function exportSelectedIqama() {
    if (!selected) return
    if (!selected.name.trim()) {
      setExportMessage('Add a masjid name before exporting.')
      return
    }
    const fromDate = parseDateInput(exportFrom)
    const toDate = parseDateInput(exportTo)
    if (toDate < fromDate) {
      setExportMessage('The end date must be on or after the start date.')
      return
    }

    try {
      const linkedCity = selected.cityProfileId
        ? savedCities.find((city) => city.id === selected.cityProfileId)
        : null
      if (selected.cityProfileId && !linkedCity) {
        setExportMessage('The linked City Mode profile is missing. Relink it or choose “No linked City Mode profile.”')
        return
      }

      if (linkedCity) {
        const result = buildMasjidIqamaExport({
          profile: selected,
          fromDate,
          toDate,
          coords: { latitude: linkedCity.latitude, longitude: linkedCity.longitude },
          sourceLabel: `${linkedCity.name || linkedCity.city || 'Linked City Mode profile'}${linkedCity.calculationMode === 'manual-timetable' ? ' imported timetable' : ' saved calculation settings'}`,
          prayerTimesForDate: (date) => prayerTimesForSavedCity(linkedCity, date)
        })
        downloadMasjidIqamaExport(result)
        setExportMessage(`Downloaded ${result.eventCount} Iqama and Jumu’ah calendar events for ${selected.name}.`)
        return
      }

      const location = await refreshDeviceLocation()
      if (!location.location) {
        setExportMessage('No City Mode profile is linked, so current device location permission is required for offset-based Iqama times.')
        return
      }
      const result = buildMasjidIqamaExport({
        profile: selected,
        fromDate,
        toDate,
        coords: { latitude: location.location.latitude, longitude: location.location.longitude },
        sourceLabel: 'Current device location with Settings prayer calculation',
        prayerSettings: loadSettings()
      })
      downloadMasjidIqamaExport(result)
      setExportMessage(`Downloaded ${result.eventCount} Iqama and Jumu’ah calendar events for ${selected.name}.`)
    } catch (error) {
      console.error('Failed to export masjid Iqama calendar', error)
      setExportMessage('Could not export this masjid calendar. Check the saved Iqama times and location information, then try again.')
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Masjid Mode</h1>
        <p className="text-sm text-gray-300">
          Save local mosque Iqama and Jumu’ah schedules on this device.
        </p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Saved Masjids</h2>
            <p className="text-xs text-gray-400">Profiles stay local in your browser.</p>
          </div>
          <button type="button" onClick={addProfile} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-2 font-semibold">
            Create New Profile
          </button>
        </div>

        {profiles.length === 0 ? (
          <p className="rounded bg-gray-900 p-3 text-sm text-gray-300">No masjid profiles yet.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => setSelectedId(profile.id)}
                className={`rounded border p-3 text-left ${selected?.id === profile.id ? 'border-teal-400 bg-teal-900/50' : 'border-gray-700 bg-gray-900 hover:bg-gray-700'}`}
              >
                <div className="font-semibold">{profile.name || 'Unnamed Masjid'}</div>
                <div className="text-sm text-gray-400">{profile.city || 'City not set'}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <section className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="font-semibold">Masjid name</span>
              <input value={selected.name} onChange={(event) => updateField('name', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
            <label className="space-y-1 text-sm">
              <span className="font-semibold">City</span>
              <input value={selected.city} onChange={(event) => updateField('city', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
            </label>
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-semibold">City Mode Athan source</span>
            <select
              value={selected.cityProfileId || ''}
              onChange={(event) => linkCityProfile(event.target.value)}
              className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2"
            >
              <option value="">No linked City Mode profile</option>
              {savedCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name || city.city || 'Unnamed city'} · {city.calculationMode === 'manual-timetable' ? 'Imported timetable' : city.calculationMethod}
                </option>
              ))}
            </select>
            <span className="block text-xs leading-5 text-gray-400">
              Link the Athan timetable used for this masjid. Iqama rules remain stored separately in Masjid Mode.
            </span>
          </label>

          {selected.cityProfileId && (
            <div className="rounded-md border border-teal-900 bg-teal-950/30 p-3 text-xs text-teal-100">
              Linked City Mode preset: {savedCities.find((city) => city.id === selected.cityProfileId)?.name || selected.city}
            </div>
          )}

          <label className="block space-y-1 text-sm">
            <span className="font-semibold">Address or short location note</span>
            <input value={selected.address} onChange={(event) => updateField('address', event.target.value)} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Iqama Schedule</h2>
            {IQAMA_PRAYERS.map((prayer) => {
              const rule = selected.iqamaRules[prayer]
              return (
                <div key={prayer} className="rounded border border-gray-700 bg-gray-900 p-3 space-y-3">
                  <div className="font-semibold text-teal-300">{prayer}</div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="space-y-1 text-sm">
                      <span>Mode</span>
                      <select value={rule.mode} onChange={(event) => updateIqamaRule(prayer, { mode: event.target.value as MasjidIqamaRule['mode'] })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2">
                        <option value="offset">Minutes after Athan</option>
                        <option value="fixed">Fixed time</option>
                      </select>
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>Fixed time</span>
                      <input type="time" value={rule.fixedTime} onChange={(event) => updateIqamaRule(prayer, { fixedTime: event.target.value })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                    </label>
                    <label className="space-y-1 text-sm">
                      <span>Minutes after Athan</span>
                      <input type="number" min="0" max="1440" value={rule.offsetMinutes} onChange={(event) => updateIqamaRule(prayer, { offsetMinutes: Number(event.target.value) })} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                    </label>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Jumu’ah Slots</h2>
              <button type="button" onClick={addJummahSlot} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">Add Jumu’ah Slot</button>
            </div>
            {selected.jummahSlots.length === 0 && <p className="text-sm text-gray-400">No Jumu’ah slots saved.</p>}
            {selected.jummahSlots.map((slot) => (
              <div key={slot.id} className="rounded border border-gray-700 bg-gray-900 p-3 space-y-3">
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="space-y-1 text-sm">
                    <span>Label</span>
                    <input value={slot.label} onChange={(event) => updateJummahSlot(slot.id, 'label', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Khutbah time</span>
                    <input type="time" value={slot.khutbahTime} onChange={(event) => updateJummahSlot(slot.id, 'khutbahTime', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                  <label className="space-y-1 text-sm">
                    <span>Iqama time</span>
                    <input type="time" value={slot.iqamaTime} onChange={(event) => updateJummahSlot(slot.id, 'iqamaTime', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                  </label>
                </div>
                <label className="block space-y-1 text-sm">
                  <span>Notes</span>
                  <input value={slot.notes} onChange={(event) => updateJummahSlot(slot.id, 'notes', event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
                </label>
                <button type="button" onClick={() => removeJummahSlot(slot.id)} className="rounded bg-red-900/70 hover:bg-red-800 px-3 py-2 text-sm">
                  Remove Jumu’ah Slot
                </button>
              </div>
            ))}
          </div>

          <label className="block space-y-1 text-sm">
            <span className="font-semibold">General notes</span>
            <textarea value={selected.notes} onChange={(event) => updateField('notes', event.target.value)} rows={3} className="w-full rounded bg-gray-900 border border-gray-700 px-3 py-2" />
          </label>

          <div className="space-y-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
            <div>
              <h2 className="text-lg font-semibold">Export Iqama Times</h2>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Uses this masjid&apos;s Iqama rules and Jumu’ah slots. A linked City Mode profile supplies Athan times, including imported timetables. Without a link, the explicit fallback is your current device location with the calculation settings saved in Settings.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="font-semibold">From date</span>
                <input type="date" value={exportFrom} onChange={(event) => setExportFrom(event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
              </label>
              <label className="space-y-1 text-sm">
                <span className="font-semibold">To date</span>
                <input type="date" min={exportFrom} value={exportTo} onChange={(event) => setExportTo(event.target.value)} className="w-full rounded bg-gray-800 border border-gray-700 px-3 py-2" />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button type="button" onClick={() => setExportRange(1)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">Today</button>
              <button type="button" onClick={() => setExportRange(7)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">7 days</button>
              <button type="button" onClick={() => setExportRange(30)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">30 days</button>
              <button type="button" onClick={() => setExportRange(365)} className="rounded bg-gray-700 hover:bg-gray-600 px-3 py-2 text-sm font-semibold">1 year</button>
            </div>
            <p className="text-xs text-gray-400">Configured Jumu’ah slots are added only on Fridays. Every event keeps the existing 10-minute Iqama alert. Alert delivery depends on your calendar app and its notification settings.</p>
            <button type="button" onClick={exportSelectedIqama} className="w-full rounded bg-teal-600 hover:bg-teal-500 px-4 py-3 font-semibold">Export Iqama Times</button>
            {exportMessage && <p role="status" className="rounded bg-gray-800 p-3 text-sm text-teal-300">{exportMessage}</p>}
          </div>

          <p className="rounded border border-amber-900/70 bg-amber-950/30 p-3 text-xs leading-5 text-amber-100">
            Sharing this profile includes its masjid name, city, address or location note, Iqama rules, Jumu’ah
            schedule, and notes. Review those fields before sharing.
          </p>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <button type="button" onClick={saveProfile} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-3 font-semibold">Save</button>
            <button type="button" onClick={shareMasjidProfile} className="rounded border border-teal-700 bg-teal-950/40 px-4 py-3 font-semibold text-teal-200 hover:bg-teal-900/60">Share Masjid Profile</button>
            <button type="button" onClick={() => removeProfile(selected.id)} className="rounded bg-red-900/70 hover:bg-red-800 px-4 py-3 font-semibold">Delete Profile</button>
            <button type="button" onClick={goBack} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-3 font-semibold">Back</button>
          </div>

          {message && <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">{message}</p>}
        </section>
      )}
    </div>
  )
}

function ordinalLabel(value: number) {
  if (value === 1) return 'First'
  if (value === 2) return 'Second'
  if (value === 3) return 'Third'
  return `${value}th`
}
