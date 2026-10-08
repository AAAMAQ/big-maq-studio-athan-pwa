# Old Need Help

Archived on October 8, 2026 (Asia/Shanghai). This is the complete user-pasted old guide, retained unchanged for historical reference only. It is not the current in-app guide.

<!-- BEGIN ORIGINAL PASTED TEXT -->

Need Help
This page is written for the web version of Athan. It explains how to troubleshoot Qibla, how the Quran reader works, how bookmarks behave in the browser, and how to get the best results from location and reminders.

Download & install the app
Download and Set reminders via Calendar (.ics)
Search Salah progress
Layout & performance
Salah stars & statistics
Backups, offline files & updates
What's new?
Qibla not accurate?
Existing feature guide
How to use the Quran
Quran bookmarks
Location & accuracy
Prayer times do not match my mosque
Reminders & notifications
Which Calculation method & settings to choose?
Calculation method, Madhab & High-latitude rule
Troubleshooting & contact
v4.0.1 — Clearer Navigation & Salah Streaks
Open Settings → Performance & App Layout. Custom Layout and Performance Mode are independent and off by default; the usual Home / Prayer / Settings navigation remains until you choose a custom layout.

Home stays first. Choose, remove, or reorder up to four extra navigation buttons; Home's prayer preview and source/date information stay protected.
Edit Home and More shortcuts using Add, Remove, and Up/Down controls. The same feature can appear on different surfaces without creating separate data.
Preview is a draft. Save layout applies it; Cancel discards unsaved edits. Reset prepares a standard-layout draft until saved. Switching Custom Layout off keeps your custom lists for later.
Home's top-left search finds app destinations, including hidden features, child screens, and Surahs. The top-right four-square icon opens the navigation-only Feature Hub. Settings is always available there, even when removed from navigation.
Optional Salah Brief appears below Home's prayer card when selected in Custom Layout. Choose Line graph (default) for this week's daily trend, or Prayer bars for per-prayer rates, in layout settings or inside an enabled Brief. Both match Tracker graphs using your local records; unlogged days are gaps, not missed. The chart choice is retained in backups and explicitly shared layouts without graph values.
Performance Mode changes internal loading only—not appearance, animations, prayer calculations, or features. Choose priorities and save performance preferences separately.
Priority prepares code after Home can render; it does not open a feature, request permissions, or automatically download content. Hidden features load when opened. Saved records are never deleted; already-imported code may remain in memory.
Everyone gets Settings − / + section controls, initially expanded. Collapse simply hides the controls while preserving their state and intentional work; it is not deep sleep. Your expansion choices are remembered.

Salah stars are different from logged-only rates
One completed obligatory prayer earns one star, always out of five. Missed and not logged both earn zero stars, but their original statuses remain separate. Sunnahs do not earn obligatory stars.

Three completed, one missed, one unlogged: ★ 3/5 stars, but 3/4 logged = 75% in existing statistics. The calendar shows the logged fraction and stars separately.

Period capacity is five times the elapsed calendar days. Blank past days lower average stars without becoming missed records; future days are excluded. Insights shows total/capacity, average per day, and logging coverage. Verified streaks still break on missing, unlogged, or missed days.

All-five streaks require five explicitly completed obligatory prayers on consecutive calendar days. streak:5 finds days in an exact five-day full run; streak:5+ finds runs of at least five days; streak:max finds all tied longest runs intersecting the selected search scope. Date/notes filters do not shorten the underlying run. Insights reports the longest segment inside its selected period, with dates and boundary context.

Backups, offline files & safe updates
Personal Backup & Restore includes records, notes, profiles, Quran progress/bookmarks, reminder settings, layout and section preferences, Performance Mode/priorities, and saved/recent searches. Keep backup files private. Share Your Defaults excludes private histories, notes, tracker reminder preferences, searches, Performance Mode, and section preferences. You can explicitly include only custom layout order and Salah Brief visibility; the recipient previews it and separately selects Apply shared layout. Graph values are never shared.

A JSON backup does not contain downloaded Quran response files. On another installation, download Arabic text and the selected translation again if needed. No Quran audio playback or audio-download option is connected to this reader; text downloads do not include recitations.

Installing alone does not cache every file. Uncached Quran content, location/timezone searches, Deep Search schedules, and new app versions can require a connection to their respective website or service. Cached feature code can stay on disk without running in memory.

Use Settings → PWA status → Check for update. A failed check preserves the current app and offline files so you can retry later. Screen errors offer Retry or Home/Settings/Feature Hub; do not erase your data as the first troubleshooting step. Export a backup before clearing browser storage or reinstalling.

What's new?
Deep Search Athan is a dedicated prayer-time tool inside the app that lets you search for a city, country, or coordinates and generate a custom prayer-time preview and calendar reminder file for that location.

What Deep Search Athan can do
Search any location: Enter a city, country, or coordinates, such as London, New York, Makkah Saudi Arabia, or 21.4225, 39.8262.
Choose a custom date range: Generate prayer times from one date to another instead of being limited to only today or a full month.
Choose calculation settings: Select the calculation method and Madhab just for Deep Search Athan without changing your main Settings page.
Preview the prayer times: Check Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha before downloading anything.
Download a custom .ics file: Export calendar reminders for the exact location, date range, calculation method, Madhab, and reminder time you selected.
Add a second calendar alert: Optionally choose another minutes-before time. Both alerts belong to each selected prayer event in the same calendar file.
Important: calculation methods differ by country
Prayer times can differ between countries, cities, masjids, and Islamic organisations because different calculation methods use different Fajr and Isha angles, Asr rules, and high-latitude handling. If you are in another country, travelling, or generating a calendar for a different city, please try the available calculation methods and compare them with a trusted local masjid or Islamic authority.

If one method looks a few minutes different from another app or website, that can be normal. If the difference is large, change the calculation method, check the Madhab setting for Asr, and compare with your local masjid. The best setting is usually the one that matches the timetable used by the Muslim community in that area.

Privacy and data use
Deep Search Athan is designed to stay lightweight and privacy-respecting. The app does not create an account and does not store your searches on our server. Location searches may be cached locally in your browser so the same city does not need to be looked up again every time.

Some Deep Search Athan features use external services to make the search and timetable work properly. Location lookup uses OpenStreetMap-based data, timezone lookup may use a timezone service, and prayer-time timetable data may be requested from AlAdhan for the selected location and date range. These services are used only to provide the feature you requested.

Credits and data sources
OpenStreetMap contributors: Used for location search and readable place names. Location data © OpenStreetMap contributors.
TimeAPI: Used to help identify the official timezone for searched coordinates when needed.
AlAdhan: Used for prayer-time timetable data in Deep Search Athan when generating prayer-time previews and calendar exports for searched locations.
Adhan calculation library: Used elsewhere in the app for local prayer time calculations, especially for current-device location features.
Deep Search Athan is still being improved. Always compare prayer times with your local masjid if you are unsure, especially in high-latitude areas, during travel, or when generating a long calendar export.

Existing feature guide
Qibla: Simple Mode gives a large readable compass, turn guidance, Qibla bearing, device heading, distance to the Ka‘bah, and optional haptic feedback. Android now uses only Earth-referenced absolute orientation, while iPhone continues to use its dedicated compass heading. Relative motion values are rejected instead of being displayed as North.

Quran: Continue Reading, recently read, per-Surah progress, bookmarks, offline Quran controls, and a focused Translation / Tafsir selector are available in the Quran screen. Choose Muhammad Asad, Pickthall, Saheeh International, or Yusuf Ali and review the live sample before reading.

City Mode: Open More, then City Mode. You can search or manually add a city, choose Auto country-based settings, override methods, add personal correction offsets, preview prayer times, export ICS, export CSV, or share a plain-text timetable. Auto settings are a starting point; always compare with a local masjid when needed.

Manual corrections: Personal Custom Profiles store minute offsets, such as Fajr +4 or Isha +5. They do not overwrite the built-in country defaults.

Prayer times do not match your local mosque?
Calculation methods are estimates based on the sun's position. Some mosques instead follow an official local calendar with seasonal adjustments or times approved by a local Islamic authority. If Athan PWA does not match that calendar, you can save the mosque's exact timetable in City Mode and use it on Home, Prayer Times, Masjid Mode, previews, and calendar exports.

Before importing a file
Confirm that the location shown by Athan PWA is correct.
In Settings, try Auto so the app uses the usual method for that country.
Check the Asr choice. Standard means earlier Asr; Hanafi means later Asr.
If every prayer differs by only a few minutes, use the positive or negative correction fields in City Mode instead of building a yearly file.
Import a timetable when the differences vary throughout the year or your mosque follows its own published calendar.
How to prepare the timetable
Obtain the official yearly calendar from your mosque or local Islamic authority.
If it is printed, take a clear, straight photo of every month. Check that every date and prayer time is visible and that no page edge, shadow, or reflection covers a value.
Enter the data in a spreadsheet yourself, or send the photos to ChatGPT or another tool you trust and ask it to create an .xlsx, .csv, or .json timetable.
The file must contain at least 300 Gregorian dated rows. Use one row per date with: Date, Fajr, Sunrise, Dhuhr (or Zuhar), Asr, Maghrib, and Isha. Times may use a consistent 24-hour or AM/PM format.
If the source includes separate schools, columns named Asr Shafi, Asr Hanafi, Isha Shafi, and Isha Hanafi are supported. The app uses the appropriate value for the profile's selected madhab.
How to import and activate it
Open More → City Mode.
Create a new city profile, or duplicate an existing profile if you want to preserve its current settings.
Enter the correct city and country. Coordinates are optional when they are already included in the imported file.
Under Manual yearly prayer timetable, tap Import Timetable File and select the file.
Wait for the confirmation showing the number of imported Gregorian dates. A full calendar normally has 365 or 366 rows.
Rename the profile clearly, such as Main Central London, Islamic Society of Boston, or Dubai Hanafi, then save it.
Preview several dates and compare every prayer with the original mosque calendar.
Open Settings → Primary prayer time source and select the imported City Mode profile. It will replace device-location calculations on Home and Prayer Times.
Optionally open Masjid Mode and link this City Mode profile. The imported file supplies Athan times; the masjid profile continues to store its separate Iqama and Jumu'ah schedule.
Supported file notes
Excel (.xlsx): Put all dated rows on one sheet, preferably named All Days.

CSV (.csv): Include one header row followed by all dated records in the same file.

JSON (.json): Use an array of prayer records, or an object containing a prayerTimes, data, or rows array. Location, latitude, and longitude metadata may also be included.

The maximum import size is 5 MB. The file is processed locally and is not uploaded by Athan PWA.

Suggested AI prompt

Create a yearly Gregorian prayer timetable from these monthly prayer-calendar photos as an .xlsx, .csv, or .json file. Use one row per date and the columns Date, Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha. Preserve every printed time exactly, include AM/PM or 24-hour times consistently, do not estimate missing values, and flag any unreadable cells for me to verify. If the source has separate Shafi and Hanafi times, use Asr Shafi, Asr Hanafi, Isha Shafi, and Isha Hanafi columns. Add all dates to a sheet named All Days when using Excel. For JSON, return an object with optional location, latitude, and longitude fields plus a prayerTimes array containing the same dated records.

Always compare several imported dates with the original printed calendar before choosing the profile as your primary source. Athan PWA validates the structure, but it cannot verify that an AI copied every photographed number correctly.

If the import is rejected
Check that the filename ends in .xlsx, .csv, or .json and is no larger than 5 MB.
Make sure there are at least 300 valid dated rows, not separate decorative monthly tables without a Date column.
Check that all required prayer columns are present and that merged cells have not hidden values.
Remove headings, footnotes, or blank rows placed inside the daily records if they confuse the column layout.
For a missing or unreadable date, correct the source file rather than guessing the prayer time.
Masjid and Iqama: Local Iqama can load rules from a saved masjid profile. A masjid can link to a City Mode Athan preset while keeping its own Iqama and Jumu’ah data. Imported settings can be edited without changing the masjid profile unless you tap Save Changes Back to Masjid.

Backup, PWA, and privacy: Backup and Restore exports known Athan PWA localStorage data only. PWA status in Settings can show install/update/offline state. Athan PWA does not upload your personal app data.

Friday and Salah: Home shows Jumu’ah Mubarak on Fridays, Prayer Times labels Dhuhr as Jumu’ah visually on Friday, and Salah Tracker includes supportive streak/completion insights.

Qibla not working or feels inaccurate?
Qibla compass status
Device orientation
Supported
Compass permission needed
Usually no / unknown
Compass status
Open Qibla to check
Location permission
denied
Bearing to Ka‘bah
Open Qibla to calculate
Current heading
Waiting for compass
Heading source
No absolute heading recorded
Move your phone in a figure-eight motion to improve compass calibration.

Keep your phone away from magnets, metal objects, speakers, and electronic devices that may affect compass accuracy.

If Qibla appears incorrect, check that location and motion/orientation permissions are enabled.

Opening Qibla automatically looks for your device location and starts the compass. If location fails, allow location access and tap Enable Location to retry. On iPhone, previously granted motion access is reused when possible; Safari may still require a tap on Enable Compass for a new permission grant.

In this web app, the Qibla screen shows the angle from your location to the Kaaba, for example: “🕋 257° from True North”. The arrow on the screen is rotated to this angle. To face the Qibla, you align your body so that the top of your phone or the arrow is pointing in that direction.

Athan PWA accepts only an absolute, North-referenced compass heading. On iPhone this normally comes from Safari's compass heading; on supported Android browsers it comes from the absolute orientation event. If a browser supplies only relative motion data, the app keeps showing the numeric Qibla bearing but does not present that relative value as a real heading.

Common reasons for inaccuracy
Magnetic interference: Phone cases with magnets, metal tables, laptops, or other electronics can disrupt the built‑in compass that your browser uses.
Fix: Remove magnetic/metal cases and move away from large metal objects or electronics before checking Qibla.
Compass calibration: Your device compass may need to be recalibrated.
Fix: Move your phone slowly in a figure‑8 motion and follow any calibration prompts from your operating system (Android/iOS). This helps the browser get a better heading.
Weak GPS or location signal: Inside buildings or underground areas, your browser may only get a rough location based on Wi‑Fi, which can slightly shift the Qibla angle.
Fix: Step near a window or go outdoors for a more accurate location, then reopen Qibla or use its Enable Location retry when shown to update your position.
Poor internet connection: On some devices, a very weak data connection can delay or block location updates.
Fix: Make sure you have a reasonably stable connection, then try again.
What you can do to confirm accuracy
Compare with more than one Qibla app or website.
Use natural landmarks (sun, shadows) according to local guidance.
Check with a reliable physical compass if available.
Ask your local masjid or community if you are unsure.
Compare with more than one phone it might be that the phones GPS could be broken.
Quick fixes to try first
Remove your phone case or metal/magnetic attachments.
Close all tabs with heavy apps, then reopen the Athan web app.
Restart your phone or browser to clear out any sensor issues.
Check that Location is allowed for this site in your browser settings.
There is no separate “recalibrate” button inside the web app. Calibration is controlled by your device and browser. If you keep having issues, try using a different browser on the same device to compare.

Note that if your device’s GPS is not working, then trying different apps will also give incorrect results. This is because GPS accuracy mainly depends on the device’s hardware — specifically the GPS receiver and antenna — not the app you are using. If the hardware cannot lock on to satellites or is giving weak or incorrect signals, no app will be able to fix or override that. In that case, only using someone else’s phone with a properly functioning GPS will give accurate results.

Also when you are in Kabba (Make dua for everyone) DONT CHECK QIBLA because you are already in the location of Qibla so the compass will be confused. May Allah bless you all.

How to use the Quran view
The Quran feature in this web app is a text‑based reader designed for mobile and desktop browsers. It does not use "pages" like a PDF; instead, you select a surah (chapter) and scroll through its ayahs.

Reading modes
Arabic + English: Shows Arabic text with an English translation under each ayah. This is the default for many users.
Arabic only: Shows only the Arabic text for a cleaner recitation view.
Choosing a surah
Open the Quran tab from the Home screen.
You will see a list of all surahs with their Arabic and English names.
Tap or click any surah to load its verses. The app will fetch the text once and keep it for that session.
Adjusting text size
Use the font size control at the top of the Quran view.
The size is remembered in your browser using local storage, so the same device will keep your preferred reading size even after you close the tab.
Reading progress and offline text
Use Set as last read at a verse to save your position, including during rereads. Complete Surah at the bottom records completion separately. Continue Reading and saved Surah positions resume after verses load. The Quran hub also provides Juz navigation and verse lookup.

Quran Settings → Download All Surahs saves Arabic text and the selected translation, not audio. Resume Download retries incomplete text downloads. Remove Download keeps bookmarks and reading progress.

Quran bookmarks (web version)
In this web app, bookmarks are attached to individual ayahs, not pages. This gives you very precise control over where you want to return.

Adding or removing a bookmark
While viewing a surah, each ayah has a small bookmark icon.
Tap or click the icon to bookmark that ayah. Tapping again removes the bookmark.
You can bookmark as many ayahs as you like. There is no fixed limit in the web version.
Viewing only your bookmarks
Use the “View Bookmarks” / “Showing Bookmarks” button near the top of the Quran view.
When enabled, the list will only show ayahs that you have bookmarked for that surah.
Clearing bookmarks
Tap “Clear Bookmarks” to remove all saved ayah bookmarks from this browser.
Bookmarks are stored locally in your browser. Clearing them here does not affect any other device.
All bookmarks and preferences are saved on your device only. If you clear your browser data or use a different phone/computer, your bookmarks will not automatically sync.

Location & prayer time accuracy
The web app uses your browser location to calculate prayer times and the Qibla angle. On phones this usually comes from GPS; on desktops it may be based on Wi‑Fi or IP, which is less precise.

If you select a saved city as your primary prayer source, its times default to that city's clock. You can choose City time, Device time, or UTC in Settings under Primary prayer time source. The timezone label shows which view you are reading. The prayer instant and countdown remain the same. If the city's timezone is unavailable, the app labels the fallback instead of guessing a city clock.

Getting a good location fix
Allow Location when the browser asks for permission.
On the Home screen, tap Refresh to request a new location and recalculate today's prayer times.
If you recently travelled, use Refresh after arriving in the new city so that times update correctly.
Going outdoors or near a window usually improves accuracy.
If location is denied, the app may not be able to compute accurate times. For now, the web version does not include full manual location entry, so enabling browser location is recommended.

Calculation method, Madhab & High‑latitude rule
Athan calculates prayer times using standard astronomy formulas plus a few important settings. These settings do not change your Islamic belief, they only control how the time is calculated in edge cases. If your app version has a Settings screen for prayer time calculation, you may see three options:

Calculation method – which organisation's angles/rules to use (MWL, Umm al‑Qura, etc.).
Madhab (Asr) – whether Asr starts when the object's shadow is equal to its length (Shafi'i/others) or double (Hanafi).
High‑latitude rule – how to handle Fajr and Isha when nights are very short or the sun barely sets.
1. Choosing a calculation method
For most users, the default method is fine (often Muslim World League (MWL)). If your local masjid or Islamic centre publishes a timetable, that is the best reference:

Ask your masjid which method they use, and select the same one.
If you are unsure, you can usually keep MWL or whatever the app sets as default.
If you compare with another app or printed timetable and the difference is only a few minutes, that is normal.
Examples (not strict rules): Many European cities commonly use MWL or similar; in Saudi Arabia you may see Umm al‑Qura; UAE uses Dubai; In Egypt its often Egyptian General Authority of Survey; and many more; some regions follow local official timetables that match a specific method. Its best to check with your local masjid or Islamic authority if unsure. If that is not possible search in google for your city name + prayer times + method to get an idea of what is commonly used in your area.

2. Choosing Madhab for Asr
The Madhab setting only affects Asr time. It does not change Fajr, Dhuhr, Maghrib or Isha.

Standard / Shafi'i (shadow = 1× length): Used by Shafi'i, Maliki, Hanbali and many global timetables.
Hanafi (shadow = 2× length): Used by Hanafi communities, especially in India, Pakistan, parts of the UK, etc.
If you follow the Hanafi madhab, choose the Hanafi option so Asr will start later. Otherwise, you can keep the standard (Shafi'i) option.

3. High‑latitude rule (very long days/nights)
In countries far from the equator (for example, UK, Scandinavia, Canada, northern Europe), some summer nights are very short and the sun does not go far below the horizon. In these cases, normal formulas can give extreme or even impossible times for Fajr and Isha.

The High‑latitude rule tells the app how to adjust those times in a balanced way. You may see options such as:

Middle of the night: Places Fajr and/or Isha halfway between sunset and sunrise.
One‑seventh of the night: Uses 1/7 of the night length from sunset/fajr as a boundary.
Angle‑based / Nearest latitude: Uses a reference latitude or fixed angle when local values break down.
If you live in a high‑latitude area, the safest option is to match your local masjid's timetable. Ask which rule they follow or which other well-known app matches their times most closely, and choose the same option here.

4. What if I move to another country?
After you travel, open the app, allow Location, and tap Refresh on the Home screen.
Check a local masjid timetable in the new country and, if needed, adjust the method, madhab and high‑latitude rule to match.
You do not need to change settings every day; set them once for your region and they will stay saved on this device.
If you are ever unsure: follow your local scholar, imam or masjid timetable first, and then adjust the app so that its times closely match what they use. The app is only a tool to help you, not a replacement for knowledgeable guidance.

Reminders & notifications (web version)
The current web app focuses on accurate times and Quran reading. It does not yet send push notifications or play full Athan audio in the background like a native app.

How you can still set reminders
Use the Home screen to see the next prayer and live countdown. Keeping the tab open helps you stay aware of upcoming times.
Use your phone’s built‑in alarm or calendar app to create recurring reminders based on the times shown in the app.
A good time for Isha‑related reminders is usually after Isha Athan and before Fajr. For example, if Fajr is at 5:00 AM and Isha is at 8:00 PM, a personal reminder window between 9:00 PM and 11:59 PM may work well for many people.
Iqama Times is available as its own feature. You can set a fixed time or an offset after Athan for each prayer, preview the schedule, and export Iqama reminders to a calendar file. Calendar alerts are handled by your calendar app.

📱 How to Install Athan App (Android & iPhone)
Athan is a browser-based app. You can install it to your home screen so it behaves like a normal app; successfully cached content can work offline. An existing test address is:

https://test-athan-pwa.vercel.app/

✅ Install on Android
Installing the Athan App on Android is very easy:

Open the website in Chrome
Visit: https://test-athan-pwa.vercel.app/
Look for “Install App”
Most Android phones will automatically show:
A banner at the bottom saying “Add to Home Screen”, or
A pop-up saying “Install App”
Tap it.
If you don't see it
Tap the three dots (⋮) in the top-right corner of Chrome and choose Add to Home screen.
Confirm
Tap Add, then Add to Home screen again.
That's it — the app will now appear on your home screen just like a normal app, with your Athan icon.

🍎 Install on iPhone (Safari workflow)
Apple requires a few extra steps, but it's still very easy:

Open the website in Safari
Visit: https://test-athan-pwa.vercel.app/
For the documented iPhone workflow, use Safari and its Share menu.
Tap the Share button
At the bottom of the screen, tap the square with the arrow pointing up (⬆️).
Scroll down
Find and tap Add to Home Screen.
Confirm the name
You will see Athan PWA. Tap Add (top-right corner).
The Athan app will now appear on your home screen with the icon.

In short
Android: Open in Chrome → “Add to Home Screen” → Confirm.

iPhone: Open in Safari → Share → “Add to Home Screen” → Add.

After a successful online load and caching, saved app files can work offline, InshaAllah. Installation does not guarantee that every feature response or translation has been downloaded. Initial or uncached content can still need internet; Quran text downloads are separate from the app-shell cache.

Which calculation method should I choose?
Different organisations use slightly different angles and rules to calculate Fajrand Isha. This does not change your aqeedah – it only affects a few minutes earlier or later. The safest option is always to match your local masjid or Islamic authority and then set the app to use the same method.

Below is a very simple overview of the most common methods and where they are often used. These aregeneral patterns, not strict rules – individual masjids may follow something different.

Method	Common regions / examples
Muslim World League (MWL)	Many European cities, Russia, Australia, parts of Africa; often used as a global default when no local authority is known.
Umm al-Qura (Makkah)	Saudi Arabia (official), sometimes nearby Gulf countries.
Egyptian General Authority	Egypt, and often Jordan, Lebanon, Syria, Palestine and surrounding areas.
Karachi (Hanafi)	Pakistan, India, Bangladesh, Afghanistan, Sri Lanka; some Hanafi mosques in the UK and elsewhere.
Dubai	United Arab Emirates (official).
Qatar	Qatar (official).
Kuwait	Kuwait (official).
Moonsighting Committee	Some communities in North America, UK, South Africa and elsewhere who follow Moonsighting Committee Worldwide (MCW).
North America / ISNA	United States and Canada (especially older timetables and apps).
Singapore	Singapore (MUIS) and sometimes nearby regions.
Tehran	Iran (official) and some Shia communities.
Turkey (Diyanet)	Turkey (official), Turkish communities abroad, sometimes Cyprus.
If the times in the app differ slightly (a few minutes) from your local masjid, that is normal and often due to different methods or rounding. If the difference is large, ask which method your masjid uses and select the closest match above. When in doubt, follow your local masjid or scholar first, and use the app as a helpful tool, not as a replacement for knowledge.

Reminders via Calendar (.ics)
You can let your phone's calendar handle prayer alerts even when the PWA is closed by exporting an .ics file from the Settings screen.

Step-by-step: Exporting reminders
Open Settings from navigation, or Home's protected top-right button if your custom navigation omits it.
Scroll to the section called Reminders via Calendar (.ics).
In Reminder offset (minutes before each prayer), choose how many minutes before every prayer you want the reminder (for example 10, 15, or 20).
Optionally enable a second reminder and choose another time before each regular prayer event. One exported event can contain two alerts, such as 10 and 15 minutes before.
Check the primary prayer source shown in Settings before exporting. The file uses the selected saved city and its calculation settings or imported timetable; when no city is selected, it uses current device location.
(Optional) Set your Fixed Isha reminder (HH:mm) time between Isha and Fajr if you want an extra nightly reminder as a separate calendar event.
Tap one of the export buttons: Export 1 day (.ics), Export 7 days (.ics), Export 30 Days (.ics), or Export 1 Year (.ics).
When the .ics file finishes downloading, open it. Your device will ask which calendar to add the events to – you can use an existing calendar or create a new one like. Its better to create a NEW CALENDAR named "Athan Reminders" to keep them separate. A dedicated calendar can make replacement easier when travelling; deletion/import behavior depends on your calendar app.
Make sure that calendar is visible in your calendar app and that notifications are allowed for it in your phone's system settings.
Important notes & things to watch out for
Your primary prayer source is used when exporting. If you switch the selected city or travel to another location, export a fresh .ics file for the source you want.
Changing settings does not update old events automatically. If you change calculation method, madhab, high latitude rule, reminder offset, or fixed Isha time, export and import a new .ics file. Old events will stay as they are.
Avoid duplicate events. If you re-export, you may want to delete the old "Athan Reminders" calendar (or its events) first so you don't end up with duplicates.
Time zones matter. Exported prayer events identify their source and use UTC instants. Calendar apps normally show those instants in the device's current time zone, so a saved city's 5:59 PM prayer can appear at a different clock time while you are elsewhere.
Calendar alerts, not the PWA, make the sound. Once imported, your device's calendar is responsible for the notification sound and banner, so make sure calendar notifications are enabled in system settings.
Second alerts are optional. The extra alert applies to regular prayer-time events. Fixed Isha, Jumu'ah, and Salah Tracker review keep their own existing alert behavior.
Search Salah progress
Open Salah Tracker for daily logging and notes. Its Insights, Search Salah Progress, and Graph Insights buttons open separate views of your private records. Search results are days, and tapping a day returns to its calendar entry.

Graph Insights keeps the existing completion bars and adds a line chart to make the weekly or monthly direction easier to see. Each point uses completed prayers divided by logged prayers; gaps mean no prayers were logged in that period.

The numbers 1–5 mean Fajr, Dhuhr, Asr, Maghrib, and Isha. A prayer name or number finds days when it was completed: fajr and 1 mean the same thing. Use ! for explicitly missed, ~ for not logged, and / for either missed or not logged.

1&2 finds days when both Fajr and Dhuhr were completed.
[1&2] finds days when only those two were completed; other prayers may be missed or unlogged.
!2,!3 finds days when Dhuhr or Asr was explicitly missed.
1&(!2,!3) finds days when Fajr was completed and either Dhuhr or Asr was missed.
Oct.30 finds October 30 across all recorded years.
2026y.6m.23d, 6m.2026y.23d, and 23d.Jun.26y all find June 23, 2026.
5m finds May in any year; 5m.26y finds May 2026; 2026y finds recorded dates throughout 2026.
10m.23d.26 and 10.23d.2026y infer the missing label and both find October 23, 2026.
(23d.06m.2026y)&fajr finds June 23, 2026 if Fajr was completed.
(Jun.26y)&fajr finds June 2026 days when Fajr was completed.
(notes)&!fajr finds days with a nonempty note and Fajr explicitly missed. note is an alias; (!notes) finds no note.
(logged5)&(26y) finds fully logged days in 2026. (!logged5)&(26y) finds fewer than five recorded prayer statuses.
(star3), (stars3), and done3 mean exactly three completed prayers. (star(3-5)) or done3-5 means three to five.
(logged(3-5)) finds three to five completed-or-missed entries; unlogged prayers do not count as logged.
(mon)&((logged5),(notes)) finds Mondays that are fully logged OR contain notes. Monday applies to both alternatives; a day matching both appears once.
((2-5)m.(21-30)d.(25-26)y) finds February–May, days 21–30, in 2025–2026. It is a component filter, not one continuous interval.
(star(3-5))&((25-26)y) finds three–five stars in 2025–2026.
(last30days)&fajr finds Fajr completed today or within the preceding 29 dates.
Join date parts with a dot in any order. June, Jun, and 6m are equivalent, and month names are not case-sensitive. Use d for day, m for month, and y for year; two-digit years mean 2000–2099. When two parts are identified, the third number can omit its label. Month names identify the month too. The special two-part form Oct.23 means October 23 in any year, never October 2023. Other unlabeled, ambiguous date formats show an error. Put the date in parentheses before combining it with prayer filters, such as (Jun.26y)&!fajr. Searches use recorded days through today by default. Enable the date-range option to include days with no records. Invalid dates, such as February 30, show an error rather than changing your records.

Full and short weekday names work, case-insensitively: Monday/mon through Sunday/sun. AND (&) binds before OR (comma/semicolon); parentheses control grouping, like A&(B,C). Square brackets remain exclusively for exact completed-prayer sets. Use ! with notes, counts, weekdays, or relative terms to negate their condition; !prayer still means explicitly missed, never unknown.

Save a useful search
Give a valid query a name and tap Save search. Reopen, rename, or remove it in Saved searches; it reruns against your current records rather than saving a copy of history. A fixed From/Through scope keeps its dates and blank-day choice. last30days rolls when reopened; a saved fixed scope still restricts it if both are used.

Recent queries use the current scope. Examples are local and require no search service. Up to 30 named searches and eight recent queries are stored. Query length and explicit ranges are bounded; blank-date searches require a range rather than creating an unlimited calendar.

The result summary shows matching-day completed, missed, and not-logged totals, plus stars out of five per matching day. These totals describe matching results, not the whole period's average. Tap a result to reopen the day in Tracker.

A missed prayer is a recorded status. A prayer left unlogged is unknown and is never counted as missed. Search, notes, and graphs stay on your device.

Troubleshooting & contact
General tips
If something looks blank or broken, reload the page.
Try using a different browser (Chrome, Safari, Edge, Firefox) to see if the issue is browser‑specific.
On desktop, you can open Developer Tools (usually F12) and check the Console for any clear error messages.
If you installed the PWA to your Home Screen, remove it and install it again only as a last resort.
Contact us
If issues keep happening or something is confusing, we are happy to help. Please email us with details (device, browser, screenshots if possible):

aaamaq.contact.us@gmail.com

JazakAllahu khairan for using this app and for any feedback you send. Your suggestions directly help improve the experience for everyone. Just remember that we know neither your birthday nor your shoe size and we'd like to keep it that way. We value your privacy and will never ask for personal information that is not necessary for the app to function. We are here to help with any technical issues or questions about using the app, so please don't hesitate to reach out if you need assistance.


Home

Prayer
