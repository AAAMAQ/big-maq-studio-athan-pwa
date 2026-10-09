# v4.0.2 — Clearer Qibla & Quick Refresh

Date: October 9, 2026 (Asia/Shanghai). Baseline main: 1a0a107. Implementation complete; physical-phone verification remains pending. The user authorized committing and pushing this release to GitHub on main. No branch, manual deployment or release tag is requested.

## User stories and cause

1. Latest user steering: attempt iPhone motion/orientation access each time Qibla opens, so missing permission does not silently look like a broken compass. This replaces the earlier request to suppress automatic permission calls in this pending release. Safari/iOS owns whether its native popup appears; the app cannot guarantee a popup or permanent approval. A clear Enable Compass fallback and live/waiting status are required.
2. Settings → PWA status → Refresh app reloads the current application without invoking the update flow, deleting caches, unregistering service workers or resetting records. Save unfinished work first. This is not an OS force-quit or a guarantee that all RAM is released.
3. Explain iPhone/Android differences in current Help and Developer Notes: the same geographic Qibla bearing but distinct heading sources, permissions, smoothing and accuracy limitations. Do not claim identical sensor behavior or a universal accuracy winner.

## Implemented

- Qibla attaches its existing validated heading listener and attempts permission once on each visit when the iOS request API exists. Valid headings show Live compass and hide Enable Compass. Other supported browsers keep their existing sensor startup without an iOS API call.
- If automatic permission is rejected (including a required user gesture), the screen explicitly says to tap Enable Compass and choose Allow if asked. Permission requests from that button invoke the API before any await, preserving the tap's user activation. Pending requests disable that action across Simple/Advanced modes; late results are ignored after leaving or once valid readings work.
- A successful grant restarts listener readiness checks but does not declare the compass live. The waiting message and retry button remain until a valid heading arrives; a no-heading timeout gives clear retry guidance. Status appears above the Simple mode Enable Compass control and is announced accessibly. Leaving stops the sensor listener and location watch. Physical location startup/retry and bearing/heading calculations are unchanged.
- No permission flag is persisted as authorization. Browser permission expiry/revocation must still be respected. No permission bypass, new upload, preference, backup key or dependency.
- Added separate English/Arabic Refresh app controls with an explanation of saved-data safety, unfinished work and cached offline use. Refresh is disabled while an intentional update check is pending; it is otherwise available offline too.
- Normal reload calls only `window.location.reload()`. Normal browser navigation/service-worker behavior may occur, but the action does not call the application's update API or intentionally activate a waiting worker.
- Updated package/lock release metadata, Credits, Developer Notes, README and current Help/Markdown. The old Need Help archive is untouched.
- Added Help sections for the shared initial great-circle calculation, Safari's supplied compass heading, Android quaternion/absolute-event fallback and smoothing, sensor versus geographic North, and the 5° display tolerance. The guide explicitly states that this version adds no independent magnetic-declination correction or certified angular-accuracy estimate. Sources are linked in Help; no Qibla sensor engines or calculations changed.

## Verification

- Final release verification: focused Help/Qibla checks passed 71 tests; full suite passed 48 files / 289 tests. ESLint, TypeScript/Vite production build and Git whitespace checks passed. New production entry is `index-xuJ9xK1i.js`. Existing browser-dataset age warnings remain nonblocking.
- Help contracts check platform descriptions and accuracy caveats, valid source links, and complete Markdown/in-app content parity. Android/iOS sensor regression tests pass; the sensor engines and old guide archive have no changes in this release. No physical-device accuracy claim is inferred from simulated tests.
- Added simulated checks for permission requests on each visit, required-tap fallback, denial, duplicate pending taps, live readings arriving during a pending request, grant without heading, no-heading retry, Advanced mode fallback, supported non-iOS startup and cleanup after unmount. These are simulated API tests, not real iPhone sensor results.
- PWA unit tests confirm reload without update requests, cache deletion, worker unregister or record reset, including offline state; Refresh stays disabled during a pending update.
- Production preview: http://127.0.0.1:4185/ (preview session 25734). Settings-only browser verification; no attempt to prove Qibla using unsupported Mac sensors and no location/motion permission granted.
- Earlier Refresh browser pass (before the latest Qibla steering): browser loaded `index-DZleB1Sz.js` through the existing safe update control, without clearing storage. Verified Refresh app at 390×844 with no horizontal overflow; clicking it reloaded to Home. Returning to Settings retained the existing Karachi method and 24-hour preference. Inspected runtime error logs were empty. Reset the temporary viewport; left Settings/PWA status open for testing. Refresh remains unchanged by the latest Qibla edit.
- [Phone-sized Refresh preview](</Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-2-2026-10-09/evidence/refresh-mobile.png>) (/Users/abdulqadir/Documents/Codex Task Snapshots/athan-pwa-v4-0-2-2026-10-09/evidence/refresh-mobile.png)
- React review emphasized stable request callbacks, direct tap-triggered fallback requests, listener cleanup, late-promise guards, duplicate-request protection, accessible status, existing visual styles and no additional background work. Work handled directly; the focused flow did not need delegation.

## Required iPhone follow-up

1. Load v4.0.2 and open Qibla: the app attempts motion access. Choose Allow if prompted. A missing native dialog alone is not failure: iOS can reuse permission or require an explicit tap.
2. If no live heading appears, tap Enable Compass and choose Allow if asked. Confirm the waiting message is visible and that only actual heading readings switch to Live compass and update alignment while rotating the phone.
3. Return Home and reopen Qibla several times. Confirm access is attempted once per visit, no repeated automatic retry loop occurs, and available readings resume. If iOS requires a tap, Enable Compass remains available—the app cannot force its popup or permanent approval.
4. Test Cancel/denial, a grant without sensor readings, and a fresh app launch after force-closing. Verify helpful fallback/retry messages and the numeric bearing; never interpret permission granted alone as an active compass.
5. In Settings → PWA status, tap Refresh app. Confirm the app reloads and personal records/settings remain. Check cached offline refresh separately. Do not clear storage for this test.

## Android and guide follow-up

- Check the existing Android compass on a supported physical phone/browser, including sensor fallback and screen orientation; this release does not change its sensor math or smoothing. Do not equate successful permission or Live compass with certified accuracy.
- Read Need Help → Qibla for the shared calculation, separate platform paths and magnetic/True North caveat. Compare against trusted local direction, not just another app using the same sensor.

Permission-reference boundary: [MDN requestPermission documentation](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static). The API requires an explicit user action when requesting new permission; the web app cannot programmatically choose permanent consent.
