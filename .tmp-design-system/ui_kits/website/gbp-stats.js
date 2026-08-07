/* Honest GBP / volume figures for the website UI kit.
   Mirrors production src/google-reviews-data.js GOOGLE_GBP_STATS + counted services. */
window.FARWA_GBP_STATS = {
  rating: 4.6,
  reviewCount: 19,
  yearsActive: 18,
  monthlyAppointments: 1000,
  serviceCount: 102,
  lastVerified: '2026-07-31',
};

/** ProofStrip items — single source for Home kit and chrome demos. */
window.FARWA_PROOF_ITEMS = [
  { lead: `${window.FARWA_GBP_STATS.rating}★`, label: `${window.FARWA_GBP_STATS.reviewCount} Google reviews` },
  { lead: `${window.FARWA_GBP_STATS.yearsActive}+`, label: 'Years in PECHS' },
  { lead: `${window.FARWA_GBP_STATS.monthlyAppointments.toLocaleString('en-US')}+`, label: 'Appointments a month' },
  { lead: String(window.FARWA_GBP_STATS.serviceCount), label: 'Services, every price printed' },
];
