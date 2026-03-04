import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/cabinet', '/cabinet/', '/api/', '/checkout/', '/admin-login'],
      },
    ],
    sitemap: 'https://altehspec.ru/sitemap.xml',
  };
}
