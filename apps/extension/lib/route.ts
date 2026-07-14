export type RedditPageKind = 'feed' | 'post' | 'unsupported';

const SUPPORTED_HOSTS = new Set(['reddit.com', 'www.reddit.com']);

export function getRedditPageKind(url: URL): RedditPageKind {
  if (url.protocol !== 'https:' || !SUPPORTED_HOSTS.has(url.hostname)) {
    return 'unsupported';
  }

  return /\/comments\//i.test(url.pathname) ? 'post' : 'feed';
}

export function normalizeFeedUrl(url: URL): string {
  const normalized = new URL(url.href);
  normalized.hash = '';
  normalized.pathname = normalized.pathname.replace(/\/+$/, '') || '/';
  return normalized.href;
}
