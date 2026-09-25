export const ATHAN_RELEASE = {
  version: String(import.meta.env.VITE_APP_VERSION || '3.3.1'),
  updatedAt: String(import.meta.env.VITE_APP_UPDATED_AT || '2026-09-25')
} as const
