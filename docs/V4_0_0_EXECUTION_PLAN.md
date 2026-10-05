# v4.0.0 — Your App, Your Flow: Execution Runbook

Prepared: 2026-10-05 (Asia/Shanghai)

**Status: IMPLEMENTED_LOCALLY — v4.0.0.** The user subsequently authorized implementation and parallel agents. The task recipe below is retained; actual outcomes are recorded in the progress ledger and verification report. Automated checks and production-preview desktop/mobile checks passed. CPU/RAM/latency benchmarking unavailable through the browser tool and physical-phone qualification are explicitly not claimed. No commit, push, deploy or branch creation was authorized or performed.

### Execution record and checklist interpretation

The original task checkboxes below describe the planned acceptance recipe, not a second independent progress database. Use the live ledger for completed phase status and the verification report for evidence and limitations.

- P0–P1: baseline, ownership and schemas complete; baseline entry size recorded. P0.7's real startup timings and full hardware matrix were unavailable, not fabricated.
- P2–P3: layout, navigation, protected access and universal disclosure implemented; focused tests and production browser checks passed.
- P4–P7: loading/recovery, stars/search, UI and backup/privacy integrated; bounded-policy/lifecycle/failure tests passed. P4.12 has bundle/policy evidence, not actual CPU/RAM/latency measurements.
- P8: 37 files / 170 tests, lint, build and whitespace checks passed. Desktop/mobile, four mode combinations, RTL/focus, restored imported source, offline cold Masjid screen/export, stale-file recovery and host-down update checked. P8.9 resource profiling and P8.10 physical Quran/compass/old-device qualification remain follow-ups; automated unaffected-workflow regressions passed.
- P9: version/date, Developer Notes, Credits, complete README and Help refreshed and reviewed. 46 README and 32 Help query examples parse.
- P10: agent output integrated and reviewed; no commits/deployments; preexisting wakefulness preserved. Production preview retained as a user testing deliverable.

## 1. Read order and source of truth

1. Latest user instructions and current repository/skill instructions.
2. [Product requirements](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_UPDATE_PLAN.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_UPDATE_PLAN.md): what v4 must deliver.
3. This runbook: task sequence, contracts, ownership, verification, and recovery.
4. [Live progress ledger](</Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_PROGRESS.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/V4_0_0_PROGRESS.md): what has actually been completed and the exact next action.
5. [Stars/search specification](</Users/abdulqadir/Documents/Athan PWA/docs/SALAH_STARS_AND_SEARCH_EXTENSIONS_PLAN.md>) (/Users/abdulqadir/Documents/Athan PWA/docs/SALAH_STARS_AND_SEARCH_EXTENSIONS_PLAN.md): detailed definitions, subordinate to newer v4 decisions.

The project is [Athan PWA](</Users/abdulqadir/Documents/Athan PWA>) (/Users/abdulqadir/Documents/Athan PWA). Work in its current `main` checkout; do not make another branch or worktree for this task. Preserve user edits. If HEAD, instructions, or files differ from a checkpoint, reconcile them before continuing.

Product changes from a later user steer take priority immediately. Record their effect on task IDs, agent ownership, tests, and documentation. A checklist never overrides a newer human instruction.

## 2. Non-negotiable release invariants

- Optional Performance Mode and Custom Layout are independent and off by default.
- Default navigation remains Home / Prayer / Settings; default Home/More shortcuts remain familiar.
- Home is the first permanent navigation entry; at most four distinct extras, five total.
- Settings must be reachable at Home's top right whenever absent from the bottom bar.
- Feature Hub access is protected even if More, Settings, and all optional shortcuts are hidden.
- Root buttons move; their child controls remain inside the root. Monthly prayer view is not a new root; tracker analysis and Quran settings are not separate roots.
- Cross-surface duplicates are allowed and share the same records; avoid duplicate entries within a single surface.
- Prayer preview, primary-source/date/timezone information, and correct countdown stay on Home.
- Settings +/- disclosure and removing the redundant inner Athan App heading apply universally.
- Disclosure is ordinary collapse, not dormant loading; field values and intentional operations remain intact.
- Performance Mode preserves appearance, animations, controls, feature choices, results, calculations, and privacy. No simplified graphs, new pagination, compact spacing, or disabled features as a mode side effect.
- Dormancy means avoiding unnecessary runtime loading/activity, not deleting code/data or promising to unload imported JavaScript.
- Hidden City/Masjid editors may still supply primary prayer data; those dependencies cannot be disabled.
- Stars are completed / 5 daily. Missed and unlogged yield zero stars equally, but remain distinct records and search statuses. Existing completed/logged rates and streak rules remain unchanged.
- Preserve all prayer logs, notes, profiles, settings, Quran progress/bookmarks/offline text, calendar semantics, and standalone Iqama.
- No tracker uploads, cloud search, new telemetry, or expansion of Share Your Defaults to personal preferences/queries.
- No GitHub Pages or second hosting deployment; retain Vercel.
- No Quran audio download, all-Surah audio package, or new playback wiring. Preserve existing offline Arabic/translation downloads. Future audio, if separately authorized, is internet/on-demand only.
- v4.0.0 metadata and release notes change only during actual delivery; use the actual release date in the client's timezone.
- Full README audit/update is mandatory for this major release.

## 3. Skills and tools: use only the relevant ones

Do not invoke every installed skill merely because it exists. Academic, Canvas, spreadsheet, image-generation, pet, or unrelated platform skills do not help this React/Vite release. Do not install plugins, create new skills, or add a cloud/backend service just to execute this plan.

Read each selected skill fully in the execution session before applying it, including required references. Reuse provided tools/resources where they fit; do not blindly copy framework-specific examples.

### Task lifecycle skills

| Skill | Use in this release | Boundary |
| --- | --- | --- |
| [Codex Subagents](</Users/abdulqadir/.codex/skills/codex-subagents/SKILL.md>) (/Users/abdulqadir/.codex/skills/codex-subagents/SKILL.md) | Independent layout, tracker, and loading work; ownership and integration reports | Follow latest use/no-agent steer; no user-facing new chats for internal delegation |
| [Codex Usage Fallback](</Users/abdulqadir/.codex/skills/codex-usage-fallback/SKILL.md>) (/Users/abdulqadir/.codex/skills/codex-usage-fallback/SKILL.md) | Durable snapshots, milestone checkpoints, verified resume | User's no-check/continue steer overrides limit polling/prompts, not real service limits |
| [Codex Caffeine](</Users/abdulqadir/.codex/skills/codex-caffeine/SKILL.md>) (/Users/abdulqadir/.codex/skills/codex-caffeine/SKILL.md) | Substantial active implementation/build/test sessions | Verify Vorssaint state; release only task-owned indefinite wake sessions; never claim crash-proof cleanup |

For fallback snapshots, also read [the snapshot schema](</Users/abdulqadir/.codex/skills/codex-usage-fallback/references/snapshot-schema.md>) (/Users/abdulqadir/.codex/skills/codex-usage-fallback/references/snapshot-schema.md).

### Implementation and verification skills

| Skill | Execution use |
| --- | --- |
| [React Best Practices](</Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/react-best-practices/SKILL.md>) (/Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/react-best-practices/SKILL.md) | Conditional module loading, narrow hook dependencies, versioned safe storage, independent async work, measured render review after TSX edits |
| [Agent Browser](</Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/agent-browser/SKILL.md>) (/Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/agent-browser/SKILL.md) | Isolated browser flows, fresh element snapshots, desktop/mobile inspection and screenshots |
| [Agent Browser Verify](</Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/agent-browser-verify/SKILL.md>) (/Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/agent-browser-verify/SKILL.md) | Immediate meaningful-content/overlay/navigation checks after starting a server; bounded repair cycles |
| [Full-Story Verification](</Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/verification/SKILL.md>) (/Users/abdulqadir/.codex/plugins/cache/openai-curated-remote/vercel/0.21.4/skills/verification/SKILL.md) | Follow real UI → local state/dependency → rendered result and backup → restore boundaries; stop at the first broken boundary and fix it |

Apply React skills to React 19 + Vite + TypeScript, not a migration to Next.js. Do not add next/dynamic, Server Components, databases, SWR, or a new rendering library merely because examples mention them. Existing dependencies and small pure helpers should be sufficient.

Browser capability must be checked at execution time. During planning `agent-browser` was not on PATH. Resolve an existing supported installation if available; otherwise use the available native CUA browser automation, following its first-call/documentation requirements, and record the fallback. Do not assume a CLI exists, run repeated failing commands, or silently install tools. The browser verification evidence is still required.

The verification skill's illustrative console array is not proof of an error-free page when that array is undefined. Capture actual available browser errors, page errors, failed requests and server output; label any unavailable channel. This is a client PWA, so do not invent server API routes or inspect secret environment values to satisfy a server-oriented example.

Additional skills may be selected only when a real need arises, such as investigation-mode for a repeatable stuck-page failure. Read them then; do not create unrelated hosting changes or paid resources.

## 4. Work allocation and safe parallel execution

There are four concurrency slots, including the root. Use up to three useful child agents, not unlimited agents.

### Establish contracts before dispatch

The root owns P0/P1 contracts, shared App integration, navigation types, backup/privacy integration, PWA build configuration, release metadata, progress/checkpoints, and final acceptance. Agents read the agreed registry, schemas, task IDs and constraints before editing.

| Workstream | Proposed task name | Exclusive ownership after dispatch | Deliverable |
| --- | --- | --- | --- |
| Layout | `v4_layout` | New editor/Hub components and Home/More; Settings presentation only if explicitly assigned | P2/P3 UI and focused tests using root's registry/contracts |
| Tracker/search | `v4_tracker` | Salah pure helpers/parser/tests and tracker/search/insight components | P5/P6 definitions, UI and regression tests |
| Loading/reliability | `v4_loading` | New loader/scheduler helpers and their tests; read-only shared App/PWA recommendations | P4 mechanisms, measurements, lifecycle audit and integration instructions |
| Root | Primary agent | Shared nav/App, storage/backup/shared-defaults, build/service worker/release, runbook/ledger | Contract integration, mode coordination, P7–P10 and acceptance |

These are proposed future assignments, not claims that those agents already exist. Record actual IDs, task statuses and assigned paths in the ledger when spawned.

If two streams need the same file, one owner edits it; the other supplies a patch proposal or transfers ownership after finishing. In particular, App, Settings, backup, navigation types, and release files must not receive simultaneous uncoordinated edits. Agents do not commit/push or change system wake state.

Each assignment must state requirements/task IDs, allowed paths, forbidden paths, input/output types, tests, and expected handoff evidence. Run only bounded focused tests concurrently; root owns whole-suite/build/browser runs so parallel work does not exhaust the machine or race over generated output.

Root continues useful integration work while streams run. Review actual diffs and tests before accepting output. Use meaningful agent updates, not repetitive polling. On a no-agent steer, stop agents, preserve their changes, record the last safe state, and continue centrally. On another steer, stop the affected stream before it implements stale scope.

## 5. Durable recovery: plan plus progress plus snapshots

The runbook remains the execution recipe. The progress ledger is the live factual state. The skill snapshot is a concise resume handoff, not another conflicting specification.

### Checkpoint timing

Write/update the ledger and snapshot:

- Before dispatching an editing agent or beginning a significant phase.
- After a consequential coherent edit, accepted handoff, passing/failing check, or changed requirement.
- Before a long build/test/browser batch or high-risk integration.
- At phase completion, before yielding for an external decision, on cancellation when execution permits, and at final cleanup.

Do not wait for usage to reach zero. Follow the installed fallback skill's thresholds when monitoring is active; when the user's no-check/continue direction applies, skip polling/prompts but retain useful checkpoints. Never invent percentages/reset times or claim checkpoints can run after the service refuses execution.

### Snapshot content and integrity

Use the fallback skill's actual persistent location under the user's Codex Task Snapshots directory, with a safe task name and immutable milestone history. The planning snapshot is separate from future implementation status; a completed planning snapshot must not mark the app delivered.

Record branch/HEAD, dirty files and ownership, exact task ID, verified work, partial work, commands/results, actual evidence paths, open risks, agent statuses, browser/server processes, user steers, wake ownership, usage policy, and one exact next safe action. Do not record private Salah content, credentials, huge logs, or hidden reasoning.

Use apply_patch to create a sibling temporary snapshot, verify it is readable/nonempty, then replace latest atomically on the same filesystem. Preserve the old snapshot if validation fails; create immutable history at important transitions. Keep source edits safe and coherent; do not use git reset/checkout to recover from interruption.

### Resume/start procedure

1. Read latest snapshot and ledger, then latest user direction and relevant skills.
2. Inspect actual branch/HEAD, git status/diff and the files referenced by the checkpoint.
3. Reconcile user edits, completed agent work, interrupted writes, missing evidence, or Git changes; do not overwrite them.
4. Confirm whether live agents/processes still exist; process IDs from an old session may be stale. Never kill a process based only on a historical PID or broad port pattern.
5. Verify Vorssaint's actual state before reacquiring or releasing wakefulness; recorded ownership is not proof the UI is unchanged.
6. Verify completed task evidence proportionately, not rerun every past phase. A changed relevant dependency invalidates its dependent tests.
7. Update the ledger with a RESUMED event and start the exact next unfinished task.

Reusable resume instruction:

> Resume this task from the saved checkpoint. Do not restart from the beginning. Inspect the current filesystem/project state, verify completed work, identify the exact next unfinished step, and continue from there without repeating completed work unless verification shows it is necessary.

### Cleanup is a finally path, not a last-phase-only action

On every reachable terminal path, including failure before P10, cancellation, or yielding for an external decision, preserve a safe checkpoint and release task-owned wake/server/browser resources as applicable. P10 describes successful final delivery, not permission to leave resources running if an earlier phase fails. Finish or safely stop child work belonging to this task unless the user explicitly asks for detached execution. Never stop unrelated processes or the user's preexisting wake session. Force quit, power loss, or a service interruption can prevent cleanup; report that limitation rather than promise guaranteed release.

## 6. P0 — Execution startup, protection and baseline

**Owner: root. Dependency: user authorizes implementation.**

- [ ] **P0.1** Read/reconcile the documents and current main checkout. Preserve dirty user files; record HEAD and release metadata without dumping secrets.
- [ ] **P0.2** Read lifecycle skills; inspect/acquire Vorssaint indefinite wake state before substantial work if appropriate. If preexisting, preserve it. If activation cannot be verified, report accurately; no caffeinate/pmset workaround.
- [ ] **P0.3** Initialize implementation ledger/snapshot with exact scope and latest usage/agent policy. Keep planning and implementation completion separate.
- [ ] **P0.4** Inventory code, imports, feature effects, calculation dependencies, schemas, backup allowlist, sharing payload, PWA cache/update behavior and release sources.
- [ ] **P0.5** Run existing test/build/lint baseline, capture failures and distinguish existing debt from new regressions. Do not modify unrelated UI to clean up all historical lint failures.
- [ ] **P0.6** Start an isolated local verification session; immediately apply browser-start verification. Use synthetic fixtures, not the user's production worship records.
- [ ] **P0.7** Capture normal-mode Home/Prayer/Settings/More/Tracker screenshots at desktop and narrow mobile widths; include Arabic/RTL where supported. Measure production-build startup and selected feature-open costs before optimization.
- [ ] **P0.8** Record dependency map, metric conditions and ownership contracts; stop planning/baseline-only temporary jobs before unrelated heavy work.

Baseline exit gate: tested current behavior, known preexisting failures, source dependency map, and real measurements recorded. Dev-server timings do not substitute for production bundle/cache behavior.

## 7. P1 — Pure registry, preferences and integration contracts

**Owner: root. Dependency: P0.**

Use stable IDs distinct from translated labels. Register existing roots: Home, Prayer, Settings, Quran, Qibla, More, Credits, Deep Search, City Mode, Iqama, Masjid Mode, Salah Tracker, Backup & Restore, Ramadan, App Guide; add Feature Hub. Keep child destinations linked to their parent root for highlighting/history.

Proposed new module names (not existing artifacts): `src/lib/rootFeatures.ts`, `src/lib/appLayout.ts`, `src/lib/performancePreferences.ts`, `src/lib/salahSavedSearches.ts`. Confirm names against repository conventions before creating them; update ownership and imports if names change.

- [ ] **P1.1** Define registry metadata and child-to-root mapping without eager imports of heavy feature components from the metadata catalog.
- [ ] **P1.2** Define pure layout shape: schemaVersion, enabled, ordered navigation extras, Home shortcuts, More shortcuts. Fixed Home/Settings fallback/Hub anchors are derived, not removable stored entries.
- [ ] **P1.3** Define performance shape: schemaVersion, enabled, distinct priority root IDs; no persistent cache/process state.
- [ ] **P1.4** Define Settings expansion shape keyed by known section IDs, initially expanded. Collapse state is separate from mode and root visibility.
- [ ] **P1.5** Define saved-query shape: stable ID, name, query, explicit scope including bounded dates/blank-date choice. Relative tokens remain in the query, not frozen into an implicit absolute date.
- [ ] **P1.6** Add validators/normalizers for malformed JSON, duplicate/unknown IDs, excess nav entries, missing protected access and storage exceptions. Preserve absent-key backup behavior.
- [ ] **P1.7** Define safe writes/change notifications and draft editor semantics. Preview is transient and Cancel performs no persistent write. Save validates and applies one coherent layout object; failed storage writes must not claim persistence.
- [ ] **P1.8** Add focused tests for defaults, normalization, save/load, read/write failures, Home protection, zero/four/excess extras, disallowed self-links and cross-surface duplication.
- [ ] **P1.9** Agree loader registration, import contracts, source-data invalidation and star/search interfaces, then dispatch independent agents.

Contract exit gate: tests pass; root catalog doesn't defeat lazy loading; all streams know exact shared-file ownership. Do not silently migrate or rewrite historical records.

## 8. P2 — Custom navigation, Home, More and Feature Hub

**Owner: layout agent for assigned UI; root for App/nav integration. Dependency: P1.**

- [ ] **P2.1** Replace hard-coded three-tab assumptions with validated effective navigation. Preserve default order and icons, selected-state semantics and existing back behavior.
- [ ] **P2.2** Render Home first plus up to four selected extras. Allow replacing Prayer/Settings; test child screens of promoted roots and labels at five-button mobile width.
- [ ] **P2.3** Derive Settings top-right Home fallback from absence in bottom navigation. It must not depend on a collapsible section or removable shortcut.
- [ ] **P2.4** Build Feature Hub/catalog: all roots, hidden-state indication, Open now, Add/Restore shortcut. Provide protected custom-layout access even with empty Home/More shortcut lists.
- [ ] **P2.5** Render Home optional shortcuts from the effective configuration. Protect preview/source/timezone/date, remove only the redundant inner Athan App heading universally, and preserve the outer Home header.
- [ ] **P2.6** Render configurable More list and a useful empty state. Reconcile conditional Ramadan content with explicit custom visibility and avoid unintended duplicates.
- [ ] **P2.7** Implement editor surface selection, add/remove, up/down ordering and optional accessible dragging, preview/save/cancel, reset and mode enable/disable. Do not require drag gestures.
- [ ] **P2.8** Preserve saved custom arrangement when disabled; Reset only layout preferences. Keep button styling/text/icon conventions; no new arbitrary theme/spacing feature.
- [ ] **P2.9** Verify root shortcuts duplicated across surfaces open the same data. All child controls remain available; no recursion/self-link traps or lost navigation history.

Exit gate: every root can be reached when all removable shortcuts disappear, every allowed order works, protected anchors remain, and cancel/reload/save/reset flows have evidence.

## 9. P3 — Universal Settings disclosure and mode controls

**Owner: one designated Settings owner; root integrates shared preferences. Dependency: P1; can overlap P2/P5.**

- [ ] **P3.1** Add accessible section disclosure for Preferences, Primary prayer source, Prayer calculation, Calendar reminders, Local data, PWA status, and Performance & App Layout.
- [ ] **P3.2** Keep headers visible; +/- controls expose expanded state/content association. Defaults remain expanded for every user.
- [ ] **P3.3** Preserve drafts/focus/field values and intentional work while collapsing; hidden content must not remain keyboard-focusable. Do not turn collapse into root dormancy or reset form state.
- [ ] **P3.4** Persist independent expansion choices; show storage failure honestly. Restored choices should update the view through the agreed preference mechanism.
- [ ] **P3.5** Add independent mode switches, root priority selection and links to layout editors/Feature Hub, preserving access regardless of nav placement.
- [ ] **P3.6** Verify collapsing Calendar during an initiated export doesn't lose configuration/cancel the operation, and PWA update behavior is not disabled by disclosure.

Exit gate: universal disclosure works with both modes off and with either on; save/export semantics are unchanged.

## 10. P4 — Conditional loading, priorities and reliability

**Owner: loading agent for helpers; root for App/build/PWA/shared-source changes. Dependency: P1; merge after P2/P3 contracts.**

- [ ] **P4.1** Audit static import chains and top-level side effects. Split lightweight catalog/primary-data helpers from full screen editors so metadata/source access doesn't pull hidden UI into startup.
- [ ] **P4.2** Define a shared feature loader with one in-flight import per module, recoverable rejected imports, and app-styled pending/error states. No hard-coded guessed chunk URLs.
- [ ] **P4.3** Implement normal-policy preparation vs optimized-policy on-demand preparation. Normal layout off/off must not become a surprise visually degraded or restricted mode. Use production comparisons to validate timing tradeoffs.
- [ ] **P4.4** Implement custom-hidden root deferral independently of Performance Mode. Opening a dormant root via Hub activates its full screen; closing stops only screen-owned temporary work.
- [ ] **P4.5** Add bounded priority preparation after essential Home readiness. Loading code must not mount screens, ask for permissions, start sensor/audio work or auto-download Quran data.
- [ ] **P4.6** Keep primary source/calculation data usable even when its editor is hidden. Cache keys include necessary date, source/profile revision, calculation settings and timezone dependencies; do not serve stale times after restore/edits/midnight.
- [ ] **P4.7** Optimize proven redundant work: storage parses, schedule/aggregate recomputation, render churn and duplicate in-flight reads. Avoid blanket memoization or permanent caches; document invalidation and capacity.
- [ ] **P4.8** Audit mount/unmount lifecycle, timers, event listeners, abort signals, object URLs, sensors and intentional continuing workflows. Keep visible countdown/animations/graphs functionally equivalent.
- [ ] **P4.9** Audit generated production service worker and disk precache so cold dormant features can open offline after a successful installation/cache. Disk storage is not JavaScript runtime memory.
- [ ] **P4.10** Handle chunk/network/update errors with bounded retry and safe navigation. Add a lightweight screen render-error boundary for unexpected React failures, retaining a usable shell and Home/Settings/Hub access without erasing records. Test a synthetic thrown render as well as rejected imports. Never use blanket storage/cache clearing or automatic reload loops as recovery.
- [ ] **P4.11** Review current update flow carefully: it removes app-shell caches before reload. Preserve the last usable offline shell when a refresh cannot reach the host; protect Quran caches and personal records. Add staged/failed-update regression tests before changing update logic.
- [ ] **P4.12** Measure all four mode combinations against the baseline: essential readiness, module-load/parse work, feature-open latency, requests, repeated-navigation CPU/cache growth. Record actual tradeoffs and unsupported memory measurements.

Exit gate: measured reduced work in intended modes, unchanged feature outputs/presentation, safe offline installation/update/error paths, and no hidden-source regression. Module imports are not claimed to be unloadable; zero crashes is not promised.

## 11. P5 — Pure stars and typed search extensions

**Owner: tracker agent. Dependency: product definitions; may run after P1 independently of layout/loading.**

- [ ] **P5.1** Derive daily completed/missed/unlogged/logged counts from normalized existing records. Add stars = completed, capacity = 5; no new per-day stored counters and no status migration.
- [ ] **P5.2** Derive period total stars, capacity `5 × elapsedDays`, average total/elapsedDays and coverage. Include past blanks, exclude futures, use existing range/week boundaries and documented all-time start. No average for an empty period.
- [ ] **P5.3** Keep old logged-only rates/streaks exactly compatible. Test three completed/one missed/one blank gives 3/4 logged rate and 3/5 stars, not two competing interpretations of one statistic.
- [ ] **P5.4** Extend the existing parser with typed count, notes-presence, weekday, range and relative-date predicates. Compile once per search change; do not use eval or a large query dependency.
- [ ] **P5.5** Accept star/stars exact/range terms, logged exact/range terms, note/notes aliases, notes/count negation, full/short weekdays, and last30days. Implement done3/done3-5 as documented completed-count aliases of the canonical star count, not another statistic.
- [ ] **P5.6** Distinguish `(notes)` grouping, `star(3-5)` count range and `(2-5)m` date range, with useful invalid-input positions. Respect AND before OR and explicit parentheses.
- [ ] **P5.7** Preserve !prayer = explicitly missed, ~prayer = unknown, /prayer = either; [] permits only exact completed-prayer sets. Bare 1–5 retain prayer aliases.
- [ ] **P5.8** Preserve exact date aliases/inference; add order-independent inclusive component ranges and two-digit years normalized to 2000–2099. Filter actual dates; don't manufacture February 30 or convert recurring ranges into continuous intervals.
- [ ] **P5.9** Use injected today/date context for deterministic relative/weekday tests; last30days includes today and previous 29 dates. Reevaluate after local tracker midnight; don't shift stored records with prayer-display timezone.
- [ ] **P5.10** Keep recorded-date default and existing bounded blank-date search limit. !notes/star0/logged0 never generate an unlimited calendar. Guard query size/nesting if needed to avoid pathological mobile workloads without rejecting documented expressions.
- [ ] **P5.11** Add explanatory descriptions and result-summary aggregation using the same parsed predicates; deduplicate days matching both OR branches.

Minimum test fixtures: all 0–5 star values; explicit false vs absent; notes-only/whitespace notes; Sunnah-only records; empty/future periods; week/month/year rollover; leap/non-leap dates; mixed exact/range dates; reversed/duplicate/ambiguous input; `(mon)&((logged5),(notes))`; all prior examples; relative date midnight; empty and maximum bounded scopes. Compare old insights tests before/after.

Exit gate: pure tests pass, old examples remain compatible, and no new privacy/network dependency exists.

## 12. P6 — Stars, result summaries and saved-query UI

**Owner: tracker agent. Dependency: P5 and preference contracts.**

- [ ] **P6.1** Add compact colored `★ x/5` immediately below calendar completed/logged fraction. Accessible text states both denominators. Future days are neutral; no-data remains distinguishable from explicit misses.
- [ ] **P6.2** Add star total/capacity/average/coverage to selected-day and existing weekly/monthly/custom-period insight destinations without cluttering daily logging or replacing graphs/rates.
- [ ] **P6.3** Add grammar examples/help for new predicates and grouping. Show validation errors, empty states, query meaning and compact totals above filtered results.
- [ ] **P6.4** Add named saved-query Save/Open/Rename/Delete. Save only valid definitions/scopes; no copied note/log records. Bound names/records reasonably; handle storage failure and safe display of user-entered names.
- [ ] **P6.5** Saved absolute scopes retain their dates/blank-day choice; last30days rolls when reopened. Display scope clearly and preserve current data edits/restore invalidation.
- [ ] **P6.6** Add bounded recent valid queries and small local tappable suggestions/examples; no cloud/autocomplete service or private note content in suggestions. Reset visible result count when filters change; retain the existing result presentation rather than creating a Performance Mode-specific one.
- [ ] **P6.7** Opening a result still selects the correct day in Tracker. Main Tracker remains calendar/logging/notes plus existing Insights/Search/Graph destination buttons.
- [ ] **P6.8** Verify re-entry after editing a day, clear-all, mark-all, notes edit, restore, midnight, and mode changes refreshes summaries/saved matches without losing records.

Exit gate: functional and mobile/accessibility evidence for stars/search/saved queries; star totals and 5-per-matching-day result status sums agree with fixtures.

## 13. P7 — Personal backup, restore, reset and privacy

**Owner: root. Dependency: schemas finalized in P1, UI/helper implementations P2–P6.**

- [ ] **P7.1** Add all new persistent keys to the existing allowlist: layout enabled/order/lists, section expansion, performance/priorities, saved definitions/scopes, recent queries if persisted.
- [ ] **P7.2** Validate imported known keys against schemas before applying them, preserving malformed-existing/partial-import compatibility safely. No arbitrary storage injection or silent unrelated data deletion.
- [ ] **P7.3** Round-trip to a fresh isolated instance: logs/notes/profiles/Quran progress/reminders plus new preferences recreate the configured experience and protected access paths.
- [ ] **P7.4** Test old backups with missing keys, imports into an existing customized instance, unknown feature IDs/future schema, invalid scopes/query definitions, duplicate roots, excessive nav entries and unavailable storage.
- [ ] **P7.5** Include new keys in explicitly requested full app-data reset; keep Reset layout limited to layout, and Quran text removal limited to downloaded text.
- [ ] **P7.6** Keep backup format version separate from release version; adding allowlisted keys alone does not require inventing a breaking backup schema bump.
- [ ] **P7.7** Verify Share Your Defaults still excludes tracker logs/notes/reminder preferences and every new config/query key; inspect generated payload and network activity with synthetic sensitive markers.
- [ ] **P7.8** Document that personal backup contains records/preferences but does not embed all offline Quran cache files or audio. Restoring metadata is not proof downloaded text exists in a fresh browser; validate actual cache availability or report that re-download is needed.

Exit gate: personal data and preferences round-trip, legacy files still work, privacy exclusions pass, and no cache download claim is inferred solely from metadata.

## 14. P8 — Whole-release verification and measurement

**Owner: root; independent review only on isolated/read-only scope. Dependency: integrated P2–P7.**

- [ ] **P8.1** Run repository tests/build/lint as separate meaningful commands; focused agent passes are not the final whole-suite result. Capture exit codes and preexisting vs new failures.
- [ ] **P8.2** Apply React best-practices review to changed components: hooks, stable dependencies, accessibility, direct imports, state updates, deferred modules and storage error paths. Do not add speculative caching or unrelated frameworks.
- [ ] **P8.3** For each browser server start, verify real content/no overlay/navigation before proceeding. Capture actual available diagnostics; missing error instrumentation is not a clean-console pass.
- [ ] **P8.4** Test the full mode matrix with fresh defaults and restored settings, desktop and mobile. Include five tabs, long labels, keyboard-only use, focus restoration, RTL where supported, and expanded/collapsed Settings.
- [ ] **P8.5** Trace editor → draft preview → cancel/save → reload → backup → clean restore; every root remains accessible and selected-day/back/history work.
- [ ] **P8.6** Trace fixture → query → explanation → summary → result → selected day → edit → reopened saved query; test exact/range/relative/negative filters with deterministic dates.
- [ ] **P8.7** Run production-preview offline/error tests: warm shell, cold unused feature cached on disk, missing external API responses, uncached Quran translation, failed chunk, synthetic screen render failure, and an update while the hosting domain is unavailable. Verify shell/Settings/Hub recovery and state exactly which resources were cached.
- [ ] **P8.8** Repeatedly navigate/open/close roots and edit/restore histories using bounded stress fixtures; verify no accumulating listeners/import tasks/cache entries beyond limits and no stale source calculations.
- [ ] **P8.9** Compare baseline vs final normal/optimized production metrics under the same viewport, fixture, cache state and throttling. Record size/time measurements, request counts and observed resource behavior; repeat enough to distinguish noise, not promise an arbitrary percentage gain.
- [ ] **P8.10** Check existing unaffected workflows: normal prayer source/date/timezone, monthly view, Quran last-read/completion/bookmarks/offline text, standalone Iqama, Masjid profile export, City/Deep Search/Settings canonical ICS event/alarm semantics, reminders and sharing.
- [ ] **P8.11** Explicitly separate mocked permissions from real iPhone/Android sensor evidence. Desktop absence of a gyroscope is not a Qibla failure; preserve calculations/behavior and do not repeatedly attempt physical compass proof on desktop.
- [ ] **P8.12** Record any required real-device follow-up. Browser CPU/network throttling is not actual low-RAM hardware evidence; no crash-free claim without qualification.

Use synthetic fixture families: brand-new user; dense month; sparse month with missed/unlogged/notes; leap-year/range dates; several years at the bounded limit; configured city/imported timetable; default and customized backup. Store test results, sanitized screenshots and measurements as evidence, not personal worship history. Create an evidence directory only when files actually exist; record its real absolute path in the ledger.

Useful existing scripts: `npm run test:run`, `npm run build`, `npm run lint`, `npm run dev`, `npm run preview`. Resolve tooling from existing dependencies and skills; don't assume extra browser-test packages are installed.

Exit gate: all required acceptance scenarios have evidence or a clearly stated genuine hardware/external limitation. Fix a broken boundary before declaring downstream success; after a fix rerun dependent checks.

## 15. P9 — Release metadata, Developer Notes and complete README

**Owner: root, or one documentation owner after integration stabilizes. Dependency: P8 acceptance.**

- [ ] **P9.1** Apply version **4.0.0** using the established process: package manifest and root lockfile version entries, release fallback/build variables where configured, Credits label, release notes and user-visible version sources. Do not replace dependency versions that happen to contain 3.3.3.
- [ ] **P9.2** Set actual release date, client timezone Asia/Shanghai. Do not use the planning date as an automatic release date or edit unrelated secret environment values.
- [ ] **P9.3** Add delivered Developer Notes entry under existing JSON/schema/screen conventions. Keep previous entries and the separate Developer Notes destination intact.
- [ ] **P9.4** Rewrite/audit README comprehensively: every root/important child feature, current version/name, default/custom modes, disclosure, protected Hub/access, priority/dormant limitations, offline boundaries, stars vs logged rates, query grammar/examples/saved scopes, backups/privacy, install/setup/checks and real-device caveats.
- [ ] **P9.5** Describe both earlier delivered features and v4 changes accurately; verify live-link claims rather than say all aliases are current by assumption. Do not document proposed audio or dual hosting as implemented.
- [ ] **P9.6** Recheck every example against parser/tests, version/date consistency and README setup commands. Explain major-release README refresh rule without allowing misleading docs between releases.
- [ ] **P9.7** Rerun affected tests/build after metadata/docs changes; verify installed/current version/update display with an actual production build.

Exit gate: release metadata and complete documentation agree with tested code; no placeholder release date, inflated performance promises or unimplemented feature claims.

## 16. P10 — Final review, cleanup and truthful handoff

**Owner: root. Dependency: P0–P9 complete or explicit non-completion report.**

- [ ] **P10.1** Review full diff for unrelated changes, accidental deletions, dependency bloat, personal fixture content, stale unused code paths and conflicts with user edits.
- [ ] **P10.2** Verify every required task/feature row; distinguish VERIFIED from IMPLEMENTED_UNVERIFIED and BLOCKED. Do not mark a release complete because time/usage is nearly exhausted.
- [ ] **P10.3** Finish required agents and capture each assignment/result/accepted files/tests; resolve unused/incomplete output centrally or report it clearly.
- [ ] **P10.4** Stop only task-owned temporary servers/browser sessions, restore any user surface/preferences touched during testing, and verify no unrelated jobs were interrupted.
- [ ] **P10.5** Release only this task's acquired Vorssaint session after required work/verification. Verify inactive UI; leave preexisting user wakefulness alone. Attempt a second reasonable cleanup if needed and report manual action if unverified.
- [ ] **P10.6** Update final progress and snapshot/history. If unresolved required work remains, mark the implementation incomplete with the exact next action rather than COMPLETED.
- [ ] **P10.7** Report changed files with clickable absolute links plus exact Finder paths, feature behavior, stats definitions, backup/privacy, measured performance/tradeoffs, tests, agent contribution, documentation/version and remaining device limitations.
- [ ] **P10.8** Do not commit or push unless the user requests it. A later commit request requires reviewing the actual dirty file scope and preserving unrelated changes.

## 17. Coverage and acceptance map

| Requirement | Implementation tasks | Required evidence |
| --- | --- | --- |
| Default experience preserved | P1.2, P2.1, P4.3, P8.4 | Upgrade with no new preferences and both modes off |
| Home + up to four customizable extras | P1.8, P2.1–P2.2 | Protection/limit/order tests and five-button mobile screenshot |
| Settings top-right fallback | P2.3, P7.4 | Remove Settings, reload/restore, still open it |
| Universal +/- Settings | P3.1–P3.6 | Both modes off, field/export preservation, persisted state |
| Root vs child distinction | P1.1, P2.9 | Monthly/tracker/Quran child flows and selected highlighting |
| Home/More add/remove/order, cross-surface duplicates | P2.5–P2.9 | Draft/save/cancel/reset and shared data flows |
| Protected prayer preview; universal title removal | P2.5, P8.4 | Default/custom Home checks, source context intact |
| Hub and hidden features | P2.4, P4.4 | Hide every optional shortcut, open each root via protected path |
| Internal-only optimized mode and priorities | P4.1–P4.8, P4.12 | Visual/output equivalence plus measured avoided work |
| Hidden primary-source dependencies | P4.6, P8.10 | City/imported/Masjid-source output unchanged when editor hidden |
| Offline/stale-chunk/white-screen recovery | P4.9–P4.11, P8.7 | Production cache/update failure scenarios, no data erasure |
| Fixed x/5 calendar stars and elapsed-day averages | P5.1–P5.3, P6.1–P6.2 | Counts/blank/future tests; old logged rates unchanged |
| Notes/logged/star/weekday predicates and aliases | P5.4–P5.8, P6.3 | All documented expressions and invalid-input tests |
| Boolean grouping and [] compatibility | P5.6–P5.7 | Monday distribution, OR dedup, old exact-set tests |
| Inclusive component ranges and relative dates | P5.8–P5.10 | Leap/order/alias/inference/range/midnight tests |
| Saved/recent searches, local suggestions, summaries | P6.3–P6.8 | Named query flows, rolling/absolute scopes, aggregate sums |
| Backups of all new configuration and privacy | P7.1–P7.8 | Fresh/legacy round trips, reset boundaries, excluded payload |
| Existing Quran/Qibla/Iqama/calendar preserved | P8.10–P8.11 | Regression tests and stated hardware limits |
| No audio download/playback work; no dual hosting | P8.10, P9.5, P10.1 | Diff/docs scope review |
| v4.0.0 + complete README + Developer Notes | P9.1–P9.7 | Consistent metadata, inventory, tested examples |
| Resumable execution and resource cleanup | All phases, P10 | Verified ledger/snapshot/history, task-owned wake/process cleanup |

## 18. Implementation handoff state

Implementation is integrated on main with local v4.0.0 metadata and passing checks. The next human action is testing the preview on real devices. Do not replay P0 or overwrite current records to resume; inspect the ledger, verification limitations, and latest snapshot. The root owns the final result even when agents help. Skill use does not grant commit/deploy authority or guarantee service/hardware availability.
