/* Shared demo data for the Farwa website UI kit — from src/data.js in the repo. */
window.FARWA_DATA = {
  categories: [
    { name: 'Threading', img: '../../assets/threading.jpg', tagline: 'Precise brow & face threading from Rs 100', count: 7, from: 'Rs 100', availability: 'Usually available same-day', popular: true, chapter: 'The Brow & The Silk' },
    { name: 'Rica Hot Wax', img: '../../assets/waxing.jpg', tagline: 'Gentle Rica stripless wax for face from Rs 150', count: 9, from: 'Rs 150', availability: 'Usually available same-day', chapter: 'The Brow & The Silk' },
    { name: 'Facials', img: '../../assets/glow.jpg', tagline: '11 facials for every skin type from Rs 1,400', count: 11, from: 'Rs 1,400', availability: 'Book 1–2 days ahead', popular: true, chapter: 'The Face' },
    { name: 'Cleansing', img: '../../assets/facial.jpg', tagline: 'Deep pore cleansing facials from Rs 1,200', count: 4, from: 'Rs 1,200', availability: 'Book 1–2 days ahead', chapter: 'The Face' },
    { name: 'Nails', img: '../../assets/pedicure.jpg', tagline: 'Manicure, pedicure & nail art from Rs 300', count: 18, from: 'Rs 300', availability: 'Book 1–2 days ahead', chapter: 'The Hands & The Calm' },
    { name: 'Massage', img: '../../assets/massage.jpg', tagline: 'Head, back & full body massage from Rs 700', count: 7, from: 'Rs 700', availability: 'Usually available same-day', chapter: 'The Hands & The Calm' },
    { name: 'Hair', img: '../../assets/hairdo.jpg', tagline: 'Cuts, colour & styling from Rs 1,500', count: 4, from: 'Rs 1,500', availability: 'Book 1–2 days ahead', chapter: 'The Hair' },
    { name: 'Hair Treatments', img: '../../assets/hairtreatment.jpg', tagline: 'Protein, repair & scalp treatments from Rs 2,000', count: 5, from: 'Rs 2,000', availability: 'Book 1–2 days ahead', chapter: 'The Hair' },
    { name: 'Bridal', img: '../../assets/bridal.jpg', tagline: 'Bridal makeup & trials from Rs 8,000', count: 4, from: 'Rs 8,000', availability: 'Book 1–2 weeks ahead', popular: true, chapter: 'The Bride' },
  ],
  chapters: [
    { name: 'The Face', caption: 'Glow & skin rituals' },
    { name: 'The Brow & The Silk', caption: 'Shaping & hair removal' },
    { name: 'The Hair', caption: 'Cut · colour · repair' },
    { name: 'The Hands & The Calm', caption: 'Nails · body · rest' },
    { name: 'The Bride', caption: 'The flagship' },
  ],
  services: {
    'Threading': [
      { name: 'Eyebrow Threading', price: 'Rs 200', dur: '10 min' },
      { name: 'Upper Lip Threading', price: 'Rs 150', dur: '5 min' },
      { name: 'Chin Threading', price: 'Rs 100', dur: '5 min' },
      { name: 'Full Face Threading', price: 'Rs 1,200', dur: '25 min' },
    ],
    'Facials': [
      { name: 'Normal Facial', price: 'Rs 1,400', dur: '45 min' },
      { name: 'Whitening Facial', price: 'Rs 1,900', dur: '55 min' },
      { name: 'HD Whitening Facial', price: 'Rs 3,000', dur: '65 min' },
      { name: 'Janssen Whitening Facial', price: 'Rs 5,500', dur: '75 min' },
    ],
    'Bridal': [
      { name: 'Bridal Trial', price: 'Rs 8,000', dur: '2h' },
      { name: 'Mehndi / Dholki Look', price: 'Rs 10,000', dur: '2h' },
      { name: 'Engagement Look', price: 'Rs 12,000', dur: '2h 30m' },
      { name: 'Full Bridal Package', price: 'Rs 25,000', dur: '5h' },
    ],
    'Nails': [
      { name: 'Nail Paint', price: 'Rs 300', dur: '15 min' },
      { name: 'Normal Manicure', price: 'Rs 900', dur: '30 min' },
      { name: 'Normal Pedicure', price: 'Rs 1,000', dur: '35 min' },
      { name: 'SPA Pedicure', price: 'Rs 1,400', dur: '45 min' },
    ],
    'Massage': [
      { name: 'Back Massage', price: 'Rs 700', dur: '15 min' },
      { name: 'Head Massage & Wash', price: 'Rs 1,500', dur: '30 min' },
      { name: 'Full Body Massage', price: 'Rs 2,500', dur: '40 min' },
    ],
  },
  slots: ['11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'],
};
