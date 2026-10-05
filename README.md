# Athan PWA

A lightweight, privacy-friendly Islamic utility built with React, TypeScript, Vite, and Tailwind CSS. Check prayer times, find Qibla, read the Quran, privately track Salah, and export calendar reminders without an account or a traditional app-store download.

## Current release

**v4.0.0 — Your App, Your Flow**

Personalize navigation and shortcuts, choose invisible loading optimizations, and explore Salah progress with fixed-capacity stars and richer local searches. Existing features and private records remain intact.

### Added and changed in v4.0.0

- Optional Custom Layout: reorder/add/remove navigation, Home, and More shortcuts; preview drafts, save, cancel, and reset.
- Permanent Home plus up to four additional navigation destinations; protected Settings fallback and Feature Hub access.
- Optional Performance Mode and priority preparation, without reducing features, changing calculations, animations, or visual design.
- Universal plus/minus Settings sections; collapse preserves controls and intentional work rather than putting a feature to sleep.
- Removed the redundant inner “Athan App” Home heading; prayer preview, date, and primary-source context remain.
- Daily `★ x/5` stars and period totals/averages, alongside unchanged logged-only completion rates.
- Notes, logging counts, stars, weekdays, relative dates, and inclusive date-component ranges in Salah search.
- Named saved searches, recent queries, local examples, and compact matching-day summaries.
- Personal backups include new layout, performance, disclosure, and query preferences.
- Recoverable screen-loading/render errors and safer update checks that preserve the current offline shell on failure.

Earlier features remain available. Full release history is inside **Credits → Developer Notes**, rather than a growing list of historical notes here. Every major release requires a complete README audit; smaller changes still need corrections when documented behavior changes.

## Live app and repository

- [Main release](https://athan-pwa.vercel.app/)
- [Test launch](https://test-athan-pwa.vercel.app/)
- [Beta address](https://test-athan-app.vercel.app/)
- [GitHub repository](https://github.com/AAAMAQ/big-maq-studio-athan-pwa)

These existing Vercel addresses are retained. Their deployment status can differ; listing an address does not establish that it serves the same or latest build. There is no second GitHub Pages deployment or cross-domain personal-data synchronization.

## Project vision

Athan PWA was created to be a simple, fast, and respectful prayer-time app. Many prayer apps contain ads, unnecessary tracking, complicated screens, or distractions from helping Muslims pray on time.

Our goals remain:

- No ads, user accounts, or advertising trackers.
- A lightweight, familiar interface and local private records.
- Useful daily prayer tools, without unnecessary feature bloat.
- Browser access and home-screen installation on supported devices.
- Accessibility across devices, including older and less powerful phones.

> “we know neither your birthday nor your shoe size and we'd like to keep it that way”

## Navigation and feature guide

The default bottom navigation remains **Home / Prayer / Settings**. Home normally links to Quran, Qibla, More, and Credits. More normally contains Deep Search Athan, City Mode, Iqama Times, Masjid Mode, Salah Tracker, Ramadan Mode, Backup & Restore, and App Guide.

| Root feature | What it does |
| --- | --- |
| Home | Hijri/source date, primary location and timezone, current prayer, next prayer, countdown, and shortcuts |
| Prayer Times | Daily six-time schedule and its monthly timetable |
| Settings | Language, time format, primary source, calculation settings, calendar reminders, local data, PWA status, and optional modes |
| Quran | Arabic/translation reader, Quran hub, verse lookup, progress, saved Surahs, bookmarks, and reader settings |
| Qibla | Simple/Advanced compass guidance, Ka‘bah bearing, heading, distance, and optional haptics |
| More | The standard or customized collection of feature shortcuts |
| Credits | Credits, support/share actions, Privacy, Vision, Need Help, and Developer Notes |
| Deep Search Athan | Search locations, choose dates/calculation settings, preview schedules, and export detailed calendar events |
| City Mode | Saved city profiles, calculation choices/corrections, imported yearly timetables, previews, and timetable/calendar exports |
| Iqama Times | Independent fixed/offset Iqama rules, selected prayers, saved-masjid rules, previews, and calendar export |
| Masjid Mode | Named masjid profiles, linked city sources, Iqama rules, Jumu‘ah slots, sharing, and profile-based export |
| Salah Tracker | Private day logging and notes, plus separate Insights, Search, and Graph destinations |
| Backup & Restore | Personal local-data export/import and explicit app-data reset |
| Ramadan Mode | Manual Ramadan/Eid dates, Fajr/Maghrib countdowns, fasting statuses, and notes |
| App Guide | Existing introduction and practical navigation guidance |
| Feature Hub | Full root catalog and access to features missing from your shortcuts |

Monthly view belongs to Prayer Times; Quran Settings belongs to Quran; Salah Insights/Search/Graphs belong to Salah Tracker. They are not separate customizable roots. Moving a root shortcut does not remove any of its child controls.

### Custom Layout

Open **Settings → Performance & App Layout → Edit layout & feature priorities**. Custom Layout is **off by default**, independently of Performance Mode.

- Home remains the first navigation destination. Choose zero to four distinct extras, for five buttons maximum.
- Prayer and Settings can be replaced or reordered. When Settings is absent, a protected button appears at Home’s top right.
- Add, remove, and reorder optional Home and More shortcuts using accessible move buttons; dragging is not required.
- The same feature may appear on different surfaces, sharing the same screen and data. A single list does not repeat a destination.
- Home’s prayer preview, date/source information, and timezone context cannot be removed.
- Protected Feature Hub access remains on custom Home and More, including when optional lists are empty. Settings also exposes the full catalog.
- Preview does not apply a draft. Save applies the layout; Cancel discards unsaved layout edits. Reset prepares the standard layout as a draft until saved.
- Turning Custom Layout off restores the normal presentation without discarding saved custom lists.

Feature Hub can open a hidden root directly or add it to Home/More. Adding there explicitly enables Custom Layout. No feature or records are deleted by hiding a shortcut.

### Performance Mode and dormant features

Performance Mode is **off by default** and independent of Custom Layout. It changes preparation/loading policy, not the interface or feature set. The optimized policy prepares selected priority roots rather than proactively preparing every screen. On-demand screen loads remain available.

Priority means code readiness after Home has an opportunity to render—not mounting a screen, continuous background operation, requesting permissions, or downloading Quran content. Choose priorities and save them separately from layout edits.

Custom-hidden features can also defer preparation without Performance Mode. Required data from a hidden City/Masjid editor remains usable as a prayer-source dependency. Leaving a screen cleans up screen-owned temporary activity; saved data and downloaded text remain.

“Deep sleep” is a practical label for deferred first loading and stopped unnecessary activity. JavaScript modules already imported may remain in memory. Browser disk caching is not the same as executing code in memory. No zero-crash guarantee or fixed performance percentage is claimed; real older-device testing remains important.

### Universal Settings disclosure

Every user gets independent **− / +** controls for Preferences, Primary prayer time source, Prayer calculation, Calendar reminders, Local data, PWA status, and Performance & App Layout. Sections initially expand; their preferences persist locally and in backups.

Collapse is ordinary visual organization, **not dormancy**. It preserves editing state and already-started exports/update checks.

## Prayer times and primary sources

The daily schedule includes Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha. Home and Prayer Times follow the **same primary source** selected in Settings: a saved City Mode profile, or current device location when none is selected.

Ordinary prayer times use the Adhan calculation library locally once coordinates/settings are available. Settings supports Auto country defaults and Manual overrides, calculation method, Shafi/Hanafi Asr timing, and high-latitude rule. Auto defaults are a starting point, not a replacement for a trusted local timetable.

When a saved city is primary, City time is the default display. **City time / Device time / UTC** is chosen in Settings. Date/Friday labels and next Fajr follow the source’s local date; display labels make the timezone explicit. Selecting a city in another country must not silently present device clock time as that city’s clock.

Prayer methods can legitimately differ in Fajr/Isha angles, Asr rules, rounding, or high-latitude treatment. Compare with your local masjid or Islamic authority. The app is a utility, not a religious authority.

### City Mode and imported timetables

Search or manually enter cities, save/rename/duplicate profiles, choose country Auto settings or a Manual method, and keep personal correction offsets without overwriting built-in defaults. Date-range previews can be exported as ICS, CSV, or shared plain text; profile sharing is a separate explicit action.

For published mosque calendars, import **`.xlsx`, `.csv`, or `.json`** with at least **300 Gregorian dated rows** and Date, Fajr, Sunrise, Dhuhr/Zuhar, Asr, Maghrib, and Isha values. School-specific Asr/Isha columns are supported. Verify the parsed dates/times against the source before setting the profile as primary. Imported rows feed previews, primary prayer screens, linked Masjid schedules, and exports. Missing required rows produce feedback rather than silently inventing a mosque timetable.

### Deep Search Athan

Search a city, country, or coordinates such as `London`, `Makkah Saudi Arabia`, or `21.4225, 39.8262`. Choose a date range, calculation method, madhab, event inclusion, and reminder offset; preview before export. These selections are separate from main prayer defaults. An optional second alert can add another minutes-before alarm to each included event.

Location/timezone/timetable lookup uses external services and can need internet even when the installed app shell opens offline.

### Iqama Times and Masjid Mode

Standalone **Iqama Times remains independently usable**. Configure fixed times or minutes-after-Athan rules, choose included prayers, load saved masjid rules where desired, preview, and export a range. Its existing device-location workflow and 10-minute calendar alert remain intact. Its optional Friday reminder retains the existing time controls.

Masjid Mode stores named profiles with Iqama rules and configured Jumu‘ah slots. **Export Iqama Times** uses the selected profile, identifies the masjid in calendar metadata/filename, and includes configured Jumu‘ah slots only on applicable Fridays.

The Athan source is the linked City Mode profile, preserving its calculation settings/corrections or imported timetable. With no link, the UI explicitly identifies the fallback to **current device location and prayer settings from Settings**. A missing linked profile is an error to resolve, not permission to use another city or masjid silently. Profile exports keep the established 10-minute alert.

### Ramadan Mode

Set Ramadan start and Eid dates manually. Record today’s Fasted, Missed, Makeup, or Not set status and notes; view Ramadan/Eid and Suhoor/Iftar countdowns. Its Fajr/Maghrib countdowns currently use **device location**, not a saved primary city. Ramadan dates do not come from an automatic Islamic-calendar API. Normal Home retains its conditional Ramadan entry; Custom Layout follows the chosen shortcut list.

## Quran reader and Qibla

### Quran

Read Uthmani Arabic with the selected translation, use Arabic-only/bilingual views and font sizing, browse Surahs/Juz, find verses, save Surahs, and bookmark ayahs. Continue Reading, recently read, and per-Surah last-read positions use local reading progress.

**Set as last read** records the chosen verse again even during a reread. **Complete Surah**, at the end of the reader, explicitly records completion. Completion and last-read position are separate; opening a saved position resumes after content has loaded.

Quran Settings provides translation choices with a sample, bookmark controls, and **Download All Surahs / Resume Download** for Arabic text plus the selected translation. Removing downloaded text retains bookmarks/progress. Choosing another translation may require another download.

**No Quran audio playback/download feature is connected to the current reader.** Text downloads do not download recitations. No all-Surah audio package or offline audio was added in v4.

### Qibla

Qibla attempts location on opening and reuses available permissions. Retry controls remain when automatic startup cannot complete. Simple Mode offers turn/alignment guidance, distance, and optional vibration; Advanced Mode exposes bearing and verified device heading.

iPhone uses its dedicated browser compass heading; supported Android paths use Earth-referenced absolute heading. Relative-only motion is not displayed as North. Initial iOS motion permission can require a tap; support varies by browser/device. Desktop machines often lack compass sensors. Sensor calibration, magnetic interference, location accuracy, and permissions affect results. Desktop/mocked tests do not replace physical-phone verification.

## Private Salah Tracker

Daily logging keeps Fajr, Dhuhr, Asr, Maghrib, and Isha prominent, with **Completed / Missed / Not logged**. Unknown is not a recorded miss. Mark All and Clear All affect only the five obligatory prayers; optional Sunnahs stay separate. Each day has a private note.

Insights, Search Salah Progress, and Graph Insights are separate destinations. Periods include This week, This month, Last 30 days, All recorded time, selected month, and custom dates. Week boundaries follow the existing tracker convention (Sunday start); future days are excluded.

### Stars versus existing statistics

| Measure | Definition |
| --- | --- |
| Daily stars | One star per completed obligatory prayer, always `x/5` |
| Period stars | Total completed prayers / `5 × elapsed calendar days` |
| Average stars | Total stars / elapsed calendar days, shown out of five |
| Completion rate | Completed / logged prayers; logged means completed or missed |
| Verified streak | Consecutive calendar days completed for that prayer; missed and missing/unlogged days break it |

Example: **3 completed, 1 missed, 1 unlogged = 3/4 logged (75%), but ★ 3/5 stars**. For stars, missed and unknown both earn zero; unknown records are never changed into missed records. Blank elapsed days lower the star average. No overall grade is assigned.

The calendar keeps its completed/logged fraction, with `★ x/5` beneath it. Future cells are neutral. Period summaries show total/capacity, average/day, and logging coverage; all-time starts at the earliest applicable obligatory record instead of adding pre-tracking years.

Per-prayer insights show completed/logged counts, contextual percentages, current streak ending at the selected range’s last day, and longest streak within the range. Summaries compare consistency with coverage, improvement with the immediately preceding equal-length period, fully completed days with fully logged context, and weekdays using logged records. Graphs retain completion bars and weekly/monthly line trends; no logged data creates a gap rather than a zero-rate miss.

### Salah search language

Searches return **days**, not individual prayers. Names are case-insensitive; prayer aliases include common spellings such as Dhuhr/Duhur and Maghrib/Magrib. Numbers **1–5** mean Fajr, Dhuhr, Asr, Maghrib, Isha—not star counts.

| Query | Meaning |
| --- | --- |
| `fajr` or `1` | Fajr completed, regardless of the other prayers |
| `!fajr` or `!1` | Fajr explicitly missed |
| `~fajr` or `~1` | Fajr not logged |
| `/fajr` or `/1` | Fajr missed or not logged |
| `fajr&dhuhr` | Both completed |
| `!2,!3` | Dhuhr or Asr explicitly missed |
| `[fajr&dhuhr]` or `[1&2]` | Only these prayers completed; others may be missed or unknown |
| `(notes)` / `(note)` | A non-whitespace daily note exists |
| `(!notes)` | No note |
| `(notes)&!fajr` | Note present and Fajr missed |
| `(logged5)` | All five completed or missed |
| `(!logged5)&(26y)` | Fewer than five logged in 2026 |
| `(star3)` / `(stars3)` / `done3` | Exactly three completed prayers, fixed daily capacity five |
| `(star(3-5))` / `done3-5` | Three–five completed prayers |
| `(logged(3-5))` | Three–five recorded prayer statuses |
| `(mon)` / `(Monday)` | Mondays |
| `(mon)&((logged5),(notes))` | Mondays that are fully logged or contain notes |
| `(last30days)&fajr` | Fajr completed today or during the preceding 29 dates |

`&` is AND; comma/semicolon are OR. AND binds before OR; parentheses explicitly group conditions. `A&(B,C)` distributes like `(A&B),(A&C)`. Square brackets are reserved for exact completed-prayer sets—not arbitrary attribute groups. `!` can negate notes/counts/weekdays/relative predicates, but prayer `!` retains its explicit-Missed meaning. `~` and `/` apply to prayers.

#### Dates and inclusive component ranges

- `Oct.30`: every October 30 across recorded years.
- `2026y.6m.23d`, `6m.2026y.23d`, and `23d.Jun.26y`: June 23, 2026.
- `5m`: May in any year; `5m.26y`: May 2026; `2026y`: dates in 2026.
- `June`, `Jun`, and `6m` are month aliases. Two-digit years mean **2000–2099**.
- When two components are identified, one exact numeric component can be inferred: `10m.23d.26` and `10.23d.2026y` both identify October 23, 2026. The special `Oct.23` form means day 23, not year 2023.
- `(23d.06m.2026y)&fajr`: the date plus Fajr completed.
- `((1-15)d.Jun.26y)&fajr`: June 1–15, 2026 with Fajr completed.
- `((2-5)m.(21-30)d.(25-26)y)`: February–May, days 21–30, in 2025–2026. Components apply together, **not** one continuous interval. Nonexistent dates are not generated.
- `(star(3-5))&((25-26)y)`: three–five stars in 2025–2026.

Range components require their `m`, `d`, or `y` label and may be reordered. Impossible exact dates, reversed/out-of-bounds ranges, duplicate components, and ambiguous input produce errors.

Default scope is recorded dates through today. An explicit fixed date range can also include blank dates; negative notes or zero-count filters never manufacture an unlimited calendar. Queries and explicit ranges are bounded for lightweight operation (2,048 query characters; approximately ten years per bounded range).

#### Saved/recent searches and result summaries

Save a valid query with a name, reopen it, rename it, or remove it. Stored definitions rerun against current records—no copied history. Up to 30 named searches and eight recent valid queries are retained; examples/suggestions are local.

Saved fixed scopes preserve From/Through and the blank-date choice. `last30days` rolls when reopened; if combined with a fixed scope, both restrictions apply. Recent queries reuse the **current** scope rather than restoring a saved date range.

Results show matching days and completed/missed/not-logged totals summing to five per result. Result stars have matching-day capacity; they are not an average over the whole selected calendar period. Tap a result to open its day in Tracker.

## Calendar reminders (.ics)

Settings, City Mode, standalone Iqama, Deep Search Athan, and Masjid Mode use a **shared event model, serializer, and download helper**. It supports escaped/folded text, calendar metadata, stable UIDs, duplicate-UID handling, UTC or floating local timestamps, and independent alarms including event-time alerts.

| Exporter | Preserved choices and behavior |
| --- | --- |
| Settings | Primary source, 1/7/30/365-day choices, regular six prayer-time events, chosen reminder offset, optional second alert, fixed Isha, Friday Jumu‘ah, and private Salah review |
| Deep Search Athan | Searched source, event inclusion, custom range/calculation context, explicit UTC instants, chosen reminder and optional second alert |
| City Mode | Selected profile, date range, six events/day, existing 10-minute alert |
| Standalone Iqama | Rules, selected prayers, range, Friday option, device-location workflow, existing 10-minute alert |
| Masjid Mode | Selected profile’s rules/Friday slots, linked city or explicit fallback, range, existing 10-minute alert |

Settings and Deep Search use rich prayer descriptions with location/source, calculation method, madhab, and timezone/offset context. Settings follows the primary source, including saved corrections/imported timetable rows. Regular events use UTC instants; calendar apps may display the same instant in a traveling device’s timezone. Other exporters retain their established floating/UTC semantics rather than silently changing schedules.

The optional **Review today’s Salah Tracker** reminder is configured in Settings, not downloaded from Tracker. Its neutral title/description never includes history or notes. Include it explicitly in Settings exports or export without it. Fixed Isha/Jumu‘ah/review events keep their own existing single-alert behavior; the second-alert option applies to regular prayer-time events.

Import the file into your calendar app. **Calendar apps—not a PWA timer—deliver alerts after the app closes.** Permissions, notification settings, import behavior, and alarm support depend on that calendar. Re-exporting does not automatically update existing imports; use a separate Athan calendar and replace old events/files as appropriate to avoid duplicates.

## Installation, offline use, and updates

- **iPhone/iPad:** Safari → Share → Add to Home Screen → confirm.
- **Android:** supported browser → Install app/Add to Home screen, or the offered install control.
- **Desktop:** supported browsers may expose an install icon in the address bar.

A successful online visit and service-worker caching can make the app shell/features available offline. Installation alone is not proof every resource was cached. Feature code cached on disk can still remain unexecuted until opened. Local Salah records/preferences and local calculations do not require uploading history.

Internet can still be needed for first app access, uncached files/translations, location search/reverse geocoding, timezone lookup, and Deep Search timetables. Device location permission is separate from internet access; geolocation availability depends on the platform. One reachable service does not establish that Vercel or another API is reachable.

Use Settings → PWA status to inspect the loaded version and check for updates. Failed checks retain the current usable app/offline files; updates do not intentionally erase personal records or Quran caches. Screen failures offer retry and safe Home/Settings/Hub navigation instead of blanket data clearing. An installed PWA can still encounter uncached resource failures or browser storage eviction.

## Backup, restore, reset, and privacy

Personal JSON backups include prayer settings/reminders, saved city/manual timetable and masjid profiles, Salah logs/notes, Ramadan records, Quran bookmarks/progress/preferences, layout order/visibility, section expansion, Performance Mode/priorities, and saved/recent queries. Store backups carefully: **they contain personal records**.

Restore validates new known preferences and keeps older backups compatible. Backup format version and app release version are separate. On fresh installations, missing new preferences use normal defaults. Import is not an automatic synchronization service. Reset layout changes only layout; explicit app-data reset targets Athan’s allowlisted local data, not unrelated websites. Downloaded Quran text has its own removal control.

Backups contain Quran offline **metadata**, not Cache Storage response files. Restoring metadata on another device does not restore downloaded Arabic/translation text; download it again if needed. Browser data clearing, uninstall behavior, storage limits, and domain changes can affect local records—export a backup first.

**Share Your Defaults is not a personal backup.** It shares the supported calculation/reminder defaults, not Salah logs, daily notes, tracker-review preferences, layout/performance/disclosure preferences, saved/recent queries, Quran progress, or personal profile/location data. City/Masjid/timetable sharing is a separate deliberate action and includes the profile information the user chooses to share.

No accounts, ads, advertising trackers, or tracker-history uploads are added. Personal records stay locally by default. External services can receive requested locations, dates, selected translation/calculation information, and normal network metadata needed to return requested content; “local history” does not mean the app never makes network requests.

## External services and credits

- **OpenStreetMap contributors / Nominatim:** location search and readable place names. Location data © OpenStreetMap contributors.
- **TimeAPI:** timezone resolution for searched coordinates when needed.
- **AlAdhan:** Deep Search prayer timetables.
- **AlQuran Cloud:** requested Quran Arabic/translation content.
- **Adhan calculation library:** local prayer calculations.
- **React, TypeScript, Vite, Tailwind CSS, vite-plugin-pwa, and spreadsheet import dependencies:** application/build tooling.

See Credits inside the app for acknowledgments and support links. External-service availability and browser capability vary; compare prayer times/Qibla with trusted local guidance when unsure.

## Development

Install Node.js/npm compatible with the repository’s dependencies. From the checkout:

```sh
npm ci
npm run dev
```

Checks and production preview:

```sh
npm run test:run
npm run lint
npm run build
npm run preview
```

The build runs TypeScript and Vite and generates the PWA assets. Tests cover pure search/stats, calendar output, backup/privacy, loaders/recovery, and UI behavior. Development-server checks do not prove production offline caching; verify that against a production build. Browser throttling/mocked permissions are supporting evidence, not real low-RAM phone or physical compass testing.

Development remains on the existing Git/Vercel workflow. Version/date metadata, Developer Notes, Credits, and the README must agree with the delivered build. Planning/runbooks and verification limitations must not be represented as completed implementation evidence.

## Support

Read **Credits → Need Help** for troubleshooting, method guidance, Quran/bookmark behavior, and calendar-import steps. Feedback/bug reports should describe the device, browser, and issue; avoid sending private worship records unnecessarily.

Feedback contact: **aaa.maq.contact.us@gmail.com**.

Support is optional through the Credits page’s project-support link. Athan PWA is community-focused, not ad-driven; contributions help development, testing, hosting, and improvements without making the app’s daily purpose more complicated.

## Copyright

The content of this software is copyrighted by BiG MAQ Studio.

Unauthorized reproduction, redistribution, copying, modification, or distribution of the software code, design, documentation, branding, or accompanying materials is prohibited without the explicit permission of the copyright owner.

This includes, but is not limited to:

- Copying the source code into another project
- Republishing the app under another name
- Redistributing modified versions without permission
- Using the app branding, text, or design without permission
- Selling or repackaging the software as another product

© BiG MAQ Studio. All rights reserved.

## Final note

Athan PWA was built to help Muslims pray on time with a clean, lightweight, privacy-respecting experience. The aim is simple: a useful Islamic web app without ads, unnecessary tracking, or distractions.

May Allah accept it, make it beneficial, and allow it to help people remember their prayers on time.
