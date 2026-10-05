# Salah Stars and Search Extensions — Planning Notes

Recorded: 2026-10-05

Status: Product planning only. No app implementation, release-note entry, version bump, or deployment is authorized by this document. The user requested that these ideas be analyzed and recorded before implementation. The app is currently v3.3.3.

The user has now assigned this feature wave to **v4.0.0 — Your App, Your Flow**. The consolidated [v4.0.0 update plan](./V4_0_0_UPDATE_PLAN.md) includes these definitions alongside optional layouts, Performance Mode, Settings disclosure, and the latest release scope. It supersedes earlier scope/priority suggestions here where they differ; the app version has not yet been changed.

## Purpose and priorities

Extend the existing Salah day-search model with completed-prayer stars, notes presence, logging coverage, date ranges, weekdays, and saved searches. Each day remains one result with independently searchable attributes. Preserve the app's current visual style, private records, and lightweight operation on older phones. Performance/reliability is a separate workstream within the consolidated v4.0.0 release plan.

## 1. Stars are a completed-prayer count

One completed obligatory prayer earns one star. The five obligatory prayers are Fajr, Dhuhr, Asr, Maghrib, and Isha; optional Sunnahs do not earn stars.

For a day:

- `stars = number of obligatory prayers explicitly completed`, from 0 to 5.
- `maximum = 5`, regardless of how many prayers were logged.
- An explicitly missed prayer contributes no star.
- An unlogged prayer contributes no star, but remains unknown in the underlying record.
- Example: three completed, one missed, and one unlogged means **3/5 stars**.
- Five unlogged prayers means **0 stars recorded**, with the existing no-data indication retained.

User clarification (2026-10-05): for star scoring, missed and unlogged are treated identically as zero-star slots against the fixed five-slot capacity. An unlogged slot must not be removed from the denominator or ignored in period averages. This is a scoring rule, not a migration of unknown records into explicitly missed records.

Stars describe recorded completion against the daily five-prayer capacity. They are not an overall grade and do not change the meanings of Missed or Not logged. Existing logged-data completion rates and verified streak rules stay independent.

### Calendar display

The user's screenshot places the new star indicator immediately beneath the existing completion fraction in each day cell.

Suggested compact presentation: `★ 3/5`, with an accessible label such as "3 of 5 stars recorded." Use an existing app accent with sufficient contrast; zero/no-data stars use a neutral treatment. A five-star strip is an alternative if it remains readable at narrow widths, but should not make the month grid taller or crowded.

The existing calendar fraction is completed/logged, not completed/5. Preserve that distinction: three completed, one missed, and one unlogged currently gives **3/4 logged**, followed by a **3/5 star count**. Label this clearly in the day details and accessibility text rather than silently changing the existing denominator.

Future calendar days should not be presented as zero-star failures. They should have a neutral unavailable star state and be excluded from elapsed-period totals.

### Daily, weekly, and monthly star statistics

Display total stars, possible stars, and average stars per day for the selected period. Reuse the existing period and custom-range boundaries, including consistent week starts and today's endpoint.

Star averaging definition, incorporating the user's clarification:

- Let `N` be the number of elapsed calendar days in the selected period.
- `totalStars = sum of the recorded completed-prayer counts for those days`.
- `possibleStars = 5 × N`.
- `averageStars = totalStars ÷ N`, displayed out of 5.
- Past blank days contribute zero recorded stars, without becoming missed records.
- Show the number of days with obligatory logs alongside the star summary.
- Do not include future days in `N`, or display an average when `N = 0`.

Example: "18 of 35 possible stars · 2.57/5 average across 7 days · obligatory logs on 5/7 days."

The fixed five-slot daily capacity also applies across the elapsed period, including unlogged days. Do not calculate the primary star average using only logged prayers or only logged days: that would hide unlogged opportunities and inflate the score. Logging coverage remains separate context, not a replacement denominator.

For all recorded time, use an explicitly documented start boundary consistent with the tracker, rather than inventing zero-star years before tracking began. Search-result averages, if later added, must identify whether they cover only matching days or the whole selected calendar period.

### Star search syntax

| Proposed query | Meaning |
| --- | --- |
| `(star3)` | Exactly three completed obligatory prayers, regardless of the other two statuses |
| `(star5)` | All five completed |
| `(star0)` | No completed obligatory prayers recorded; may contain missed or unlogged statuses |
| `(star(3-5))` | Between three and five completed prayers, inclusive |
| `(star(3-5))&((25-26)y)` | Matching days in 2025 or 2026 |

Use `star` as the canonical count term; `stars` can be a friendly alias. Counts outside 0–5 and reversed ranges should show an error. Bare numbers 1–5 continue to mean prayer names, not star counts.

## 2. Notes are a presence attribute

`notes` and `note` are equivalent and mean that the day's stored note contains at least one non-whitespace character. Whitespace-only or absent notes count as no note. Presence searches do not inspect the content of a note.

| Proposed query | Meaning |
| --- | --- |
| `notes`, `note`, or `(notes)` | Days with a note |
| `(!notes)` or `(!note)` | Days without a note |
| `(notes)&!fajr` | A note exists and Fajr was explicitly missed |
| `(notes)&~fajr` | A note exists and Fajr is unlogged |
| `(notes)&(Jun.26y)` | June 2026 days with a note |

Use parentheses in examples to group attributes consistently with dates. Notes remain local and private. Full-text note search has not been requested in this wave.

## 3. Logging coverage is a separate count

`loggedCount = completedCount + missedCount`. An unlogged prayer does not contribute to logging coverage. Stars and logged counts therefore answer different questions: how many completed prayers were recorded, and how many prayer statuses are known.

| Proposed query | Meaning |
| --- | --- |
| `(logged5)` | All five obligatory prayers have a completed or missed status |
| `(logged3)` | Exactly three obligatory prayers have a recorded status |
| `(logged(3-5))` | Three to five obligatory prayers have a recorded status |
| `(!logged5)` | Fewer than five obligatory prayers are logged |
| `(logged5)&(26y)` | Fully logged days in 2026 |
| `(!logged5)&(26y)` | Incompletely logged days in 2026 |

Correction to the user's illustrative query: `(!logged5)&26y` finds days where not all five were logged. To find days where all five were logged, use `(logged5)&(26y)`.

For non-prayer attributes such as notes and counts, `!` negates the predicate. Preserve the existing special prayer meaning: `!fajr` means explicitly missed, while `~fajr` means unlogged and `/fajr` means missed or unlogged. Do not reinterpret `!fajr` as a generic Boolean exclusion that includes unknown prayers.

## 4. Inclusive date-component ranges

The requested form is:

```text
((2-5)m.(21-30)d.(25-26)y)
```

It matches existing dates whose month is February–May, whose day is 21–30, and whose year is 2025–2026. Each component is inclusive and all component conditions apply together. This is a repeated date-component filter, not one continuous interval from February 21, 2025 to May 30, 2026.

- March 25, 2025 matches.
- May 30, 2026 matches.
- March 10, 2026 does not match because its day is outside 21–30.
- October 25, 2026 does not match because its month is outside February–May.
- February 30 is never generated; search evaluates real calendar dates only.

Allow component order changes:

```text
((21-30)d.(25-26)y.(2-5)m)
```

Allow exact components alongside ranges:

```text
((2-5)m.23d.26y)&fajr
```

Preserve existing exact-date aliases and missing-label inference: two identified components determine one remaining exact numeric component, and `Oct.23` means October 23 across years. Range components should carry m, d, or y so their purpose is clear.

Two-digit years remain 2000–2099. Use explicit four-digit years for other centuries; do not introduce a moving cutoff. Reject reversed ranges after year normalization, duplicated components, values outside month/day bounds, and ambiguous unlabeled inputs. A month/day range may include values unavailable in some matched months: include valid dates and skip nonexistent combinations rather than rejecting the whole useful filter.

## 5. Weekday attributes and Boolean combinations

Accept case-insensitive full weekday names and familiar abbreviations: Monday/Mon through Sunday/Sun. Weekdays are calculated from the tracker's stored calendar date; prayer-time display timezone preferences should not shift a recorded day to another weekday.

The intended Monday example is:

```text
(mon)&((logged5),(notes))
```

Meaning: Mondays where either all five prayers were logged or a note exists. A Monday satisfying both appears once.

Parentheses work like mathematical/Boolean grouping: `A & (B OR C)` is equivalent to `(A & B) OR (A & C)`. Therefore the Monday condition applies to both alternatives, not just the logged-count branch. Parentheses are not merely decorative wrappers around attributes.

Correction to the user's illustrative `[logged5]`: square brackets already mean the exact set of completed prayer names/numbers, such as `[fajr&dhuhr]`. `logged5` is already an exact count and needs no square brackets. Keep parentheses for grouping arbitrary attributes so the meaning of existing square-bracket searches stays predictable.

Preserve existing operator meanings and priority:

- `&`: both conditions (AND).
- Comma or semicolon: either condition (OR).
- Parentheses: explicit grouping.
- `[fajr&dhuhr]`: only those obligatory prayers completed; others may be missed or unlogged.
- AND binds before OR when parentheses do not override it.

The parser must distinguish a suffixed numeric range such as `(2-5)m` from Boolean grouping such as `(notes)`, and a count range such as `star(3-5)` from both. These should become validated typed predicates, not unrestricted expression evaluation.

## 6. Saved searches

Let users save a valid query, give it a readable name, and open it again with one tap, following the familiar Pokémon GO saved-search interaction.

Suggested scope:

- Save the query definition, not a copy of matching prayer records or notes.
- Re-evaluate the query against current local data when opened.
- Support naming, renaming, deleting, and selecting a saved search.
- Define how the existing optional blank-day date range is saved, so reopening a search does not silently change its scope.
- Keep saved searches local; include their definitions in Backup & Restore and exclude them from Share Your Defaults.
- Validate restored definitions and preserve compatibility with backups that contain no saved searches.
- Use a small list and existing app controls; no new chart/search dependency or cloud service is needed.

The consolidated v4.0.0 scope also records a small bounded recent-search list, compact local suggestions/examples, relative dates, and filtered-result summaries. Keep these in the dedicated Search view rather than adding clutter to daily logging.

## Search scope, privacy, and performance

Search recorded dates through today by default, preserving the existing option to include blank dates within an explicit bounded date range. `!notes`, `logged0`, and `star0` must not silently generate every missing date across all time. Notes-only records can match notes searches and have zero logged obligatory prayers and zero recorded stars.

Compute stars, logged counts, notes presence, and weekdays from existing records. Avoid storing duplicate per-day counters that can become stale after editing, clearing, or restoring logs. Compile a query once per change, match only the bounded candidate dates, and retain limited result rendering suitable for older phones.

No tracker uploads, third-party search service, personal-data sharing, or reminder changes are part of this proposal. A planning document does not authorize implementation or GitHub publication.

## Acceptance criteria for a future implementation

- Star counts equal completed obligatory prayers, and missed/unlogged contribute zero stars without changing their statuses.
- Stars appear beneath the calendar fraction using the existing design and accessible labels.
- Total/average star summaries show their period, daily capacity, day denominator, and logging coverage.
- Future dates are excluded from elapsed-period averages.
- Notes aliases, whitespace handling, and negation work independently of prayer filters.
- Logged counts distinguish completed/missed from unlogged.
- Inclusive component ranges, order changes, leap years, and invalid dates behave consistently.
- Weekday queries and nested AND/OR examples match the documented meaning.
- Existing prayer aliases, exact completed sets, `!`, `~`, `/`, and date searches remain compatible.
- Saved searches restore safely and remain excluded from Share Your Defaults.
- Main Tracker stays compact; detailed statistics and search controls remain in their dedicated views.
- Meaningful parser/statistics tests and older-device performance checks are selected when implementation is authorized.

## Decisions to settle before implementation

1. Choose the compact calendar indicator (`★ 3/5`) versus a five-star strip at mobile widths, keeping the fixed capacity explicit.
2. Implement the settled saved-search rule from the consolidated v4.0.0 plan: explicit bounded date scopes are absolute; relative tokens such as last30days remain rolling. Reopening must explain rather than silently change that scope.
3. Apply the user-assigned v4.0.0 release version during implementation, following the established version process. No version bump is made by these planning notes.
