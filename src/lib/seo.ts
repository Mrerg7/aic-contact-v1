export const SITE_URL = 'https://aic.contact';

export function canonicalPath(pathname: string): string {
  if (pathname === '/' || pathname === '') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
}

export function canonicalUrl(pathname: string): string {
  return new URL(canonicalPath(pathname), SITE_URL).href;
}
