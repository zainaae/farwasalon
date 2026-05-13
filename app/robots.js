export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    // TODO: change back to https://farwasalon.com/sitemap.xml once custom domain is connected
    sitemap: 'https://farwasalon.vercel.app/sitemap.xml',
  }
}
