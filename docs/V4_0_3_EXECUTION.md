# v4.0.3 — Faster Qibla & Prayer Streaks

Date: October 10, 2026 (Asia/Shanghai). Baseline: main / 04f3de7. User authorized implementation, commit and push to GitHub on main. No branch or manual deployment.

## Requirements and boundaries

- Optional Preferences control for one-shot physical device location preparation at launch; default off to preserve privacy and existing saved-city startup. Reuse a recent successful device fix or join its in-flight request when opening Qibla, rather than require a second coordinate wait. Never treat a manual/saved-city coordinate or stale persisted cache as a fresh physical fix. Location/sensor permissions remain browser-controlled; there is no guarantee an OS fix completes before an immediate tap.
- Invoke iOS motion request synchronously from every Qibla navigation action before lazy loading, waiting for location or other awaits. Pass the request result into Qibla through a session-only broker; do not repeat it on mount when navigation already started one. Keep a clearly labelled failure/retry fallback; no normal extra Enable Compass tap required when the navigation request succeeds. No permission bypass or forced native-dialog guarantee.
- Move the existing Show Sunnahs in Salah Tracker control into Performance & App Layout; preserve its key, saved value, immediate preference behavior and separation from obligatory totals.
- Add single/independent/combined prayer streak scopes: streak(1):max == streak(fajr):max; streak(1,2):max reports each prayer independently; streak(1&2):max requires both completed each day. Exact :5 means a maximal run of five, not longer; retain :5+ and old all-five syntax. Missing/missed/unlogged days break runs. Show prayer labels, run lengths and dates.
- Keep app styling, calculations, sensor-engine math, Qibla source and data privacy intact. Backups include the new private location-startup preference; Share Your Defaults does not. Existing prayer logs, notes and Sunnah data are not migrated away.
- Help explains why Safari's dedicated compass field and Android's absolute-sensor/fallback handling differ. It may suggest comparing with another calibrated device, including iPhone, but must not assert an unsupported universal iOS accuracy advantage or that Android lacks compass hardware. No measured precision claims from unit/desktop tests.

## Parallel ownership

- Root: App navigation, startup preparation, location freshness/deduplication, Qibla permission broker/component/tests, docs, release metadata, integration and final commit/push.
- v403_streaks: pure streak/query implementation and tests, Search Salah Progress summaries/UI only.
- v403_preferences: Settings/App Layout controls, preference persistence, backup/share contracts and their tests only.
- No concurrent ownership of these files; root merges/reviews every result and performs final checks. No agent commits/pushes.

## Execution checklist

1. [x] Inspect current App/Qibla startup, location store, sensor engines and release baseline; dispatch independent work.
2. [x] Implement session permission broker, synchronous navigation requests, startup fix reuse/deduplication and safeguards.
3. [x] Integrate Settings preference, preserved Sunnah control and backup/privacy tests.
4. [x] Integrate prayer-specific and combined streak parsing, summaries and edge-case tests.
5. [x] Update Need Help + Markdown mirror, README, developer notes, Credits and v4.0.3 metadata.
6. [x] Run focused/full tests, lint and production build. Inspect relevant desktop/mobile UI; do not grant computer location/motion access or pretend desktop proves phone compass behavior.
7. [x] Review complete diff and prepare the verified release for commit on main. Final push, remote SHA and clean-tree confirmation are recorded in the external completion snapshot after delivery; leave the existing user wake session unchanged.

## Recovery and verification

Usage polling skipped under prior user direction; milestone snapshots remain enabled. Existing Vorssaint timed session was observed active (~26 minutes remaining), not replaced or acquired; preserve user-owned state at cleanup. Snapshot records implementation and the next action without credentials or private logs.

Current status: verified release ready for Git delivery. Full tests, lint, production build, diff review and browser inspection pass. Post-commit/push status belongs in the external completion snapshot so the release commit need not contain its own hash. Physical iPhone verification remains necessary, specifically direct Qibla tap from Home, Feature Hub, search and custom navigation; granted, cancelled, denied, no-heading and slow/missing location paths. Android sensor behavior remains unchanged.

## Verification ledger

- Full suite: 51 files / 334 tests passed, including scoped/independent/joint streaks, exact versus minimum lengths, boundaries, gaps, ties, query grouping and saved-search compatibility.
- Added navigation gesture ordering, preparation opt-in, strict fresh-location fallback, actual fix age, in-flight deduplication, pending permission, stale/cached/manual coordinates, leaving during requests, retries and React StrictMode effect-replay tests.
- Backup opt-in validation, restore/reset notification, older-backup compatibility and Share Your Defaults exclusion pass. Sunnah control retains the old key and independent immediate persistence, including storage-failure behavior.
- ESLint and TypeScript/production Vite/PWA build pass. Existing stale browser-compatibility metadata warnings are informational; no dependency update was introduced.
- Reviewer agent v403_review inspected navigation coverage, resource cleanup and query boundaries. Fixed the stale-fix age issue (use OS timestamp, not receipt time) and added the recommended StrictMode regression.
- Production preview used isolated localhost port 4186, not the user's existing installation. Inspected Preferences, App Layout, scoped results and Help at 1280×900 and 393×852. No horizontal overflow at phone size. Generated three disposable test completions through the tracker UI, verified separate Fajr (2 days)/Dhuhr (1 day) maxima and joint overlap (1 day). Actual popup/sensors were not tested or granted on Mac. No console errors; reset viewport and closed the temporary tab. Evidence is in the external task-snapshot evidence folder, not bundled in the app.
