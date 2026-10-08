# v4.0.1 — Clearer Navigation & Salah Streaks

## Task identity
- Status: COMPLETED; implementation authorized and verified 2026-10-08 (Asia/Shanghai).
- Repository: /Users/abdulqadir/Documents/Athan PWA; main; baseline 4fa4af3.
- User authorized committing and pushing the completed v4.0.1 work to GitHub on 2026-10-08. Continue on main; no new branch or separate deployment requested. Earlier no-commit notes below describe their historical checkpoints.

## Objective and constraints
Implement every requirement in V4_0_1_NAVIGATION_AND_SALAH_STREAKS_PLAN.md. Preserve style, private records, calculations, calendar exports, standalone Iqama and offline Quran behavior. No audio downloads. No usage polling per prior explicit user direction; maintain recovery checkpoints.

## Ownership and contracts
- Root: App/navigation props/loader, layout preferences/editor/backup, release docs, integration and full checks.
- v401_navigation: Home/Hub/search catalog/search screen/Prayer and Quran internal navigation, destination audit.
- v401_tracker: maximal all-five runs/parser/analytics, teal stars/help disclosure, shared graphs and lazy Salah Brief.
- v401_sharing: strict optional layout-sharing payload, sender/recipient consent, privacy/help wording.
- NavigationIntent carries screen + typed internal views/Surah/Juz/weekly graph/Qibla Help. It never represents destructive or external actions.
- AppLayout schema1 adds optional homeSections.salahBrief (default false); backup uses existing validated key. Roots remain shortcuts, Brief is content.
- Search derives full maximal runs before filtering. Exact N, minimum N+, max tied full lengths intersecting explicit scope. Analytics clips to selected period.

## Verified baseline
- 37 test files / 170 tests pass.
- Baseline lint passed. The concurrent baseline build overlapped new Screen contracts and reported temporary missing FeatureSearch entries; integration fixed them. First integrated production build passed (entry296.66kB/gzip95.40kB;63precache entries/2014.56KiB), with existing stale browser-database warnings only.

## Current execution
1. [x] Read approved plan and establish independent ownership/contracts.
2. [x] Baseline tests; preserve existing selected Vorssaint Keep Awake (mode not verified; never acquired).
3. [x] Implement navigation, tracker and sharing streams in parallel.
4. [x] Integrate header, layout Brief toggle/preview, backup and shared props.
5. [x] Full tests, lint/build and React review.
6. [x] Desktop/mobile/RTL browser checks, query-to-results and widget/share flows.
7. [x] Release v4.0.1 metadata/Developer Notes/README, final checkpoint and handoff.

## Exact next action
The user's Salah Brief correction and Need Help refresh are implemented and verified. User has now authorized commit/push; run final checks and publish the completed changes on main. Physical iOS/Android sensors and older-device memory measurements remain outside desktop verification.

## Need Help refresh — 2026-10-08

- Promoted NeedHelp into the root registry; Feature Hub now exposes 16 destination-only buttons. Default navigation/Home/More lists remain unchanged. Custom shortcuts, performance priorities, backup normalization and explicitly shared layout validation recognize NeedHelp without adding a storage key or changing schemas.
- Destination search indexes Need Help once under App, with English/Arabic aliases; Qibla Help is its child. Existing Credits entry and typed Qibla Help intent remain available.
- Replaced the outdated long page with 19 searchable, expandable current topics. Practical steps cover installation/offline limits, sources/timezones, calculation settings, City Mode and local timetable imports, Deep Search, calendars, Iqama/Masjid, Salah logging/stars/insights/search/streaks, Quran text/progress, physical-location Qibla, optional layout/performance, Ramadan, backups/privacy and troubleshooting. Guide search reads static guide text only, never personal records or an API.
- Added 30 query examples validated against the actual parser. Preserved section aliases and shared-defaults URL fragments, cancelled pending scroll/permission work on exit, retained read-only Qibla diagnostics and validated malformed snapshot fields. No new library, background work, audio feature or permission request.
- Archived the complete user-pasted source verbatim, allowing only a final newline difference: 39,361 original bytes, SHA-256 10bbb9e0bf55b2f0307711d55b78da62f9e8f46b34e6b534ac8b426b6203b58d. Archive is never imported into the runtime. Current Markdown guide mirrors the app's static topics.
- [Old Need Help archive](</Users/abdulqadir/Documents/Athan PWA/docs/Old Need Help.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/Old Need Help.md)
- [Current Need Help guide](</Users/abdulqadir/Documents/Athan PWA/docs/Need Help.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/Need Help.md)
- One independent help_navigation subagent handled registry/catalog integration and six navigation/layout test files while root handled content/archive/UI/documentation/integration. Agent's focused 68 tests passed. Root's full suite: 48 files / 276 tests passed; final guide suite: 37 tests passed. ESLint, TypeScript/Vite production build and whitespace checks passed. Existing stale browser-database warnings only.
- Browser: loaded the rebuilt production preview via the normal Settings update flow; verified Hub → Need Help, one App-breadcrumb predictive search result, guide-only search, expand/collapse, Enter on a topic disclosure, Qibla diagnostics, real Search Salah Progress action, and Need Help choices on all layout surfaces/performance priorities without saving changes. Desktop 1365px and mobile 390px showed no horizontal overflow; inspected runtime error/warning logs were empty. Viewport override reset; preview retained for testing.
- [Phone Help overview](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-mobile.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-mobile.jpg)
- [Desktop guide search](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-search-desktop.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-search-desktop.jpg)
- Release remains v4.0.1 — Clearer Navigation & Salah Streaks; README, Developer Notes, Credits and destination audit corrected. Latest build: entry 298.67kB/gzip95.96kB, Help lazy chunk44.01kB/gzip15.71kB, 63precache entries/1993.19KiB. Previous uncommitted work preserved. No branch, commit, push or deployment.
- Recovery/React/subagent/caffeine skills used; usage polling skipped under prior user direction. Keep Awake was already selected; no task-owned session acquired or released, user-owned state preserved. Sensor accuracy and real calendar delivery are not claimed as desktop-tested.

## Salah Brief correction — 2026-10-08
- Implemented optional line/bar choice in Custom Layout draft/preview/save and directly inside an enabled Brief. Missing/legacy choice defaults to line; the whole section stays default off.
- Extracted the lightweight SVG trend into SalahCompletionTrend, shared by Brief and Graph Insights. This week now plots daily points through today, not one weekly bucket. No-data days break the line; explicit misses can be 0%; future/Sunnah-only/notes-only entries do not manufacture rates.
- Choice stored in homeSections.salahBriefView; Backup & Restore and strictly validated, opt-in shared layouts preserve line/bars without records or graph values. Failed saves leave the current chart intact and show feedback.
- React review: shared lazy chart, memoized store/date derivation, unique accessible chart title IDs, no new library, responsive SVG without mandatory horizontal scrolling. Root handled this focused correction without additional delegation.
- Focused six-file suite: 63 tests passed. Full suite 47 files / 238 tests passed twice; 21 chart/date tests also passed under America/New_York. ESLint, TypeScript/Vite build and whitespace checks passed. An initial stale consent-text assertion was updated; Home dynamic-import fixture failures did not reproduce in the focused run or subsequent full runs.
- Browser loaded final index-BrzG4wLr.js through the existing Settings update control without clearing records. Verified live line→bars→line, bar choice persisted after reload, Settings selected line, unsaved bar preview/cancel preserved line, mobile390px and desktop1365px without horizontal overflow, and no inspected runtime errors. Restored viewport override and retained the existing preview for testing. Preview prayer dashes reflect the intentionally unavailable location, not a chart issue.
- Final entry298.64kB/gzip95.94kB;63precache entries/2019.19KiB. Shared SVG chart stays in a separate lazy chunk and is width-bounded on large screens. Existing stale browser-database warnings remain. Release remains v4.0.1; README, Developer Notes, Help, Credits/privacy and approved plan updated. No commit, push or deployment.
- Evidence: [Corrected line graph](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/salah-brief-line-desktop.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/salah-brief-line-desktop.jpg)

## Milestone evidence
- Tracker focused63tests pass; additional12 pass under America/New_York for DST cases. Sharing focused29 tests pass. Whole suite currently223passed/1Home test fixture failure (stale sibling captured before lazy resolution), being repaired by navigation owner.
- React review found malformed Quran view coercion, cached-search autofocus race and stale Quran intent replay. Strict string guard and parent focus exception implemented; navigation owner consumes Quran command after entry.
- Production preview84127 at http://127.0.0.1:4185/ uses a fresh, isolated origin with synthetic test records only. User installed app/deployed storage untouched.
- Browser verified protected header, search month opens actual monthly timetable, Hub navigation-only with Settings, no-logs Brief immediately below preview, Brief opens This week graphs. Location unavailable on isolated preview is expected; no permission grant attempted.
- UI created five all-completed days Oct4–8; `(streak:5)` returns5days/25completed and full-run dates. No raw private data is sent externally.

## Recovery and wake state
Usage data unavailable by choice (checks skipped). Keep Awake was already selected before work; preserve that user-owned state. No task-owned wake state to release. Changes are in the working tree; user data is not mutated by implementation.

## Resume instructions
Inspect git status and this ledger, read agents' completed reports and focused test results, resume unfinished items rather than rebuilding finished work. Inspect live wake state on resume without changing preexisting state.

## Final verification and delivery
- 47 test files / 232 tests pass (baseline37/170). Full ESLint, TypeScript/Vite production build and git diff --check pass. Existing baseline-browser-mapping/caniuse-lite freshness warnings remain; no dependency upgrades added.
- Final production entry298.24kB/gzip95.82kB;63precache entries/2016.45KiB. New search, Brief and Quran metadata chunks confirmed in generated service-worker manifest. Disk precaching is not an assertion of RAM usage or real network-offline testing.
- Final browser loaded actual `/assets/index-C0SPfq8u.js`, at1280px after temporary viewport reset. Additional1365px desktop and390px mobile/Arabic tests passed; no horizontal overflow. Home targets64×44CSSpx; physical left/right maintained in RTL.
- Browser: search Monthly Timetable opens actual monthly screen; mobile iq search opens standalone Iqama; Arabic الكهف selects Al-Kahf reader and actual content loads. Cached search returns focus to combobox without another tap. Runtime error log empty in inspected final flows.
- Browser: five-day UI-created run returns5matchingdays/25completed with full run dates. Help disclosure preserves query. Returning Home refreshes Brief to5/5logged days and100% ·5/5 per prayer. View full graphs selects This week.
- Browser: recipient synthetic v2 fixture previews offered layout with unchecked consent, preserves existing layout before Apply, and explicitly applying changes navigation to Home/Iqama while retaining recipient's25completed test prayers. Consent dialog receives keyboard focus; Escape dismisses without applying. Sender native Share/clipboard completion was not observable in this browser (clipboard empty); sender payload/options/privacy verified in unit tests, not claimed as browser transport success.
- React review led to conditional lazy Brief loading, memoized data/date calculations, isolated widget recovery preserving the prayer card, runtime intent validation, one-shot Quran intents, and corrected search/dialog focus ownership. No new library or unrelated visual change.
- Release metadata/package/lockfile, Developer Notes, Credits, Help, Privacy and changed README passages updated to v4.0.1 — Clearer Navigation & Salah Streaks, October8,2026. Previous release history retained.
- Agents: v401_navigation22focused tests/6files; v401_tracker63focused tests/7files plus12DST tests; v401_sharing29focused tests/4files. Root integrated contracts/backup/releases and performed full checks/browser verification. Additional read-only tracker review identified the intent/focus edge cases fixed above.
- Preview remains at http://127.0.0.1:4185/ (terminal84127), deliberately retained for user testing; data there is synthetic and isolated from installed/deployed origins. Native Vorssaint was already active; never acquired/changed, so no user-owned wake session was disabled. No commit/push/branch/deployment performed; main remains4fa4af3.

## Evidence
- [Mobile Home](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/home-mobile.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/home-mobile.jpg)
- [Desktop consent](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/layout-consent-desktop.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-1-2026-10-08/evidence/layout-consent-desktop.jpg)
- [Destination audit](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_DESTINATION_AUDIT.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_DESTINATION_AUDIT.md)


## Changed-file inventory

- [README.md](</Users/abdulqadir/Documents/Athan PWA/README.md>) (/Users/abdulqadir/Documents/Athan PWA/README.md)
- [package-lock.json](</Users/abdulqadir/Documents/Athan PWA/package-lock.json>) (/Users/abdulqadir/Documents/Athan PWA/package-lock.json)
- [package.json](</Users/abdulqadir/Documents/Athan PWA/package.json>) (/Users/abdulqadir/Documents/Athan PWA/package.json)
- [public/data/dev-notes.json](</Users/abdulqadir/Documents/Athan PWA/public/data/dev-notes.json>) (/Users/abdulqadir/Documents/Athan PWA/public/data/dev-notes.json)
- [src/App.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/App.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/App.test.tsx)
- [src/App.tsx](</Users/abdulqadir/Documents/Athan PWA/src/App.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/App.tsx)
- [src/components/SharedDefaultsPrompt.tsx](</Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.tsx)
- [src/features/AppLayout.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/AppLayout.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/AppLayout.test.tsx)
- [src/features/AppLayout.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/AppLayout.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/AppLayout.tsx)
- [src/features/Credits.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Credits.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Credits.tsx)
- [src/features/FeatureHub.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.tsx)
- [src/features/Home.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Home.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Home.test.tsx)
- [src/features/Home.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Home.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Home.tsx)
- [src/features/NeedHelp.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/NeedHelp.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/NeedHelp.tsx)
- [src/features/PrayerTimes.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.test.tsx)
- [src/features/PrayerTimes.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.tsx)
- [src/features/Privacy.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Privacy.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Privacy.tsx)
- [src/features/Quran.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Quran.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Quran.tsx)
- [src/features/SalahGraphs.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahGraphs.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahGraphs.tsx)
- [src/features/SalahInsights.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahInsights.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahInsights.tsx)
- [src/features/SalahSearch.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.test.tsx)
- [src/features/SalahSearch.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.tsx)
- [src/features/SalahTracker.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahTracker.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahTracker.tsx)
- [src/lib/appLayout.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.test.ts)
- [src/lib/appLayout.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.ts)
- [src/lib/backup.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/backup.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/backup.test.ts)
- [src/lib/release.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/release.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/release.ts)
- [src/lib/rootFeatures.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/rootFeatures.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/rootFeatures.ts)
- [src/lib/salahInsights.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/salahInsights.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/salahInsights.ts)
- [src/lib/salahSearch.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/salahSearch.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/salahSearch.ts)
- [src/lib/screenLoader.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/screenLoader.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/screenLoader.ts)
- [src/lib/sharedDefaults.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.test.ts)
- [src/lib/sharedDefaults.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.ts)
- [src/types/nav.ts](</Users/abdulqadir/Documents/Athan PWA/src/types/nav.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/types/nav.ts)
- [docs/V4_0_1_DESTINATION_AUDIT.md](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_DESTINATION_AUDIT.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_DESTINATION_AUDIT.md)
- [docs/V4_0_1_EXECUTION.md](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_EXECUTION.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_EXECUTION.md)
- [docs/V4_0_1_NAVIGATION_AND_SALAH_STREAKS_PLAN.md](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_NAVIGATION_AND_SALAH_STREAKS_PLAN.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_1_NAVIGATION_AND_SALAH_STREAKS_PLAN.md)
- [src/components/SalahBriefSlot.tsx](</Users/abdulqadir/Documents/Athan PWA/src/components/SalahBriefSlot.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SalahBriefSlot.tsx)
- [src/components/SalahFullDayStreakSummary.tsx](</Users/abdulqadir/Documents/Athan PWA/src/components/SalahFullDayStreakSummary.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SalahFullDayStreakSummary.tsx)
- [src/components/SalahPrayerCompletionChart.tsx](</Users/abdulqadir/Documents/Athan PWA/src/components/SalahPrayerCompletionChart.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SalahPrayerCompletionChart.tsx)
- [src/components/SharedDefaultsPrompt.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.test.tsx)
- [src/features/Credits.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Credits.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Credits.test.tsx)
- [src/features/FeatureHub.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.test.tsx)
- [src/features/FeatureSearch.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/FeatureSearch.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/FeatureSearch.test.tsx)
- [src/features/FeatureSearch.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/FeatureSearch.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/FeatureSearch.tsx)
- [src/features/NeedHelp.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/NeedHelp.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/NeedHelp.test.tsx)
- [src/features/Quran.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/Quran.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Quran.test.tsx)
- [src/features/SalahBrief.test.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahBrief.test.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahBrief.test.tsx)
- [src/features/SalahBrief.tsx](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahBrief.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahBrief.tsx)
- [src/lib/destinationSearch.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/destinationSearch.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/destinationSearch.test.ts)
- [src/lib/destinationSearch.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/destinationSearch.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/destinationSearch.ts)
- [src/lib/navigationIntent.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/navigationIntent.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/navigationIntent.test.ts)
- [src/lib/navigationIntent.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/navigationIntent.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/navigationIntent.ts)
- [src/lib/quranDestinations.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/quranDestinations.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/quranDestinations.ts)
- [src/lib/salahStreaks.test.ts](</Users/abdulqadir/Documents/Athan PWA/src/lib/salahStreaks.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/salahStreaks.test.ts)

## Need Help: missing-detail restoration — October 8, 2026

Completed the user-requested follow-up within v4.0.1; no new release, commit, push or deployment. All unrelated work remains intact.

Restored the material identified in the old-versus-new guide comparison:

| Old-guide detail | Current-guide destination |
| --- | --- |
| Android/iPhone menu, confirmation and installation steps; test address | Install the app and use it offline |
| Regional calculation-method reference table | Calculation settings and mosque differences; all 12 supported presets |
| Earlier/later Asr shadow explanation and high-latitude rules | Calculation settings and mosque differences |
| Photograph preparation and complete ready-to-copy AI conversion prompt | Import a mosque’s yearly timetable |
| Bookmark-only reader and Clear Bookmarks | Quran: read, resume, bookmark and download text |
| Four named translations, reading modes and persistent fonts | Quran: read, resume, bookmark and download text |
| Compass orientation, approximate distance, supported haptics and troubleshooting | Qibla: location, compass and accuracy |
| Named OpenStreetMap, TimeAPI, AlAdhan and Adhan roles; local lookup cache/privacy | Deep Search Athan |
| Friday Jumu’ah Mubarak and Dhuhr/Jumu’ah visual label | Find features: Hub, Search and More |
| Other browsers, restart, Console/F12, safe reinstall and phone-alarm alternatives | Troubleshooting; Calendar reminders |
| Welcome, InshaAllah, make dua for everyone near the Ka’bah, blessing, thanks, birthday/shoe-size privacy touch | Start here; Install; Qibla; Troubleshooting |

Correctness guardrails:

- Match current controls rather than copying obsolete claims. City Mode supports manual location; there is no invented Home Refresh button. Karachi and Asr school remain separate, Dubai is not described as an official timetable, and nearest-latitude is not presented as a supported high-latitude selector.
- The near-Ka’bah note now encourages looking at the actual Ka’bah/local guidance rather than claiming a compass becomes confused. No guaranteed unlimited bookmarks, offline recitations, GPS cure through connectivity, or background PWA alarm is promised.
- The detailed regional/calculation guidance is checked against the [Adhan method reference](https://github.com/batoulapps/adhan-js/blob/develop/METHODS.md), [AlAdhan calculation-method explanations](https://aladhan.com/calculation-methods), and [PrayTimes calculation explanation](https://praytimes.org/docs/calculation). These links are user-clicked only; reading/searching Help does not call those providers or transmit personal records.
- The current Markdown mirror includes every guide paragraph, step, note, table cell, prompt, source link and search example; regression tests enforce synchronization.
- The original 39,361-byte pasted body is unchanged (archive adds only its previously documented final newline): SHA-256 `10bbb9e0bf55b2f0307711d55b78da62f9e8f46b34e6b534ac8b426b6203b58d`. The archive was not edited in this follow-up.

Verification:

- 48 test files / 281 tests pass; focused Help checks: 42 tests. Lint, production build and Git whitespace checks pass.
- Verified production preview loads `index-6m8fagtx.js`; Help remains a separately lazy-loaded chunk (61.29 kB / 21.67 kB gzip). No dependency added; no calculation, storage, backup or sensor behavior changed.
- Tested at 390×844 and 1365×900: method table and complete selectable prompt fit without horizontal overflow. Searched restored Asr content, full conversion prompt and privacy closing; verified expandable topics and direct Feature Hub access. Reset the temporary viewport and left Need Help open for the user.
- Existing browser-compatibility dataset age warnings remain nonblocking; dependencies were not updated as part of this content task.

Evidence:

- [Phone method-reference preview](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-human-methods-mobile.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-human-methods-mobile.jpg)
- [Restored human closing on desktop](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-human-desktop.jpg>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-need-help-2026-10-08/evidence/help-human-desktop.jpg)

## GitHub publication preflight — October 8, 2026

- User explicitly requested commit and push of all completed work. Existing main and origin/main both start at 4fa4af3; no new branch or separate deployment.
- Scope: v4.0.1 navigation/search, all-five streaks, optional line/bar Salah Brief, teal stars, search-help disclosure, explicit layout sharing, Need Help as a root feature, detailed current guide and unchanged old archive, regression tests and release documentation.
- Fresh ESLint, TypeScript/Vite production build and staged whitespace checks passed. Full suite rerun passed: 48 files / 281 tests.
- The initial preflight suite, running alongside lint/build, hit two previously observed intermittent Home lazy-import fixture failures. The focused Home suite (6/6) and the subsequent complete suite (281/281) passed without source changes. This test-fixture instability is recorded for a future stabilization pass; it is not claimed fixed by rerunning tests.
- No personal app records, generated build files, credentials or new dependencies included. Version stays 4.0.1.
