import { canonicalUrl } from '$lib/seo';

export const prerender = true;

const routes = ['/', '/privacy', '/terms'];

export function GET() {
  const urls = routes.map((route) => `  <url>\n    <loc>${canonicalUrl(route)}</loc>\n  </url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
