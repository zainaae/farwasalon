/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  redirects: async () => [
    {
      source: '/:path*',
      has: [{ type: 'host', value: 'www.farwasalon.com' }],
      destination: 'https://farwasalon.com/:path*',
      permanent: true,
    },
    {
      source: '/review',
      destination:
        'https://search.google.com/local/writereview?placeid=ChIJeVyXMig_szoQEKI0TaSkW-U',
      permanent: false,
    },
  ],
}

export default nextConfig
