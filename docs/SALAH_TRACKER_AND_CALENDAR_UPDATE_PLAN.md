# Salah Tracker, Prayer-Time Display, and Calendar Update Plan

**Status:** Implemented in the current `main` working tree. This document records the agreed scope and acceptance criteria; the 2026-10-02 developer note records the delivered feature wave. No version bump has been assigned.

## Purpose

Next release planning (2026-10-05): [v4.0.0 — Your App, Your Flow](./V4_0_0_UPDATE_PLAN.md) consolidates the newly agreed layout, internal-loading, Settings, and Salah search/star additions. The delivered feature-wave record below remains historical; the new plan is not an implementation or release.

Plan the next focused feature wave for Athan PWA while preserving its current visual style, prayer calculations, privacy boundaries, saved data, and existing screens. The wave improves clarity when viewing a saved city's prayer times, adds a second optional calendar alert to Deep Search Athan and Settings, makes Settings exports follow the selected primary prayer source with Deep Search-style event detail, and separates Salah Tracker logging from its deeper search and insight tools.

## Existing behavior to preserve

- Salah Tracker already has a month calendar, daily obligatory prayer logging, optional Sunnah logging, daily notes, and the four period presets: This week, This month, Last 30 days, and All recorded time.
- Daily notes and prayer logs are stored locally in `salahLogV1`; notes should remain private and retain current Backup & Restore behavior.
- Settings already controls optional fixed Isha, Jumu’ah, and Salah Tracker review calendar events. The Salah review reminder is opt-in and is included only when the user exports a Settings calendar file.
- Deep Search Athan already produces detailed event descriptions and UTC event timestamps. The shared ICS serializer supports more than one alarm per event.
- The app currently uses the primary saved city as a prayer-time source. Prayer instants can be correct while the visible clock is formatted in the device timezone, which can confuse someone viewing another city's schedule while traveling.
- Settings currently exports from device location even when a saved city is the selected primary prayer source. This wave explicitly changes that source selection.
- The standalone Iqama Times screen and Masjid Mode are outside this wave's requested changes and must remain available and unaffected.

## Product principles and non-goals

1. Keep the main Salah Tracker screen for daily use: calendar, selected day, five obligatory prayer controls, and notes.
2. Make all summaries contextual. A percentage always shows its logged denominator; unlogged data is never silently treated as missed or completed.
3. Keep tracker records and notes local. Do not transmit or include them in Share Your Defaults. Do not add an overall grade or guilt-oriented scoring.
4. Do not alter prayer calculations, saved-city calculation settings, or Qibla behavior to solve a display-time ambiguity.
5. Preserve current calendar event choices and alert defaults. New alerts remain opt-in, and calendar apps remain responsible for alert delivery.
6. Keep the existing app design language: compact cards, familiar colors and spacing, readable labels, mobile-first layout, and accessible controls.
7. Do not assign a version number or create a release entry until the repository's release process is checked during implementation.

## Workstream A: Make saved-city prayer-time displays explicit

### Problem

Prayer times are calculated for the selected city's coordinates, but Home and Prayer Times currently display JavaScript `Date` values using the device timezone. For example, a Chennai prayer instant corresponding to 5:59 PM India Standard Time appears as 8:29 PM on a device set to China Standard Time. These are two renderings of the same instant; the interface does not currently make that distinction obvious. A traveler needs to see which city's clock is being shown and choose the view that is useful at the moment.

### Planned behavior

- When the primary source is a saved city, default to **City time** and label the timezone/UTC offset, such as `5:59 PM IST (UTC+5:30)`.
- Offer three clearly labeled display choices for that saved city in **Settings → Primary prayer time source**: **City time**, **Device time**, and **UTC**. Keep the segmented control off Home, Prayer Times, and the monthly timetable to reduce visual clutter; those screens show the active timezone label. Apply the preference consistently to Home and Prayer Times, including the monthly timetable. If no saved city is selected, retain the clearly labeled device-location display.
- Do not change the prayer calculation method. Keep the next-prayer countdown based on the correct event instant; changing a display preference must not change when a prayer occurs.
- Use the selected city's calendar date and weekday when choosing its daily row, tomorrow's Fajr, and Friday/Jumu’ah labels. Device and city dates can differ near midnight. The Hijri/date header must state which location's date it represents.
- Use the saved city's IANA timezone identifier when available. Populate/cache it for newly searched cities using a reliable timezone-resolution source or maintained timezone data. Preserve existing records and fill missing metadata safely.
- For imported timetables, interpret the saved wall-clock rows in the profile's timezone before converting them to an instant; those rows currently become device-local `Date` values. Use a known profile timezone if present. If it cannot be resolved, label the display fallback explicitly (for example, “Device time; city timezone unavailable”) and do not claim a city-time or UTC conversion is verified. Do not guess another profile's timezone.
- Show UTC conversion only from a well-defined instant. Do not derive a timezone by applying a single fixed offset across a date range when daylight-saving transitions could matter.

### Acceptance criteria

- A saved Chennai profile viewed from a China-timezone device displays the Chennai wall-clock time with its zone/offset, while the countdown remains correct.
- The user can switch between City time, Device time, and UTC; the displayed label always matches the selected view.
- UTC mode displays the corresponding UTC time and is labeled as such.
- Unknown timezone data produces a visible, honest fallback and never silently changes prayer calculations.
- Existing device-location behavior remains clear and unchanged unless the user selects an explicit display preference.
- Tests cover city/device date rollover, Friday labels, imported timetable wall-clock rows, a non-whole-hour offset (India), and a daylight-saving timezone across a transition.

## Workstream B: Add a second optional ICS alert to Deep Search Athan and Settings

### Planned behavior

- Add an off-by-default **Second reminder** control and a separate minutes-before-event value in both Deep Search Athan and Settings. Keep each screen's existing primary reminder control and default unchanged. Their settings are independent, so changing one screen does not silently change the other.
- This creates two `VALARM` components inside **one** calendar event, like the screenshot showing alerts at 10 and 15 minutes before. It does not create a duplicate prayer event or rely on a JavaScript timer.
- When enabled, add the second alarm to each included Deep Search prayer event and each of Settings' six daily Athan/Sunrise events. When disabled, retain exactly one alarm per event.
- Keep fixed-time Isha, Jumu’ah, and Salah Tracker review events at their existing single-alert behavior. The review event's current alert is at event time. The second reminder control is labeled as applying to regular prayer-time events so this scope is clear.
- Validate both offsets and avoid two identical triggers on one event; show a clear message if the selected values match. Allow an alert at event time only where that screen's control explicitly permits zero.
- Do not add second alerts to City Mode, standalone Iqama, or Masjid Mode without an explicit control on those screens.
- Preserve the active Deep Search export's UTC timestamps, event inclusion choices, date range, location/calculation metadata, filename behavior, and download behavior.

### Acceptance criteria

- Existing Deep Search exports retain the same event and alarm count when the new option is off. Settings also retains one alarm per event when off, subject to its planned rich-export migration.
- With the option on, each eligible event has exactly two alarms at the selected offsets; optional fixed-time and review events retain their existing alert behavior.
- Store both screens' second-alert preferences locally and include them in Backup & Restore. Neither option is silently added to unrelated calendar exports or Share Your Defaults.

## Workstream C: Enrich Settings ICS using Deep Search event detail

### Planned behavior

- Make the active Settings export use Deep Search-style rich prayer events through the canonical ICS handler (or a shared prayer-event factory). Include prayer, source location, calculation method, madhab, timezone/offset, and relevant calculation or imported-timetable context.
- Resolve the **selected primary prayer source** for every Settings export. If it is a saved City Mode profile, use that exact profile's coordinates, calculation settings, corrections, or imported timetable. If no saved city is selected, use the current device-location source and its effective settings. Identify the source in the export UI and calendar metadata/filename. Never silently use another city or fall back to device data when a selected saved-city source fails.
- Generate the date range as consecutive dates in the primary source's timezone. Resolve its IANA timezone and convert the source's prayer wall times to actual instants. Use explicit UTC `DTSTART`/`DTEND` values for the active Settings prayer events, as Deep Search does; preserve the intended prayer instant and verify the imported calendar shows the right time in different device zones. If source timezone or timetable rows are insufficient for a safe conversion, stop export with an actionable error.
- Preserve Settings' existing event choices and controls: selected date-range choices, prayer events, optional fixed-time Isha, Jumu’ah reminder, optional Salah Tracker review event, and selected reminder offset.
- Interpret configured fixed Isha, Jumu’ah, and Salah Tracker review wall-clock times in the primary source timezone, including source-local Fridays. Label the selected source and timezone beside these controls so the user knows what their chosen reminder time means. Convert each event to a correct UTC instant for export. The review event remains a private prompt and never exposes tracker records.
- Keep the Settings reminder event privacy-safe: title/description must not disclose prayer history or daily notes. The event is only a review prompt.
- Keep the prior Settings ICS generation path in the source as an inactive reference, as requested; route active downloads through the rich/shared path.
- Settings currently emits floating local timestamps. The new active path intentionally emits UTC timestamps to match Deep Search's event behavior. Compare the resulting instants against the old source schedule across timezones before enabling this path; this is a format change, not permission to shift prayer times.
- Keep one alarm per event by default; add a second alarm to the six daily events only when the Settings second reminder is enabled. Preserve the optional events' existing single-alert triggers.

### Acceptance criteria

- Settings prayer events carry rich source/calculation context and reflect the selected primary source, including imported timetables and saved-city corrections.
- Fixed Isha, Jumu’ah, and Salah review entries remain included only under their current opt-in/configured conditions.
- Their selected wall-clock times follow the primary source's local date and timezone, which are visible in Settings before export.
- Settings' primary reminder offset remains unchanged. A second alarm appears only when explicitly enabled and only on eligible events.
- The same source-local prayer instant appears at the correct device-local time after import on devices in different timezones; the source-local date and Friday rules remain correct.
- A generated file can be imported by supported calendar clients, and its event count, titles, timestamps, descriptions, and alarms are covered by tests.

## Workstream D: Separate Salah Tracker logging, insights, search, and charts

### Main Tracker screen

Keep the monthly calendar, selected-day prayer logging, daily notes, and optional Sunnah control prominent. Add three navigation buttons below the daily content:

1. **Insights**
2. **Search Salah Progress**
3. **Graph Insights**

The new destinations supplement the daily tracker. They do not replace its calendar or logging controls.

### Insights screen and date filters

- Preserve the four existing presets: This week, This month, Last 30 days, and All recorded time.
- Add a month/year picker and a custom from/to date range. Make the active range visible and make switching between preset and custom ranges predictable.
- Keep per-prayer completed count, logged count, completion rate, and verified streaks, plus existing contextual summaries where they fit.
- Every rate displays its denominator (for example, `8/10 logged · 80%`). Show the number of days with at least one logged obligatory prayer in the selected range.
- Missing/unlogged dates remain unknown. They are not added to a missed count or completion denominator.
- Define date ranges inclusively in the user's local calendar date and handle month/year boundaries consistently. Ensure “All recorded time” has a clear latest applicable end date and does not imply future unlogged dates.

### Search Salah Progress: Pokemon GO-inspired string grammar

Treat each date as a searchable record with five prayer attributes. Preserve the user's desired compact syntax, numeric aliases, and status distinctions. Prayer aliases are:

| Number | Prayer token |
| --- | --- |
| `1` | `fajr` |
| `2` | `dhuhr` |
| `3` | `asr` |
| `4` | `maghrib` |
| `5` | `isha` |

Initial search rules:

- A bare prayer token or number means that prayer was **Completed**: `fajr` = `1`.
- `&` combines required conditions (AND): `fajr&dhuhr` or `1&2` means both were completed. Unmentioned prayers can have any status.
- A comma or semicolon separates alternatives (OR): `!2,!3,!4,!5` means at least one of Dhuhr, Asr, Maghrib, or Isha was explicitly missed.
- `!` before a prayer means explicitly **Missed**: `!fajr` = `!1`.
- `~` before a prayer means **Not logged**: `~fajr` = `~1`.
- `/` before a prayer means **not completed**, covering either Missed or Not logged: `/fajr` = `/1`.
- Square brackets mean an exact set of completed prayers. `[fajr&dhuhr]` or `[1&2]` means Fajr and Dhuhr are completed, and no other prayer is completed; each other prayer may be Missed or Not logged. Without brackets, `fajr&dhuhr` does not constrain the other prayers.
- Parentheses group a logical expression and are evaluated first, including nested parentheses. Outside parentheses, `&` is evaluated before comma/semicolon OR. For example, `1&(!2,!3)` requires Fajr completed and either Dhuhr or Asr explicitly missed; `1&2,3` means `(1&2),3`. Square brackets are the exact-completed-set operator, not another kind of grouping parenthesis; their contents are a nonempty `&`-joined list of distinct, positive prayer names or numbers.
- The UI explains the active query and provides examples/autocomplete. Invalid or ambiguous syntax returns a helpful inline error, never a silent empty result.
- Search results are dates, show all five statuses and the relevant daily note only when safely rendered, and open the matching day in the main calendar. Do not expose notes in URLs, logs, analytics, or share links.
- Bound the default search universe to recorded tracker dates through today; allow an explicit date range to include blank dates when searching for Not logged. This prevents an unbounded “all dates” result.
- Numeric value filters and arbitrary note-text operators are not part of the first syntax unless implementation reveals a clear need. Keep the grammar small and stable.

Examples:

| Query | Meaning |
| --- | --- |
| `fajr` or `1` | Fajr completed, regardless of other prayers |
| `!fajr` or `!1` | Fajr explicitly missed |
| `~fajr` or `~1` | Fajr has no logged status |
| `/fajr` or `/1` | Fajr was missed or not logged |
| `fajr&dhuhr` or `1&2` | Both Fajr and Dhuhr completed; other statuses unrestricted |
| `[fajr&dhuhr]` or `[1&2]` | Only Fajr and Dhuhr completed; the rest are missed or unlogged |
| `!2,!3,!4,!5` | At least one of prayers 2–5 was explicitly missed |
| `1&(!2,!3)` | Fajr completed, and either Dhuhr or Asr explicitly missed |
| `1&2,3` | Either Fajr and Dhuhr both completed, or Asr completed |

### Graph Insights screen

- Provide clear, accessible charts for completion trend over the selected week/month/custom range and per-prayer comparisons. Graph Insights retains its completion bars and adds a line chart that makes the direction across logged periods visible. Add weekday summaries if the data supports them.
- Display completed/logged counts beside rates and visually distinguish no-data intervals from zero completion.
- Make chart points keyboard/touch accessible. Selecting a point or date opens that date in the tracker.
- Avoid an overall score, grade, or streak pressure. Charts are descriptive, not evaluative.
- Prefer lightweight chart components already present in the project; do not introduce a large chart dependency without checking bundle size and maintenance cost.

### Salah Tracker acceptance criteria

- Existing `salahLogV1` records and notes load without loss or schema breakage.
- All five numbered and named search aliases match the same underlying prayer.
- `!`, `~`, and `/` produce distinct, tested results. Unlogged never counts as missed.
- Bracket searches enforce the exact completed set; unbracketed AND searches leave other prayer statuses unconstrained.
- Search date scope, inclusive date filtering, and empty/error states are understandable.
- Insights and charts use logged records only and show context for every percentage.
- Main Tracker remains focused on daily logging and notes at desktop and mobile sizes.

## Privacy, backup, and compatibility

- Continue storing prayer logs and notes locally in the existing store; no tracker upload or analytics is introduced.
- Keep tracker records, notes, Salah review preferences, and the new second-alert preferences out of Share Your Defaults. Preserve the existing shareable nonpersonal defaults already supported by that feature.
- Add both second-alert preferences and any persisted display/search preferences to Backup & Restore. Preserve existing inclusion of tracker records/notes and Settings reminder preferences. Restore older backups safely when the new keys are absent.
- Backups remain user-initiated and local-file based under current behavior. No extra cloud sync is introduced.
- Calendar files contain schedule/reminder data only. The Salah review event does not contain tracker state, notes, completion counts, or missed prayers.
- Existing exports remain available from their current screens; standalone Iqama Times remains independently usable.

## Suggested implementation sequence

1. Inspect current data normalization, timezone/profile metadata, primary-source selection, Settings and Deep Search calendar event construction, and navigation conventions before editing.
2. Agree on a small source/date/time contract shared by the saved-city display and Settings export: source identifier, source-local date, IANA timezone, per-day prayer instants, and explicit errors when conversion is unsafe. Add focused tests for this contract and for the search grammar.
3. Implement timezone metadata, source-local day selection, and the City/Device/UTC display in Home and Prayer Times. Verify imported timetable interpretation without changing the underlying calculation rules.
4. Add the optional second ICS alarm in Deep Search and Settings, keeping each control independent and off by default.
5. Extract or reuse rich event construction for Settings. Make it follow the selected primary source, emit verified UTC instants, keep its old builder inactive, and check every optional event and alert.
6. Add new Tracker navigation destinations, then custom date filters and the search parser/UI (including parentheses), followed by charts.
7. Update Backup & Restore, help text, developer notes, and release notes according to established conventions; do not invent a version bump.
8. Run focused tests, the full test/build/lint checks available in the repository, calendar import checks, and desktop/mobile visual checks.

## Subagent execution plan for implementation

When implementation begins, use up to three focused subagents where work can genuinely proceed in parallel. The primary agent owns the shared contracts, integration, privacy review, final checks, and user-facing report. No subagents are needed merely to maintain this planning document.

| Role | Independent assignment | Likely ownership | Deliverable |
| --- | --- | --- | --- |
| Timezone/source agent | Audit and implement source-local dates, timezone resolution, imported timetable interpretation, and City/Device/UTC display | Saved-city/source utilities, Home, Prayer Times, monthly timetable | Tested source/time contract and display behavior |
| Calendar agent | Add second alarms, rich Settings event construction, primary-source Settings export, and calendar compatibility checks | Deep Search engine/UI, Settings export/UI, ICS event helpers | ICS fixtures/tests showing correct UTC instants and one/two alarm behavior |
| Tracker agent | Implement date filters, the search grammar and results, separate Insights and Graph screens | Salah insight/search utilities, Tracker navigation and analysis screens | Parser examples/tests and usable responsive analysis screens |

Start the timezone/source and tracker agents concurrently after the primary agent defines the shared interfaces. The calendar agent can work on the Deep Search second alarm at the same time, then consume the stabilized source/time contract for Settings. Do not assign simultaneous edits to the same file; the primary agent coordinates any shared utility or navigation edits and reviews every agent's work before integration.

After the agents finish, the primary agent checks cross-feature behavior: Settings and Home must use the same primary source; timezone conversion must preserve instants; optional events must keep their intended alerts; Tracker routes must open the correct selected date; backups and Share Your Defaults must respect privacy. Run the repository checks and inspect desktop/mobile screens before reporting each agent's actual contribution and any unused work.

## Verification checklist

- [ ] Existing prayer calculations and Qibla behavior are unchanged.
- [ ] Saved-city display is labeled with the correct city timezone or an explicit fallback.
- [ ] City time is the saved-city default; Device time and UTC are explicit selectable views.
- [ ] Source-local date, tomorrow's Fajr, and Friday/Jumu’ah labels remain correct when device and city dates differ.
- [ ] Countdown behavior remains based on the same prayer instant.
- [ ] Deep Search and Settings each export one alarm on eligible events by default and two only when that screen's second option is enabled.
- [ ] Settings follows the selected primary source, including corrections/imported timetables, and exports rich UTC events with verified instants.
- [ ] Fixed Isha, Jumu’ah, and Salah review retain their configured inclusion and current single-alert behavior.
- [ ] Existing Settings ICS generator remains in source but is not called by its active export path.
- [ ] Search grammar tests cover names/numbers, AND, OR, missed, unlogged, not-completed, parentheses/precedence, and exact-set brackets.
- [ ] Custom date ranges and all presets have correct inclusive boundaries across months and years.
- [ ] Percentages and charts always show logged-data context; unknown is not silently counted as missed.
- [ ] Notes, logs, new second-alert/display preferences, and existing reminder settings survive Backup & Restore; private data stays out of Share Your Defaults.
- [ ] Iqama Times remains independently accessible and usable.
- [ ] Existing visual language and responsive behavior are retained.

## Research references

Future planning notes for stars, notes-presence searches, logging coverage, component ranges, weekdays, and saved searches are in [Salah Stars and Search Extensions](./SALAH_STARS_AND_SEARCH_EXTENSIONS_PLAN.md). Those notes were recorded on 2026-10-05 and are planning only; they do not change the delivered scope described above.

- Pokémon GO's official search documentation is a reference for combining terms, exclusions, and suggestions: [Searching & Filtering your Pokémon Inventory](https://niantic.helpshift.com/hc/en/6-pokemon-go/faq/1486-searching-filtering-your-pokemon-inventory/).
- JavaScript timezone-aware display can use `Intl.DateTimeFormat` with an IANA timezone: [MDN `Intl.DateTimeFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat).
- iCalendar distinguishes floating local, UTC, and timezone-referenced local values; preserve that distinction during Settings enrichment: [RFC 5545](https://www.rfc-editor.org/info/rfc5545/).
