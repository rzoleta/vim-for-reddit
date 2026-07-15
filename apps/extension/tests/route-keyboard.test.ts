import { describe, expect, it } from 'vitest';
import {
  isAllowedRepeat,
  KeyboardShortcutMatcher,
  type KeyboardCommand,
} from '../lib/keyboard';
import { getRedditPageKind, normalizeFeedUrl, type RedditPageKind } from '../lib/route';

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
  function expectCommand(
    matcher: KeyboardShortcutMatcher,
    key: string,
    pageKind: RedditPageKind,
    command: KeyboardCommand,
  ): void {
    expect(matcher.match(key, pageKind)).toEqual({ type: 'command', command });
  }

  it('maps every feed shortcut and no post-only shortcuts', () => {
    const matcher = new KeyboardShortcutMatcher();
    expectCommand(matcher, 'j', 'feed', 'next');
    expectCommand(matcher, 'k', 'feed', 'previous');
    expectCommand(matcher, 'u', 'feed', 'upvote');
    expectCommand(matcher, 'd', 'feed', 'downvote');
    expectCommand(matcher, 'Enter', 'feed', 'open');
    expectCommand(matcher, 'h', 'feed', 'previous-image');
    expectCommand(matcher, 'l', 'feed', 'next-image');
    expectCommand(matcher, 'G', 'feed', 'last');
    expect(matcher.match('c', 'feed')).toEqual({ type: 'none' });
  });

  it('maps every post shortcut and no feed-only open shortcut', () => {
    const matcher = new KeyboardShortcutMatcher();
    expectCommand(matcher, 'j', 'post', 'next');
    expectCommand(matcher, 'k', 'post', 'previous');
    expectCommand(matcher, 'h', 'post', 'previous-image');
    expectCommand(matcher, 'l', 'post', 'next-image');
    expectCommand(matcher, 'u', 'post', 'upvote');
    expectCommand(matcher, 'd', 'post', 'downvote');
    expectCommand(matcher, 'c', 'post', 'reply');
    expectCommand(matcher, 'Escape', 'post', 'deselect');
    expectCommand(matcher, 'G', 'post', 'last');
    expect(matcher.match('Enter', 'post')).toEqual({ type: 'none' });
  });

  it('makes Backspace global only on supported Reddit pages', () => {
    const matcher = new KeyboardShortcutMatcher();
    expectCommand(matcher, 'Backspace', 'feed', 'back');
    expectCommand(matcher, 'Backspace', 'post', 'back');
    expect(matcher.match('Backspace', 'unsupported')).toEqual({ type: 'none' });
  });

  it('matches chords, retries a failed chord as a single key, and expires stale prefixes', () => {
    const matcher = new KeyboardShortcutMatcher(1_000);

    expect(matcher.match('g', 'feed', { now: 0 })).toEqual({ type: 'pending' });
    expect(matcher.match('g', 'feed', { now: 500 })).toEqual({
      type: 'command',
      command: 'first',
    });

    expect(matcher.match('g', 'feed', { now: 1_000 })).toEqual({ type: 'pending' });
    expect(matcher.match('j', 'feed', { now: 1_200 })).toEqual({
      type: 'command',
      command: 'next',
    });

    expect(matcher.match('g', 'feed', { now: 2_000 })).toEqual({ type: 'pending' });
    expect(matcher.match('g', 'feed', { now: 3_001 })).toEqual({ type: 'pending' });
    expect(matcher.match('g', 'feed', { now: 3_500 })).toEqual({
      type: 'command',
      command: 'first',
    });
  });

  it('does not let key repeat complete a chord and clears prefixes between pages', () => {
    const matcher = new KeyboardShortcutMatcher();

    expect(matcher.match('g', 'feed', { now: 0 })).toEqual({ type: 'pending' });
    expect(matcher.match('g', 'feed', { now: 100, repeat: true })).toEqual({
      type: 'pending',
    });
    expect(matcher.match('g', 'feed', { now: 200 })).toEqual({
      type: 'command',
      command: 'first',
    });

    expect(matcher.match('g', 'feed')).toEqual({ type: 'pending' });
    expect(matcher.match('g', 'post')).toEqual({ type: 'pending' });
  });

  it('allows key repeat only for relative motion commands', () => {
    expect(isAllowedRepeat('next')).toBe(true);
    expect(isAllowedRepeat('previous')).toBe(true);
    for (const command of [
      'first',
      'last',
      'upvote',
      'downvote',
      'open',
      'previous-image',
      'next-image',
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
