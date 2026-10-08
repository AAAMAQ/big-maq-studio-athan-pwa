export const ATHAN_RELEASE = {
  version: String(import.meta.env.VITE_APP_VERSION || '4.0.1'),
  updatedAt: String(import.meta.env.VITE_APP_UPDATED_AT || '2026-10-08')
} as const
