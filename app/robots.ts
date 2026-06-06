import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/app',
        '/dashboard',
        '/api/',
        '/admin',
        '/reel-studio',
        '/pending-bills',
        '/scan-bill',
        '/add-bill',
        '/payment',
        '/settings',
        '/profile',
        '/subscription-success',
      ],
    },
    sitemap: 'https://mybillport.com/sitemap.xml',
    host: 'https://mybillport.com',
  };
}
