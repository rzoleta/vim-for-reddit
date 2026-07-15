export const SITE_NAME = 'Vim for Reddit';
export const SITE_URL = 'https://vimreddit.com';
export const DEFAULT_DESCRIPTION =
  'Browse Reddit faster with Vim keybindings. Navigate posts and comments, vote, open, collapse, and reply without reaching for your mouse.';

export function canonicalUrl(pathname: string) {
  return new URL(pathname, SITE_URL).href;
}
