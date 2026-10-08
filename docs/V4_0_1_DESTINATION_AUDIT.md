# v4.0.1 app-destination search coverage audit

Audited: 2026-10-08. This records source navigation coverage; browser verification is recorded separately in the execution ledger.

The catalog contains 178 finite metadata entries: 17 roots, 17 child/internal destinations, 114 Surahs and 30 Juz reader starts. Need Help is a root, not a duplicate Credits child. It imports no feature components, reads no worship records, and makes no network/permission calls. English/Arabic root and child names, provider Surah names, common transliteration aliases and numeric Surah aliases are searchable. Suggestions are ranked exact → prefix → substring and capped at 12 (10 by default).

## Navigation handlers and indexed destinations

| Existing navigation source | Actual target | Search coverage / safe intent |
| --- | --- | --- |
| App bottom navigation; customizable Home/More shortcuts; App Layout feature-opening controls | Root screens | All 17 root registry entries, including Need Help; hidden features are not excluded |
| Protected Home header | App search / Feature Hub | Search opens this metadata search itself; Hub is indexed. The search screen does not index itself recursively |
| Home automatic utility row | Previously Hub / conditional Settings | Removed. Header Hub → prominent Settings protects access, without changing saved explicit shortcuts |
| Feature Hub | Every root except recursive Hub | 16 destination-only buttons including Need Help, Settings first; no layout writes |
| Home seasonal Ramadan card | Ramadan Mode | Root RamadanMode entry |
| Settings local-data button | Backup & Restore | Root BackupRestore entry |
| Settings Performance & App Layout buttons | AppLayout / FeatureHub | Child AppLayout entry and root Hub |
| Credits Explore / Developer Notes | NeedHelp, Vision, Privacy, DevNotes | NeedHelp root and remaining Credits child entries; existing access preserved |
| Qibla Help | NeedHelp's Qibla section | Need Help breadcrumb and QiblaHelp intent `{screen:'NeedHelp', section:'qibla'}`; no arbitrary fragment execution |
| Salah Tracker Explore | Insights, Search Salah Progress, Graph Insights | All three children, retaining tracker parent highlight |
| Salah Brief View full graphs | Existing Graph Insights, This week | Typed weekly Graphs intent; graph destination is indexed (Salah Brief alias), not a duplicate widget screen |
| Prayer Times Monthly View | Prayer's local showMonth state, not a standalone root | Monthly Timetable intent `{screen:'Prayer', view:'month'}`; legacy PrayerMonth alias opens the same internal view |
| Prayer month Today | Daily Prayer Times | Root Prayer; no duplicate Today search entry |
| Quran Settings | QuranSettings screen | Child QuranSettings |
| Quran Quick Access Surah | Local Surah list panel | QuranSurahs view intent |
| Quran Quick Access Juz | Local 30-part panel | QuranJuz view intent |
| Quran Quick Access Surah Bookmarks | Saved Quran Places panel | QuranSaved view intent, opens local favorites/bookmarks without indexing private records |
| Quran Quick Access Last Read / Continue Reading / Begin with Al-Fatihah | Reader at last-read Surah+Ayah or first Surah | QuranContinue view intent preserves resume; Surah1 entry covers initial reading |
| Quran Quick Access Search | Local Surah/Ayah search panel | QuranSearch view intent; app search does not search Quran text |
| Quran Quick Access Ayah of the Day | Daily Ayah panel | QuranDaily view intent; changing global search text does not fetch this content |
| Quran Recently Read | Existing recent-reading section, then parameterized reader | QuranRecent section intent; dynamic private Surah/Ayah activity is not globally indexed |
| Quran Surah list / reader Surah dropdown / name search results | Reader for Surah1–114 | All 114 bounded Surah metadata entries; per-Surah resume retained and existing content-ready verse scrolling reused |
| Quran Juz1–30 buttons | Reader at fixed Juz starting Surah+Ayah | All 30 Juz metadata entries; uses the same shared JUZ_STARTS as Quran, not separate calculation |
| Quran saved Surah / bookmark / Ayah search / daily Ayah / recently read result | Parameterized private/contextual verse | Parent Saved/Search/Daily/Recent entries indexed; user-specific verse records remain in Quran's own UI/search |
| Salah Insights/Graphs/Search day result callbacks | Tracker selected date | Root Tracker and three child entries indexed; private dates/results remain inside progress search/analytics |
| App Guide destination buttons | Settings / City Mode / Quran / Qibla; finish Home | Existing roots indexed. Skip/finish continues the existing onboarding workflow, not a search action |
| Existing Back callbacks in Credits/Privacy/Vision/Help/Backup/Iqama/City/Masjid/Ramadan/Deep Search and shared App header | Previous screen / More / Settings | Those destinations indexed once; Back is context-dependent, not an additional entry |

## Deliberately not navigation entries

Mark/clear/completion/bookmark buttons; delete/reset/apply/share/download/update; backup file dialogs; GPS/gyro permission controls; custom-layout ordering and saving; theme/language/calculation/time selectors; prayer-source profile selectors; date and graph-range selectors; calendar previous/next month; accordion disclosures; chart point selection; prayer reading/notes edits; browser-native print dialogs; external Support/email/API links. These are actions, filters or external destinations, not new app screens. Search never executes them.

The feature-specific profiles and timetable editors are existing controls within City/Iqama/Masjid screens, not separate routable screens. Their parent roots remain searchable. Custom-layout preview is an inline preview inside the layout screen; it does not need a duplicate search destination.

## Metadata provenance and navigation safety

Surah names and numbering were verified directly against the app's existing provider, `https://api.alquran.cloud/v1/surah`, on 2026-10-08. Only names are checked into the metadata module; no Ayah text, translations, recordings or personal metadata. Juz starts were extracted unchanged from the existing Quran implementation into the same lightweight metadata module.

Internal intents are a typed finite union validated by App. Monthly, section, Surah and Juz entry points must remain explicit; arbitrary strings must not mutate location hash or execute actions. Quran intents reuse content fetching/cache/resume logic only after selecting a destination. Its delayed verse-scroll effect waits for the intended Surah content; it does not scroll to a different, previously loaded Surah.

Quran consumes its initial entry intent after handling it. Subsequent local reader/panel changes therefore cannot leave a stale searched Surah in App history and reopen it after Quran Settings → Back. Pending content-ready reader scrolling and one-shot panel scrolling/focus remain local to Quran after consumption.

## Focused automated coverage

The destination catalog tests cover unique IDs, all roots/114 Surahs/30 Juz, internal intents, aliases/ranking/bounds, Arabic matching and absence of storage/network work. Search component tests cover suggestions, input focus, active descendant, arrows/Enter/Escape, no-match state and touch selection. Hub tests verify all 16 buttons and no layout mutation. Need Help tests cover local guide search, disclosure controls, screen actions, repeated/legacy topic links, cancellation, safe read-only diagnostics and 30 parseable current Salah examples. Prayer tests verify the real month intent and Today. Quran navigation tests cover reader resume/content-ready scrolling, Juz starts and local panels. Home tests verify date styling, no automatic content utility row, preserved explicit shortcuts and optional lazy Brief placement.

Focused command on 2026-10-08: `npm run test:run -- src/lib/destinationSearch.test.ts src/features/FeatureSearch.test.tsx src/features/FeatureHub.test.tsx src/features/Home.test.tsx src/features/PrayerTimes.test.tsx src/features/Quran.test.tsx` — 6 files, 22 tests passed, including Brief-error isolation/retry. Focused ESLint and `git diff --check` also passed. The optional lazy Brief has its own retry boundary: failure does not replace the essential Home prayer card.

This audit is a living integration record: do not mark physical device sensors, offline content availability, or production browser flows verified solely because metadata/unit tests pass.
