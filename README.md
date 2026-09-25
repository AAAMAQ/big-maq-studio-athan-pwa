# Athan PWA

A lightweight, privacy-friendly Islamic prayer web app built with React, TypeScript, and Vite.

Athan PWA helps users check prayer times, find the Qibla direction, read the Quran, track Salah, and export prayer reminders to their calendar without needing a traditional app-store download.

The app is built as a Progressive Web App, which means it can be opened in the browser and installed to the home screen on supported devices.

---

## Progressive Web App

Athan PWA can be installed on supported devices from the browser.

### Install on iPhone or iPad

1. Open the app in Safari.
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Confirm the install.

### Install on Android

1. Open the app in Chrome.
2. Tap the menu button.
3. Tap **Add to Home screen** or **Install app**.
4. Confirm the install.

### Install on Desktop

Supported browsers may show an install icon in the address bar.

---
## Live App Links

The app currently has multiple Vercel aliases. All of these point to the latest version of the app.

### Main Release

https://athan-pwa.vercel.app/

### Test Launch

https://test-athan-pwa.vercel.app/

### Beta Version

https://test-athan-app.vercel.app/

---

## Repository

GitHub repository:

https://github.com/AAAMAQ/TEST-athan-pwa

---

## Current Version

**v3.3.1**

This version upgrades Salah Tracker with three-state obligatory prayer logging, private daily notes, verified
streaks, period-based insights, and contextual summaries. It also unifies active calendar exports, groups optional
fixed-Isha, Friday Jumu’ah, and privacy-safe Salah review reminders in Settings, and adds profile-based Iqama export
to Masjid Mode while retaining the standalone Iqama Times screen.

---

## Unified UI and Navigation

Athan PWA uses one responsive navy-and-teal interface across the installed PWA and browser experience. Shared cards,
buttons, headings, status messages, and back navigation keep Home, Prayer Times, Settings, Qibla, Quran, and the
advanced tools visually connected.

The primary navigation stays focused on three destinations:

- **Home** shows the Hijri date, current prayer, next prayer countdown, active location or City Mode source, and quick access to Quran, Qibla, More, and Credits.
- **Prayer** shows daily and monthly prayer times from the same primary prayer source selected in Settings.
- **Settings** controls calculation defaults, language, reminders, display preferences, and the primary prayer source used throughout the app.

Secondary features live under **More**, including Deep Search Athan, Iqama Times, Masjid Mode, City Mode, Salah
Tracker, Ramadan Mode, backup and restore, and the App Guide. Secondary screens share the same header and Back
behavior, while the bottom navigation remains available for returning to the three primary areas.

Qibla follows this unified approach with Simple and Advanced views. Both use the same location-derived Ka‘bah bearing
and verified compass pipeline: iPhone uses its dedicated browser compass heading, supported Android browsers use
absolute device orientation, and relative-only motion readings are rejected rather than displayed as North.

---

## Project Vision

Athan PWA was created to be a simple, fast, and respectful prayer-time app.

Many prayer apps are filled with ads, unnecessary tracking, complicated screens, or features that distract from the actual purpose: helping Muslims pray on time.

Athan PWA is designed to be different:

- No ads
- No accounts
- No unnecessary tracking
- Lightweight interface
- Privacy-focused
- Works directly from the web
- Can be added to the home screen
- Designed for daily use
- Built to stay simple and useful

The goal is not to create a bloated app. The goal is to provide a clean Islamic utility that helps users stay consistent with Salah.

---

## Features

### Prayer Times

Athan PWA shows daily prayer times based on the user's location.

Supported prayer times include:

- Fajr
- Sunrise
- Dhuhr
- Asr
- Maghrib
- Isha

The home page also shows the next prayer and a live countdown.

---

### Hijri Date

The app displays the current Hijri date on the home page.

The Hijri date refreshes automatically at midnight.

---

### Current Location Display

The home page can display the user's readable location instead of only showing coordinates.

Location is used only for prayer-time and Qibla-related features.

---

### Qibla Direction

The Qibla screen helps users find the direction of the Kaaba.

Simple Mode provides turn guidance, alignment feedback, distance, and an optional vibration when aligned. Advanced
Mode exposes the numeric Qibla bearing and verified device heading. The app accepts iPhone compass headings and
absolute Android orientation readings; arbitrary relative Android motion angles are not treated as North.

Qibla accuracy may vary depending on:

- GPS signal
- Compass calibration
- Magnetic interference
- Device hardware
- Browser permissions
- Whether the device supports compass sensors

Users should compare with a trusted local source if unsure.

---

### Quran Reader

Athan PWA includes a Quran reader with Arabic text and translation support.

Features include:

- Uthmani script Quran
- English translation display
- Arabic-only mode
- Font size controls
- Surah selection
- Translation selection
- Bookmarking ayahs
- Viewing bookmarked verses
- Clearing bookmarks

Quran settings and bookmarks are stored locally on the device/browser.

---

### Salah Tracker

The private Salah Tracker records each obligatory prayer as Completed, Missed, or Not logged. Unknown days are not
treated as misses, and optional Sunnahs stay separate from obligatory statistics.

Features include:

- Monthly calendar view
- Three-state daily logging for Fajr, Dhuhr, Asr, Maghrib, and Isha
- Mark all completed and clear all obligatory actions
- Private notes stored separately for every calendar day
- Week, month, last-30-day, and all-time insight periods
- Per-prayer completed/logged rates and verified current/longest streaks
- Contextual consistency, improvement, complete-day, weekday, and trend summaries

Tracker records and daily notes are stored locally on the user's device. The optional evening review reminder is
configured in Settings and can be included in Settings calendar exports, but its calendar event contains no prayer
history. Backup and Restore includes tracker records, notes, and the reminder preference, while Share Your Defaults
excludes all three.

---

### Monthly Prayer Times

The app includes a monthly prayer-time view.

Users can view prayer times across a selected month and change months/years.

---

### Settings

Users can customize prayer calculation settings.

Settings include:

- Calculation method
- Madhab
- High-latitude rule
- Reminder offset

These settings are stored locally in the browser.

---

### Calendar Reminder Export

Athan PWA supports exporting prayer reminders as `.ics` calendar files.

Users can generate calendar reminders for:

- 1 day
- 7 days
- 30 days
- 1 year

These files can be imported into calendar apps such as:

- Apple Calendar
- Google Calendar
- Outlook Calendar
- Samsung Calendar
- Other calendar apps that support `.ics` files

Calendar alerts are handled by the user's calendar app, not by the PWA itself.

Settings, City Mode, standalone Iqama Times, Deep Search Athan, and Masjid Mode use one shared calendar serializer
and download path. Settings exports can explicitly include or exclude fixed-time Isha, Friday Jumu’ah, and the
privacy-safe Salah Tracker review reminder. The shared handler supports local and UTC event times, stable event
identifiers, escaped/folded calendar text, and one or more alerts per event while preserving each screen's
established choices.

Masjid Mode can export the selected masjid profile's Iqama rules and configured Jumu’ah slots for a date range. It
uses the linked City Mode profile—including imported timetables—when available. If no City Mode profile is linked,
the screen explicitly falls back to current device location with the prayer calculation saved in Settings. The
standalone Iqama Times screen remains independently available.

---

## Advanced Athan

Advanced Athan is a separate prayer-time system inside the app.

It allows users to search for a location and generate custom prayer-time reminders for that location.

### Advanced Athan Features

Advanced Athan supports:

- Searching by city
- Searching by country
- Searching by coordinates
- Custom date ranges
- Calculation method selection
- Madhab selection
- Reminder offset selection
- Prayer-time preview before download
- Custom `.ics` calendar export

Example searches:

```txt
London
New York
Dubai
Makkah Saudi Arabia
Chennai
Anchorage
21.4225, 39.8262
```
## Important Note About Calculation Methods

Prayer times can differ between countries, mosques, communities, and Islamic organizations.

Different calculation methods may use different values for:

- Fajr angle
- Isha angle
- Asr calculation
- High-latitude handling
- Regional prayer standards

For this reason, users should try different calculation methods and compare them with a trusted local masjid or Islamic authority.

If one method is a few minutes different from another app, that can be normal. If the difference is large, users should check:

- Calculation method
- Madhab setting
- High-latitude location behavior
- Local mosque timetable

---

## Privacy

Athan PWA is designed to be privacy-friendly.

Our motto is:

> “we know neither your birthday nor your shoe size and we'd like to keep it that way”

### What the app does not do

The app does not:

- Create user accounts
- Show ads
- Sell user data
- Use advertising trackers
- Store personal data on a server
- Require unnecessary permissions

### What may be stored locally

Some data may be stored locally in the browser, such as:

- Prayer settings
- Quran bookmarks
- Salah tracker entries
- Last known location
- Cached location search results
- App preferences

This local data stays on the user’s device/browser.

---

## External Services and Credits

Some features depend on external data sources or libraries.

### OpenStreetMap Contributors

Used for location search and readable place names.

Location data © OpenStreetMap contributors.

### TimeAPI

Used to help identify the official timezone for searched coordinates when needed.

### AlAdhan

Used by Advanced Athan for prayer-time timetable data when generating prayer-time previews and calendar exports for searched locations.

### Adhan Calculation Library

Used in the app for local prayer-time calculations.

---

## Progressive Web App

Athan PWA can be installed on supported devices from the browser.

### Install on iPhone or iPad

1. Open the app in Safari.
2. Tap the Share button.
3. Tap **Add to Home Screen**.
4. Confirm the install.

### Install on Android

1. Open the app in Chrome.
2. Tap the menu button.
3. Tap **Add to Home screen** or **Install app**.
4. Confirm the install.

### Install on Desktop

Supported browsers may show an install icon in the address bar.

---

## Offline Support

The app is designed to work offline after it has been loaded and installed.

Some features may still require internet access, especially:

- First-time Quran loading
- Location search
- Advanced Athan city search
- Timezone lookup
- Prayer-time timetable fetching for searched locations

Locally cached data may continue working offline depending on browser support.

---

## Tech Stack

This project is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Progressive Web App support
- `.ics` calendar export logic

---

## Live App Links

Current aliases include:

- https://athan-pwa.vercel.app/
- https://test-athan-pwa.vercel.app/
- https://test-athan-app.vercel.app/

All aliases are currently updated to the latest launch.

---

## Dev Notes

### May 18, 2026 — v2.01.1

Version v2.01.1 includes:

- Advanced Athan updates
- Custom location search
- Date-range prayer previews
- Custom `.ics` calendar export
- Calculation method selection
- Madhab selection
- Reminder offset selection
- Dev Notes section
- Updated Need Help section
- Updated public URL/domain notes

### Advanced Athan

Advanced Athan was added as a separate system so users can generate prayer times and reminders for locations other than their current device location.

### Calendar Export

The `.ics` calendar export feature helps users create prayer reminders in their own calendar apps.

This is useful because calendar apps can handle alerts across devices without requiring the PWA to run in the background.

---

## Known Notes

- Prayer times may differ slightly between sources because calculation methods differ.
- Qibla accuracy depends on device sensors and GPS.
- Calendar alerts are handled by the calendar app, not directly by the PWA.
- High-latitude locations may require users to compare results with a local masjid or scholar.
- Advanced Athan may use external APIs for location, timezone, or timetable data.

---

## Support and Need Help

For help, troubleshooting, and usage guidance, read the **Need Help** section inside the app.

For feedback or bug reports, contact:

```txt
aaa.maq.contact.us@gmail.com
```

---
## Support the Project

If this app benefits you, you may support the project through the link provided in the Credits page.

Athan PWA is built as a community-focused project, not as an ad-driven product. Any support helps with development, testing, hosting, and future improvements.

Support is optional. The app is intended to remain simple, useful, and accessible.

---

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

---

## Final Note

Athan PWA was built to help Muslims pray on time with a clean, lightweight, and privacy-respecting experience.

The aim is simple: make a useful Islamic web app without ads, unnecessary tracking, or distractions.

Our motto is:

> “we know neither your birthday nor your shoe size and we'd like to keep it that way”

May Allah accept it, make it beneficial, and allow it to help people remember their prayers on time.

---
