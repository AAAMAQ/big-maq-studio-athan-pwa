import { readPreference, writePreference } from './appLayout'
import { isRootFeatureId, type RootFeatureId } from './rootFeatures'

export const PERFORMANCE_KEY = 'athan.performance.v1'
export type PerformancePreferences = { schemaVersion: 1; enabled: boolean; priorities: RootFeatureId[] }
export function normalizePerformancePreferences(value: unknown): PerformancePreferences {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { schemaVersion: 1, enabled: false, priorities: [] }
  const raw = value as Partial<PerformancePreferences>
  if (raw.schemaVersion !== undefined && raw.schemaVersion !== 1) return { schemaVersion: 1, enabled: false, priorities: [] }
  return { schemaVersion: 1, enabled: raw.enabled === true, priorities: Array.isArray(raw.priorities) ? [...new Set(raw.priorities.filter(isRootFeatureId))] : [] }
}
export function loadPerformancePreferences(): PerformancePreferences { return normalizePerformancePreferences(readPreference(PERFORMANCE_KEY)) }
export function savePerformancePreferences(value: PerformancePreferences): boolean { return writePreference(PERFORMANCE_KEY, normalizePerformancePreferences(value)) }
