import { SITE_HOST } from './lib/seo';

interface Env {
  ASSETS: Fetcher;
}

function redirect(url: URL, status: 301 | 308 = 301): Response {
  return Response.redirect(url.toString(), status);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
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

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
