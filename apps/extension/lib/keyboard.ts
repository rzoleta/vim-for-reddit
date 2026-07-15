import type { RedditPageKind } from './route';

export type KeyboardCommand =
  | 'next'
  | 'previous'
  | 'first'
  | 'last'
  | 'previous-image'
  | 'next-image'
  | 'upvote'
  | 'downvote'
  | 'open'
  | 'collapse'
  | 'expand'
  | 'reply'
  | 'deselect'
  | 'back';

type SupportedPageKind = Exclude<RedditPageKind, 'unsupported'>;

type Keybinding = {
  keys: readonly [string, ...string[]];
  pages: readonly SupportedPageKind[];
  command: KeyboardCommand;
};

const ALL_PAGES = ['feed', 'post'] as const;

const KEYBINDINGS: readonly Keybinding[] = [
  { keys: ['Backspace'], pages: ALL_PAGES, command: 'back' },
  { keys: ['g', 'g'], pages: ALL_PAGES, command: 'first' },
  { keys: ['G'], pages: ALL_PAGES, command: 'last' },
  { keys: ['j'], pages: ALL_PAGES, command: 'next' },
  { keys: ['k'], pages: ALL_PAGES, command: 'previous' },
  { keys: ['h'], pages: ALL_PAGES, command: 'previous-image' },
  { keys: ['l'], pages: ALL_PAGES, command: 'next-image' },
  { keys: ['u'], pages: ALL_PAGES, command: 'upvote' },
  { keys: ['d'], pages: ALL_PAGES, command: 'downvote' },
  { keys: ['Enter'], pages: ['feed'], command: 'open' },
  { keys: ['c'], pages: ['post'], command: 'reply' },
  { keys: ['Escape'], pages: ['post'], command: 'deselect' },
];

const REPEATABLE_COMMANDS = new Set<KeyboardCommand>(['next', 'previous']);

export type KeyboardMatch =
  | { type: 'command'; command: KeyboardCommand }
  | { type: 'pending' }
  | { type: 'none' };

type MatchOptions = {
  now?: number;
  repeat?: boolean;
};

export class KeyboardShortcutMatcher {
  #pendingKeys: string[] = [];
  #pendingPage: SupportedPageKind | null = null;
  #lastKeyAt = 0;

  constructor(private readonly chordTimeoutMs = 1_000) {}

  match(key: string, pageKind: RedditPageKind, options: MatchOptions = {}): KeyboardMatch {
    const now = options.now ?? Date.now();
    if (pageKind === 'unsupported') {
      this.reset();
      return { type: 'none' };
    }

    if (
      this.#pendingKeys.length > 0 &&
      (this.#pendingPage !== pageKind || now - this.#lastKeyAt > this.chordTimeoutMs)
    ) {
      this.reset();
    }

    // Key repeat must never finish a chord: holding `g` should not become `gg`.
    if (options.repeat && this.#pendingKeys.length > 0) {
      this.#lastKeyAt = now;
      return { type: 'pending' };
    }

    let keys = [...this.#pendingKeys, key];
    let candidates = this.#candidates(keys, pageKind);

    // If a chord fails, retry its final key as the start of a new shortcut. This
    // lets `g` followed by `j` behave like an ordinary `j` motion.
    if (candidates.length === 0 && this.#pendingKeys.length > 0) {
      this.reset();
      keys = [key];
      candidates = this.#candidates(keys, pageKind);
    }

    if (candidates.length === 0) {
      this.reset();
      return { type: 'none' };
    }

    const exact = candidates.find((binding) => binding.keys.length === keys.length);
    if (exact) {
      this.reset();
      return { type: 'command', command: exact.command };
    }

    this.#pendingKeys = keys;
    this.#pendingPage = pageKind;
    this.#lastKeyAt = now;
    return { type: 'pending' };
  }

  reset(): void {
    this.#pendingKeys = [];
    this.#pendingPage = null;
    this.#lastKeyAt = 0;
  }

  #candidates(keys: readonly string[], pageKind: SupportedPageKind): Keybinding[] {
    return KEYBINDINGS.filter(
      (binding) =>
        binding.pages.includes(pageKind) &&
        keys.every((key, index) => binding.keys[index] === key),
    );
  }
}

export function isAllowedRepeat(command: KeyboardCommand): boolean {
  return REPEATABLE_COMMANDS.has(command);
}
