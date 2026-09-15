import type { APIRoute } from 'astro';

/**
 * Generated so the sitemap URL follows the real domain rather than being
 * hardcoded to whatever `site` happened to be when someone wrote it.
 */
export const GET: APIRoute = ({ site }) => {
  const base = site?.toString().replace(/\/$/, '') ?? '';
  const body = ['User-agent: *', 'Allow: /', '', `Sitemap: ${base}/sitemap-index.xml`, ''].join(
    '\n',
  );

  return new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
