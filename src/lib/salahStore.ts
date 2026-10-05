import { normalizeSalahLogStore, type SalahLogStore } from './salahInsights'

export const SALAH_LOG_STORAGE_KEY = 'salahLogV1'
export const SALAH_DATA_CHANGE_EVENT = 'athan-salah-data-change'

export function loadSalahStore(): SalahLogStore {
  try {
    return normalizeSalahLogStore(JSON.parse(localStorage.getItem(SALAH_LOG_STORAGE_KEY) || '{}'))
  } catch {
    return {}
  }
}

export function saveSalahStore(store: SalahLogStore): void {
  localStorage.setItem(SALAH_LOG_STORAGE_KEY, JSON.stringify(store))
  window.dispatchEvent(new Event(SALAH_DATA_CHANGE_EVENT))
}
