import { describe, expect, it } from 'vitest';
import { commandForKey, isAllowedRepeat } from '../lib/keyboard';
import { getRedditPageKind, normalizeFeedUrl } from '../lib/route';

describe('Reddit route classification', () => {
  it.each([
    ['https://www.reddit.com/', 'feed'],
    ['https://reddit.com/r/typescript/', 'feed'],
    ['https://www.reddit.com/search/?q=svelte', 'feed'],
    ['https://www.reddit.com/r/typescript/comments/abc123/a_post/', 'post'],
    ['https://reddit.com/comments/abc123/a_post/', 'post'],
  ] as const)('classifies %s as %s', (href, expected) => {
    expect(getRedditPageKind(new URL(href))).toBe(expected);
  });

  it.each([
    'https://old.reddit.com/r/typescript/',
    'https://new.reddit.com/r/typescript/',
    'http://www.reddit.com/r/typescript/',
    'https://www.reddit.com.evil.example/comments/abc123/',
    'https://example.com/r/typescript/',
  ])('rejects unsupported origin %s', (href) => {
    expect(getRedditPageKind(new URL(href))).toBe('unsupported');
  });

  it('normalizes trailing slashes and fragments while retaining query state', () => {
    expect(normalizeFeedUrl(new URL('https://www.reddit.com/r/svelte///?sort=new#post'))).toBe(
      'https://www.reddit.com/r/svelte?sort=new',
    );
  });
});

describe('keyboard command mapping', () => {
  it('maps every feed shortcut and no post-only shortcuts', () => {
    expect(commandForKey('j', 'feed')).toBe('next');
    expect(commandForKey('k', 'feed')).toBe('previous');
    expect(commandForKey('u', 'feed')).toBe('upvote');
    expect(commandForKey('d', 'feed')).toBe('downvote');
    expect(commandForKey('Enter', 'feed')).toBe('open');
    expect(commandForKey('h', 'feed')).toBeNull();
    expect(commandForKey('c', 'feed')).toBeNull();
  });

  it('maps every post shortcut and no feed-only open shortcut', () => {
    expect(commandForKey('j', 'post')).toBe('next');
    expect(commandForKey('k', 'post')).toBe('previous');
    expect(commandForKey('h', 'post')).toBe('collapse');
    expect(commandForKey('l', 'post')).toBe('expand');
    expect(commandForKey('u', 'post')).toBe('upvote');
    expect(commandForKey('d', 'post')).toBe('downvote');
    expect(commandForKey('c', 'post')).toBe('reply');
    expect(commandForKey('Escape', 'post')).toBe('deselect');
    expect(commandForKey('Enter', 'post')).toBeNull();
  });

  it('makes Backspace global only on supported Reddit pages', () => {
    expect(commandForKey('Backspace', 'feed')).toBe('back');
    expect(commandForKey('Backspace', 'post')).toBe('back');
    expect(commandForKey('Backspace', 'unsupported')).toBeNull();
  });

  it('allows key repeat only for motion commands', () => {
    expect(isAllowedRepeat('next')).toBe(true);
    expect(isAllowedRepeat('previous')).toBe(true);
    for (const command of [
      'upvote',
      'downvote',
      'open',
      'collapse',
      'expand',
      'reply',
      'deselect',
      'back',
    ] as const) {
      expect(isAllowedRepeat(command)).toBe(false);
    }
  });
});
