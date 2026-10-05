import { useCallback, useEffect, useState } from 'react'
import { formatSalahDate, type SalahLogStore } from './salahInsights'
import { loadSalahStore, SALAH_DATA_CHANGE_EVENT, SALAH_LOG_STORAGE_KEY, saveSalahStore } from './salahStore'

/** One tracker-local midnight timer; sleeping/background devices refresh on visibility. */
export function useSalahTodayKey() {
  const [todayKey, setTodayKey] = useState(() => formatSalahDate(new Date()))
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const refresh = () => {
      clearTimeout(timer)
      const now = new Date()
      setTodayKey(formatSalahDate(now))
      const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      timer = setTimeout(refresh, next.getTime() - now.getTime() + 50)
    }
    const onVisible = () => { if (!document.hidden) refresh() }
    refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    return () => { clearTimeout(timer); document.removeEventListener('visibilitychange', onVisible); window.removeEventListener('focus', refresh) }
  }, [])
  return todayKey
}

export function useSalahData() {
  const [store, setStore] = useState(loadSalahStore)
  const [storageError, setStorageError] = useState('')
  const todayKey = useSalahTodayKey()
  useEffect(() => {
    const refresh = () => setStore(loadSalahStore())
    const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === SALAH_LOG_STORAGE_KEY) refresh() }
    const onVisible = () => { if (!document.hidden) refresh() }
    window.addEventListener(SALAH_DATA_CHANGE_EVENT, refresh)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', onVisible)
    return () => { window.removeEventListener(SALAH_DATA_CHANGE_EVENT, refresh); window.removeEventListener('storage', onStorage); document.removeEventListener('visibilitychange', onVisible) }
  }, [])
  const updateStore = useCallback((update: (current: SalahLogStore) => SalahLogStore) => {
    const next = update(store)
    setStore(next)
    try { saveSalahStore(next); setStorageError(''); return true }
    catch { setStorageError('Changes are shown here but could not be saved on this device. Check available storage before leaving.'); return false }
  }, [store])
  return { store, updateStore, storageError, todayKey }
}
