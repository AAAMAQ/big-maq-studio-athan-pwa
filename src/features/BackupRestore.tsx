import { useRef, useState } from 'react'
import { downloadBackup, importBackup, parseBackupJson, resetAthanAppData } from '../lib/backup'

type Props = {
  go?: (screen: string) => void
}

export default function BackupRestore({ go }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [message, setMessage] = useState('')

  function exportData() {
    try {
      const filename = downloadBackup()
      setMessage(`Downloaded ${filename}.`)
    } catch (error) {
      console.error('Failed to export backup', error)
      setMessage('Could not export app data.')
    }
  }

  async function importData(file: File | undefined) {
    if (!file) return
    try {
      const text = await file.text()
      const backup = parseBackupJson(text)
      const confirmed = window.confirm('Importing a backup may replace current local Athan PWA data. Continue?')
      if (!confirmed) return
      const count = importBackup(backup)
      setMessage(`Imported ${count} saved app items. Reload the app to see all restored data.`)
    } catch (error) {
      console.error('Failed to import backup', error)
      setMessage(error instanceof Error ? error.message : 'Could not restore this backup. Please keep the file and retry.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function resetData() {
    const confirmed = window.confirm('Reset Athan PWA local app data on this device? This cannot be undone unless you have a backup.')
    if (!confirmed) return
    try {
      const count = resetAthanAppData()
      setMessage(`Reset ${count} local app items. Reload the app to start fresh.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not reset device storage.')
    }
  }

  function goBack() {
    if (go) go('Settings')
    else window.location.hash = '#Settings'
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Backup and Restore</h1>
        <p className="text-sm text-gray-300">
          Save or restore Athan PWA data without accounts or cloud sync.
        </p>
      </header>

      <section className="bg-gray-800 rounded-lg p-4 space-y-4">
        <p className="rounded border border-teal-700 bg-teal-950/40 p-3 text-sm text-teal-100">
          Your backup file stays on your device. Athan PWA does not upload your data. Importing a backup may replace current local app data.
        </p>
        <p className="text-sm text-gray-300">Includes layout, performance priorities, Settings expansion, tracker records and notes, saved searches, profiles and reminders. Downloaded Quran text files are not embedded in backups; download them again on a new device if needed.</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <button type="button" onClick={exportData} className="rounded bg-teal-600 hover:bg-teal-500 px-4 py-3 font-semibold">
            Export App Data
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-3 font-semibold">
            Import App Data
          </button>
          <button type="button" onClick={resetData} className="rounded bg-red-900/70 hover:bg-red-800 px-4 py-3 font-semibold">
            Reset App Data
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(event) => importData(event.target.files?.[0])}
        />

        {message && <p className="rounded bg-gray-900 p-3 text-sm text-teal-300">{message}</p>}

        <button type="button" onClick={goBack} className="rounded bg-gray-700 hover:bg-gray-600 px-4 py-2">
          Back
        </button>
      </section>
    </div>
  )
}
