import type { RedditPageKind } from './route';

export type KeyboardCommand =
  | 'next'
  | 'previous'
  | 'upvote'
  | 'downvote'
  | 'open'
  | 'collapse'
  | 'first-reply'
  | 'reply'
  | 'deselect'
  | 'back';

const REPEATABLE_COMMANDS = new Set<KeyboardCommand>(['next', 'previous']);

export function commandForKey(key: string, pageKind: RedditPageKind): KeyboardCommand | null {
  if (key === 'Backspace' && pageKind !== 'unsupported') return 'back';

  if (pageKind === 'feed') {
    switch (key) {
      case 'j':
        return 'next';
      case 'k':
        return 'previous';
      case 'u':
        return 'upvote';
      case 'd':
        return 'downvote';
      case 'Enter':
        return 'open';
      default:
        return null;
    }
  }

  if (pageKind === 'post') {
    switch (key) {
      case 'j':
        return 'next';
      case 'k':
        return 'previous';
      case 'h':
        return 'collapse';
      case 'l':
        return 'first-reply';
      case 'u':
        return 'upvote';
      case 'd':
        return 'downvote';
      case 'c':
        return 'reply';
      case 'Escape':
        return 'deselect';
      default:
        return null;
    }
  }

  return null;
}

export function isAllowedRepeat(command: KeyboardCommand): boolean {
  return REPEATABLE_COMMANDS.has(command);
}
