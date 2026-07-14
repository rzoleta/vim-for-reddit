import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FeedRestorationStore } from '../lib/restoration';
import { SELECTED_ATTRIBUTE, SELECTED_CLASS, SelectionManager } from '../lib/selection';
import { createStorage, element, setDocument } from './helpers';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-07-15T00:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('SelectionManager', () => {
  it('selects first/last from an empty selection and clamps at both boundaries', () => {
    setDocument('<div id="one"></div><div id="two"></div><div id="three"></div>');
    const candidates = [...document.querySelectorAll<HTMLElement>('div')];
    for (const candidate of candidates) candidate.scrollIntoView = vi.fn();
    const selected = vi.fn();
    const manager = new SelectionManager(() => candidates, selected);

    expect(manager.move(1)?.id).toBe('one');
    expect(manager.move(-1)?.id).toBe('one');
    expect(manager.move(1)?.id).toBe('two');
    expect(manager.move(1)?.id).toBe('three');
    expect(manager.move(1)?.id).toBe('three');

    manager.clear();
    expect(manager.move(-1)?.id).toBe('three');
    expect(selected).toHaveBeenCalledTimes(6);
  });

  it('moves the highlight, scrolls to center, and clears all selection state', () => {
    setDocument('<shreddit-post id="one"></shreddit-post><shreddit-post id="two"></shreddit-post>');
    const one = element('#one');
    const two = element('#two');
    one.scrollIntoView = vi.fn();
    two.scrollIntoView = vi.fn();
    const manager = new SelectionManager(() => [one, two]);

    manager.select(one);
    expect(one.classList.contains(SELECTED_CLASS)).toBe(true);
    expect(one.getAttribute(SELECTED_ATTRIBUTE)).toBe('true');
    expect(one.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    manager.select(two, { smooth: false });
    expect(one.classList.contains(SELECTED_CLASS)).toBe(false);
    expect(one.hasAttribute(SELECTED_ATTRIBUTE)).toBe(false);
    expect(two.classList.contains(SELECTED_CLASS)).toBe(true);
    expect(two.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'auto',
      block: 'center',
      inline: 'nearest',
    });

    manager.clear();
    expect(manager.current).toBeNull();
    expect(manager.currentKey).toBeNull();
    expect(two.classList.contains(SELECTED_CLASS)).toBe(false);
  });

  it('reconciles a rerendered element using its stable key without scrolling', () => {
    setDocument('<shreddit-post post-id="t3_abc" id="old"></shreddit-post>');
    let candidates = [element('#old')];
    candidates[0].scrollIntoView = vi.fn();
    const manager = new SelectionManager(() => candidates);
    manager.select(candidates[0]);

    candidates[0].remove();
    const replacement = document.createElement('shreddit-post');
    replacement.id = 'replacement';
    replacement.setAttribute('post-id', 't3_abc');
    replacement.scrollIntoView = vi.fn();
    document.body.append(replacement);
    candidates = [replacement];

    expect(manager.current).toBeNull();
    expect(manager.reconcile()).toBe(replacement);
    expect(replacement.classList.contains(SELECTED_CLASS)).toBe(true);
    expect(replacement.scrollIntoView).not.toHaveBeenCalled();
  });

  it('returns null with no candidates', () => {
    const manager = new SelectionManager(() => []);
    expect(manager.move(1)).toBeNull();
    expect(manager.reconcile()).toBeNull();
  });
});

describe('FeedRestorationStore', () => {
  it('saves a stable post key and restores it only on the normalized matching feed', () => {
    setDocument(`
      <shreddit-post post-id="t3_one" id="one"></shreddit-post>
      <shreddit-post post-id="t3_two" id="two"></shreddit-post>
    `);
    const candidates = [...document.querySelectorAll<HTMLElement>('shreddit-post')];
    const storage = createStorage();
    const store = new FeedRestorationStore(storage);
    store.save(new URL('https://www.reddit.com/r/svelte/#selected'), candidates[1]);

    expect(store.find(new URL('https://www.reddit.com/r/svelte/'), candidates)).toBe(candidates[1]);
    expect(store.find(new URL('https://www.reddit.com/r/typescript/'), candidates)).toBeNull();
    expect(store.find(new URL('https://www.reddit.com/r/svelte/?sort=new'), candidates)).toBeNull();
  });

  it('expires stale restoration data and removes malformed records', () => {
    setDocument('<shreddit-post post-id="t3_one" id="one"></shreddit-post>');
    const post = element('#one');
    const storage = createStorage();
    const store = new FeedRestorationStore(storage);
    store.save(new URL('https://www.reddit.com/'), post);
    vi.advanceTimersByTime(12 * 60 * 60 * 1_000 + 1);
    expect(store.find(new URL('https://www.reddit.com/'), [post])).toBeNull();
    expect(storage.removeItem).toHaveBeenCalled();

    const malformed = createStorage({ __vim_for_reddit_feed_selection_v1__: '{"feedUrl":1}' });
    expect(new FeedRestorationStore(malformed).find(new URL('https://www.reddit.com/'), [post])).toBeNull();
    expect(malformed.removeItem).toHaveBeenCalled();
  });

  it('silently tolerates unavailable storage and posts without stable identifiers', () => {
    setDocument('<shreddit-post id="post"></shreddit-post>');
    const post = element('#post');
    post.removeAttribute('id');
    const storage = {
      getItem: vi.fn(() => {
        throw new Error('denied');
      }),
      setItem: vi.fn(() => {
        throw new Error('denied');
      }),
      removeItem: vi.fn(),
    };
    const store = new FeedRestorationStore(storage);
    expect(() => store.save(new URL('https://www.reddit.com/'), post)).not.toThrow();
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(store.find(new URL('https://www.reddit.com/'), [post])).toBeNull();
  });
});
