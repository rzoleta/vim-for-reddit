import {
  ACTIVATE_POST_COMPOSER_EVENT,
  COMMENT_COMPOSER_HOST_SELECTOR,
} from './page-bridge';

export const POST_SELECTOR = 'shreddit-post';
export const COMMENT_SELECTOR = 'shreddit-comment';

export type RedditAction = 'upvote' | 'downvote' | 'collapse' | 'expand' | 'reply';

const ACTION_SELECTORS: Record<RedditAction, string[]> = {
  upvote: [
    'button[upvote]',
    'button[data-action-bar-action="upvote"]',
    'button[aria-label="upvote" i]',
    'button[aria-label^="upvote" i]',
    'button[data-testid="upvote-button"]',
    '[data-click-id="upvote"]',
    'faceplate-tracker[noun="upvote"] button',
    'button[name="upvote"]',
  ],
  downvote: [
    'button[downvote]',
    'button[data-action-bar-action="downvote"]',
    'button[aria-label="downvote" i]',
    'button[aria-label^="downvote" i]',
    'button[data-testid="downvote-button"]',
    '[data-click-id="downvote"]',
    'faceplate-tracker[noun="downvote"] button',
    'button[name="downvote"]',
  ],
  collapse: [
    ':scope > details > summary',
    'button[aria-label*="collapse comment" i]',
    'button[data-testid="comment-collapse"]',
    '[data-click-id="collapse"]',
    'faceplate-tracker[noun="collapse"] button',
  ],
  expand: [
    ':scope > details > summary',
    'button[aria-label*="expand comment" i]',
    'button[data-testid="comment-expand"]',
    '[data-click-id="expand"]',
    'faceplate-tracker[noun="expand"] button',
  ],
  reply: [
    '[slot="comment-reply"]',
    'button[aria-label="reply" i]',
    'button[aria-label*="reply to" i]',
    'button[data-testid="comment-reply-button"]',
    '[data-click-id="reply"]',
    'faceplate-tracker[noun="reply"] button',
    'button[slot="reply-button"]',
  ],
};

const POST_COMPOSER_SELECTOR = 'shreddit-composer[placeholder*="join the conversation" i]';

const POST_REPLY_SELECTORS = [
  `${POST_COMPOSER_SELECTOR} [slot="rte"]`,
  '[contenteditable="true"][aria-placeholder*="join the conversation" i]',
  'textarea[placeholder*="join the conversation" i]',
  'button[aria-label*="add a comment" i]',
  'button[aria-label*="comment on this post" i]',
  '[data-testid="comment-submission-form"] button',
  'shreddit-composer button',
];

const POST_LINK_SELECTORS = [
  'a[slot="title"]',
  'a[slot="full-post-link"]',
  'a[data-testid="post-title"]',
  'a[data-click-id="body"]',
  'a[href*="/comments/"]',
];

function uniqueElements(elements: Iterable<HTMLElement>): HTMLElement[] {
  return [...new Set(elements)];
}

function isHiddenByAttributes(element: HTMLElement): boolean {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') return true;

  let current: HTMLElement | null = element;
  while (current) {
    if (current.hidden || current.getAttribute('aria-hidden') === 'true') return true;
    const style = current.ownerDocument.defaultView?.getComputedStyle(current);
    if (style?.display === 'none' || style?.visibility === 'hidden') return true;
    current = current.parentElement;
  }

  return false;
}

function isCollapsed(comment: HTMLElement): boolean {
  const collapsed = comment.getAttribute('collapsed');
  const details = comment.querySelector<HTMLDetailsElement>(':scope > details');
  return (
    (collapsed !== null && collapsed !== 'false') ||
    comment.getAttribute('data-collapsed') === 'true' ||
    (details !== null && !details.open)
  );
}

export function isVisibleComment(comment: HTMLElement): boolean {
  if (isHiddenByAttributes(comment)) return false;

  let ancestor = comment.parentElement?.closest<HTMLElement>(COMMENT_SELECTOR) ?? null;
  while (ancestor) {
    if (isCollapsed(ancestor)) return false;
    ancestor = ancestor.parentElement?.closest<HTMLElement>(COMMENT_SELECTOR) ?? null;
  }

  return true;
}

export function getFeedPosts(document: Document): HTMLElement[] {
  const inMain = document.querySelectorAll<HTMLElement>(`main ${POST_SELECTOR}`);
  const candidates = inMain.length > 0 ? inMain : document.querySelectorAll<HTMLElement>(POST_SELECTOR);
  return uniqueElements(candidates).filter((post) => !isHiddenByAttributes(post));
}

export function getPostPagePost(document: Document): HTMLElement | null {
  return document.querySelector<HTMLElement>(`main ${POST_SELECTOR}`) ?? document.querySelector<HTMLElement>(POST_SELECTOR);
}

export function getVisibleComments(document: Document): HTMLElement[] {
  return uniqueElements(document.querySelectorAll<HTMLElement>(COMMENT_SELECTOR)).filter(isVisibleComment);
}

function collectOpenShadowRoots(root: ParentNode): ShadowRoot[] {
  const roots: ShadowRoot[] = [];
  if (root instanceof Element && root.shadowRoot) {
    roots.push(root.shadowRoot, ...collectOpenShadowRoots(root.shadowRoot));
  }
  for (const element of root.querySelectorAll<HTMLElement>('*')) {
    if (element.shadowRoot) {
      roots.push(element.shadowRoot, ...collectOpenShadowRoots(element.shadowRoot));
    }
  }
  return roots;
}

function getClosestAcrossShadowRoots(element: HTMLElement, selector: string): HTMLElement | null {
  let current: Element | null = element;
  while (current) {
    const closest = current.closest<HTMLElement>(selector);
    if (closest) return closest;
    const root = current.getRootNode();
    current = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
}

function queryFirstDeep(
  root: ParentNode,
  selectors: string[],
  accepts: (candidate: HTMLElement) => boolean = () => true,
): HTMLElement | null {
  const roots: ParentNode[] = [root, ...collectOpenShadowRoots(root)];
  for (const selector of selectors) {
    for (const candidateRoot of roots) {
      for (const candidate of candidateRoot.querySelectorAll<HTMLElement>(selector)) {
        if (accepts(candidate)) return candidate;
      }
    }
  }
  return null;
}

export function findActionControl(scope: HTMLElement, action: RedditAction): HTMLElement | null {
  const boundarySelector = scope.matches(COMMENT_SELECTOR)
    ? COMMENT_SELECTOR
    : scope.matches(POST_SELECTOR)
      ? POST_SELECTOR
      : null;
  return queryFirstDeep(
    scope,
    ACTION_SELECTORS[action],
    (candidate) =>
      boundarySelector === null || getClosestAcrossShadowRoots(candidate, boundarySelector) === scope,
  );
}

export function setCommentExpanded(comment: HTMLElement, expanded: boolean): boolean {
  const details = comment.querySelector<HTMLDetailsElement>(':scope > details');
  if (details) {
    if (details.open === expanded) return true;
    return clickNativeControl(findActionControl(comment, expanded ? 'expand' : 'collapse'));
  }

  const collapsed = isCollapsed(comment);
  if (collapsed === !expanded) return true;
  return clickNativeControl(findActionControl(comment, expanded ? 'expand' : 'collapse'));
}

export function findPostReplyControl(document: Document): HTMLElement | null {
  const root: ParentNode = document.querySelector('main') ?? document;
  const composer = queryFirstDeep(root, [POST_COMPOSER_SELECTOR]);
  const composerHost = composer
    ? getClosestAcrossShadowRoots(composer, COMMENT_COMPOSER_HOST_SELECTOR)
    : null;
  if (composerHost) return composerHost;
  return queryFirstDeep(root, POST_REPLY_SELECTORS);
}

export function activatePostReplyControl(document: Document): boolean {
  const control = findPostReplyControl(document);
  if (!control || control.matches(':disabled, [aria-disabled="true"]')) return false;

  if (control.matches(COMMENT_COMPOSER_HOST_SELECTOR)) {
    control.dispatchEvent(
      new Event(ACTIVATE_POST_COMPOSER_EVENT, { bubbles: true, composed: true }),
    );
    return true;
  }

  control.focus();
  control.click();
  return true;
}

export function findPostLink(post: HTMLElement): HTMLAnchorElement | null {
  for (const selector of POST_LINK_SELECTORS) {
    const link = post.querySelector<HTMLAnchorElement>(selector);
    if (link?.href && /\/comments\//i.test(link.href)) return link;
  }
  return null;
}

export function getStableElementKey(element: HTMLElement): string | null {
  const attributes = ['thingid', 'post-id', 'comment-id', 'id', 'permalink', 'content-href'];
  for (const attribute of attributes) {
    const value = element.getAttribute(attribute)?.trim();
    if (value) return `${attribute}:${value}`;
  }

  const link = element.querySelector<HTMLAnchorElement>('a[href*="/comments/"]');
  return link?.href ? `href:${new URL(link.href, element.ownerDocument.location.href).pathname}` : null;
}

export function clickNativeControl(control: HTMLElement | null): boolean {
  if (!control || control.matches(':disabled, [aria-disabled="true"]')) return false;
  control.click();
  return true;
}
