export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/book/confirmation',
          '/book/cancel',
        ],
      },
    ],
    sitemap: 'https://farwasalon.com/sitemap.xml',
  }
}
