export const ATHAN_RELEASE = {
  version: String(import.meta.env.VITE_APP_VERSION || '3.3.2'),
  updatedAt: String(import.meta.env.VITE_APP_UPDATED_AT || '2026-10-03')
} as const
