import { useEffect, useState } from 'react'

type Props = {
  go?: (screen: string) => void
  backTarget?: string
}

export default function NeedHelp({ go, backTarget = 'Credits' }: Props) {
  useEffect(() => {
    const target = window.location.hash.replace('#', '')
    if (!target) return
    window.setTimeout(() => {
      document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [])

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {go && (
        <button
          type="button"
          onClick={() => go(backTarget)}
          className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 hover:border-teal-700 hover:text-teal-300"
        >
          ← Back to Credits
        </button>
      )}
      <h1 className="text-2xl font-bold">Need Help</h1>

      <p className="text-gray-200 text-sm">
        This page is written for the <span className="font-semibold">web version</span> of Athan. It explains how
        to troubleshoot Qibla, how the Quran reader works, how bookmarks behave in the browser, and how to get the
        best results from location and reminders.
      </p>

      <nav className="text-sm text-teal-300 flex flex-wrap gap-3">
        <a href="#downloadapp" className="underline">Download & install the app</a>
        <a href="#downloadics" className="underline">Download and Set reminders via Calendar (.ics)</a>
        <a href="#salah-search" className="underline">Search Salah progress</a>
        <a href="#whatsnew" className="underline">What&apos;s new?</a>
        <a href="#qibla" className="underline">Qibla not accurate?</a>
        <a href="#v3features" className="underline">v3.2.2 features</a>
        <a href="#quran" className="underline">How to use the Quran</a>
        <a href="#bookmarks" className="underline">Quran bookmarks</a>
        <a href="#location" className="underline">Location & accuracy</a>
        <a href="#manual-timetable" className="underline">Prayer times do not match my mosque</a>
        <a href="#notifications" className="underline">Reminders & notifications</a>
        <a href="#methods" className="underline"> Which Calculation method & settings to choose?</a>
        <a href="#calculation" className="underline">Calculation method, Madhab & High-latitude rule</a>
        <a href="#troubleshooting" className="underline">Troubleshooting & contact</a>
      </nav>


      {/* WHAT'S NEW */}
      <section id="whatsnew" className="space-y-2">
        <h2 className="text-xl font-semibold">What&apos;s new?</h2>
        <p className="text-gray-200 text-sm">
          <span className="font-semibold">Deep Search Athan</span> is a dedicated prayer-time
          tool inside the app that lets you search for a city, country, or coordinates and generate a custom prayer-time
          preview and calendar reminder file for that location.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">What Deep Search Athan can do</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Search any location:</span> Enter a city, country, or coordinates, such as
            <span className="font-mono text-teal-300"> London</span>, <span className="font-mono text-teal-300">New York</span>,
            <span className="font-mono text-teal-300"> Makkah Saudi Arabia</span>, or
            <span className="font-mono text-teal-300"> 21.4225, 39.8262</span>.
          </li>
          <li>
            <span className="font-semibold">Choose a custom date range:</span> Generate prayer times from one date to
            another instead of being limited to only today or a full month.
          </li>
          <li>
            <span className="font-semibold">Choose calculation settings:</span> Select the calculation method and Madhab
            just for Deep Search Athan without changing your main Settings page.
          </li>
          <li>
            <span className="font-semibold">Preview the prayer times:</span> Check Fajr, Sunrise, Dhuhr, Asr, Maghrib,
            and Isha before downloading anything.
          </li>
          <li>
            <span className="font-semibold">Download a custom .ics file:</span> Export calendar reminders for the exact
            location, date range, calculation method, Madhab, and reminder time you selected.
          </li>
          <li>
            <span className="font-semibold">Add a second calendar alert:</span> Optionally choose another minutes-before
            time. Both alerts belong to each selected prayer event in the same calendar file.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Important: calculation methods differ by country</h3>
        <p className="text-gray-200 text-sm">
          Prayer times can differ between countries, cities, masjids, and Islamic organisations because different
          calculation methods use different Fajr and Isha angles, Asr rules, and high-latitude handling. If you are in
          another country, travelling, or generating a calendar for a different city, please try the available calculation
          methods and compare them with a trusted local masjid or Islamic authority.
        </p>
        <p className="text-gray-200 text-sm">
          If one method looks a few minutes different from another app or website, that can be normal. If the difference
          is large, change the calculation method, check the Madhab setting for Asr, and compare with your local masjid.
          The best setting is usually the one that matches the timetable used by the Muslim community in that area.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Privacy and data use</h3>
        <p className="text-gray-200 text-sm">
          Deep Search Athan is designed to stay lightweight and privacy-respecting. The app does not create an account and
          does not store your searches on our server. Location searches may be cached locally in your browser so the same
          city does not need to be looked up again every time.
        </p>
        <p className="text-gray-200 text-sm">
          Some Deep Search Athan features use external services to make the search and timetable work properly. Location
          lookup uses OpenStreetMap-based data, timezone lookup may use a timezone service, and prayer-time timetable
          data may be requested from AlAdhan for the selected location and date range. These services are used only to
          provide the feature you requested.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Credits and data sources</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">OpenStreetMap contributors:</span> Used for location search and readable
            place names. Location data © OpenStreetMap contributors.
          </li>
          <li>
            <span className="font-semibold">TimeAPI:</span> Used to help identify the official timezone for searched
            coordinates when needed.
          </li>
          <li>
            <span className="font-semibold">AlAdhan:</span> Used for prayer-time timetable data in Deep Search Athan when
            generating prayer-time previews and calendar exports for searched locations.
          </li>
          <li>
            <span className="font-semibold">Adhan calculation library:</span> Used elsewhere in the app for local prayer
            time calculations, especially for current-device location features.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          Deep Search Athan is still being improved. Always compare prayer times with your local masjid if you are unsure,
          especially in high-latitude areas, during travel, or when generating a long calendar export.
        </p>
      </section>

      <section id="v3features" className="space-y-2">
        <h2 className="text-xl font-semibold">v3.2.2 feature guide</h2>
        <div className="space-y-3 text-sm text-gray-200">
          <p>
            <span className="font-semibold text-teal-300">Qibla:</span> Simple Mode gives a large readable compass,
            turn guidance, Qibla bearing, device heading, distance to the Ka‘bah, and optional haptic feedback.
            Android now uses only Earth-referenced absolute orientation, while iPhone continues to use its dedicated
            compass heading. Relative motion values are rejected instead of being displayed as North.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Quran:</span> Continue Reading, recently read, per-Surah
            progress, bookmarks, offline Quran controls, and a focused Translation / Tafsir selector are available
            in the Quran screen. Choose Muhammad Asad, Pickthall, Saheeh International, or Yusuf Ali and review the
            live sample before reading.
          </p>
          <p>
            <span className="font-semibold text-teal-300">City Mode:</span> Open More, then City Mode.
            You can search or manually add a city, choose Auto country-based settings, override methods,
            add personal correction offsets, preview prayer times, export ICS, export CSV, or share a plain-text
            timetable. Auto settings are a starting point; always compare with a local masjid when needed.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Manual corrections:</span> Personal Custom Profiles store
            minute offsets, such as Fajr +4 or Isha +5. They do not overwrite the built-in country defaults.
          </p>
          <div id="manual-timetable" className="space-y-3 rounded-lg border border-teal-900 bg-teal-950/20 p-4">
            <h3 className="text-lg font-semibold text-teal-300">Prayer times do not match your local mosque?</h3>
            <p>
              Calculation methods are estimates based on the sun&apos;s position. Some mosques instead follow an
              official local calendar with seasonal adjustments or times approved by a local Islamic authority.
              If Athan PWA does not match that calendar, you can save the mosque&apos;s exact timetable in City Mode
              and use it on Home, Prayer Times, Masjid Mode, previews, and calendar exports.
            </p>

            <div className="space-y-2 rounded-md border border-gray-700 bg-gray-950/50 p-3">
              <h4 className="font-semibold">Before importing a file</h4>
              <ol className="list-decimal space-y-1 pl-5 text-gray-300">
                <li>Confirm that the location shown by Athan PWA is correct.</li>
                <li>In Settings, try <span className="font-semibold text-white">Auto</span> so the app uses the usual method for that country.</li>
                <li>Check the Asr choice. Standard means earlier Asr; Hanafi means later Asr.</li>
                <li>
                  If every prayer differs by only a few minutes, use the positive or negative correction fields in
                  City Mode instead of building a yearly file.
                </li>
                <li>
                  Import a timetable when the differences vary throughout the year or your mosque follows its own
                  published calendar.
                </li>
              </ol>
            </div>

            <h4 className="font-semibold text-white">How to prepare the timetable</h4>
            <ol className="list-decimal space-y-2 pl-5 text-gray-200">
              <li>Obtain the official yearly calendar from your mosque or local Islamic authority.</li>
              <li>
                If it is printed, take a clear, straight photo of every month. Check that every date and prayer time
                is visible and that no page edge, shadow, or reflection covers a value.
              </li>
              <li>
                Enter the data in a spreadsheet yourself, or send the photos to ChatGPT or another tool you trust
                and ask it to create an <span className="font-mono">.xlsx</span>, <span className="font-mono">.csv</span>,
                or <span className="font-mono">.json</span> timetable.
              </li>
              <li>
                The file must contain at least 300 Gregorian dated rows. Use one row per date with:
                <span className="font-semibold"> Date, Fajr, Sunrise, Dhuhr (or Zuhar), Asr, Maghrib, and Isha</span>.
                Times may use a consistent 24-hour or AM/PM format.
              </li>
              <li>
                If the source includes separate schools, columns named Asr Shafi, Asr Hanafi, Isha Shafi, and Isha
                Hanafi are supported. The app uses the appropriate value for the profile&apos;s selected madhab.
              </li>
            </ol>

            <h4 className="font-semibold text-white">How to import and activate it</h4>
            <ol className="list-decimal space-y-2 pl-5 text-gray-200">
              <li>Open <span className="font-semibold">More → City Mode</span>.</li>
              <li>Create a new city profile, or duplicate an existing profile if you want to preserve its current settings.</li>
              <li>Enter the correct city and country. Coordinates are optional when they are already included in the imported file.</li>
              <li>Under Manual yearly prayer timetable, tap <span className="font-semibold">Import Timetable File</span> and select the file.</li>
              <li>Wait for the confirmation showing the number of imported Gregorian dates. A full calendar normally has 365 or 366 rows.</li>
              <li>Rename the profile clearly, such as Main Central London, Islamic Society of Boston, or Dubai Hanafi, then save it.</li>
              <li>Preview several dates and compare every prayer with the original mosque calendar.</li>
              <li>
                Open <span className="font-semibold">Settings → Primary prayer time source</span> and select the
                imported City Mode profile. It will replace device-location calculations on Home and Prayer Times.
              </li>
              <li>
                Optionally open Masjid Mode and link this City Mode profile. The imported file supplies Athan times;
                the masjid profile continues to store its separate Iqama and Jumu&apos;ah schedule.
              </li>
            </ol>

            <div className="space-y-2 rounded-md border border-gray-700 bg-gray-950/50 p-3 text-xs text-gray-300">
              <h4 className="text-sm font-semibold text-white">Supported file notes</h4>
              <p><span className="font-semibold text-teal-300">Excel (.xlsx):</span> Put all dated rows on one sheet, preferably named All Days.</p>
              <p><span className="font-semibold text-teal-300">CSV (.csv):</span> Include one header row followed by all dated records in the same file.</p>
              <p>
                <span className="font-semibold text-teal-300">JSON (.json):</span> Use an array of prayer records, or
                an object containing a prayerTimes, data, or rows array. Location, latitude, and longitude metadata
                may also be included.
              </p>
              <p>The maximum import size is 5 MB. The file is processed locally and is not uploaded by Athan PWA.</p>
            </div>

            <div className="rounded-md bg-gray-950/70 p-3">
              <p className="text-xs font-semibold uppercase text-gray-400">Suggested AI prompt</p>
              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-gray-200">
                Create a yearly Gregorian prayer timetable from these monthly prayer-calendar photos as an .xlsx,
                .csv, or .json file.
                Use one row per date and the columns Date, Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha. Preserve
                every printed time exactly, include AM/PM or 24-hour times consistently, do not estimate missing
                values, and flag any unreadable cells for me to verify. If the source has separate Shafi and Hanafi
                times, use Asr Shafi, Asr Hanafi, Isha Shafi, and Isha Hanafi columns. Add all dates to a sheet named
                All Days when using Excel. For JSON, return an object with optional location, latitude, and longitude
                fields plus a prayerTimes array containing the same dated records.
              </p>
            </div>
            <p className="text-xs text-amber-200">
              Always compare several imported dates with the original printed calendar before choosing the profile
              as your primary source. Athan PWA validates the structure, but it cannot verify that an AI copied every
              photographed number correctly.
            </p>

            <div className="space-y-2 text-xs text-gray-300">
              <h4 className="text-sm font-semibold text-white">If the import is rejected</h4>
              <ul className="list-disc space-y-1 pl-5">
                <li>Check that the filename ends in .xlsx, .csv, or .json and is no larger than 5 MB.</li>
                <li>Make sure there are at least 300 valid dated rows, not separate decorative monthly tables without a Date column.</li>
                <li>Check that all required prayer columns are present and that merged cells have not hidden values.</li>
                <li>Remove headings, footnotes, or blank rows placed inside the daily records if they confuse the column layout.</li>
                <li>For a missing or unreadable date, correct the source file rather than guessing the prayer time.</li>
              </ul>
            </div>
          </div>
          <p>
            <span className="font-semibold text-teal-300">Masjid and Iqama:</span> Local Iqama can load rules from a
            saved masjid profile. A masjid can link to a City Mode Athan preset while keeping its own Iqama and
            Jumu’ah data. Imported settings can be edited without changing the masjid profile unless you tap Save
            Changes Back to Masjid.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Backup, PWA, and privacy:</span> Backup and Restore exports
            known Athan PWA localStorage data only. PWA status in Settings can show install/update/offline state.
            Athan PWA does not upload your personal app data.
          </p>
          <p>
            <span className="font-semibold text-teal-300">Friday and Salah:</span> Home shows Jumu’ah Mubarak on
            Fridays, Prayer Times labels Dhuhr as Jumu’ah visually on Friday, and Salah Tracker includes supportive
            streak/completion insights.
          </p>
        </div>
      </section>

      {/* QIBLA HELP */}
      <section id="qibla" className="space-y-2">
        <h2 className="text-xl font-semibold">Qibla not working or feels inaccurate?</h2>
        <QiblaStatusPanel />
        <p className="text-gray-200 text-sm">
          Opening Qibla automatically looks for your device location and starts the compass. If location fails,
          allow location access and tap Enable Location to retry. On iPhone, previously granted motion access is
          reused when possible; Safari may still require a tap on Enable Compass for a new permission grant.
        </p>
        <p className="text-gray-200 text-sm">
          In this web app, the <span className="font-semibold">Qibla screen</span> shows the angle from your
          location to the Kaaba, for example: <span className="italic">“🕋 257° from True North”</span>. The arrow
          on the screen is rotated to this angle. To face the Qibla, you align your body so that the 
          <span className="font-semibold"> top of your phone</span> or the arrow is pointing in that direction.
        </p>
        <p className="rounded-lg border border-teal-900 bg-teal-950/20 p-3 text-sm text-gray-200">
          Athan PWA accepts only an absolute, North-referenced compass heading. On iPhone this normally comes from
          Safari&apos;s compass heading; on supported Android browsers it comes from the absolute orientation event.
          If a browser supplies only relative motion data, the app keeps showing the numeric Qibla bearing but does
          not present that relative value as a real heading.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Common reasons for inaccuracy</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Magnetic interference:</span> Phone cases with magnets, metal tables,
            laptops, or other electronics can disrupt the built‑in compass that your browser uses.
            <br />
            <span className="font-semibold">Fix:</span> Remove magnetic/metal cases and move away from large metal
            objects or electronics before checking Qibla.
          </li>
          <li>
            <span className="font-semibold">Compass calibration:</span> Your device compass may need to be
            recalibrated.
            <br />
            <span className="font-semibold">Fix:</span> Move your phone slowly in a figure‑8 motion and follow any
            calibration prompts from your operating system (Android/iOS). This helps the browser get a better
            heading.
          </li>
          <li>
            <span className="font-semibold">Weak GPS or location signal:</span> Inside buildings or underground
            areas, your browser may only get a rough location based on Wi‑Fi, which can slightly shift the Qibla
            angle.
            <br />
            <span className="font-semibold">Fix:</span> Step near a window or go outdoors for a more accurate
            location, then reopen the Qibla screen or tap <span className="font-semibold">Refresh</span> on the Home
            screen to update your position.
          </li>
          <li>
            <span className="font-semibold">Poor internet connection:</span> On some devices, a very weak data
            connection can delay or block location updates.
            <br />
            <span className="font-semibold">Fix:</span> Make sure you have a reasonably stable connection, then try
            again.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">What you can do to confirm accuracy</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Compare with <span className="font-semibold">more than one Qibla app</span> or website.</li>
          <li>Use <span className="font-semibold">natural landmarks</span> (sun, shadows) according to local guidance.</li>
          <li>Check with a <span className="font-semibold">reliable physical compass</span> if available.</li>
          <li>Ask your <span className="font-semibold">local masjid</span> or community if you are unsure.</li>
          <li>Compare with <span className="font-semibold">more than one phone</span> it might be that the phones GPS could be broken.</li>


        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Quick fixes to try first</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Remove your phone case or metal/magnetic attachments.</li>
          <li>Close all tabs with heavy apps, then reopen the Athan web app.</li>
          <li>Restart your phone or browser to clear out any sensor issues.</li>
          <li>Check that <span className="font-semibold">Location</span> is allowed for this site in your browser settings.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          There is no separate “recalibrate” button inside the web app. Calibration is controlled by your device and
          browser. If you keep having issues, try using a different browser on the same device to compare.
        </p>

          <p className="text-gray-300 text-xs">
            Note that if your device’s GPS is not working, then trying different apps will also give incorrect results. This is because GPS accuracy mainly depends on the device’s hardware — specifically the GPS receiver and antenna — not the app you are using. If the hardware cannot lock on to satellites or is giving weak or incorrect signals, no app will be able to fix or override that. In that case, only using someone else’s phone with a properly functioning GPS will give accurate results.

          </p>

          <p className="text-gray-300 text-xs">
          Also when you are in Kabba (Make dua for everyone) DONT CHECK QIBLA because you are already in the location of Qibla so the compass will be confused.
          May Allah bless you all.
        </p>
      </section>

      {/* QURAN HELP */}
      <section id="quran" className="space-y-2">
        <h2 className="text-xl font-semibold">How to use the Quran view</h2>
        <p className="text-gray-200 text-sm">
          The Quran feature in this web app is a <span className="font-semibold">text‑based reader</span> designed
          for mobile and desktop browsers. It does not use "pages" like a PDF; instead, you select a
          <span className="font-semibold"> surah (chapter)</span> and scroll through its ayahs.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Reading modes</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Arabic + English:</span> Shows Arabic text with an English translation
            under each ayah. This is the default for many users.
          </li>
          <li>
            <span className="font-semibold">Arabic only:</span> Shows only the Arabic text for a cleaner recitation
            view.
          </li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Choosing a surah</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Open the <span className="font-semibold">Quran</span> tab from the Home screen.</li>
          <li>You will see a list of all surahs with their Arabic and English names.</li>
          <li>Tap or click any surah to load its verses. The app will fetch the text once and keep it for that session.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Adjusting text size</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Use the <span className="font-semibold">font size control</span> at the top of the Quran view.</li>
          <li>The size is remembered in your browser using <span className="font-semibold">local storage</span>, so the
              same device will keep your preferred reading size even after you close the tab.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          Quran in the web app is currently in <span className="font-semibold">beta</span>. More translations and
          navigation options (like Juz and Hizb navigation) may be added in future updates.
        </p>
      </section>

      {/* BOOKMARKS HELP */}
      <section id="bookmarks" className="space-y-2">
        <h2 className="text-xl font-semibold">Quran bookmarks (web version)</h2>
        <p className="text-gray-200 text-sm">
          In this web app, bookmarks are attached to <span className="font-semibold">individual ayahs</span>, not
          pages. This gives you very precise control over where you want to return.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Adding or removing a bookmark</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>While viewing a surah, each ayah has a small <span className="font-semibold">bookmark icon</span>.</li>
          <li>Tap or click the icon to bookmark that ayah. Tapping again removes the bookmark.</li>
          <li>You can bookmark as many ayahs as you like. There is no fixed limit in the web version.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Viewing only your bookmarks</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Use the <span className="font-semibold">“View Bookmarks”</span> /
            <span className="font-semibold"> “Showing Bookmarks”</span> button near the top of the Quran view.</li>
          <li>When enabled, the list will only show ayahs that you have bookmarked for that surah.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Clearing bookmarks</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            Tap <span className="font-semibold">“Clear Bookmarks”</span> to remove <span className="font-semibold">all
            saved ayah bookmarks</span> from this browser.
          </li>
          <li>
            Bookmarks are stored locally in your browser. Clearing them here does not affect any other device.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          All bookmarks and preferences are saved on your device only. If you clear your browser data or use
          a different phone/computer, your bookmarks will not automatically sync.
        </p>
      </section>

      {/* LOCATION HELP */}
      <section id="location" className="space-y-2">
        <h2 className="text-xl font-semibold">Location & prayer time accuracy</h2>
        <p className="text-gray-200 text-sm">
          The web app uses your <span className="font-semibold">browser location</span> to calculate prayer times and
          the Qibla angle. On phones this usually comes from GPS; on desktops it may be based on Wi‑Fi or IP, which is
          less precise.
        </p>
        <p className="text-gray-200 text-sm">
          If you select a saved city as your primary prayer source, its times default to that city&apos;s clock. You can
          choose City time, Device time, or UTC in Settings under Primary prayer time source. The timezone label shows
          which view you are reading. The prayer instant and countdown remain the same. If the city&apos;s timezone is
          unavailable, the app labels the fallback instead of guessing a city clock.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Getting a good location fix</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>Allow <span className="font-semibold">Location</span> when the browser asks for permission.</li>
          <li>On the Home screen, tap <span className="font-semibold">Refresh</span> to request a new location and
              recalculate today's prayer times.</li>
          <li>If you recently travelled, use <span className="font-semibold">Refresh</span> after arriving in the new
              city so that times update correctly.</li>
          <li>Going outdoors or near a window usually improves accuracy.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          If location is denied, the app may not be able to compute accurate times. For now, the web version does not
          include full manual location entry, so enabling browser location is recommended.
        </p>
      </section>

      {/* CALCULATION METHOD, MADHAB & HIGH-LATITUDE RULE */}
      <section id="calculation" className="space-y-2">
        <h2 className="text-xl font-semibold">Calculation method, Madhab & High‑latitude rule</h2>
        <p className="text-gray-200 text-sm">
          Athan calculates prayer times using standard astronomy formulas plus a few important settings. These settings
          do <span className="font-semibold">not change your Islamic belief</span>, they only control how the time is
          calculated in edge cases. If your app version has a <span className="font-semibold">Settings</span> screen for
          prayer time calculation, you may see three options:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Calculation method</span> – which organisation&apos;s angles/rules to use (MWL, Umm al‑Qura, etc.).</li>
          <li><span className="font-semibold">Madhab (Asr)</span> – whether Asr starts when the object&apos;s shadow is equal to its length (Shafi&apos;i/others) or double (Hanafi).</li>
          <li><span className="font-semibold">High‑latitude rule</span> – how to handle Fajr and Isha when nights are very short or the sun barely sets.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">1. Choosing a calculation method</h3>
        <p className="text-gray-200 text-sm">
          For most users, the default method is fine (often <span className="font-semibold">Muslim World League (MWL)</span>).
          If your local masjid or Islamic centre publishes a timetable, that is the best reference:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Ask your masjid</span> which method they use, and select the same one.</li>
          <li>If you are unsure, you can usually keep <span className="font-semibold">MWL</span> or whatever the app sets as default.</li>
          <li>If you compare with another app or printed timetable and the difference is only a few minutes, that is normal.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          Examples (not strict rules): Many European cities commonly use MWL or similar; in Saudi Arabia you may see Umm al‑Qura; UAE uses Dubai; In Egypt its often Egyptian General Authority of Survey; and many more;
          some regions follow local official timetables that match a specific method. Its best to check with your local masjid or Islamic authority if unsure. If that is not possible search in google for your city name + prayer times + method to get an idea of what is commonly used in your area.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">2. Choosing Madhab for Asr</h3>
        <p className="text-gray-200 text-sm">
          The <span className="font-semibold">Madhab setting only affects Asr time.</span> It does not change Fajr, Dhuhr,
          Maghrib or Isha.
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Standard / Shafi&apos;i (shadow = 1× length):</span> Used by Shafi&apos;i, Maliki, Hanbali and many global timetables.</li>
          <li><span className="font-semibold">Hanafi (shadow = 2× length):</span> Used by Hanafi communities, especially in India, Pakistan, parts of the UK, etc.</li>
        </ul>
        <p className="text-gray-200 text-sm">
          If you follow the <span className="font-semibold">Hanafi madhab</span>, choose the Hanafi option so Asr will start later.
          Otherwise, you can keep the standard (Shafi&apos;i) option.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">3. High‑latitude rule (very long days/nights)</h3>
        <p className="text-gray-200 text-sm">
          In countries far from the equator (for example, <span className="font-semibold">UK, Scandinavia, Canada, northern Europe</span>),
          some summer nights are very short and the sun does not go far below the horizon. In these cases, normal formulas
          can give extreme or even impossible times for <span className="font-semibold">Fajr</span> and <span className="font-semibold">Isha</span>.
        </p>
        <p className="text-gray-200 text-sm">
          The <span className="font-semibold">High‑latitude rule</span> tells the app how to adjust those times in a balanced way.
          You may see options such as:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li><span className="font-semibold">Middle of the night:</span> Places Fajr and/or Isha halfway between sunset and sunrise.</li>
          <li><span className="font-semibold">One‑seventh of the night:</span> Uses 1/7 of the night length from sunset/fajr as a boundary.</li>
          <li><span className="font-semibold">Angle‑based / Nearest latitude:</span> Uses a reference latitude or fixed angle when local values break down.</li>
        </ul>
        <p className="text-gray-200 text-sm">
          If you live in a high‑latitude area, the safest option is to <span className="font-semibold">match your local masjid&apos;s timetable</span>.
          Ask which rule they follow or which other well-known app matches their times most closely, and choose the same option here.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">4. What if I move to another country?</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>After you travel, open the app, allow <span className="font-semibold">Location</span>, and tap <span className="font-semibold">Refresh</span> on the Home screen.</li>
          <li>Check a local masjid timetable in the new country and, if needed, adjust the <span className="font-semibold">method, madhab and high‑latitude rule</span> to match.</li>
          <li>You do <span className="font-semibold">not</span> need to change settings every day; set them once for your region and they will stay saved on this device.</li>
        </ul>

        <p className="text-gray-300 text-xs">
          If you are ever unsure: follow your local scholar, imam or masjid timetable first, and then adjust the app so that
          its times closely match what they use. The app is only a tool to help you, not a replacement for knowledgeable guidance.
        </p>
      </section>

      {/* NOTIFICATIONS HELP */}
      <section id="notifications" className="space-y-2">
        <h2 className="text-xl font-semibold">Reminders & notifications (web version)</h2>
        <p className="text-gray-200 text-sm">
          The current web app focuses on accurate times and Quran reading. It does
          <span className="font-semibold"> not yet send push notifications or play full Athan audio</span> in the
          background like a native app.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">How you can still set reminders</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            Use the <span className="font-semibold">Home screen</span> to see the next prayer and live countdown.
            Keeping the tab open helps you stay aware of upcoming times.
          </li>
          <li>
            Use your phone’s <span className="font-semibold">built‑in alarm or calendar app</span> to create recurring
            reminders based on the times shown in the app.
          </li>
          <li>
            A good time for <span className="font-semibold">Isha‑related reminders</span> is usually after Isha Athan
            and before Fajr. For example, if Fajr is at 5:00 AM and Isha is at 8:00 PM, a personal reminder window
            between <span className="font-semibold">9:00 PM and 11:59 PM</span> may work well for many people.
          </li>
        </ul>

        <p className="text-gray-300 text-xs">
          Iqama Times is available as its own feature. You can set a fixed time or an offset after Athan for each
          prayer, preview the schedule, and export Iqama reminders to a calendar file. Calendar alerts are handled
          by your calendar app.
        </p>
      </section>

      {/* HOW TO DOWNLOAD THE APP */}
      <section id="downloadapp" className="space-y-2">
        <h2 className="text-xl font-semibold">📱 How to Install Athan App (Android & iPhone)</h2>

        <p className="text-gray-200 text-sm">
          This is the <span className="font-semibold">beta-testing</span> launch of the Athan web app. You can
          install it to your home screen so it behaves like a normal app and works offline after the first load.
          The current beta is available at:
        </p>
        <p className="text-teal-300 text-sm font-mono break-all">
          https://test-athan-pwa.vercel.app/
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">✅ Install on Android</h3>
        <p className="text-gray-200 text-sm">
          Installing the Athan App on Android is very easy:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Open the website in Chrome</span>
            <br />
            Visit: <span className="font-mono text-teal-300">https://test-athan-pwa.vercel.app/</span>
          </li>
          <li>
            <span className="font-semibold">Look for “Install App”</span>
            <br />
            Most Android phones will automatically show:
            <ul className="list-disc pl-5 mt-1">
              <li>A banner at the bottom saying <span className="italic">“Add to Home Screen”</span>, or</li>
              <li>A pop-up saying <span className="italic">“Install App”</span></li>
            </ul>
            Tap it.
          </li>
          <li>
            <span className="font-semibold">If you don&apos;t see it</span>
            <br />
            Tap the three dots (⋮) in the top-right corner of Chrome and choose
            <span className="font-semibold"> Add to Home screen</span>.
          </li>
          <li>
            <span className="font-semibold">Confirm</span>
            <br />
            Tap <span className="font-semibold">Add</span>, then <span className="font-semibold">Add to Home screen</span> again.
          </li>
        </ol>
        <p className="text-gray-300 text-xs">
          That&apos;s it — the app will now appear on your home screen just like a normal app, with your Athan icon.
        </p>

        <hr className="border-gray-700 my-3" />

        <h3 className="font-semibold text-teal-300 text-sm mt-2">🍎 Install on iPhone (iOS – Safari only)</h3>
        <p className="text-gray-200 text-sm">
          Apple requires a few extra steps, but it&apos;s still very easy:
        </p>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200 text-sm">
          <li>
            <span className="font-semibold">Open the website in Safari</span>
            <br />
            Visit: <span className="font-mono text-teal-300">https://test-athan-pwa.vercel.app/</span>
            <br />
            <span className="text-xs text-gray-300">
              Important: iOS only allows installation from <span className="font-semibold">Safari</span>, not Chrome.
            </span>
          </li>
          <li>
            <span className="font-semibold">Tap the Share button</span>
            <br />
            At the bottom of the screen, tap the square with the arrow pointing up (⬆️).
          </li>
          <li>
            <span className="font-semibold">Scroll down</span>
            <br />
            Find and tap <span className="font-semibold">Add to Home Screen</span>.
          </li>
          <li>
            <span className="font-semibold">Confirm the name</span>
            <br />
            You will see <span className="font-mono">Athan PWA</span>. Tap <span className="font-semibold">Add</span> (top-right corner).
          </li>
        </ol>
        <p className="text-gray-300 text-xs">
          The Athan app will now appear on your home screen with the icon.
        </p>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">In short</h3>
        <div className="text-gray-200 text-sm space-y-1">
          <p>
            <span className="font-semibold">Android:</span> Open in Chrome → “Add to Home Screen” → Confirm.
          </p>
          <p>
            <span className="font-semibold">iPhone:</span> Open in Safari → Share → “Add to Home Screen” → Add.
          </p>
        </div>

        <p className="text-gray-300 text-xs mt-2">
          After you install the app to your home screen using the above steps, it will work offline after the first
          successful load, InshaAllah. Some features like initial Quran loading still need an internet connection the
          first time you open them, but afterwards the app is designed to be lightweight and cache data on your
          device.
        </p>
      </section>

      {/* HOW TO USE PRAYER TIME METHODS */}
      <section id="methods" className="space-y-2">
        <h2 className="text-xl font-semibold">Which calculation method should I choose?</h2>
        <p className="text-gray-200 text-sm">
          Different organisations use slightly different angles and rules to calculate <span className="font-semibold">Fajr</span>
          and <span className="font-semibold">Isha</span>. This does <span className="font-semibold">not change your aqeedah</span> – it only
          affects a few minutes earlier or later. The safest option is always to <span className="font-semibold">match your local masjid or
          Islamic authority</span> and then set the app to use the same method.
        </p>

        <p className="text-gray-200 text-sm">
          Below is a very simple overview of the most common methods and where they are often used. These are
          <span className="font-semibold">general patterns, not strict rules</span> – individual masjids may follow something different.
        </p>

        <div className="overflow-x-auto text-xs sm:text-sm">
          <table className="min-w-full border border-gray-700 text-left">
            <thead className="bg-gray-800">
              <tr>
                <th className="border-b border-gray-700 px-2 py-1 font-semibold">Method</th>
                <th className="border-b border-gray-700 px-2 py-1 font-semibold">Common regions / examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Muslim World League (MWL)</td>
                <td className="border-b border-gray-700 px-2 py-1">Many European cities, Russia, Australia, parts of Africa; often used as a global default when no local authority is known.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Umm al-Qura (Makkah)</td>
                <td className="border-b border-gray-700 px-2 py-1">Saudi Arabia (official), sometimes nearby Gulf countries.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Egyptian General Authority</td>
                <td className="border-b border-gray-700 px-2 py-1">Egypt, and often Jordan, Lebanon, Syria, Palestine and surrounding areas.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Karachi (Hanafi)</td>
                <td className="border-b border-gray-700 px-2 py-1">Pakistan, India, Bangladesh, Afghanistan, Sri Lanka; some Hanafi mosques in the UK and elsewhere.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Dubai</td>
                <td className="border-b border-gray-700 px-2 py-1">United Arab Emirates (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Qatar</td>
                <td className="border-b border-gray-700 px-2 py-1">Qatar (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Kuwait</td>
                <td className="border-b border-gray-700 px-2 py-1">Kuwait (official).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Moonsighting Committee</td>
                <td className="border-b border-gray-700 px-2 py-1">Some communities in North America, UK, South Africa and elsewhere who follow Moonsighting Committee Worldwide (MCW).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">North America / ISNA</td>
                <td className="border-b border-gray-700 px-2 py-1">United States and Canada (especially older timetables and apps).</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Singapore</td>
                <td className="border-b border-gray-700 px-2 py-1">Singapore (MUIS) and sometimes nearby regions.</td>
              </tr>
              <tr>
                <td className="border-b border-gray-700 px-2 py-1">Tehran</td>
                <td className="border-b border-gray-700 px-2 py-1">Iran (official) and some Shia communities.</td>
              </tr>
              <tr>
                <td className="px-2 py-1">Turkey (Diyanet)</td>
                <td className="px-2 py-1">Turkey (official), Turkish communities abroad, sometimes Cyprus.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-300 text-xs">
          If the times in the app differ slightly (a few minutes) from your local masjid, that is normal and often
          due to different methods or rounding. If the difference is large, ask which method your masjid uses and
          select the closest match above. When in doubt, follow your local masjid or scholar first, and use the app
          as a helpful tool, not as a replacement for knowledge.
        </p>
      </section>
            
            {/* HOW TO USE CALENDAR NOTIFICATIONS */}
            <section id="downloadics" className="space-y-2">
        <h2 className="text-xl font-semibold">Reminders via Calendar (.ics)</h2>
        <p className="text-gray-200">
          You can let your phone&apos;s calendar handle prayer alerts even when the PWA is closed by exporting an
          .ics file from the Settings screen.
        </p>

        <h3 className="font-semibold mt-3">Step-by-step: Exporting reminders</h3>
        <ol className="list-decimal pl-5 space-y-1 text-gray-200">
          <li>Open the <span className="font-semibold">Settings</span> tab at the bottom of the app.</li>
          <li>Scroll to the section called <span className="font-semibold">Reminders via Calendar (.ics)</span>.</li>
          <li>
            In <span className="font-semibold">Reminder offset (minutes before each prayer)</span>, choose how many
            minutes before every prayer you want the reminder (for example 10, 15, or 20).
          </li>
          <li>
            Optionally enable a second reminder and choose another time before each regular prayer event. One exported
            event can contain two alerts, such as 10 and 15 minutes before.
          </li>
          <li className="font-semibold">
            Check the primary prayer source shown in Settings before exporting. The file uses the selected saved city
            and its calculation settings or imported timetable; when no city is selected, it uses current device location.
          </li>
          <li>
            (Optional) Set your <span className="font-semibold">Fixed Isha reminder (HH:mm)</span> time between Isha
            and Fajr if you want an extra nightly reminder as a separate calendar event.
          </li>
          <li>
            Tap one of the export buttons:
            <span className="font-semibold"> Export 1 day (.ics)</span>,
            <span className="font-semibold"> Export 7 days (.ics)</span>,
            <span className="font-semibold"> Export 30 Days (.ics)</span>, or
            <span className="font-semibold"> Export 1 Year (.ics)</span>.
          </li>
          <li>
            When the .ics file finishes downloading, open it. Your device will ask which calendar to add the events to –
            you can use an existing calendar or create a new one like. Its better to create a  <span className="font-semibold">  NEW CALENDAR </span> named
            <span className="font-semibold"> &quot;Athan Reminders&quot;</span> to keep them separate. This will make sure that it will be easy to delete if you travel. As Calendar apps do not support mass event deleting.
          </li>
          <li>
            Make sure that calendar is visible in your calendar app and that notifications are allowed for it in your
            phone&apos;s system settings.
          </li>
        </ol>

        <h3 className="font-semibold mt-4">Important notes & things to watch out for</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200">
          <li>
            <span className="font-semibold">Your primary prayer source is used when exporting.</span> If you switch
            the selected city or travel to another location, export a fresh .ics file for the source you want.
          </li>
          <li>
            <span className="font-semibold">Changing settings does not update old events automatically.</span> If you
            change calculation method, madhab, high latitude rule, reminder offset, or fixed Isha time, export and
            import a new .ics file. Old events will stay as they are.
          </li>
          <li>
            <span className="font-semibold">Avoid duplicate events.</span> If you re-export, you may want to delete the
            old &quot;Athan Reminders&quot; calendar (or its events) first so you don&apos;t end up with duplicates.
          </li>
          <li>
            <span className="font-semibold">Time zones matter.</span> Exported prayer events identify their source and
            use UTC instants. Calendar apps normally show those instants in the device&apos;s current time zone, so a
            saved city&apos;s 5:59 PM prayer can appear at a different clock time while you are elsewhere.
          </li>
          <li>
            <span className="font-semibold">Calendar alerts, not the PWA, make the sound.</span> Once imported, your
            device&apos;s calendar is responsible for the notification sound and banner, so make sure calendar
            notifications are enabled in system settings.
          </li>
          <li>
            <span className="font-semibold">Second alerts are optional.</span> The extra alert applies to regular
            prayer-time events. Fixed Isha, Jumu&apos;ah, and Salah Tracker review keep their own existing alert behavior.
          </li>
        </ul>
      </section>

      <section id="salah-search" className="space-y-3">
        <h2 className="text-xl font-semibold">Search Salah progress</h2>
        <p className="text-sm text-gray-200">
          Open Salah Tracker for daily logging and notes. Its Insights, Search Salah Progress, and Graph Insights
          buttons open separate views of your private records. Search results are days, and tapping a day returns
          to its calendar entry.
        </p>
        <p className="text-sm text-gray-200">
          Graph Insights keeps the existing completion bars and adds a line chart to make the weekly or monthly
          direction easier to see. Each point uses completed prayers divided by logged prayers; gaps mean no prayers
          were logged in that period.
        </p>
        <p className="text-sm text-gray-200">
          The numbers 1–5 mean Fajr, Dhuhr, Asr, Maghrib, and Isha. A prayer name or number finds days when it was
          completed: <code>fajr</code> and <code>1</code> mean the same thing. Use <code>!</code> for explicitly
          missed, <code>~</code> for not logged, and <code>/</code> for either missed or not logged.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-200">
          <li><code>1&amp;2</code> finds days when both Fajr and Dhuhr were completed.</li>
          <li><code>[1&amp;2]</code> finds days when only those two were completed; other prayers may be missed or unlogged.</li>
          <li><code>!2,!3</code> finds days when Dhuhr or Asr was explicitly missed.</li>
          <li><code>1&amp;(!2,!3)</code> finds days when Fajr was completed and either Dhuhr or Asr was missed.</li>
          <li><code>Oct.30</code> finds October 30 across all recorded years.</li>
          <li><code>2026y.6m.23d</code>, <code>6m.2026y.23d</code>, and <code>23d.Jun.26y</code> all find June 23, 2026.</li>
          <li><code>5m</code> finds May in any year; <code>5m.26y</code> finds May 2026; <code>2026y</code> finds recorded dates throughout 2026.</li>
          <li><code>10m.23d.26</code> and <code>10.23d.2026y</code> infer the missing label and both find October 23, 2026.</li>
          <li><code>(23d.06m.2026y)&amp;fajr</code> finds June 23, 2026 if Fajr was completed.</li>
          <li><code>(Jun.26y)&amp;fajr</code> finds June 2026 days when Fajr was completed.</li>
        </ul>
        <p className="text-sm text-gray-200">
          Join date parts with a dot in any order. June, Jun, and 6m are equivalent, and month names are not case-sensitive.
          Use d for day, m for month, and y for year; two-digit years mean 2000–2099. When two parts are identified,
          the third number can omit its label. Month names identify the month too. The special two-part form Oct.23
          means October 23 in any year, never October 2023. Other unlabeled, ambiguous date formats show an error.
          Put the date in parentheses before combining it with prayer filters, such as (Jun.26y)&amp;!fajr.
          Searches use recorded days through
          today by default. Enable the date-range option to include days with no records. Invalid dates, such as February 30,
          show an error rather than changing your records.
        </p>
        <p className="text-xs text-gray-400">
          A missed prayer is a recorded status. A prayer left unlogged is unknown and is never counted as missed.
          Search, notes, and graphs stay on your device.
        </p>
      </section>
      

      {/* TROUBLESHOOTING & CONTACT */}
      <section id="troubleshooting" className="space-y-2">
        <h2 className="text-xl font-semibold">Troubleshooting & contact</h2>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">General tips</h3>
        <ul className="list-disc pl-5 space-y-1 text-gray-200 text-sm">
          <li>If something looks blank or broken, reload the page.</li>
          <li>Try using a different browser (Chrome, Safari, Edge, Firefox) to see if the issue is browser‑specific.</li>
          <li>On desktop, you can open Developer Tools (usually F12) and check the <span className="font-semibold">Console</span> for any clear error messages.</li>
          <li>If you installed the PWA to your Home Screen, remove it and install it again only as a last resort.</li>
        </ul>

        <h3 className="font-semibold text-teal-300 text-sm mt-2">Contact us</h3>
        <p className="text-gray-200 text-sm">
          If issues keep happening or something is confusing, we are happy to help. Please email us with details
          (device, browser, screenshots if possible):
        </p>
        <p className="text-teal-300 text-sm font-mono">
          aaamaq.contact.us@gmail.com
        </p>
        <p className="text-gray-300 text-xs">
          JazakAllahu khairan for using this app and for any feedback you send. Your suggestions directly help improve
          the experience for everyone.
          Just remember that we know neither your birthday nor your shoe size and we'd like to keep it that way.
          We value your privacy and will never ask for personal information that is not necessary for the app to function. 
          We are here to help with any technical issues or questions about using the app, so please don&apos;t hesitate to reach out if you need assistance.
        </p>
      </section>
    </div>
  )
}

type QiblaStoredStatus = {
  compassSupported?: boolean
  compassPermissionNeeded?: boolean
  compassStatus?: string
  locationStatus?: string
  bearing?: number
  heading?: number | null
  headingSource?: 'ios-compass' | 'android-absolute-sensor' | 'android-absolute-orientation' | null
  aligned?: boolean
}

function QiblaStatusPanel() {
  const [status, setStatus] = useState<QiblaStoredStatus | null>(null)
  const [locationPermission, setLocationPermission] = useState('unknown')
  const [orientationSupported, setOrientationSupported] = useState(false)

  useEffect(() => {
    setOrientationSupported(typeof window !== 'undefined' && 'DeviceOrientationEvent' in window)
    try {
      const raw = localStorage.getItem('athan.qibla.status.v1')
      if (raw) setStatus(JSON.parse(raw) as QiblaStoredStatus)
    } catch {
      setStatus(null)
    }

    async function readPermission() {
      try {
        if ('permissions' in navigator) {
          const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
          setLocationPermission(result.state)
        }
      } catch {
        setLocationPermission('unknown')
      }
    }

    readPermission()
  }, [])

  return (
    <div className="rounded-lg border border-teal-800 bg-gray-900 p-4 space-y-3 text-sm">
      <h3 className="font-semibold text-teal-300">Qibla compass status</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <StatusLine label="Device orientation" value={orientationSupported ? 'Supported' : 'Not detected'} />
        <StatusLine label="Compass permission needed" value={status?.compassPermissionNeeded ? 'Yes on this browser' : 'Usually no / unknown'} />
        <StatusLine label="Compass status" value={status?.compassStatus ?? 'Open Qibla to check'} />
        <StatusLine label="Location permission" value={status?.locationStatus ?? locationPermission} />
        <StatusLine label="Bearing to Ka‘bah" value={typeof status?.bearing === 'number' ? `${status.bearing.toFixed(1)}°` : 'Open Qibla to calculate'} />
        <StatusLine label="Current heading" value={typeof status?.heading === 'number' ? `${status.heading.toFixed(0)}°` : 'Waiting for compass'} />
        <StatusLine label="Heading source" value={formatQiblaHeadingSource(status?.headingSource)} />
      </div>
      <div className="space-y-1 text-gray-300">
        <p>Move your phone in a figure-eight motion to improve compass calibration.</p>
        <p>Keep your phone away from magnets, metal objects, speakers, and electronic devices that may affect compass accuracy.</p>
        <p>If Qibla appears incorrect, check that location and motion/orientation permissions are enabled.</p>
      </div>
    </div>
  )
}

function formatQiblaHeadingSource(source: QiblaStoredStatus['headingSource']) {
  if (source === 'ios-compass') return 'iPhone compass'
  if (source === 'android-absolute-sensor') return 'Android magnetic North sensor'
  if (source === 'android-absolute-orientation') return 'Android absolute orientation'
  return 'No absolute heading recorded'
}

function StatusLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded bg-gray-800 p-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-semibold text-gray-100">{value}</div>
    </div>
  )
}
