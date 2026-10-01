import { SITE_HOST } from './lib/seo';

interface Env {
  ASSETS: Fetcher;
}

function redirect(url: URL, status: 301 | 308 = 301): Response {
  return Response.redirect(url.toString(), status);
}

function withSecurityHeaders(res: Response): Response {
  const headers = new Headers(res.headers);
  if (!headers.has('X-Content-Type-Options')) headers.set('X-Content-Type-Options', 'nosniff');
  if (!headers.has('X-Frame-Options')) headers.set('X-Frame-Options', 'DENY');
  if (!headers.has('Referrer-Policy')) headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  if (!headers.has('Permissions-Policy')) headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (!headers.has('Strict-Transport-Security'))
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  if (!headers.has('Cross-Origin-Opener-Policy')) headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Lightweight privacy-friendly analytics endpoint (no PII, no cookies).
    // Free-plan safe: in-memory only, always 204.
    if (url.pathname === '/api/track') {
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: {
            'Access-Control-Allow-Origin': `https://${SITE_HOST}`,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
          },
        });
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': `https://${SITE_HOST}`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const original = url.toString();
    const host = url.hostname.toLowerCase();
    const forwardedProto = request.headers.get('X-Forwarded-Proto');
    const isHttp = url.protocol === 'http:' || forwardedProto === 'http';
    const isCanonicalHost = host === SITE_HOST;

    // Single-hop canonicalization: http and/or www -> https://aic.contact.
    // Only redirect when normalization actually changes the URL (loop-proof).
    if (isHttp || !isCanonicalHost) {
      url.protocol = 'https:';
      url.hostname = SITE_HOST;
      if (url.toString() !== original) {
        return redirect(url, 301);
      }
    }

    const { pathname } = url;

    // Permanent redirects for index variants (assets handler uses 307, which
    // Google treats as temporary and keeps listing as alternate URLs).
    if (/\/index(?:\.html?)?$/i.test(pathname)) {
      url.pathname = pathname.replace(/index(?:\.html?)?$/i, '');
      if (url.pathname !== '/' && !url.pathname.endsWith('/')) {
        url.pathname += '/';
      }
      return redirect(url, 301);
    }

    // Legacy sitemap path referenced by older crawlers and Search Console
    if (pathname === '/sitemap.xml') {
      url.pathname = '/sitemap-index.xml';
      return redirect(url, 301);
    }

    const res = await env.ASSETS.fetch(request);
    return withSecurityHeaders(res);
  },
} satisfies ExportedHandler<Env>;
