# Next update — Clearer Navigation & Salah Streaks

Recorded: 2026-10-08, Asia/Shanghai.

Status: **IMPLEMENTATION AUTHORIZED** on 2026-10-08. Baseline v4.0.0, main at commit4fa4af3. Target **v4.0.1 — Clearer Navigation & Salah Streaks**. Track actual implementation and verification in V4_0_1_EXECUTION.md. No commit, push or deployment unless newly requested. Historical planning observations below describe the inspected baseline, not completion claims.

## 1. Confirmed scope and changed decisions

1. Replace the oversized protected Home Feature Hub text row with a four-square icon at the physical top right of the Home header.
2. Add a magnifying-glass icon at the physical top left of that same header, opening local app-destination search with predictive suggestions.
3. Keep Home centered. Make the main Hijri/date line beneath it larger and bolder; preserve source Gregorian date, city, timezone and prayer preview.
4. Simplify Feature Hub into destination buttons only. Remove Customize layout, Add to Home, Add to More, layout-status cards and mutation feedback from that screen. Customization stays in Settings.
5. Remove the automatic standalone Home Settings fallback when Settings is absent from bottom navigation. Settings remains a permanent, easy-to-find Feature Hub destination, also searchable.
6. Add all-five-prayer consecutive-day streak search and contextual analytics, without replacing existing per-prayer streaks or star/rate statistics.
7. Replace yellow Salah stars with a palette consistent with the app's teal tone and adequate contrast.
8. Make the Search Salah Progress syntax help/examples expandable/collapsible without changing the query, scope or results.
9. Allow explicit sharing of custom layout through Share Your Defaults, while preserving every other personal-data exclusion.
10. Add optional **Salah Brief** in Custom Layout: this week's tracker graph directly below Home's current-prayer card. Default off; reuse tracker data, chart styling and statistical definitions rather than create a different accuracy metric.

Items4–5 deliberately supersede v4.0.0's Hub editing controls and direct Home Settings fallback. Item9 deliberately supersedes the previous blanket exclusion of layout from shared defaults. They do not authorize sharing prayer logs, notes, saved searches, performance settings or profiles.

## 2. What current code actually does

| Area | Inspected behavior | Consequence for this update |
| --- | --- | --- |
| App header | Centered title with reserved left/right slots; no Home search or Hub icon | Put protected actions in the shared header, only for Home; preserve secondary-screen Back |
| Home | Custom Layout adds a separate Hub row and conditional Settings fallback; Hijri date is small normal-weight text | Remove that automatic row; promote the existing date rather than calculate another date |
| Feature Hub | Iterates16roots and renders cards, availability labels, Open/Add controls and Customize layout | Reuse root registry but render a compact navigation-only collection; no layout writes |
| Screen model |26Screen values;16customizable roots; child-root mapping | Root catalog alone is insufficient for app search |
| Monthly View | Local showMonth state in Prayer Times; PrayerMonth screen alias alone does not open the month | Introduce an explicit internal-view navigation intent |
| Quran | Quran Settings is a screen; Surah reader is local readerOpen/openReader state with verse-resume logic | Search must dispatch safe reader/section intents rather than pretend all destinations are Screen values |
| Salah insights | Current/longest streak per prayer and all-five completed-day totals, but no consecutive all-five run model | Add a distinct pure run helper and all-five summary |
| Salah search | Typed local predicate AST, status/count/notes/weekday/date/relative/group/exact nodes; no streak predicate | Extend parser/context without changing existing operators or rescanning history per result |
| Salah calendar | Partial-day stars use yellow; full-day stars use dark text on teal; selected-day ring also yellow | Recolor Salah-specific accents with contrast-aware states; do not recolor all app warnings/bookmarks |
| Progress search help | Three always-visible paragraphs plus15examples | Group instructions/examples under accessible disclosure, leaving query and scope controls outside |
| Share Your Defaults | Explicit version1safe payload; no layout. Receiving dialog waits for Apply, then reloads | Add consented, validated layout payload and receiver preview; preserve version1links |
| Backups | Already include layout, disclosure, performance and saved/recent Salah queries | Keep format-compatible; add only genuinely new persisted preferences if chosen |

These observations were checked against source, not inferred from screenshots. No browser behavior or new test pass is claimed by this planning document.

## 3. Home header and date design

Header composition: **Search icon — Home — four-square Hub icon**.

- Make both protected header icons available regardless of Custom Layout and Performance Mode. Otherwise removing Settings could make it unreachable in one mode.
- Keep at least44×44CSS-pixel tap targets, existing gray/teal styling, visible focus, accessible names such as Search app and Feature Hub, and decorative SVGs hidden from screen readers. No new icon library is necessary.
- Keep physical left/right placement as requested, including Arabic RTL, while preserving logical keyboard order and readable labels.
- Reserve balanced icon columns so Home remains centered. Do not shrink tap targets to compensate for longer translated titles.
- Preserve Back on non-Home headers. No icons are added to every secondary page by assumption.
- Remove only the automatic Home utility row. If a user explicitly configured Settings or Feature Hub as an ordinary custom shortcut, preserve that saved choice unless they remove it; do not silently rewrite layouts.
- Settings remains in default bottom navigation. When removed, Hub → Settings is the protected alternative, not a new gear beside Home.
- Make the existing Hijri/date text a responsive, semibold/bold primary line; let long dates wrap rather than overflow. Keep the source's Gregorian date as secondary text.
- Reuse current source-aware Hijri and date boundaries. Do not change prayer dates, timezone display, countdown or calculations while styling.

## 4. Navigation-only Feature Hub

- Use simple existing-style buttons in a responsive grid/list, not one multi-control card per destination.
- Each item opens its feature; no Add/Restore, Save, toggle or Customize layout action inside Hub.
- Include Settings prominently and permanently. Home stays reachable; Hub should not link recursively to itself.
- Retain the full existing root catalog. A button for Performance & App Layout may open that screen as a destination, but it must not turn Hub into an editor; the default recommendation is keep it under Settings and expose it through search.
- No layout mutation occurs merely by visiting or selecting a Hub item. Do not implicitly enable Custom Layout.
- Keep optional modes, hidden roots and imported-source dependencies intact. Opening a hidden destination loads its full feature on demand.
- Preserve existing More behavior outside the specifically requested Hub cleanup; do not delete unrelated editing/navigation controls elsewhere without a separate requirement.

### Optional Home section: Salah Brief

User clarification: this optional section defaults to a **Line graph**, with **Prayer bars** as an alternative. A saved choice is available in the Custom Layout draft and an enabled Home Brief. The line plots elapsed days this week using the same shared chart and daily data as This week in Graph Insights. No logged prayers means a gap; future dates are excluded. Both views retain logged-data context. The entire Brief remains off by default and hidden unless explicitly enabled through Custom Layout. Backup/Restore and consented layout sharing preserve only the display choice, never graph values or history. Existing layouts without a choice default to line; disabling the section retains its choice.

The latest user addition is a **Home content section**, not another root shortcut or a new independent screen. Configure it under Settings → Customize Layout using a Show Salah Brief option.

- Off by default; render only when Custom Layout is enabled and this section is selected. Disabling Custom Layout hides it but retains the saved choice for re-enabling.
- Place it immediately **below the current-prayer card**, before ordinary optional Home shortcuts. Keep the prayer card permanently visible; do not replace it with tracking data.
- Show **This week** with the actual start/end dates through today, using the tracker’s existing Sunday-start/local-date convention. Do not reinterpret the tracking week in the selected prayer-city timezone.
- Reuse the same weekly Graph Insights data and presentation. The current per-prayer completion bars are the primary compact graph: five obligatory prayers, completed/logged counts, percentages and no-data states. Extract a shared presentational chart instead of mounting the whole Graph Insights screen, duplicating markup/calculations or displaying its period selector/help/full analysis on Home.
- Here weekly “accuracy” means the existing **completion rate among logged prayers**, not prayer-time accuracy. Completed ÷ logged; missing/unlogged entries are not recorded misses. Preserve coverage context, especially when only one or two entries exist.
- If stars are included as a small existing context line, keep fixed completed/5 capacity separate from logged-only percentages. No new score, overall grade or Sunnah contribution.
- A weekly trend bucket can contain only one point. Do not manufacture an upward/downward line by changing aggregation or inventing values merely to decorate Home. Any included trend must match Graph Insights with the same period.
- No recorded week data: say No logged data this week, not0% failure. Partially logged days retain their actual statuses. Future dates excluded.
- Optional View full graphs action opens existing Graph Insights with This week preselected. Support a typed period-selection intent so the destination does not silently fall back to its current This month default. It remains a child of Salah Tracker and searchable through the existing graph destination.
- Update after tracker edits, restore, returning Home and tracker midnight using existing data-change mechanisms. Do not calculate/parse the full log every second as the prayer countdown ticks; memoize against records and the date boundary.
- Keep the brief component and tracker subscription unmounted when disabled. Lazy-load the selected widget without proactively mounting the full tracker or starting timers/network requests for hidden content; code readiness is not feature activity.
- Store only the display preference in the local layout configuration, using a validated optional Home-sections field distinct from root shortcut arrays. Never persist duplicate chart data/stats or insert Salah Brief into ROOT_FEATURE_IDS just to save a toggle.
- Include that field in personal Backup & Restore/reset-layout behavior. Older layouts/backups without it retain the standard hidden default; do not overwrite prayer records.
- When users explicitly share custom layout, the Salah Brief visibility preference can be included with the arrangement. **No graph values, Salah logs, counts, notes or weekly history may be included.** Receiving users see their own local data after enabling the shared section.
- Preserve card colors, typography, compact mobile layout and chart accessibility. No performance-mode-specific visual reduction or extra chart dependency.

## 5. App-destination search, separate from Salah-history search

The magnifier opens a compact search screen or dialog. Recommendation: a small destination-search screen with Back and existing visual styling. It searches navigation metadata, not worship records, Quran text or the internet.

### Catalog and coverage audit

Create typed navigation entries containing stable ID, localized name, aliases, parent/breadcrumb and a safe navigation intent. Keep this registry lightweight; importing it must not import destination screen components.

| Destination family | Initial searchable entries/intents |
| --- | --- |
| Existing roots | Home, Prayer Times, Settings, Quran, Qibla, More, Credits, Deep Search Athan, City Mode, Iqama Times, Masjid Mode, Salah Tracker, Backup & Restore, Ramadan Mode, App Guide, Feature Hub |
| Existing child Screen destinations | Quran Settings, Salah Insights, Search Salah Progress, Graph Insights, Developer Notes, Privacy, Our Vision, Need Help, Performance & App Layout |
| Prayer internal view | Monthly Timetable/Monthly View → open Prayer with showMonth intent; alias PrayerMonth must invoke the actual internal view |
| Quran internal views | Quran Reader, Continue Reading, Surah list, Juz view, Saved Surahs/Bookmarks and verse search section where these are distinct navigable panels/anchors; use the existing reader/resume behavior |
| Parameterized reader family | Surah names/numbers → corresponding reader; include all114Surah destinations using lightweight verified metadata, not loading full Arabic/translation content while typing |
| Contextual Help | Qibla Help → existing Help section/anchor without destroying shared-defaults URL handling |

During implementation, audit every go/open/goOrHash/hash navigation, internal-view setter, parameterized openReader handler and cross-component callback. Record a coverage table for the actual target of every navigation button. Back/Today aliases should not produce duplicate search entries for the same destination.

Do not mechanically index all buttons: Mark completed, delete/reset/share/download/update, permission toggles, date selectors, mode switches and external Support links are actions, not new in-app screens. Search never executes these. Dynamic private day/verse/bookmark result links keep their existing feature-specific searches; expose their parent destination, not a global index of private notes/history. All114Surah destinations are a bounded metadata family, not millions of ayah search entries.

### Predictive behavior and safety

- Update suggestions immediately from local labels/aliases; prefer exact, prefix and then substring matches. Example: iq → Iqama Times; month → Monthly Timetable; notes → Developer Notes where named, not daily note contents.
- Show name plus breadcrumb so Search Salah Progress and Search app cannot be confused.
- Use localized labels and sensible aliases (saved cities/city mode, Deep Search/Athan search, graph insights, monthly timetable).
- Match hidden features too. Suggestions must not prefetch API responses, start geolocation/gyro or mount screen modules. Load only on selection or explicit existing priority preparation.
- Support arrow keys, Enter, Escape/Back and touch, meaningful empty/no-match states and accessible suggestion announcements. Choose a correctly implemented combobox or an input with keyboard-navigable result buttons; do not apply ARIA roles without their interaction model.
- Bound displayed suggestions; do not build an unbounded result list or install a large fuzzy-search library.
- Keep query transient initially. No stored global search history or network autocomplete is needed.
- Dispatch typed screen/internal-view/reader intents through App, respecting navigation history, parent highlighting and focus. Parameterized reader intent must wait for content and existing verse-position logic rather than forcing a premature scroll.
- Existing malformed navigation intents get a safe no-op/error fallback, not arbitrary hash execution or an action inferred from user text.

## 6. All-five Salah streak definition

A qualifying day has **all five obligatory prayers explicitly Completed**. Sunnahs do not participate.

- All-five days must be consecutive tracker calendar dates, not merely adjacent stored records.
- Any explicit miss, unlogged prayer, absent day or partially logged day breaks the run. A fully logged day with one miss is not a qualifying day.
- Keep Missed and Not logged distinct in saved data. Breaking a streak does not assign a grade or convert unknown into missed.
- Future dates do not qualify. Tracker date conventions remain local tracker dates, independent of the selected prayer-city display timezone.
- Use date-key/calendar arithmetic, not elapsed24hour milliseconds, so DST/month/year/leap transitions work.
- Pure output should contain each maximal run's start date, end date and length, plus day-to-run membership for matching. Derive it from normalized logs; do not store new daily counters or migrate salahLogV1.
- One pass over ordered valid recorded dates can detect calendar gaps without allocating an entire unbounded calendar. Recompute only on log/today changes and reuse the same helper for search and analytics.

### Confirmed exact/minimum syntax and recommended scope behavior

The user clarified: streak:N is exactly N consecutive all-five days; streak:N+ is N or more; streak:max is the maximum consecutive all-five run. These syntax meanings are confirmed, not implemented. The eligible-scope behavior below remains the planning recommendation.

| Query | Recommended meaning |
| --- | --- |
| streak:5 or (streak:5) | Days belonging to a maximal uninterrupted all-five run of **exactly5days**; longer runs do not match |
| streak:5+ or (streak:5+) | Days belonging to an uninterrupted all-five run of **5or more days**, including longer runs |
| streak:max or (streak:max) | Days in the longest all-five run within the search's eligible date scope; include all tied longest runs |
| (streak:5)&(Oct.26y) | October2026 days in a globally verified run of exactly5days |
| (streak:5+)&(Oct.26y) | October2026 days in a globally verified run of at least5days |
| (streak:max)&(notes) | Days with notes inside the eligible longest run(s); notes are applied after streak evaluation |

Exactness applies to the full maximal run, not arbitrary five-day windows inside a longer run. A10-day run matches streak:5+ and streak:10, but not streak:5. An ongoing run is measured through today and may stop matching an exact-length query as another qualifying day is added. The plus suffix belongs to the streak token, not a new general Boolean operator.

Return day cards compatible with the current search, with an additional run summary such as7days · Oct2–8. No qualifying runs means an honest empty result, not every zero-streak day. Invalid values (zero, negative, fractional, unknown text) show helpful errors. A positive threshold above the observed longest run returns no matches; bound numeric input safely.

Keep existing AND/OR/grouping rules. Square brackets remain exact completed-prayer sets only; do not repurpose them for streak operators. Case-insensitive Streak aliases should follow the existing parser conventions.

### Scope and filter order

1. Build qualifying runs from the underlying eligible records through today **before** notes/weekday/prayer Boolean filters.
2. For streak:N, compare the verified full run length for equality; for streak:N+, compare it against the minimum. A month/date filter restricts displayed dates without falsely breaking a run that crosses its boundary.
3. For streak:max, recommendation: consider runs intersecting the explicit search date scope, rank by their full verified lengths, return their in-scope member dates, then apply the remaining Boolean terms. Default scope is recorded dates through today.
4. Date terms inside the query are ordinary filters, not hidden changes to max ranking. To ask for the longest specifically in October, select the October search scope and explain whether the intersecting run began in September. Avoid trying to infer scope from arbitrary OR branches.
5. Blank-date inclusion can expose zero-count/negative matches in the existing bounded range, but cannot create a qualifying all-five streak.
6. Saved searches retain query and existing fixed/rolling scope, so streak:max reruns against current records; do not freeze yesterday's winning run in the saved definition.

Example: all-five logged on Sep29–Oct5 produces a7-day verified run. streak:5+&(Oct.26y) shows Oct1–5 and labels the underlying Sep29–Oct5run. streak:5&(Oct.26y) does not match it; streak:7&(Oct.26y) does. Hiding September does not turn the seven-day run into an exact five-day run.

## 7. Analytics: full-day streaks alongside existing statistics

Add a compact **All-five prayer streak** summary to Salah Insights, with selected-period context. Reuse on Graph Insights only if a small summary improves consistency; no new chart library or daily-screen clutter.

- Current verified full-day streak ending at the latest applicable date in the selected period.
- Longest full-day streak **inside that period**, with start/end dates; clip at period boundaries for month/week reporting and say so plainly.
- Include ties rather than arbitrarily omitting equal longest runs. A lightweight expandable list can hold tie dates.
- Distinguish the period-clipped analytics metric from full-run search matching. If a run spans a month boundary, show the period segment and optional continues-before/after context.
- Example: a7-day Sep29–Oct5run has5days inside October; the October summary says5days, Oct1–5, with a run-began-in-September note. Whole-history search can still qualify it as7days.
- No qualifying days:0days/no all-five streak in this period. No logs: state no logged data, not a recorded failure. Future days excluded.
- Keep per-prayer verified streaks, completed/logged rates, total stars, fixed capacity/averages, coverage and completed-day totals unchanged.

The user requested maximum streak dates. Display both length and date range, not just a bare number.

## 8. Teal Salah stars and collapsible query help

### Star styling

- Reuse teal/gray/dark tokens already in the app. Active partial-day stars should not remain yellow.
- Full five-star cells have a teal background: retain dark/light contrast-aware text rather than blindly placing pale teal on teal.
- Unknown/future/zero-star states retain neutral gray and explanatory text. Preserve ★x/5, accessible labels and all numerical definitions.
- Review the yellow selected-day ring in Salah Tracker for a coherent teal/white focus accent. This is a tracker-only palette adjustment, not a request to recolor Quran bookmarks or warning states.
- Verify selected/nonselected/in-month/outside-month/future states and keyboard focus, including mobile screenshots.

### Search grammar help

- One Help with search strings disclosure, initially collapsed as a compact recommendation, containing existing grammar, date/count/range examples and new streak examples.
- Keep search input, validation/meaning, dates/scope, saved-search controls and results usable outside that disclosure.
- Provide accessible expanded state/content association; collapsed controls cannot retain keyboard focus.
- Expanding/collapsing must not reset query, result count, selected scope, validation or unsaved search name.
- Keep a concise always-visible hint and error-specific guidance so users can discover syntax even while help is collapsed; aria-describedby must point to an available description, not only hidden text.
- Disclosure can be session-only initially. If persistence is desired, give it a separate small validated preference and include it in personal backup/reset. Do not put it in shared layout or saved query definitions accidentally.

## 9. Share Your Defaults: narrow custom-layout inclusion

Layout is now explicitly authorized for sharing, but it is still a user preference that should not be added invisibly to every link.

- Add an explicit Include custom layout choice to the share flow. Recommendation: unchecked initially, so old ordinary sharing remains unchanged; the user can share the arrangement when they choose.
- Share only a validated layout object: enabled flag, ordered navigation extras, ordered Home/More root IDs, optional Home-section visibility such as Salah Brief, and necessary layout schema version. No DOM snapshots, labels with personal text, graph values or feature records.
- Preserve empty lists and disabled-but-saved custom lists. Preview clearly says whether custom layout is enabled and what will be applied.
- Do not share Performance Mode/priorities, Settings section expansion, help state, saved/recent searches, tracker records/notes/reminder preference, Quran activity, Ramadan records, GPS, city/masjid profiles or imported timetables.
- Keep the personal backup format separate and already complete; a shared layout is not a backup.
- Recommendation: accept existing version1links unchanged; generate a clearly versioned layout-aware payload when included (version2), with explicit safe field reconstruction rather than object-spreading unknown nested fields. Omit absent layout instead of defaulting to sender/recipient defaults.
- Existing older clients may reject/ignore version2links; explain update requirements rather than promise old clients understand the layout. Do not change or silently downgrade their code.
- Receiving prompt previews shared layout and has a separate Apply shared layout choice; opening the URL changes nothing. A recipient can apply ordinary defaults while retaining their own layout.
- Applying a layout validates IDs, deduplicates, caps extras at4, protects Home/Hub/Settings access and dispatches the existing layout change event. Unknown future feature IDs must be handled explicitly with feedback; malformed layout must not silently reset a recipient's arrangement.
- No layout save should claim success if storage fails. Scope failure handling so personal records remain untouched and the recipient knows if any ordinary default writes already succeeded.
- Keep links bounded using the finite catalog. Verify serialized output with private sentinel data, and check that fragment handling remains separate from internal navigation/search intents.
- Update Credits share explanation, recipient prompt, Privacy/Help/README statements about the exact newly authorized layout exception. Do not casually broaden wording to all preferences.

## 10. Execution sequence for a later authorized implementation

1. **Baseline and contracts:** inspect latest main/user edits; test existing suite/build/lint; inventory every navigation target; preserve confirmed exact/minimum streak syntax and agree max-scope examples and metadata-only layout share contract.
2. **Pure helpers first:** add run derivation, streak AST/context/explanations, period analytics, route/search metadata and validators; test gaps/ties/boundaries/filter order before wiring UI.
3. **Navigation/UI:** balanced protected Home header, larger date, simplified Hub, search screen and typed child/reader intents; preserve history/resume/deferred loading.
4. **Tracker polish:** analytics/date ranges, teal stars and help disclosure; extract the shared weekly chart and add optional Home Salah Brief after coordinating Home/layout ownership. Keep stats and existing query aliases backward compatible.
5. **Sharing/privacy:** sender inclusion control, validated new payload, old-link support, receiver preview/choice, explicit storage failure; keep backup/reset coverage accurate.
6. **Integrated verification:** defaults/custom/empty/five-tab configurations, Settings removed, both performance policies, all destination families, desktop/mobile/RTL/keyboard, offline metadata search/cold destination opening, real query-to-day/streak-to-analysis/share-to-apply flows.
7. **Release documentation:** after actual implementation, update version/date, Developer Notes, Credits, relevant Help/README passages and verification ledger. This is a patch, not another wholesale major-version README rewrite, but changed behavior must be documented accurately.
8. **Handoff:** list actual changes/tests/limitations; no commit/push/deploy unless newly requested.

Potential files are grouped below; these are existing inspection targets, not permission to edit code now:

- Navigation contracts: App, screen types, root registry, loader; add lightweight destination metadata/search helper and feature component during implementation.
- Home/Hub presentation and their tests; internal Prayer/Quran intent entry points and tests where needed.
- Salah insights/search pure helpers/tests, Insights/Graphs/Tracker/Search components and focused UI tests.
- Shared-defaults helpers/tests, recipient prompt, Credits and relevant privacy/help descriptions; backup only if a genuinely new persistent key is introduced.
- Established package/release/dev-notes metadata and docs at delivery, not planning time.

### Parallel work proposal

This planning pass uses no subagents: the main work is reconciling coupled navigation, streak-scope and privacy decisions, not independent implementation. No editing agents were started.

On implementation authorization, parallel streams can help once contracts are settled:

- **Navigation owner:** Hub/header/destination search and safe internal-view intents; owns App/Home/FeatureHub/Prayer/Quran changes needed for those intents.
- **Tracker owner:** pure run/parser/analytics helpers and tracker/search/insight UI/tests; shared weekly graph/Salah Brief component. Provides the chart contract to the navigation owner, who alone edits Home/layout integration.
- **Sharing owner:** shared-defaults payload, receiver controls/privacy tests; provides any Credits or documentation patch to the single designated owner instead of editing overlapping files.
- **Root:** contracts, file ownership, backup/release/docs, integration and full browser checks. Delegate only useful independent work and respect any later use/no-agent direction immediately.

Four available slots include root. No two agents edit App, shared navigation contracts, Credits or release files simultaneously. Do not add framework/dependencies or alter sensor/calculation behavior merely to parallelize work.

## 11. Acceptance cases

- Home icons match screenshot positions; main date is prominent without overflow; source/calculation/countdown unchanged.
- Salah Brief is default off, selectable in Custom Layout and positioned directly below the prayer card when enabled. Home bars/counts/percentages exactly match Graph Insights set to This week for the same records/date; no-data, sparse logs, future dates and Sunday/year/DST boundaries behave identically.
- Brief hides when Custom Layout is off without losing the preference; disabled widget does not mount tracker subscriptions or repeated calculations. Returning from a tracker edit/restore and midnight refreshes an enabled brief. View full graphs opens the actual weekly view.
- Backup and selected layout sharing preserve only the brief's visibility; receiving users' private data supplies their own graph. Shared payload tests exclude all sender graph/history values.
- Custom Layout off/on, zero/fourextras and Settings absent: Home → Hub → Settings always works; same via app search. Hub navigation never writes layout.
- Every audited registered/internal/parameterized destination has a corresponding safe search entry/intent. Monthly result opens the month; Surah result opens the intended Surah with existing resume rules, not a generic root that requires another search.
- Predictive results work offline from local metadata, translated aliases and hidden features; no runtime API/permission work while typing; keyboard/RTL/44px targets verified.
- Five-day all-five run matches streak:5 and streak:5+; four-day matches neither; ten-day matches streak:5+ and streak:10, but not streak:5. One missed/unlogged/absent day splits the run. A completed Sunnah cannot repair it.
- Multiple longest ties included; no-run empty result; October boundary example behaves as documented; leap/year/DST cases and sparse multi-year records are bounded.
- Notes/weekday/date/AND/OR/exact sets and saved fixed/relative scopes work with streak predicates; filtering is not performed before run derivation.
- Month max-streak analytics includes dates and clipping context while old per-prayer statistics and star denominators remain unchanged.
- Teal stars readable on every heatmap state; yellow warning/bookmark styling elsewhere is preserved.
- Collapsing syntax help preserves query/scope/name/results; hidden examples do not capture focus; useful hints remain accessible.
- Share without layout is compatible with old behavior; shared layout remains opt-in both ends; invalid/unknown payloads are safe; old links never reset layout. Personal sentinel data excluded except the specifically selected layout.
- Existing Backup & Restore, canonical calendars, standalone Iqama, Quran reading/offline text and Qibla remain unchanged, apart from necessary navigation entry intents. No audio/download-all feature is added.
- Tests/build/lint/diff and actual mobile/desktop production checks recorded before delivery; physical compass/older-phone performance not inferred from desktop screenshots.

## 12. Inspected source references

- [App header and navigation](</Users/abdulqadir/Documents/Athan PWA/src/App.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/App.tsx)
- [Home presentation](</Users/abdulqadir/Documents/Athan PWA/src/features/Home.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Home.tsx)
- [Feature Hub](</Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/FeatureHub.tsx)
- [Screen destinations](</Users/abdulqadir/Documents/Athan PWA/src/types/nav.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/types/nav.ts)
- [Root feature registry](</Users/abdulqadir/Documents/Athan PWA/src/lib/rootFeatures.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/rootFeatures.ts)
- [Layout preferences](</Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/appLayout.ts)
- [Prayer internal monthly view](</Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/PrayerTimes.tsx)
- [Quran reader entry points](</Users/abdulqadir/Documents/Athan PWA/src/features/Quran.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Quran.tsx)
- [Salah run/stat calculation target](</Users/abdulqadir/Documents/Athan PWA/src/lib/salahInsights.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/salahInsights.ts)
- [Salah parser](</Users/abdulqadir/Documents/Athan PWA/src/lib/salahSearch.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/salahSearch.ts)
- [Salah search help/results](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahSearch.tsx)
- [Salah calendar colors](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahTracker.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahTracker.tsx)
- [Existing tracker graphs for Salah Brief reuse](</Users/abdulqadir/Documents/Athan PWA/src/features/SalahGraphs.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/SalahGraphs.tsx)
- [Shared defaults](</Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.ts)
- [Shared-defaults privacy tests](</Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.test.ts>) (/Users/abdulqadir/Documents/Athan PWA/src/lib/sharedDefaults.test.ts)
- [Recipient prompt](</Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/components/SharedDefaultsPrompt.tsx)
- [Credits navigation/share UI](</Users/abdulqadir/Documents/Athan PWA/src/features/Credits.tsx>) (/Users/abdulqadir/Documents/Athan PWA/src/features/Credits.tsx)
- [Earlier v4 requirements](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_UPDATE_PLAN.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_UPDATE_PLAN.md)

## Implementation handoff

Implementation was authorized on 2026-10-08. This approved specification remains the requirement record; V4_0_1_EXECUTION.md records implementation, agent ownership, actual checks and remaining limitations. Search uses the scope/filter behavior in section6; layout inclusion and application remain separately opt-in. No commit, push or deployment is authorized by implementation alone.
