import { SITE_HOST } from './lib/seo';

interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === `www.${SITE_HOST}`) {
      url.hostname = SITE_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (request.headers.get('X-Forwarded-Proto') === 'http') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
