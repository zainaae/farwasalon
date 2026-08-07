# Metrics baseline & rollback

Commercial gate for design sprints (Amended takeaways Sprint 0).

## Events

| Event | Where | Notes |
|---|---|---|
| `WhatsAppIntent` | `WaCta`, sticky bar, service modal, contact | `track()` always adds `path` |
| `BookingStarted` | Service modal; `/book` on load | Slice by `path` in Plausible |
| `BookingCompleted` | Book flow submit | Funnel companion |

Shared helper: `src/site-config.js` → `track()` → Plausible tagged events + Meta map.

## Baseline

- Window: **last 14 days** in Plausible (or shorter if property history is shorter).
- Rates: booking-starts / sessions (or pageviews) on `/` and on `/prices`.
- Record the baseline numbers in the PR description when shipping a UI sprint.

## Rollback (locked)

If **booking-start rate** on `/` or `/prices` drops **>15%** vs the prior 14-day baseline after a sprint’s UI PR ships, **revert that sprint’s UI PR**.
