# Need Help

Current guide for Athan PWA v4.0.2 — Clearer Qibla & Quick Refresh. Updated October 9, 2026 (Asia/Shanghai).

This mirrors the current in-app guide. The separately archived old guide is historical reference only. Open Need Help directly from Feature Hub, Search app, Credits, or a custom shortcut.

Assalamu alaikum. Need a hand with Athan? Start with your first prayer schedule, or search for the topic you need. We’ll walk through the controls, explain what they mean, and help you troubleshoot without risking your saved records.

## Topics

- [Start here: your first prayer schedule](#getting-started)
- [Install the app and use it offline](#downloadapp)
- [Find features: Hub, Search and More](#navigation)
- [Prayer source, city time and travel](#location)
- [Calculation settings and mosque differences](#calculation)
- [City Mode: save and reuse a prayer source](#cities)
- [Import a mosque’s yearly timetable](#manual-timetable)
- [Deep Search Athan: a separate location and range](#deep-search)
- [Calendar reminders: export and import safely](#downloadics)
- [Iqama Times and Masjid Mode](#iqama-masjid)
- [Salah Tracker: log a day and write notes](#salah-logging)
- [Understand stars, insights, graphs and streaks](#salah-stars)
- [Search Salah progress: simple terms to advanced combinations](#salah-search)
- [Quran: read, resume, bookmark and download text](#quran)
- [Qibla: location, compass and accuracy](#qibla)
- [Customize layout, Salah Brief and Performance Mode](#layout-performance)
- [Ramadan Mode](#ramadan)
- [Backups, sharing, storage and updates](#backups-offline)
- [Quick troubleshooting and contact](#troubleshooting)

<a id="getting-started"></a>

## Start here: your first prayer schedule

Choose a source, check its timezone, and compare with your local timetable.

Assalamu alaikum, and welcome. Whether you are setting up Athan for the first time or looking for one specific button, you do not have to learn everything at once. Start with your prayer source below, then open whichever topic helps you today.

1. Open Settings from navigation, or Home → the top-right four-square Feature Hub → Settings. Need Help is also a main feature in that Hub.
2. Under Primary prayer time source, choose Current device location or a saved City Mode profile. For device location, allow location access when the prayer screen requests it; use its retry control if needed.
3. Check Prayer calculation. Auto uses a country profile as a starting point; Manual lets you select a method, Asr timing and high-latitude rule.
4. Open Home or Prayer Times. Check the location, date, timezone and displayed schedule before relying on it. Prayer Times also has Monthly view.
5. Compare several prayers against a trusted local masjid timetable. If necessary, adjust a City Mode profile or import the published yearly timetable; see the source and timetable sections below.

- No account is required. Personal records and preferences stay on this installation. Optional Custom Layout and Performance Mode start off; you do not need either to use the app.

In-app action: **Open Settings**.

<a id="downloadapp"></a>

## Install the app and use it offline

Add Athan to your Home Screen; understand what still needs a connection.

1. Visit the app online once and allow it to load successfully.
2. On iPhone or iPad, use Safari → Share → Add to Home Screen. On supported Android or desktop browsers, use the browser’s install option, or the install control in Settings when available.
3. Open the installed app to confirm it works. Settings → PWA status shows the loaded version and offers Check for update.

- Installation alone does not prove every file or Quran translation has been cached. Offline support depends on resources already saved by this browser.
- Local tracker records and local prayer calculations do not require uploading history. Uncached screens/text, online place and timezone searches, Deep Search timetable requests, and updates can need internet.
- The app host and external APIs are different connections. One may be reachable while another is unavailable. Use cached features when a service cannot be reached.
- Changing browser, device or website address creates a separate storage context; records do not automatically follow. Export a personal backup before moving.

### Android: install from Chrome

1. Open the Athan website in Chrome and wait for it to finish loading.
2. If an Install App or Add to Home Screen banner appears, tap it. If no banner appears, open Chrome’s three-dot menu and look for Install app or Add to Home screen; wording depends on your browser version.
3. Confirm the install/Add prompt. Look for the Athan icon on your Home Screen or app launcher, then open it to check that the app loads.

- No banner? That alone does not mean the app is broken. Use the browser menu or check Settings → PWA status for the available installation control.

### iPhone and iPad: Safari workflow

1. Open the Athan website in Safari and allow it to load.
2. Tap Share—the square with an upward arrow. Its position varies with Safari’s toolbar layout.
3. Scroll through the Share menu and choose Add to Home Screen. If necessary, use the menu’s editing options to find that action.
4. Review the name, then tap Add. Open the new Athan icon from your Home Screen.

- Safari → Share → Add to Home Screen → Add is the documented workflow here; a missing Android-style install banner on iPhone is expected.

### Which website should I install?

Use the address where you intend to keep your records. The existing main release and test launch are listed below; a test address is for trying builds and is not a promise that both sites run the same version.

After a successful online load and caching, saved app files can work offline, InshaAllah. Quran text downloads are separate—see the Quran topic before expecting an entire translation offline.

- [Main Athan release](https://athan-pwa.vercel.app/) (opens website)
- [Existing test launch](https://test-athan-pwa.vercel.app/) (opens website)

In-app action: **Open Settings for install/update status**.

<a id="navigation"></a>

## Find features: Hub, Search and More

Browse main screens or search directly for a feature, child screen or Surah.

Home’s top-right four-square icon opens Feature Hub: a navigation-only list of main features, including Settings and Need Help. It has no layout-editing controls. Home’s top-left magnifying glass opens Search app with predictive suggestions.

- Search app can find hidden main features, Monthly Timetable, Salah Insights/Search/Graphs, Quran Settings, Surahs and Juz destinations. It searches local names and aliases—not your notes or worship history.
- Search Salah Progress is different: it filters your private tracker days using prayer/date/status queries. Quran Verse Search is another separate tool inside Quran.
- More contains the standard or customized shortcut collection. Hiding a shortcut never removes a feature or its records. Credits → Need Help remains available too.
- On Fridays, Home displays Jumu’ah Mubarak and Prayer Times visually labels Dhuhr as Jumu’ah. These labels do not calculate your masjid’s congregation time; use its saved Jumu’ah slots or timetable for that.

In-app action: **Open Feature Hub**.

<a id="location"></a>

## Prayer source, city time and travel

Understand why a saved city’s time can differ from your phone’s clock.

1. Open Settings → Primary prayer time source and select the intended city or Current device location.
2. For a saved city, choose Prayer time display: City time, Device time or UTC. This changes the display, not the prayer instant.
3. Read the source/date/timezone information on Home and Prayer Times. Monthly view follows the display preference too.

- A selected saved city remains the primary source even when your phone is elsewhere. Current device location instead follows the device’s acquired coordinates; location permissions and availability are separate from choosing a saved city.
- Example: Chennai’s 5:59 PM at UTC+5:30 is the same instant as 8:29 PM at UTC+8:00. Device time can therefore look different without the underlying prayer instant being wrong.
- If a saved-city timezone is unavailable, heed the fallback information rather than assume the shown device clock is city-local time. Recheck the city/profile/location information.
- Qibla uses your physical device location, not a remote saved city: the direction you need is from where you are standing.

### Get a better location fix after travelling

1. If you want times where you are now, explicitly select Current device location—or save/select the new city. A previously selected remote city intentionally stays selected.
2. Allow location for this site in your browser settings. If a location request failed, use the retry control shown by the affected prayer or Qibla screen.
3. Try near a window or outdoors when your reported location is unsuitable; phones and desktop browsers can obtain location in different ways.
4. Recheck the source, date and timezone, then compare with the new community’s timetable. Export a fresh calendar if you want reminders for that source.

- Changing tabs or websites does not repair faulty location hardware. Comparing another device can help distinguish a device problem from a source/settings problem.
- Manual location entry is available through City Mode. You do not have to grant device location just to view a correctly configured saved city; Qibla still needs your physical location.

In-app action: **Open primary-source settings**.

<a id="calculation"></a>

## Calculation settings and mosque differences

Choose settings deliberately; Auto is a starting point, not an official local ruling.

- The app is a practical tool, not a replacement for local religious guidance. It cannot certify that a guessed method or imported transcription matches your masjid.

### What the controls mean

- Calculation method affects Fajr/Isha conventions and other method-specific settings. Select the method used by your trusted local community rather than assuming one country label fits everyone.
- Asr timing selects earlier Shafi/standard or later Hanafi timing. Method and Asr timing are separate controls; selecting Karachi does not by itself mean you selected Hanafi Asr.
- High-latitude rule handles conditions where ordinary twilight calculations become difficult. Use the convention appropriate to the local timetable; ask your masjid when uncertain.
- Auto uses the app’s country profile. Manual lets you choose explicitly. A saved City Mode source has its own calculation settings or imported timetable; changing device defaults does not silently rewrite every saved profile.

### Calculation methods: names and regional reference points

These settings are calculation conventions, not changes to your aqeedah. The names below can help you recognize a timetable, but they are not universal national defaults or religious recommendations. Start with Auto or your saved choice, then ask your local masjid which convention its timetable follows.

| Method | Reference point—not a guaranteed local match |
| --- | --- |
| Muslim World League (MWL) | An international convention; check your local timetable. |
| Umm al-Qura (Makkah) | Makkah / Saudi Arabia. |
| Egyptian General Authority | Egyptian survey convention. |
| University of Islamic Sciences, Karachi | Karachi / Pakistan; Asr school is a separate choice. |
| Dubai | UAE-oriented preset; not a certified official timetable. |
| Qatar | Qatar convention. |
| Kuwait | Kuwait convention. |
| Moonsighting Committee | MCW convention, including North American/UK usage. |
| North America / ISNA | ISNA convention for North America. |
| Singapore | Singapore-related convention. |
| Tehran | University of Tehran / Iran. |
| Turkey | Approximation of Diyanet’s Turkey convention. |

- An app preset is not a substitute for an official calendar. In particular, do not assume Turkey’s approximation matches communities outside Turkey, or that Dubai means every published UAE timetable.
- A few minutes of difference can come from conventions, offsets or rounding. A large difference deserves a source/timezone/settings check, not random adjustments. If you cannot ask locally, look for your city’s mosque or authority’s published timetable and method information.

- [Adhan library: methods and parameter reference](https://github.com/batoulapps/adhan-js/blob/develop/METHODS.md) (opens website)
- [AlAdhan: calculation-method explanations](https://aladhan.com/calculation-methods) (opens website)

### Asr: what earlier and later mean

In the usual calculation model, earlier Shafi/standard Asr uses an object’s height plus its shadow at solar noon; later Hanafi Asr uses twice its height plus that noon shadow. For a one-metre object, that is one or two additional metres beyond the noon shadow—not simply one or two metres total.

This Asr setting selects how the app calculates Asr. It does not choose a different Fajr or Isha method. Match the practice/timetable followed by your community rather than changing it to force a preferred clock time.

- [PrayTimes: Asr calculation explanation](https://praytimes.org/docs/calculation) (opens website)

### High-latitude rules: the three controls in this app

In northern/southern regions with very short summer nights, twilight can persist and ordinary Fajr/Isha angles may not produce usable times. These controls bound those calculations; they do not simply move every prayer to midnight.

- Middle of the night: uses half the sunset-to-sunrise night as the limiting portion for Fajr/Isha.
- Seventh of the night: limits Isha using the first seventh after sunset and Fajr using the final seventh before sunrise.
- Twilight angle: derives the limiting night portion from each prayer’s twilight angle divided by 60; it is not a nearest-latitude selector.
- Some calculation methods have additional special handling. For your region, follow a trusted timetable or local guidance instead of assuming one rule is always best. These settings do not guarantee a solution for every polar-day/polar-night condition.

- [Adhan library: high-latitude rules](https://github.com/batoulapps/adhan-js/blob/develop/METHODS.md#highlatituderule) (opens website)

### When times do not match

1. First check source, city coordinates, date and timezone. A timezone/display difference is not a correction-offset problem.
2. Compare several dates with the published Athan timetable, not the masjid’s later Iqama time.
3. Check method and Asr timing. For small intended minute corrections, use a City Mode profile’s positive/negative offsets without changing built-in country defaults.
4. For a mosque’s varying yearly schedule, import its exact timetable instead of trying to fit every date with one offset.

In-app action: **Open prayer calculation**.

<a id="cities"></a>

## City Mode: save and reuse a prayer source

Create a profile, adjust it, and make it the primary source.

1. Search for a place, or add a city manually with the required location information.
2. Name the profile clearly. Review its country, coordinates, timezone and calculation choices; apply personal minute corrections only when intended.
3. Save the profile. Use its preview to check dates before exporting its timetable or calendar.
4. To use it on Home and Prayer Times, select it in Settings → Primary prayer time source.
5. Duplicate a profile before experimenting if you want to preserve the original arrangement.

- City Mode can export ICS, CSV and a readable plain-text timetable. A profile-sharing action deliberately shares that profile’s information; it is not a personal backup.
- Renaming or editing a profile does not create a new mosque authority or verify its times. Check against your intended local source.

In-app action: **Open City Mode**.

<a id="manual-timetable"></a>

## Import a mosque’s yearly timetable

Prepare a local file, validate it and activate the saved source.

### Prepare the file

1. Obtain the official timetable and transcribe its actual Gregorian dates/times. Do not guess unreadable values. If a tool converts photos or a PDF, check its transcription yourself.
2. Use .xlsx, .csv or .json, no larger than 5 MB, containing at least 300 valid dated rows. A complete year usually has 365 or 366.
3. Include Date, Fajr, Sunrise, Dhuhr (Zuhar is accepted), Asr, Maghrib and Isha. Use consistent 24-hour or AM/PM times.
4. For Excel, put dated rows together on one sheet, preferably All Days. For CSV, use a header row. JSON accepts an array, or an object with prayerTimes, data or rows; supported location metadata may be included.

- Separate Asr Shafi/Asr Hanafi and Isha Shafi/Isha Hanafi columns are supported when supplied. Review which values the selected profile uses.

### Printed calendars and a ready-to-copy prompt

Photograph each month straight-on in good light. Make sure every date/time is visible, with no cropped edges, reflections or shadows hiding numbers. You can type the data yourself, or choose a conversion tool you trust.

Select and copy the prompt below if you want a tool to help. Sending photos to that tool is your separate choice; Athan does not upload your calendar for you. Avoid including private notes or other personal information in those photos.

> Create a yearly Gregorian prayer timetable from these monthly prayer-calendar photos as an .xlsx, .csv, or .json file. Use one row per date and the columns Date, Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha. Preserve every printed time exactly, include AM/PM or 24-hour times consistently, do not estimate missing values, and flag any unreadable cells for me to verify. If the source has separate Shafi and Hanafi times, use Asr Shafi, Asr Hanafi, Isha Shafi, and Isha Hanafi columns. Add all dates to a sheet named All Days when using Excel. For JSON, return an object with optional location, latitude, and longitude fields plus a prayerTimes array containing the same dated records.

- Always compare several dates from different months with the original calendar. The app checks structure, not whether a tool read every photographed number correctly. Remove decorative headings/footnotes inside records if they confuse column recognition.

### Import, verify and activate

1. Create or select the intended City Mode profile; duplicate first if you want to keep its old settings.
2. Under Manual yearly prayer timetable, tap Import Timetable File and choose the file. Check the import confirmation and location information.
3. Save the profile and preview several dates from different months against the original source.
4. Choose this profile in Settings → Primary prayer time source. Optionally link it from a Masjid Mode profile for Athan-based Iqama rules.

- The app processes the file locally, not by uploading it. Structural validation cannot prove a photographed time was copied correctly.
- If rejected, check file size, extension, valid Date rows, required columns and hidden/merged cells. Correct the source instead of inventing missing dates.
- A missing required timetable date produces feedback; never assume the app quietly filled it with the mosque’s official time.

In-app action: **Open City Mode to import**.

<a id="deep-search"></a>

## Deep Search Athan: a separate location and range

Preview a searched schedule without changing your main prayer source.

1. Enter a city/country or coordinates, for example London, Makkah Saudi Arabia, or 21.4225, 39.8262. Choose the intended result.
2. Choose From/Through dates, calculation method and madhab for this search. These choices are independent of your main Settings defaults.
3. Preview the times and check the place, calculation context and timezone before exporting.
4. Choose which events to include and the first reminder offset. Enable the optional second alert only if you want another minutes-before alarm.
5. Download the ICS and import it into a calendar app; the calendar section below explains delivery and duplicate handling.

- Location, timezone or timetable lookup can require external services and a connection. Failure of a lookup does not mean your private tracker records were uploaded.
- Deep Search exports detailed event context and UTC instants. Calendar display can follow the calendar/device timezone, not the city clock shown in the app.

### Where the data comes from

There is no Athan account or app-owned search-history server. Some place results are cached locally to avoid repeating a lookup. External lookup services still receive the requests needed for their feature, including searched places/coordinates, and have their own policies; this does not make those requests anonymous.

Your Salah history and daily notes are not part of those timetable requests. Please compare the returned schedule with your local masjid when travelling or choosing a long export.

- OpenStreetMap contributors / Nominatim: place search, coordinate lookup and readable location names. Location data © OpenStreetMap contributors.
- TimeAPI (timeapi.io): timezone lookup for searched coordinates when needed.
- AlAdhan: timetable requests for the searched location and date range.
- Adhan calculation library: local astronomical calculations elsewhere in Athan, including device-location and calculated city profiles.

In-app action: **Open Deep Search Athan**.

<a id="downloadics"></a>

## Calendar reminders: export and import safely

Settings reminders follow the primary source; your calendar app delivers alerts.

1. Open Settings → Calendar reminders (.ics). Check the export source and timezone before choosing a range.
2. Select Minutes before each prayer. Optionally enable Second reminder for regular prayer-time events and choose its offset.
3. Choose optional separate events explicitly: fixed Isha, Friday Jumu’ah, and Review today’s Salah Tracker. Set their clock times in the displayed source’s local timezone. The Salah review is configured here, not inside Tracker.
4. Tap Save reminder to retain your preferences. Try Export 1 day first; then use 7 days, 30 days or 1 year as needed.
5. Open/import the file using a calendar app that supports ICS. A separate calendar such as Athan Reminders can help keep exported events distinct. Import options vary by calendar.
6. Check an imported event’s time and alert(s), enable notifications for that calendar, and verify a test alert on your own device.

### What does—and does not—update

- The calendar app manages alert delivery after Athan closes. The PWA does not run a background JavaScript timer or guarantee a notification sound.
- Changing a source, method, reminder offset or clock time does not automatically change previously imported events. Export again when those settings change.
- Importing another file can create duplicates. Review the old dedicated calendar/events before replacing them, and keep anything you still need. Replacement behavior depends on the calendar app.
- Settings and Deep Search regular events use UTC instants with detailed source context. Your calendar may display them in the device timezone during travel. Other exporters retain their own established local/UTC semantics.
- Second alerts are optional for regular prayer-time events. Settings’ fixed Isha, Friday Jumu’ah and tracker review retain their separate single-alert behavior. City Mode and Iqama use their established 10-minute alert; do not assume a Settings offset changes those exporters.
- The tracker review event contains a neutral prompt, never your prayer history or notes. Uncheck it to export without it. It cannot automatically know whether you logged today.

### Other ways to remind yourself

Athan does not currently provide native-style background Athan audio or its own prayer push-alert service. Keeping Home open lets you see the countdown, but it is not a dependable closed-app alarm.

You can also set an alarm in your phone’s Clock app using the verified schedule. A repeating fixed alarm will not follow changing daily prayer times automatically—review it when dates, location or timetable change.

For a separate evening review prompt, choose a time that suits you. For example, if your local Isha is 8 PM and Fajr is 5 AM, a 9 PM reminder may be convenient; this is an organizational example, not a ruling on the last permissible Isha time. Check local guidance if you need that religious boundary.

In-app action: **Open calendar reminder settings**.

<a id="iqama-masjid"></a>

## Iqama Times and Masjid Mode

Keep Athan, congregation times and Friday slots distinct.

### Standalone Iqama Times

1. Open Iqama Times from Feature Hub, More, or a custom shortcut. It remains independently usable.
2. Select the prayers, date range and fixed-time/minutes-after-Athan rules. Review the Friday controls when needed.
3. You can load saved masjid rules, preview the result and export with the existing 10-minute alert.
4. Loading/editing rules does not automatically overwrite a masjid profile. Use Save Changes Back to Masjid only when you intend to update that profile.

### Export from a masjid profile

1. Create/select the correct Masjid Mode profile. Save its Iqama rules and configured Jumu’ah slots.
2. Link the intended City Mode profile for Athan times. Its calculation settings, corrections or imported timetable remain the Athan source.
3. Below the selected masjid details, choose Export Iqama Times, set the date range, and review feedback. Configured Jumu’ah slots are exported on applicable Fridays.

- Without a city link, the app explicitly falls back to current device location and prayer settings from Settings, consistent with the standalone Iqama workflow. Do not export until that location/source is suitable.
- A missing linked city profile is an error to resolve, not permission to silently use a different city or masjid.
- These exports preserve the established 10-minute alert and identify the selected masjid in calendar metadata/filename.

In-app action: **Open Masjid Mode**.

<a id="salah-logging"></a>

## Salah Tracker: log a day and write notes

Completed, Missed and Not logged mean different things.

1. Choose a date in the tracker calendar. The tracker’s calendar days follow your device’s local date, separately from a remote city’s prayer display.
2. Record Fajr, Dhuhr, Asr, Maghrib and Isha as Completed or Missed; leave a prayer Not logged when you have not recorded it.
3. Use Mark All or Clear All only for the five obligatory prayers. Optional Sunnahs and daily notes stay separate.
4. Write the selected day’s private note. Changing days lets you view that day’s note and prayer statuses.
5. Use Insights, Search Salah Progress or Graph Insights for reflection without cluttering daily logging.

- No data for this day means there are no obligatory logs—it does not mean five recorded misses. Unknown entries stay unknown.
- Sunnahs can be shown from Settings → Preferences. They never change obligatory stars, completion rates or verified streaks.
- Tracker history and notes remain local. Back them up privately; they are excluded from Share Your Defaults.

In-app action: **Open Salah Tracker**.

<a id="salah-stars"></a>

## Understand stars, insights, graphs and streaks

Stars use five daily slots; completion percentages use logged prayers.

### Two different measurements

Three completed, one missed and one not logged gives ★ 3/5 stars, but 3/4 logged = 75% completion. Both are correct: they measure different things.

- One completed obligatory prayer earns one star out of five. Missed and unknown earn zero stars without changing their stored status. Sunnahs are excluded.
- Period star capacity is five times elapsed calendar days; blank past days reduce the average. Future days are excluded. All recorded time starts at the first applicable obligatory record.
- Logged-only rates use completed ÷ (completed + explicitly missed). If nothing was logged, there is no rate—not 0%. Coverage explains how many dates contain obligatory logs.

### Choose a period and read the charts

1. Choose This week, This month, Last 30 days, All recorded time, a selected month or custom From/Through dates. Weeks start on Sunday.
2. Per-prayer insights show completed/logged counts and current/longest verified streaks. Current streak ends at the latest applicable date in the chosen range; a blank or missed day breaks it.
3. Read consistency and improvement with their coverage/counts. Improvement compares the preceding equal-length period. Full-five days are shown alongside fully logged days; weekday comparisons use logged records.
4. Graph Insights offers per-prayer bars and a trend line. This week plots daily points; longer selections use weekly/monthly trend buckets. Gaps mean no obligatory logs, not missed prayers.

- There is no overall grade. A high percentage with very few logs is not the same coverage as a complete month.
- The optional Home Salah Brief is enabled through Custom Layout. Choose Line graph or Prayer bars in layout settings or the enabled Brief; it uses the same weekly data as Tracker.

### All-five consecutive-day streaks

A full-day run needs all five obligatory prayers explicitly completed on consecutive dates. A missing, missed or unlogged prayer breaks it.

- Search streak:5 means a full run of exactly five days; streak:5+ means five or more; streak:max includes tied longest full runs intersecting your fixed search scope.
- Runs are derived before other query filters. A month/date/notes predicate narrows displayed days, not the underlying run’s length. To find the longest run intersecting October, choose October as the fixed search range.
- Analytics instead reports the longest segment inside its selected period, with date ranges and boundary context. This can differ from the full-run length shown in Search.

In-app action: **Open Salah Insights**.

<a id="salah-search"></a>

## Search Salah progress: simple terms to advanced combinations

Search returns matching days. Start with a prayer name, then combine attributes.

Prayer numbers are 1 Fajr, 2 Dhuhr, 3 Asr, 4 Maghrib, 5 Isha. Names and common aliases such as Duhur/Magrib are case-insensitive. A bare prayer means Completed; !prayer means explicitly Missed, ~prayer means Not logged, and /prayer means either Missed or Not logged.

### Combine conditions

- & means AND. Comma or semicolon means OR. AND binds before OR; parentheses group conditions, just like A&(B,C).
- Square brackets mean ONLY these prayers completed: [1&2]. They are not general brackets for dates, notes, logged counts or missed statuses.
- Use parentheses for other attributes: (notes), (mon), (Jun.26y), (star(3-5)). ! can negate notes/counts/weekdays/relative terms; !prayer keeps its explicit-Missed meaning.
- Join date components with dots and label them d/m/y when needed. Month names identify the month. If two components are identified, the third exact number can be inferred; ambiguous formats and impossible exact dates show an error.

### Scope, saved searches and results

1. By default, search recorded dates through today. Expand Help with search strings for examples without resetting your query.
2. To restrict the calendar explicitly, enable Restrict search to a fixed date range, set From/Through, and choose whether to include days with no records. Blank days only appear within a bounded range.
3. Give a valid query a name and Save search. Reopen it against current records; rename or remove it when needed. A saved fixed scope retains its dates and blank-day choice.
4. Recent queries use your current scope. last30days rolls with today, but a fixed saved scope still restricts it if both apply.
5. Read matching-day completed/missed/not-logged totals and stars. Tap a result to open its calendar day in Tracker.

- Up to 30 saved searches and eight recent queries are kept locally. Query length is limited to 2,048 characters and explicit ranges to 3,660 days.
- Result totals describe matching days, not the entire period’s star average. Saved queries and history are private and included in personal backups, never Share Your Defaults.

### Search examples

- `fajr` — Days when Fajr was completed, regardless of the other prayers. The number 1 is equivalent.
- `!fajr` — Fajr explicitly marked Missed. This does not include unknown entries.
- `~1` — Fajr not logged.
- `/fajr` — Fajr missed OR not logged.
- `1&2` — Both Fajr and Dhuhr completed. Other prayers are unrestricted.
- `[fajr&dhuhr]` — Only Fajr and Dhuhr completed; the other three can be missed or unlogged.
- `!2,!3` — Dhuhr OR Asr explicitly missed, not necessarily both.
- `fajr&(!dhuhr,!isha)` — Fajr completed AND either Dhuhr or Isha missed.
- `Oct.30` — October 30 across recorded years. Oct.23 likewise means October 23, not the year 2023.
- `2026y.6m.23d` — June 23, 2026. Reorder labeled parts freely: 23d.Jun.26y means the same date.
- `5m` — May in every recorded year. June, Jun and 6m are equivalent month aliases.
- `5m.26y` — May 2026. Two-digit years mean 2000–2099.
- `2026y` — Recorded dates throughout 2026.
- `10m.23d.26` — October 23, 2026. With two identified components, the remaining number can omit its label.
- `10.23d.2026y` — Also October 23, 2026: the unlabeled 10 is the missing month.
- `(23d.06m.2026y)&fajr` — June 23, 2026, if Fajr was completed. Group the date before combining prayer filters.
- `(notes)&!fajr` — A nonempty daily note AND Fajr missed. note is an alias for notes.
- `(!notes)` — Days without a non-whitespace note, within the search scope.
- `(logged5)&(26y)` — All five obligatory prayers recorded as completed or missed in 2026.
- `(!logged5)&(26y)` — Fewer than five logged prayers in 2026—not all five logged.
- `(star3)` — Exactly three completed prayers: three stars out of five. stars3 and done3 are aliases.
- `(star(3-5))&((25-26)y)` — Three to five stars on dates in 2025 or 2026.
- `(logged(3-5))` — Three to five prayers recorded as completed or missed; unknown entries do not count.
- `(mon)&((logged5),(notes))` — Mondays with all five logged OR a note. Monday applies to both alternatives.
- `((2-5)m.(21-30)d.(25-26)y)` — February–May, days 21–30, in 2025–2026. This is a component filter, not one continuous date interval.
- `((1-15)d.Jun.26y)&fajr` — June 1–15, 2026 when Fajr was completed. Ranges are inclusive.
- `(last30days)&fajr` — Fajr completed today or during the preceding 29 dates.
- `(streak:5)` — Dates in a full all-five completed run of exactly five consecutive days. A seven-day run does not match.
- `(streak:5+)` — Dates in an all-five completed run of at least five consecutive days.
- `(streak:max)` — Dates in the tied longest full runs intersecting the selected fixed scope, before other query filters.

In-app action: **Open Search Salah Progress**.

<a id="quran"></a>

## Quran: read, resume, bookmark and download text

Last-read position, Surah completion and bookmarks are independent.

### Open and resume reading

1. Open Quran and choose a Surah or Juz. Continue Reading resumes your saved global Surah/Ayah; Recently Read offers recent positions.
2. At a verse, use Set as last read to explicitly save that reading position. You can update it again on a reread—it is not a one-time completion mark.
3. Use Complete Surah at the bottom only when you want to record that you finished the Surah. This is separate from the saved last-read verse.
4. When reopening a saved Surah position, allow its content to load before it scrolls to the verse. A fresh explicitly selected Juz starts at that Juz’s starting verse.

### Make the reader comfortable

This is a scrolling text reader, not a PDF with fixed page numbers. Choose a Surah, then scroll through its ayahs; bookmarks attach to an ayah, not a printed page.

1. Open Quran Settings → Reading view. Arabic + English places the translation with the Arabic; Arabic only keeps the recitation view focused on Arabic text.
2. Use Font size to choose a comfortable reading size. Reading view and font size are saved locally, so this installation remembers your preference.
3. Under Translation / Tafsir, choose Muhammad Asad, Marmaduke Pickthall, Saheeh International or Abdullah Yusuf Ali. The current selector supplies these English translations; its title does not mean a separate tafsir dataset is available.
4. Compare the Al-Fatihah 1–5 sample before settling on the translation you prefer. A sample not already cached needs a connection.

### Search and bookmarks

- Inside Quran, search a Surah name/number or a verse reference such as 2:255 or 2.255. Keyword search covers the currently loaded translation, not an offline full-Quran text index.
- Use the verse’s bookmark control to save or remove that place; use saved/bookmark controls to return to it. Bookmarks and progress stay on this installation.
- Home’s Search app finds Surah/Juz destinations from metadata. It does not search Quran verse text or your private bookmarks.

### Bookmark an ayah, filter the reader, or clear bookmarks

1. At the ayah you want to keep, tap its bookmark control. Tap it again to remove that bookmark.
2. In the reader’s top controls, tap Bookmarks to show bookmarked ayahs for the selected Surah. The button changes to All Ayahs; tap that to restore the full Surah.
3. Use the Quran hub’s saved/bookmark destination to revisit saved places. Saving a Surah is a separate shortcut from bookmarking individual ayahs.
4. If you intentionally want to remove every ayah bookmark from this installation, use Clear Bookmarks in Quran Settings → Reading data (also available in the reader’s saved-place controls). Export a backup first if you may want them back.

- Bookmarks do not sync to another phone/browser automatically. Clearing all bookmarks affects this installation, not somebody else’s device.
- There is no published small bookmark quota in the UI, but browser storage is finite. Do not treat local storage as an unlimited or guaranteed permanent archive.
- Reset Progress, Clear Bookmarks and Remove Download have different purposes: reading positions/completion, saved ayah places, and downloaded text. Choose the intended action rather than resetting everything.

### Reader settings and offline text

1. Open Quran Settings to choose supported reading mode, font size and translation options. Review the sample before selecting a translation.
2. Use Download All Surahs / Resume Download for Arabic text plus the selected translation. Connect while downloading and check the reported status.
3. If you change translation, download that edition too when you want it available offline. Uncached content requires a connection.

- Text downloads do not include recitation audio. No audio playback/download feature is connected to this reader.
- Personal backups preserve Quran settings, bookmarks, progress and offline metadata—not downloaded Cache Storage response files. On another device or website installation, download text again.
- Removing downloaded text is not the same as resetting all records. Read the control and export a backup before clearing browser storage.

In-app action: **Open Quran**.

<a id="qibla"></a>

## Qibla: location, compass and accuracy

The same geographic Qibla calculation, different iPhone/Android compass paths, and honest accuracy limits.

1. Open Qibla. It attempts your physical device location automatically; if that fails, allow location access in the browser/site settings and use Enable Location when shown.
2. On iPhone, Qibla attempts compass permission on every visit and listens for valid headings. Choose Allow if the popup appears. If no popup or live direction appears, tap Enable Compass; iOS may require that explicit tap. The screen stays marked as not live until a heading arrives, even after permission succeeds. The browser/iOS decides whether to ask again; Athan cannot force the popup or permanent permission.
3. Use Simple Mode’s turn/alignment guidance or Advanced Mode’s bearing and heading. An available numeric bearing is not proof the device has a working compass.
4. Move away from magnets, speakers and large metal objects; remove magnetic cases and calibrate according to your device’s guidance. Obtain a better location fix if the reported position is unsuitable.
5. Compare with a trusted local direction/masjid when uncertain; treat low accuracy and unsupported-sensor messages seriously.

- The app accepts a North-referenced heading; relative motion alone is not treated as North. iPhone and supported Android paths use different sensor mechanisms.
- Desktop browsers often lack usable compass hardware even when an orientation API exists. A missing live heading is not fixed by assuming the phone-like compass works.
- Location, sensor accuracy and permissions are different issues. A saved prayer city does not replace the physical location needed for Qibla. No general internet connection guarantees a compass or GPS fix.
- The diagnostic panel below is a last-recorded status snapshot, not a live compass. Open Qibla to refresh its readings.

### How to read the direction

The bearing is the direction from your physical location to the Ka‘bah, measured clockwise from North. For example, 257° is a bearing, not your phone’s current heading.

With a verified heading, hold the phone steadily, screen facing up, away from magnetic attachments. Turn yourself and the phone together, following the turn/alignment instruction until the app indicates alignment. Do not assume a numeric bearing alone makes the top of your phone point correctly.

Simple Mode shows turn guidance, Qibla bearing, available heading and approximate distance in kilometres to the Ka‘bah. Enable Haptic feedback when aligned if you want a short vibration; it depends on browser/device vibration support and is not guaranteed on every phone.

### What is calculated the same on iPhone and Android?

Both platforms use your physical latitude/longitude and the same Ka‘bah coordinates (21.4225° N, 39.8262° E). The app calculates the initial great-circle bearing: the starting direction of the shortest route on a spherical Earth, clockwise from geographic True North. It does not choose a different Qibla formula for iOS or Android, and your saved prayer city, madhab and prayer-time calculation method do not change this bearing.

Your phone’s heading is a separate input: which way the phone is pointing. The app subtracts that heading from the calculated Qibla bearing and wraps the difference to the shortest left/right turn. A numeric Qibla bearing can therefore be available even when compass permission or sensors are not working.

Alignment means the supplied heading is within 5° of the calculated bearing. This is a display threshold, not a promise of ±5° real-world accuracy or a measurement of sensor uncertainty.

### iPhone / iPad: Safari compass and permission

On Apple mobile devices, the app listens for Safari’s deviceorientation events and uses a finite webkitCompassHeading reading, normalized to 0–360°. It does not treat generic relative alpha rotation as a reliable North reference. The device/browser supplies this compass heading; the app does not reproduce Apple’s internal sensor calibration.

Qibla attempts motion/orientation access on opening. Safari/iOS decides whether the native Allow popup appears or an explicit tap is required. If no live heading appears, tap Enable Compass and choose Allow if asked. Permission granted alone does not prove that the compass is working.

Hold the phone flat in portrait orientation for the clearest comparison. The iPhone path uses the supplied compass heading directly, without the Android path’s additional smoothing and screen-rotation conversion. A denied permission, missing heading or unsupported browser can leave the numeric bearing available without a moving compass.

### Android: absolute sensors, fallback and smoothing

On supported Android browsers over HTTPS, the app first tries AbsoluteOrientationSensor. It converts the sensor’s quaternion (a 3D orientation reading) into a horizontal heading for the visible top edge of the screen. If that sensor fails or does not supply readings promptly, it listens for absolute device-orientation events instead.

The fallback accepts only events marked absolute and accounts for available tilt angles and screen rotation. Session-relative motion is rejected rather than pretending the phone’s starting direction is North. A gyroscope that detects rotation alone is not enough to establish a trustworthy compass direction.

The Android path applies circular smoothing to reduce jitter and sudden jumps, and keeps one active heading source rather than mixing competing streams. Smoothing may make movement look steadier or slightly delayed; it does not correct a wrong North reference or guarantee greater accuracy than an iPhone.

Android support depends on the browser, sensor permissions and hardware, including access to the magnetometer. A browser that exposes an orientation API can still fail to deliver a usable compass. The iPhone-style permission popup is not assumed to exist on every Android browser.

### Why accuracy can differ between phones

Neither iPhone nor Android is always more accurate. Different hardware, browser sensor processing, calibration, screen posture and nearby magnetic fields can produce different headings or responsiveness. A live reading means data is arriving, not that the direction has been independently checked.

True North and magnetic North are not identical. The calculated Qibla bearing uses geographic True North; the standard absolute-orientation sensor frame uses magnetic North, while other browser heading references depend on the implementation. This version uses the heading supplied by the browser and does not add its own magnetic-declination correction. Local differences between magnetic and True North can therefore affect alignment.

The app does not show a measured angular-accuracy estimate or use Safari’s webkitCompassAccuracy value to certify readings. Do not interpret a stable arrow, a Live compass message or the alignment indicator as a professional accuracy guarantee. Compare with a trusted local masjid direction when uncertain.

Location accuracy affects the calculated bearing; compass accuracy affects how the phone aligns to that bearing. Better internet or granting permission cannot repair magnetic interference or faulty sensors. Physical iPhone and Android checks are needed to assess real-device behavior; desktop and mocked tests verify software logic only.

- [Browser orientation and Safari compass fields (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent)
- [Absolute orientation sensors and permissions (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/AbsoluteOrientationSensor)
- [Magnetic-North sensor reference (W3C)](https://www.w3.org/TR/orientation-sensor/#absoluteorientationsensor-model)

### Quick checks when the compass seems wrong

1. Remove a magnetic case or attachment and move away from metal tables, speakers and nearby electronics.
2. Move the phone gently in a figure-eight and follow any device calibration guidance. Athan has no separate recalibrate button; sensor calibration belongs to the device/browser.
3. If the location is poor indoors or underground, try near a window or outdoors, then reopen Qibla or use its location retry control.
4. If it still looks wrong, restart the browser/phone or try another supported browser. Close unrelated heavy tabs if the device is struggling, without clearing your Athan records.
5. Compare with a trusted local masjid direction, a reliable physical compass/local landmark guidance, or another phone. Another app on the same phone can share the same hardware problem.

- An internet connection can help some location providers, but a better connection is not a cure for faulty GPS/compass hardware or denied permissions. No app can promise to repair those problems.
- If you have no usable compass heading, use the numeric bearing only with an independent trustworthy North reference. Do not treat an unsupported desktop’s display as a live phone compass.

### A small reminder from the original guide

If you are blessed to be at the Ka‘bah—make dua for everyone. Look to the actual Ka‘bah and follow local guidance rather than relying on a phone arrow there. May Allah bless you all.

In-app action: **Open Qibla**.

<a id="layout-performance"></a>

## Customize layout, Salah Brief and Performance Mode

Optional organization and loading choices; all features stay accessible.

1. Open Settings → Performance & App Layout → Edit layout & feature priorities. Custom Layout and Performance Mode are separate and off by default.
2. For navigation, keep Home first and choose up to four extras. Add, remove and move shortcuts with the supplied Up/Down controls. Home and More lists can be arranged separately.
3. Home’s prayer preview and source/date information stay protected. Search remains top left and Feature Hub top right. If Settings is absent from navigation, open it inside Feature Hub.
4. Optionally select Show Salah Brief below Home’s prayer preview. Choose Line graph (default) for this week’s daily trend, or Prayer bars for per-prayer rates. It is a Home content section, not a separate root button.
5. Preview layout is a draft. Save layout applies it; Cancel layout edits discards changes. Reset layout draft prepares the standard arrangement until saved. Disabling Custom Layout retains saved choices for later.
6. For Performance Mode, select priority features and Save performance preferences separately from the layout draft.

- The same feature can have shortcuts on different surfaces without duplicating its data. Monthly view remains inside Prayer Times, and Quran Settings remains inside Quran.
- Performance Mode changes internal loading only—not appearance, animations, calculations or feature availability. Priority means preparing code after Home can render, not running it continuously or requesting permissions.
- Hidden features open on demand; their saved data remains available when needed as a prayer-source dependency. Imported modules may remain in memory; “deep sleep” does not promise forcibly unloading all code.
- Everyone has − / + Settings section controls. Collapsing a section only hides controls while preserving form values/work; it is not deep sleep.
- Personal backups retain these choices. Share Your Defaults can explicitly include layout and Salah Brief visibility/chart choice, but not personal graph data or Performance Mode preferences.

In-app action: **Open Performance & App Layout**.

<a id="ramadan"></a>

## Ramadan Mode

Manual dates, fasting status and private notes—not a new prayer calculation.

1. Set the manual Ramadan and Eid dates to the dates followed by your community.
2. Use the available Fajr/Maghrib countdowns and daily fasting-status controls during the configured period.
3. Record the day’s fasting note/status locally. Keep these records in your personal backup.

- Manual dates are your configuration, not an automatic official moon-sighting announcement. Review them each year. Ramadan records do not change the five obligatory-prayer tracker totals.

In-app action: **Open Ramadan Mode**.

<a id="backups-offline"></a>

## Backups, sharing, storage and updates

Protect records before moving installations or troubleshooting.

### Export and restore personal data

1. Open Backup and Restore → Export App Data and keep the downloaded JSON file somewhere safe and private.
2. Before importing, export the current installation’s data too. Import App Data can replace existing values; it is not a guaranteed conflict-free merge.
3. Choose your backup, read the confirmation and resulting feedback, then reload as instructed to see restored settings/records.
4. Never use Reset App Data casually. Without a backup, reset cannot be undone.

- Backups include known app records/preferences: tracker history and notes, saved/recent searches, profiles, reminders, Quran progress/bookmarks/settings, layouts, expansion preferences and performance choices.
- Downloaded Quran response files are not embedded. A restored metadata flag does not prove the new installation contains the text.
- Browser data clearing, storage pressure and installation/domain changes can affect local records. No account or automatic cloud synchronization exists.

### Share defaults is not a backup

- Share Your Defaults shares supported calculation/reminder defaults—not personal histories, notes, tracker-review preferences, searches, performance/disclosure preferences, Quran progress or personal profile/location data.
- Include custom layout is an explicit sender choice. Recipients preview it and separately select Apply shared layout; opening a link applies nothing automatically.
- Only validated arrangement and Salah Brief visibility/chart choice are included. The recipient’s Brief uses their own records. Profile/timetable sharing is a different deliberate action.

### Refresh or update safely

1. If the app feels slow, save unfinished work and choose Settings → PWA status → Refresh app. This reloads the screen without clearing saved records/caches or checking for updates. A cached app can reload offline; it is not an operating-system force-quit.
2. For a new version, connect to the app host, then Settings → PWA status → Check for update. This is separate from the normal Refresh app button.
3. If the check fails, keep using the current usable app/offline files and retry when connected. An update is not intended to erase saved records.
4. If a screen cannot load, try its Retry action or return Home/Feature Hub/Settings. Uncached chunks or text may require a connection.
5. Export a backup before clearing site data, changing domains/browsers or reinstalling. Do not erase records as the first fix for a blank screen.

In-app action: **Open Backup and Restore**.

<a id="troubleshooting"></a>

## Quick troubleshooting and contact

Start with the affected feature; preserve your data.

### Common problems

- Prayer clock looks shifted: check primary source and City/Device/UTC display first. Do not add correction minutes to compensate for a timezone difference.
- No prayer schedule: check selected profile, imported date coverage, required coordinates/location permission, and the error message.
- No calendar alert: inspect the imported event and alarms in the calendar app, notification permissions, calendar visibility and device focus settings. The PWA cannot force calendar delivery.
- Quran is unavailable offline: connect and download the selected text/translation; a personal JSON backup does not restore downloaded text files.
- Search has no matching days: check spelling/operators, Completed versus Missed versus Not logged, fixed range and whether blank days are included. A valid empty result does not delete records.
- Feature missing from shortcuts: use Feature Hub or Search app. Layout customization never removes the feature.
- Blank or broken screen: use Retry and safe navigation, then Check for update when online. Preserve/export a backup before any storage clearing or reinstall.

### A few more things to try before resetting anything

1. Reload a blank/broken page after saving any current work. If there is a screen Retry button, try that first.
2. Try the same address in another browser such as Safari, Chrome, Edge or Firefox to see whether the problem is browser-specific. Its records may be empty because each browser has separate storage—not because your original records disappeared.
3. Restart the browser or device if it appears stuck. Recheck location/calendar permissions for the affected feature without granting unrelated access.
4. On desktop, if you are comfortable with Developer Tools, open the Console (often F12 or the browser’s developer menu) and note the exact error. Do not paste commands offered by strangers; redact private information before sending a screenshot.
5. Reinstall or clear site data only as a last resort, after exporting a backup. Confirm where the backup is stored before removing anything.

### Ask for help safely

Contact aaamaq.contact.us@gmail.com with the app version, device model, operating system/browser, steps to reproduce and exact error text. Redact private prayer history, notes and precise location from screenshots unless you deliberately want to share them.

Developer Notes contains release history; Need Help explains the current app. We do not need your personal worship backup to answer an ordinary usage question.

### Thank you for helping us improve Athan

JazakAllahu khairan for using Athan and for sharing thoughtful feedback. If something feels confusing, you are welcome to ask—your suggestions help us make the app clearer for everyone.

We know neither your birthday nor your shoe size and we’d like to keep it that way. Your worship history is yours; please share only the information needed to understand a technical problem.

In-app action: **Open Credits**.

This guide describes current controls, not promised future features. Archived older instructions are not the current guide.
