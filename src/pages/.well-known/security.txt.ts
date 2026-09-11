import type { APIRoute } from 'astro';

/**
 * RFC 9116 security.txt.
 *
 * Generated rather than static so `Expires` is always fresh: the RFC requires
 * the field and recommends under a year, and a hardcoded date would quietly
 * expire — the exact failure this file exists to prevent.
 *
 * Add an `Encryption:` line pointing at a published public key if a PGP key
 * is ever created.
 */
export const GET: APIRoute = ({ site }) => {
  const expires = new Date();
  expires.setFullYear(expires.getFullYear() + 1);

  const base = site?.toString().replace(/\/$/, '') ?? '';

  const body = [
    '# Security contact for this site.',
    '# If you find something wrong with it, please tell me.',
    '',
    'Contact: mailto:josedanielbarranqueroortigosa@gmail.com',
    `Expires: ${expires.toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
    'Preferred-Languages: es, en',
    `Canonical: ${base}/.well-known/security.txt`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
