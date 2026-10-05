# v4.0.0 — Your App, Your Flow

Description: Optional personalized navigation and layouts, lighter internal loading, and richer private Salah progress searches and stars.

Recorded: 2026-10-05

Status: Implemented locally as **v4.0.0**, following the user's subsequent implementation authorization. Automated checks and desktop/mobile production-preview checks passed; physical-device qualification and unavailable CPU/RAM measurements remain documented limitations. No commit, push, branch or deployment was made. See the progress ledger and verification report for actual evidence; the requirements below remain the product specification.

Execution instructions and resumable task IDs are in [the execution runbook](./V4_0_0_EXECUTION_PLAN.md); current implementation status is tracked separately in [the progress ledger](./V4_0_0_PROGRESS.md).

## 1. Scope and priority of decisions

This document consolidates the conversation and screenshots into the next release plan. The latest user decisions override earlier proposals to keep the bottom navigation fixed, reduce animations, change result presentation in Performance Mode, or use recorded days alone for star averages.

The release contains:

1. Optional customizable bottom navigation, Home shortcuts, and More shortcuts.
2. An always-reachable Feature Hub and full feature catalog in layout settings.
3. Independently collapsible Settings sections using plus/minus controls.
4. Optional Performance Mode that changes internal loading/execution only.
5. Salah stars, count/coverage/notes/weekday/date-range searches, relative dates, saved searches, recent searches, suggestions, and a compact result summary.
6. Backup & Restore support for new preferences and saved searches.
7. One universal Home visual change: remove the redundant **Athan App** heading inside Home's content.
8. A mandatory full README refresh documenting the complete delivered app, not just changing its version heading.

All other existing screens, data, prayer calculations, primary-source rules, Qibla behavior, Quran reading progress, and calendar export behavior are preserved. Standalone Iqama Times remains independently accessible.

## 2. Optional modes and unchanged defaults

- Custom Layout is off by default. Existing users retain their current bottom navigation, Home shortcut order, and More shortcut order.
- Performance Mode is off by default. It is independent of Custom Layout.
- Settings plus/minus expand/collapse controls are a universal visual change, available to every user regardless of Custom Layout or Performance Mode. Sections initially remain expanded; users may collapse individual sections and retain that preference.
- Removing the redundant Home content heading applies to everyone, regardless of either mode. Keep the outer **Home** screen header, Hijri/date information, source/location label, timezone context, and prayer preview.
- No compact-spacing mode, redesigned theme, reduced animations, removed charts, shortened result presentation, or reduced feature set is introduced by Performance Mode.
- Disabling Custom Layout restores the normal arrangement but retains the saved custom arrangement for a later re-enable. Provide a separate Reset layout action that changes only layout preferences.
- Disabling Performance Mode restores normal loading policy without altering layout, priority selections, records, or settings.

## 3. Define root features before customizing them

A root feature is a main entry button that opens a feature screen. A control within that screen is not a separately configurable root feature.

Example: **Prayer Times** is a root feature; its **Monthly view** is an internal control. Moving or hiding the Prayer Times shortcut does not remove Monthly view or separate it from Prayer Times.

Create a small shared root-feature registry with stable IDs, existing translated labels, icons, screen destinations, and loading definitions. Use it for navigation, Home, More, the Feature Hub, priority selection, and restored-preference validation. Do not store display names as identity.

### Root-feature inventory checked against the current app

| User-facing root feature | Current screen | Treatment |
| --- | --- | --- |
| Home | `Home` | Permanent bottom-navigation entry and protected prayer preview |
| Prayer Times / Prayer | `Prayer` | Eligible for bottom navigation, Home, and More |
| Settings | `Settings` | Eligible; protected alternate access when absent from bottom navigation |
| Quran | `Quran` | Eligible; its reading/settings controls stay inside the feature |
| Qibla | `Qibla` | Eligible; opening still follows the existing location/permission workflow |
| More | `More` | Configurable shortcut collection, itself available as a root entry |
| Credits | `Credits` | Eligible; Developer Notes and existing related links remain inside it |
| Deep Search Athan | `AthanEngine` | Eligible |
| City Mode / Saved Cities | `SavedCities` | Eligible; hiding does not change the selected prayer source |
| Iqama Times | `Iqama` | Eligible and independently usable |
| Masjid Mode | `MasjidMode` | Eligible; profile dependencies preserved |
| Salah Tracker | `SalahTracker` | Eligible; Insights, Search, and Graphs remain internal destinations |
| Backup & Restore | `BackupRestore` | Eligible; also remains available through Settings |
| Ramadan Mode | `RamadanMode` | Eligible; overlooked in the short root list but already present in More |
| App Guide | `Onboarding` | Eligible; uses the existing guide rather than adding another guide |
| Feature Hub | New utility destination | Protected access to the full catalog and hidden features |

Privacy, Vision, Help, Developer Notes, Quran Settings, Salah Insights/Search/Graphs, and Monthly view keep their existing internal access paths. Do not promote every internal screen into a new root shortcut simply because it appears in the screen type. Preserve Help access through its existing path.

Existing conditional Ramadan Home content must be accounted for: in normal layout keep current behavior; in custom layout apply the user's Ramadan visibility choice rather than injecting a second unexpected shortcut. Keep required source/date/prayer information independent of optional shortcut lists.

## 4. Bottom navigation: Home plus up to four features

The screenshot's **Home / Prayer / Settings** bar is the default navigation hub.

Custom-layout rules:

- Home cannot be removed. Keep it first as the navigation anchor.
- Allow zero to four additional distinct root features: **one Home + up to four extras**, five buttons maximum.
- Prayer and Settings are removable/replacable; neither consumes a reserved slot in custom mode.
- Users may retain three buttons, replace Prayer and Settings with two other roots, or add extras up to the limit.
- Reorder the extra buttons using existing-style controls. If drag ordering is offered, also provide move buttons and keyboard support.
- Do not duplicate the same destination twice inside the bottom bar. The same destination may appear across different surfaces.
- When Settings is absent from the bottom bar, always show an accessible Settings button at the **top right of Home**. Do not allow a layout edit to hide this fallback.
- Mark the selected destination correctly. Internal child screens should remain associated with their parent feature where appropriate, not incorrectly highlight a previous unrelated tab.
- Back navigation and history must work for all custom roots, including roots formerly treated only as secondary screens.
- Keep labels/icons readable at narrow mobile widths and with longer translations; do not solve five-button overflow by making targets too small.

Examples:

```text
Default: Home | Prayer | Settings
Custom:  Home | Quran | Salah Tracker
Custom:  Home | Prayer | Qibla | City Mode | Salah Tracker
```

In both custom examples without Settings, Home provides its protected top-right Settings button.

## 5. Home and More shortcut customization

### Home

- Keep the current-prayer preview, next-prayer time/countdown, source/date context, and timezone information. The prayer preview cannot be removed.
- Remove the redundant **Athan App** content heading for every user; do not remove the outer Home heading.
- In custom mode, add, remove, and reorder root shortcuts such as Quran, Qibla, More, Credits, Prayer, Settings, City Mode, or Salah Tracker.
- Start the editor from the existing Home layout rather than an empty replacement.
- Allow the same root destination on Home and the bottom bar, or on Home and More. These are shortcuts to one feature, not duplicate feature instances or separate data stores.
- Avoid redundant copies within one shortcut list and self-links such as Home inside Home. This is a proposed usability guard; the explicitly approved duplication is across surfaces.
- Preserve the existing card/button design, colors, typography, and screen content.

### More

- Start from the existing More list: Deep Search Athan, City Mode, Iqama Times, Masjid Mode, Salah Tracker, Ramadan Mode, Backup & Restore, and App Guide.
- Allow removing, adding, and reordering eligible roots. Home's usual Quran, Qibla, and Credits shortcuts may be placed in More instead.
- Removing a shortcut from More does not delete the feature or alter any profile/data.
- Avoid More linking to itself. Show a useful empty state with protected Feature Hub/layout-settings access if all optional shortcuts are removed.

### Layout editor

Provide one Settings area, **Performance & App Layout**, with separate on/off controls and destinations for editing the bottom bar, Home, More, feature priorities, and opening the Feature Hub.

For each surface show its current ordered list, add/remove controls, protected items, and capacity where applicable. Provide preview/save/cancel and reset controls; cancel must not partially apply a layout. Save a valid configuration atomically and ensure it cannot strand the user outside Settings.

## 6. Feature Hub and dormant features

Feature Hub provides:

- A full catalog of root features, with hidden/dormant entries clearly identified.
- Open now, even if the feature has no shortcut on any ordinary surface.
- Restore/add a shortcut to an eligible surface.
- Access through Settings and a protected compact entry in custom layouts. Do not require a removable More or Settings bottom tab to reach it.

**Dormant** describes loading/execution, not deletion or a new category of prayer data:

- Before first use, unneeded feature modules/data should not be loaded into the active runtime when custom-layout dormancy or Performance Mode applies.
- Opening a feature activates the existing screen, with existing records and all child controls.
- On leaving a screen, stop its unneeded listeners, timers, requests, and temporary render state safely. Persistent profiles, logs, notes, Quran progress, and downloaded offline material remain intact.
- JavaScript modules already imported cannot generally be completely unloaded on demand. Do not promise that hiding a previously opened feature removes every byte from memory. The practical goals are deferred first load, stopped background work, and bounded temporary data.
- Loading a module must not itself request location, enable a compass, start audio, or activate other permission-sensitive work. Such work follows the existing feature's active-screen lifecycle.
- A hidden City Mode or Masjid screen can still supply the selected primary prayer source. Load its necessary shared data/calculation dependency without waking the full profile-editor screen.
- Do not call Settings sections dormant merely because their contents are collapsed.

Offline availability and dormancy are compatible: feature code can be cached on disk for offline use without being imported/executed into the current page. Do not discard offline Quran data or feature assets to simulate deep sleep.

## 7. Collapsible Settings sections

This Settings improvement applies to everyone. It is not gated by Custom Layout or Performance Mode; only each user's choice to collapse or expand a section is optional.

Add independent plus/minus controls to:

1. Preferences.
2. Primary prayer time source.
3. Prayer calculation.
4. Calendar reminders (.ics).
5. Local data.
6. PWA status.
7. Performance & App Layout.

The section title remains visible; minus collapses and plus expands. Use accessible buttons with expanded state and associated content labels. Preserve editing state and existing save/export behavior when collapsing. Persist the user's expansion choices locally and in backups.

This is ordinary disclosure, **not deep sleep**: collapsing must not reset fields, stop a required app-level update mechanism, change calculation settings, cancel an intentional export, or disable a feature. Do not automatically collapse sections when Performance Mode changes.

## 8. Performance Mode: identical presentation, more efficient work

The user means client-side loading and execution, not introducing a remote backend. The existing React/Vite PWA must remain private and locally functional.

Performance Mode is off by default and does not change colors, spacing, animations, text, charts, results, controls, mathematical outputs, or feature availability. It must not automatically hide shortcuts or enable Custom Layout.

Candidate internal changes, to be justified by measurements:

- Defer feature modules until requested and share loading definitions with the root registry.
- Load large optional parsing/import dependencies only for the operations that need them.
- Avoid repeated calculation of unchanged prayer schedules or tracker aggregates. Use correctly keyed, bounded caches and invalidate after editing, restoring, changing location/profile/calculation settings, or crossing date boundaries.
- Avoid rerendering whole screens for narrow changes, without making visible countdowns or progress stale.
- Deduplicate equivalent in-flight reads/requests and cancel obsolete screen-specific work safely.
- Clean up timers/listeners/sensors/object URLs after their legitimate use ends. Do not interrupt a user-requested export, Quran audio, or another workflow meant to continue.
- Avoid unnecessary high-frequency hidden-screen work and repeated storage parsing.
- Bound temporary caches; do not keep all hidden features mounted merely to make later navigation appear instant.
- Keep the visual experience the same; do not substitute pagination, remove animations, or simplify graphs as an optimization-mode side effect.

### Priority features

Let users select root features to prepare first, such as Prayer Times, Quran, or Salah Tracker. Priority concerns code/data readiness, not continuous execution of those screens.

- Home and the data needed for its protected prayer preview remain essential.
- Prepare chosen modules conservatively after essential startup work, using a bounded queue rather than loading everything simultaneously.
- Do not auto-download the entire Quran, request GPS, enable sensors, or start playback merely because a root is prioritized.
- A hidden root explicitly selected as priority may have code prepared, but must still remain unmounted with no unrelated background activity. Explain this exception to cold/dormant loading.
- Disabling Performance Mode does not delete priority choices; they are inactive until re-enabled.

### Independence of options

| Custom Layout | Performance Mode | Expected behavior |
| --- | --- | --- |
| Off | Off | Standard arrangement and loading policy; universal Home heading cleanup and Settings disclosure controls |
| On | Off | Custom shortcuts/navigation; hidden roots load on demand |
| Off | On | Standard arrangement; optimized internal loading with chosen priorities |
| On | On | Custom arrangement plus optimized loading and explicit priorities |

Measure startup work, feature-open latency, bundle/chunk loading, CPU activity, request duplication, and memory/cache growth where the browser provides usable measurements. Establish a baseline before promising savings. Not all browsers expose reliable memory readings; do not invent precise RAM numbers or claim zero crash risk.

## 9. PWA reliability and recovery

Code splitting requires a deliberate offline/update strategy:

- Preserve existing offline capability when moving screens to deferred modules; audit which files the service worker caches.
- Ensure a hidden feature can open offline after an appropriate completed cache/install, without importing all modules at startup.
- Provide app-styled loading and recoverable module-load error states rather than a white screen.
- Test stale shell/new chunk combinations during an update. Offer a bounded retry or existing app-refresh flow, never an automatic reload loop.
- Do not clear local storage, profiles, offline Quran data, or service-worker caches as a blanket error fix.
- Keep prayer-source correctness and no-connection fallback behavior independent of optimization choices.

Data-loss prevention and a recoverable error state should not be withheld from users with Performance Mode off. They are safety requirements, not optional presentation changes.

### Quran text and audio boundary

Preserve the existing offline Arabic text and selected-translation download. Do not implement offline Quran audio downloads, an all-Surah audio download, or audio playback wiring in v4.0.0. The current audio helper is not connected to the reader. Any later authorized audio playback should be internet-based and user-initiated, not automatically downloaded or bundled into the app.

## 10. Salah stars: fixed daily capacity, separate from existing rates

Detailed definitions are preserved in [Salah Stars and Search Extensions](./SALAH_STARS_AND_SEARCH_EXTENSIONS_PLAN.md). This release includes that scope with the following binding definitions:

- One completed obligatory prayer equals one star, 0–5 daily. Sunnahs are excluded.
- Always display stars against five slots: three completed, one missed, one unlogged means **3/5 stars**.
- Missed and unlogged contribute zero stars equally. They remain distinct underlying statuses for existing statistics and search.
- Show a colored compact star indicator immediately below the existing calendar completion fraction, with accessible text that states the five-slot capacity.
- Preserve the existing completed/logged rate: the example above is **3/4 = 75%** among logged prayers, but **3/5 = 60%** of star capacity. Neither replaces the other.
- Add daily, weekly, monthly, and selected-period star totals, possible stars, average stars/day, and logging-coverage context in the appropriate existing insight views.
- For `N` elapsed calendar days: possible stars = `5N`; average = total stars / `N`. Blank past days contribute zero; never exclude them to inflate the primary average.
- Exclude future dates; an empty period has no average. Use the documented tracker start boundary for all recorded time rather than counting years before tracking began.
- Keep the main Tracker focused on calendar, logging, notes, and its existing analysis destination buttons. No new overall grade.

## 11. Salah search additions

Extend the small local parser, preserving existing prayer names/numbers, aliases, exact completed sets, date syntax, and status semantics.

| Search | Meaning |
| --- | --- |
| `(star3)` | Exactly three obligatory prayers completed |
| `(star(3-5))` | Three to five completed prayers, inclusive |
| `(logged5)` | All five explicitly completed or missed |
| `(!logged5)&(26y)` | Fewer than five logged in 2026, not fully logged days |
| `(logged(3-5))` | Three to five obligatory prayer statuses logged |
| `note`, `notes`, `(notes)` | A non-whitespace daily note exists |
| `(!notes)` | No non-whitespace note exists |
| `(notes)&!fajr` | Note exists and Fajr is explicitly missed |
| `(fri)&!fajr` | Fridays with Fajr explicitly missed |
| `(mon)&((logged5),(notes))` | Mondays that are fully logged OR contain notes |
| `((2-5)m.(21-30)d.(25-26)y)` | Feb–May, days 21–30, years 2025–2026; all component filters apply |
| `(star(3-5))&((25-26)y)` | Three to five stars in 2025–2026 |
| `(last30days)&fajr` | Matching dates from today minus 29 days through today, Fajr completed |

### Compatibility and grouping

- Bare `1`–`5` still mean Fajr, Dhuhr, Asr, Maghrib, Isha, respectively; do not reinterpret them as star counts.
- `!fajr` remains explicitly missed; `~fajr` unlogged; `/fajr` either missed or unlogged.
- For notes/counts, `!` negates the predicate. The special prayer-status meaning remains deliberate.
- Parentheses group conditions like Boolean expressions: `A & (B OR C)` equals `(A & B) OR (A & C)`.
- `&` means AND; comma/semicolon mean OR; preserve existing precedence. A date dot joins date components, not Boolean conditions.
- `[]` remains an exact completed-prayer set, e.g. `[fajr&dhuhr]`. Do not require `[logged5]`; a count of five is already exact.
- Distinguish grouping `(notes)`, count ranges `star(3-5)`, and suffixed component ranges `(2-5)m` in the tokenizer/parser. Never use unrestricted expression evaluation.
- Canonical completed-count term is `star`; accept `stars` as an alias. Include the earlier proposed `done3` / `done3-5` as lightweight documented aliases for the same count rather than a second statistic. They never introduce a logged-only denominator.

### Date and weekday rules

- Retain exact-date inputs such as `Oct.23`, `23d.06m.2026y`, and `10m.23d.26`; component order independence, existing month aliases, and identified-component inference remain intact.
- Use the newly agreed bracketed range form `((1-15)d.Jun.26y)` for June 1–15, 2026. Do not silently substitute the older speculative `1-15d` grammar without compatibility tests and documentation.
- Two-digit years mean 2000–2099, including year ranges. Explicit four-digit years support other centuries.
- Component ranges are inclusive recurring filters, not one continuous calendar interval. Invalid actual dates such as February 30 are not generated.
- Reject impossible exact dates, reversed/out-of-bounds ranges, duplicate components, and ambiguous input clearly.
- Accept full/short weekday names, case-insensitively, based on the stored tracker date rather than a traveling device's prayer-display timezone.
- Start relative-date support with `last30days`; evaluate it using today's tracker date when searching, reopening a saved search, or crossing midnight. Preserve current period-boundary conventions.
- Search recorded dates through today by default. Negative notes/count queries do not generate unlimited missing dates; blank-day searches require an explicit bounded scope.

### Saved searches, learning aids, and summaries

- Save a valid query with a user-selected name; support reopen, rename, and remove.
- Store definitions, not copies of prayer records. Reopening reruns against current local data.
- Persist an explicit absolute scope when a bounded date range is selected; a relative token such as `last30days` remains rolling. Show that distinction rather than silently freezing a relative query.
- Include a small bounded recent-query list and compact tappable suggestions/examples in the dedicated Search view. Do not add a large command palette or new dashboard on the main Tracker.
- Search suggestions are local examples/valid completions, not a cloud/AI service. Avoid exposing note contents in suggestions.
- Show a compact result summary, e.g. **8 matching days · 27 completed · 7 missed · 6 not logged**. Obligatory status counts must sum to five per matching day; Sunnahs remain excluded. Star totals can reuse the completed count with the fixed matching-day capacity explicitly labeled.
- Avoid confusing averages over matching results with averages over the entire selected period. Label their denominator if both are offered.
- Notes-presence search does not add full-text note search in this release.

## 12. Local storage, backups, restore, and privacy

Preserve `salahLogV1` and all existing profile/settings/progress records. Derive stars/counts from the existing statuses rather than persist counters that can become stale.

Persist and back up:

- Custom Layout enabled state.
- Bottom navigation extras and their order.
- Home and More shortcut lists/order.
- Settings section expansion states.
- Performance Mode enabled state and priority feature IDs.
- Named saved searches, their definitions, and explicit scopes.
- The bounded recent-search list if it is persisted.

Use versioned, validated preference schemas. Validate known root IDs, deduplicate per surface, enforce Home protection/navigation capacity, restore Settings/Feature Hub access, and reject invalid queries/preferences safely. Older backups with no new keys must remain valid; importing into a fresh installation uses normal defaults for absent options. In an existing installation, preserve the established import behavior for absent keys instead of unexpectedly overwriting unrelated current preferences.

Update the existing backup/export/import/reset allowlist and tests. Do not assume newly created local-storage keys are automatically backed up. App release version and backup schema version are different; only change the backup schema version if its actual format requires it.

Layout/performance preferences and saved/recent queries are local by default and included in the personal backup. Do not extend Share Your Defaults to transmit them during this release. Continue excluding tracker records, notes, reminder preferences, worship history, Quran progress, and personal profile/location data from sharing. No tracker upload or new analytics service is authorized.

## 13. Implementation order and integration boundaries

1. Inspect current navigation/history, feature lifecycle, profile dependencies, backup handling, PWA caching, and release conventions; measure normal-mode baseline before changes.
2. Build and test the pure root registry, preference normalizer, and invariants: Home always exists, five-button maximum, protected Settings/Hub paths, safe backup compatibility.
3. Implement navigation/Home/More customization, Feature Hub, Settings disclosure, and the universal redundant-heading removal while retaining the current design.
4. Add measured deferred loading, dependency-aware priority preparation, cleanup, and module-error/offline recovery. Keep normal mode and optimized mode behavior visibly equivalent.
5. Implement pure star aggregation and typed search predicates/ranges/relative dates with tests before wiring UI. Preserve all existing logged-only statistics.
6. Add calendar stars, insight summaries, saved/recent searches, suggestions, and result summaries in existing dedicated destinations.
7. Integrate personal backup/restore/reset and verify sharing exclusions across all new keys.
8. Update developer notes, Credits/version information, and fully audit/refresh the README for the complete delivered feature set, changed behavior, setup, privacy, backups, and limitations; apply v4.0.0 at implementation time, with the actual release date rather than a guessed date.
9. Run repository checks, desktop/mobile/accessibility/offline flows, low-resource stress tests, and normal-vs-optimized comparisons before calling the release complete.

### Possible parallel work when implementation is authorized

If agents are requested or permitted by applicable instructions, split by independent ownership rather than duplicate the same architecture:

- Navigation/layout agent: registry consumers, Home/More editor, Feature Hub and accessible navigation.
- Tracker/search agent: pure counts/parser/statistics, tracker displays and search UI.
- Loading/reliability agent: deferred module loader, priority scheduling, cleanup and offline/error scenarios.
- Lead integration: agree registry/storage contracts first, own shared app/backup/release integration, review cross-feature source dependencies, run combined verification.

Avoid simultaneous edits to shared navigation, storage, or release files. Agents report touched files, tests, tradeoffs, and unresolved issues. Parallel execution is an implementation approach, not authorization to spawn agents for this planning-only request.

## 14. Verification and release acceptance

### Layout and Settings

- Upgrade without new preferences retains Home/Prayer/Settings and current shortcuts.
- All four mode combinations work independently.
- Home and prayer preview cannot be removed; navigation never exceeds five buttons.
- Removing Settings from navigation produces its top-right Home fallback immediately, including after restore.
- Every root remains openable from the Feature Hub/layout catalog even when absent from all ordinary shortcut lists.
- Cross-surface duplicate shortcuts open the same feature/data; back behavior and active highlighting remain correct.
- Section collapse is reversible, accessible, persisted, and does not reset fields or masquerade as deep sleep.
- Reset layout, mode disable/re-enable, malformed preferences, empty More, and future/unknown feature IDs are handled safely.
- Existing palette, text, controls, and animations remain unchanged except the agreed title removal and new feature controls.

### Performance and PWA

- Baseline vs optimized startup/runtime measurements demonstrate which work is reduced and where feature-open latency trades off against preparation.
- Hidden features do not mount, request permissions, or start unnecessary listeners merely because their shortcuts/configuration exist.
- Selected primary sources still drive correct Home/Prayer times when their editor roots are hidden.
- Repeated navigation, tracker edits, large histories, imports, restores, and exports do not accumulate unbounded resources or stale data.
- Priority preparation is bounded and does not silently download large user content.
- First load, cached launch, offline hidden-feature access, failed module load, interrupted connection, and PWA update transitions recover without erasing data or reload loops.
- Test narrow mobile/desktop layouts, reduced CPU/network conditions, and representative older real devices when available. Browser throttling is supporting evidence, not proof of real-device RAM behavior.

### Salah and privacy

- Stars use the fixed daily five capacity; blank elapsed days reduce average; optional Sunnahs/future days do not inflate it.
- Existing completion rates exclude unknown prayers exactly as before, and unknown statuses are never migrated into missed records.
- Parser tests cover nested Boolean grouping, notes whitespace/negation, weekday/date rollover, leap years, exact/inclusive ranges, aliases, invalid inputs, relative midnight changes, and all prior query syntax.
- Saved/recent searches and new preferences survive export to a fresh installation; older backups remain importable.
- Share Your Defaults still excludes personal tracker/reminder/query data and new local-only configuration.
- Run `npm run test:run`, `npm run build`, and appropriate lint checks, recording any pre-existing failures separately.

## 15. Documentation and delivery boundaries

Target release name: **v4.0.0 — Your App, Your Flow**.

Suggested release description: **Personalize your navigation and shortcuts, enable invisible performance improvements, and explore Salah progress with fixed-capacity stars and richer local searches. Existing features and private records stay intact.**

### Mandatory README refresh for major releases

User clarification (2026-10-05): a complete new major release, such as v4.0.0 or v5.0.0, must include a full README review and refresh. Updating only the current-version label is insufficient. The existing README identifies v3.3.3, but every feature description and operational claim must be checked against the delivered code rather than assumed complete because that label is current.

For v4.0.0:

- Inventory all delivered root features and important child capabilities, including earlier additions that may be missing from the README.
- Explain the default experience, optional custom navigation/Home/More layout, Feature Hub, protected access, universal Settings disclosure, and Performance Mode without implying visual or feature reductions.
- Document fixed-capacity stars separately from logged-data rates; add tested examples for new filters, relative dates, saved searches, and result summaries.
- Update Quran/Qibla, primary sources/timezones, calendar export/reminders, offline behavior, personal backups, and sharing/privacy explanations to match actual behavior.
- Include what was added and changed in v4.0.0 and link readers to the existing Developer Notes/release history for detail.
- Verify setup/build/test instructions, release/version references, screenshots if present, and live links. Do not assume every Vercel alias serves the same release without checking.
- Clearly label real-device limitations and incomplete work; do not present proposed or unverified features as delivered.
- Review any other maintained README files if added to the repository later. Avoid unrelated dependency/vendor documentation.

Future major releases require the same audit. Smaller releases still need targeted corrections when they change documented behavior; the major-release rule is not permission to knowingly leave misleading instructions between major versions.

GitHub Pages dual hosting is an explanation-only inquiry, not part of the v4.0.0 implementation scope. No deployment workflow or hosting change is authorized by this plan.

This document records the next release; it is not an implemented developer-log entry. When delivered, update the established version/date sources, Developer Notes and Credits conventions, and the README as required above. Report changed files, checks, measured performance findings, remaining real-device limitations, backup/privacy behavior, and the exact release version. Do not claim a mode guarantees zero crashes or that previously imported modules are completely unloaded.

Work on the current `main` branch as previously requested; do not create a branch or push without a new user request. No implementation, commit, push, or release metadata change was made during this planning pass.
