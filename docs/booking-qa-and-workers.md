# Booking QA matrix — networks, dates, workers

How to test Farwa’s online booking under real conditions, what breaks today, and how to assign appointments to staff.

---

## 1. Automated tests (run locally)

```bash
npm run test
```

| File | Covers |
|------|--------|
| `lib/booking-scenarios.test.js` | Dates (past, +14d, Sunday), times, occupancy, add-ons, buffer, double-book logic |
| `lib/booking-slots.test.js` | Slot grid, capacity, bridal-length slots |
| `lib/booking-duration.test.js` | Add-on minutes, cancel policy constant |

**Fixed in code:** `/api/book` now uses the same **14-day + closed-day** rules as `/api/slots` (previously you could POST a date the UI never showed).

---

## 2. Live API probe (optional)

With dev server running (`npm run dev`) or production URL:

```bash
node scripts/booking-api-probe.mjs
# or
BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs
```

Exercises slots + validation errors (no real bookings unless `PROBE_WRITE=1`).

---

## 3. Manual QA — dates & times

Use **production or preview** with a test name + phone you control.

| # | Scenario | Steps | Expected |
|---|----------|-------|----------|
| D1 | **Today** | Book earliest free slot today | 200, row in sheet |
| D2 | **Tomorrow** | Any weekday | Slots load, book OK |
| D3 | **Saturday** | Pick Sat in date strip | Open 11–7 |
| D4 | **Sunday** | Tap Sunday (if shown) or API | Closed / no slots |
| D5 | **Day +14** | Last allowed day in UI | Slots OK |
| D6 | **Past date** | DevTools: POST `/api/book` with yesterday | 400 past date |
| D7 | **Day +15** | API only | 400 too far |
| T1 | **11:00** | First slot | OK |
| T2 | **18:30** | Last slot | OK |
| T3 | **10:00** | API only | 400 outside hours |
| T4 | **Add-on** | Eyebrow + Upper Lip on step 1 | Fewer times; duration in sheet |
| T5 | **Bridal 2h+** | Long service late afternoon | May block 17:30/18:00 |
| T6 | **Double book** | Two browsers same slot | Second gets 409 |
| T7 | **Cancel** | Link on confirmation, >2h before | Status Cancelled |
| T8 | **Cancel late** | <2h before | 400 policy message |

---

## 4. Manual QA — network strength

Simulate in Chrome DevTools → **Network** → Throttling.

| Profile | What to watch | Known gaps |
|---------|----------------|------------|
| **Fast 4G** | Baseline | Should work |
| **Slow 3G** | Step 1 slots spinner | 25s abort on slots fetch; message shown; book submit still has no timeout |
| **Offline** | Submit on step 3 | “Could not load times” / fetch error; draft kept in localStorage |
| **Flaky** | Throttle + reload mid-step | May lose selected time; draft may restore wrong step |
| **Tab background** | Start book, switch apps, return | Usually OK; slots may be stale → 409 on submit |

### User-visible errors today

| HTTP | Message | Cause |
|------|---------|--------|
| 400 | Invalid date / closed / past / time | Validation |
| 409 | Slot no longer available | Race or stale UI |
| 429 | Too many requests | Rate limit (5 books / 10 min per IP) |
| 502 | Unable to check availability / failed to save | Google Sheets slow/down |
| 503 | Not configured | Missing Vercel env |

### Production probe (2026-05-19)

Ran `BASE_URL=https://farwasalon.com node scripts/booking-api-probe.mjs` before deploy of latest validation:

| Check | Result | Note |
|-------|--------|------|
| Slots today | Failed with UTC “today” in old probe | Fixed probe to use **local** `YYYY-MM-DD`; re-run after deploy |
| Slots +14d | OK | |
| Slots +15d | **200** on prod | Prod still allows +15d until **14-day rules** ship |
| Book past date | 400 | Prod returned “Closed on Sundays” when yesterday was Sunday — use weekday in probe |
| Book 09:00 | **409** on prod | Prod checks occupancy before grid time validation; local code returns **400** |

### Hurdles to fix later

1. **Book submit has no fetch timeout** — slow network can hang on final step (slots fetch has 25s abort)
2. **No retry button** on slots error (only copy + WhatsApp link)
3. **Stale slots** — user idle on step 1, someone else books → 409 on submit (acceptable if message clear)
4. **Rate limit** — shared salon Wi‑Fi IP may hit 429 for many staff testing
5. **Sheets latency** — 502 on peak; no queue/retry server-side
6. **Verify-read fails** — booking kept even if double-book check fails (optimistic path in code)
7. **No assigned worker** — sheet has no “who does this” column yet

---

## 5. Data captured per booking (Google Sheet)

Tab **Bookings** columns A–L:

| Col | Field | Worker use |
|-----|--------|------------|
| A | bookingId | Reference |
| B | date | Day schedule |
| C | timeSlot | Start |
| D | endTime | End (uses duration + add-ons) |
| E | clientName | Client |
| F | clientPhone | Call/WhatsApp |
| G | service | What |
| H | category | Bridal / Threading / … |
| I | duration | Minutes (total with add-ons) |
| J | status | Confirmed / Cancelled |
| K | bookedAt | When booked |
| L | notes | Add-ons text, requests |
| M | Notified | Email bot (YES/empty) |

**Not captured yet:** staff assignment, room/chair, deposit paid, reminder sent.

---

## 6. Delegating appointments to workers (recommended)

### Phase A — Sheet columns (no code)

Add columns on **Bookings**:

| Col | Name | Values |
|-----|------|--------|
| N | `assignedTo` | Rubina / Ayesha / Any / blank |
| O | `workStatus` | Pending / In progress / Done |
| P | `staffNotes` | Internal |

Salon lead assigns manually each morning from filtered view (sort by date + time).

### Phase B — Staff day view (code)

- `/admin/day?date=YYYY-MM-DD` (password-protected)  
- Lists confirmed rows grouped by time  
- Dropdown writes column N via Apps Script or API  

### Phase C — Auto-suggest assignment (later)

Rules example:

- Bridal → Rubina only  
- Threading → any junior  
- Max 2 parallel bookings already enforced in code (`MAX_WORKERS = 2`)

### Phase D — WhatsApp to worker (optional)

When column N set, Apps Script sends “You have Eyebrow at 2pm” to staff number.

---

## 7. Sign-off

| Area | Owner | Date | Pass? |
|------|-------|------|-------|
| Automated `npm run test` | Dev | | |
| D1–D8 date/time manual | Salon | | |
| Network slow/offline | Salon | | |
| Email bot column M | Salon | | |
| Worker columns N–P (optional) | Salon | | |

---

See also: `docs/live-vs-local.md` (prod vs local matrix), `docs/master-improvement-plan.md`, `docs/booking-setup.md`
