/**
 * Per-area content for the /areas/<slug> pages.
 *
 * These replace the retired service × area matrix. That matrix failed because
 * the subject of each page was the service — "threading in DHA" is 90% a page
 * about threading, so ten of them measured 84–91% identical and Google folded
 * 48 under its own canonical.
 *
 * Here the subject is the area itself: the road you actually take, how long it
 * actually takes, and what is worth booking given that drive. Those genuinely
 * differ between Bahadurabad at eight minutes and Korangi at fifty, which is
 * why these pages can carry distinct content honestly rather than by shuffling
 * synonyms around a template.
 *
 * Rule for adding one: if you cannot write the route, the timing and the
 * booking advice without copying another entry, the area does not get a page.
 *
 * Nothing here claims a branch or an at-home service. One studio, Block 3.
 */

/** @typedef {{ distanceKm: string, driveTime: string, route: string,
 *  gettingHere: string, worthTheTrip: string, timing: string }} AreaContent */

/** @type {Record<string, AreaContent>} */
export const AREA_CONTENT = {
  'tariq-road': {
    distanceKm: 'about 1 km',
    driveTime: '5 minutes',
    route: 'straight into Block 3 off the main shopping stretch',
    gettingHere:
      'Tariq Road and Block 3 PECHS sit side by side — this is the shortest trip anyone makes to us. From the main shopping stretch you turn into PECHS rather than heading out toward Shahrah-e-Faisal, and Saima Terrace is the building to look for. Rickshaw drivers know it by name, which saves explaining Block 3 numbering to someone who has lived here for years and still finds it confusing.',
    worthTheTrip:
      'At five minutes away you do not need to plan around us. This is the one catchment where booking a single Rs 200 eyebrow threading on its own makes complete sense — you are not spending an hour in traffic for it. Come for the small things as often as you like.',
    timing:
      'Salon first, shopping after. Threading and waxing leave skin slightly pink for an hour or two, and nobody enjoys trying on clothes in that state. Street parking around us is genuinely easier before 1pm and after 5pm; the middle of the afternoon is when the surrounding lanes fill.',
  },

  bahadurabad: {
    distanceKm: 'about 2 km',
    driveTime: 'under 10 minutes',
    route: 'via Shaheed-e-Millat Road',
    gettingHere:
      'Bahadurabad is our closest catchment after Tariq Road — usually under ten minutes via Shaheed-e-Millat. Close enough that a fair number of our Bahadurabad regulars have been coming monthly for the better part of a decade, since well before the website existed.',
    worthTheTrip:
      'Short enough that you can treat us like a local salon rather than a destination. Monthly threading, a walk-in brow tidy before an event, a facial on a slow afternoon — none of it needs to be bundled into one big visit to justify the drive.',
    timing:
      'Mornings are the quiet window. If you want a chair without waiting, 11am to 1pm on a weekday is consistently the calmest stretch of our week. Saturday afternoons are the opposite and worth booking ahead for.',
  },

  'shahrah-e-faisal': {
    distanceKm: 'about 2 km from the nearest stretch',
    driveTime: '10–20 minutes off-peak',
    route: 'off the main arterial into Block 3',
    gettingHere:
      'The offices and apartment blocks along Shahrah-e-Faisal reach us in roughly ten to twenty minutes when the road is moving. The caveat is the road itself: Shahrah-e-Faisal at 6pm on a weekday is a different proposition to Shahrah-e-Faisal at 11am, and the difference can be half an hour.',
    worthTheTrip:
      'This is our most common lunch-break catchment. Threading from Rs 100 and a face bleach at Rs 650 both fit inside an hour with travel either side. Anything on the facials menu needs 45 minutes in the chair alone, so save those for a Saturday.',
    timing:
      'Book a held slot rather than walking in — the whole point of coming on a work break is not queueing. If you are travelling after 5pm, add twenty minutes to whatever the map tells you and tell us, so we hold the chair rather than giving it away.',
  },

  saddar: {
    distanceKm: 'about 5 km',
    driveTime: '15–25 minutes',
    route: 'via MA Jinnah Road and Shahrah-e-Quaideen',
    gettingHere:
      'Saddar and the MA Jinnah Road side of the city reach Block 3 in fifteen to twenty-five minutes depending on how the Quaideen stretch is behaving. It is a straightforward run with no complicated turns at our end.',
    worthTheTrip:
      'Twenty minutes each way is the point where combining services starts to pay. A cleansing at Rs 1,200 followed by threading, or a manicure and pedicure together, turns one trip into a proper visit rather than an errand.',
    timing:
      'Avoid Friday afternoons on this route. Otherwise a late-morning appointment gives you the easiest run in both directions and the quietest floor at our end.',
  },

  gulshan: {
    distanceKm: 'about 7 km',
    driveTime: '20–30 minutes',
    route: 'via University Road and Shahrah-e-Quaideen',
    gettingHere:
      'From Gulshan-e-Iqbal it is typically twenty to thirty minutes down University Road onto Shahrah-e-Quaideen. Long enough to be a decision rather than an impulse, which is worth being honest about — there are salons closer to you than we are.',
    worthTheTrip:
      'What Gulshan clients tell us they come for is the printed price list. Every one of our hundred-plus services has its rate published, and the number you read online is the number at the counter. In a market where the standard answer is that it depends on your hair, that turns out to be worth a half-hour drive to a fair number of people.',
    timing:
      'Make it one substantial visit rather than three small ones. A facial with a cleansing beforehand runs close to two hours; add threading and you have used the afternoon well. Book ahead — arriving after that drive to find a wait is a bad trade.',
  },

  'clifton-karachi': {
    distanceKm: 'about 7 km',
    driveTime: '20–25 minutes',
    route: 'via Shahrah-e-Faisal or the Clifton link roads',
    gettingHere:
      'Clifton and the Sea View side reach us in around twenty to twenty-five minutes. The run is easier outside office hours in either direction, and the last stretch into Block 3 is quiet residential road rather than main-artery traffic.',
    worthTheTrip:
      'Most of what brings Clifton clients across is bridal and pre-event work, where the trial matters more than the distance. A Bridal Trial at Rs 8,000 is two hours and worth planning a clear afternoon around — you will want to sit with the look rather than rush off.',
    timing:
      'For bridal, book the trial four to six weeks out and the main appointment as early as you can; wedding season fills our diary before anything else does. For a single facial, a weekday morning is a far easier drive than a Saturday.',
  },

  dha: {
    distanceKm: 'about 8–12 km depending on phase',
    driveTime: '25–40 minutes',
    route: 'via Shahrah-e-Faisal',
    gettingHere:
      'DHA is a spread-out catchment — the nearer phases are around twenty-five minutes via Shahrah-e-Faisal, the further ones closer to forty in traffic. Worth checking your own phase against the map rather than trusting an average.',
    worthTheTrip:
      'At this distance we would rather you booked properly than dropped in. Bridal, a colour appointment, or a facial course are what justify the run; a Rs 200 threading on its own does not, and we will say so if you ask.',
    timing:
      'Mid-morning on a weekday is the only version of this drive that is genuinely pleasant. Colour runs about two hours in the chair, so budget the afternoon rather than squeezing it before somewhere you need to be.',
  },

  'north-nazimabad': {
    distanceKm: 'about 13 km',
    driveTime: '30–45 minutes',
    route: 'via Shahrah-e-Quaideen and University Road',
    gettingHere:
      'North Nazimabad is one of our longer catchments at thirty to forty-five minutes depending entirely on traffic. Some of our longest-standing clients make this trip, which we do not take for granted — it is a real commitment of an afternoon.',
    worthTheTrip:
      'Only worth it as a proper visit. Stack the appointment: a cleansing and a facial, or bridal prep across hair and skin in one sitting. If you are coming this far for a single service, it should be one you cannot get done well closer to home.',
    timing:
      'Book, always. A walk-in after forty minutes of traffic that turns into a wait is the worst possible version of this. Tell us on WhatsApp roughly when you are leaving and we will hold the chair.',
  },

  korangi: {
    distanceKm: 'about 12 km',
    driveTime: '30–50 minutes',
    route: 'via Korangi Road and Shahrah-e-Faisal',
    gettingHere:
      'Korangi and Landhi are our furthest regular catchment — half an hour on a good day and closer to fifty when Shahrah-e-Faisal is heavy. We would be doing you no favours pretending otherwise.',
    worthTheTrip:
      'Be selective. This distance makes sense for bridal, where the trial and the day itself are worth the travel, or for a full afternoon of stacked services. For monthly threading it honestly does not, and there is no version of this page that should tell you it does.',
    timing:
      'Weekday late-morning, and book in advance. Leave earlier than the map suggests — the Shahrah-e-Faisal stretch is the part that varies, and it varies a lot.',
  },

  'pechs-karachi': {
    distanceKm: 'you are here',
    driveTime: 'walking distance for much of the block',
    route: 'Plot 165/G-1, Saima Terrace, Block 3',
    gettingHere:
      'This is home. The salon has been at Plot 165/G-1, Saima Terrace in Block 3 since it outgrew Rubina’s house, and PECHS clients are the reason it did. A good number of the faces we see monthly have been coming since 2008.',
    worthTheTrip:
      'There is no trip. Book a Rs 100 lower-lip threading on its own if that is what you need — the whole point of a neighbourhood salon is that nothing has to be justified by the journey.',
    timing:
      'Walk in when you like for the short services; a chair is usually free on a weekday morning. Book ahead for anything over an hour, and for the fortnight before Eid or a wedding weekend, when the floor fills from open to close.',
  },
}
