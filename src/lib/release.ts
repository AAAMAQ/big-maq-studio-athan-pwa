export const ATHAN_RELEASE = {
  version: String(import.meta.env.VITE_APP_VERSION || '4.0.2'),
  updatedAt: String(import.meta.env.VITE_APP_UPDATED_AT || '2026-10-09')
} as const
