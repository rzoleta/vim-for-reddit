import { shouldIgnoreKeyboardEvent } from './editable';
import { commandForKey, isAllowedRepeat, type KeyboardCommand } from './keyboard';
import {
  activatePostReplyControl,
  clickNativeControl,
  findActionControl,
  findPostLink,
  getFeedPosts,
  getPostPagePost,
  getVisibleComments,
  navigateGallery,
  POST_SELECTOR,
  setCommentExpanded,
} from './reddit-dom';
import { FeedRestorationStore } from './restoration';
import { getRedditPageKind, type RedditPageKind } from './route';
import { SelectionManager } from './selection';

export class RedditController {
  readonly feedSelection: SelectionManager;
  readonly commentSelection: SelectionManager;

  #enabled = false;
  #started = false;
  #pageKind: RedditPageKind;
  #observer: MutationObserver | null = null;
  #refreshScheduled = false;
  readonly #restoration: FeedRestorationStore;

  constructor(
    private readonly document: Document,
    private readonly window: Window,
  ) {
    this.#pageKind = getRedditPageKind(new URL(window.location.href));
    this.#restoration = new FeedRestorationStore(window.sessionStorage);
    this.feedSelection = new SelectionManager(
      () => getFeedPosts(this.document),
      (post) => this.#restoration.save(new URL(this.window.location.href), post),
    );
    this.commentSelection = new SelectionManager(() => {
      const post = getPostPagePost(this.document);
      const comments = getVisibleComments(this.document);
      return post ? [post, ...comments] : comments;
    });
  }

  start(): void {
    if (this.#started) return;
    this.#started = true;

    this.document.addEventListener('keydown', this.#onKeydown, true);
    this.window.addEventListener('popstate', this.#onLocationChange);
    this.window.addEventListener('pageshow', this.#onLocationChange);

    const view = this.document.defaultView as (Window & typeof globalThis) | null;
    const MutationObserverConstructor = view?.MutationObserver ?? MutationObserver;
    const observer = new MutationObserverConstructor(this.#scheduleRefresh);
    this.#observer = observer;
    observer.observe(this.document.documentElement, { childList: true, subtree: true });
    this.#syncPage();
  }

  stop(): void {
    if (!this.#started) return;
    this.#started = false;
    this.document.removeEventListener('keydown', this.#onKeydown, true);
    this.window.removeEventListener('popstate', this.#onLocationChange);
    this.window.removeEventListener('pageshow', this.#onLocationChange);
    this.#observer?.disconnect();
    this.#observer = null;
    this.feedSelection.clear();
    this.commentSelection.clear();
  }

  setEnabled(enabled: boolean): void {
    this.#enabled = enabled;
    if (!enabled) {
      this.feedSelection.clear();
      this.commentSelection.clear();
      return;
    }
    this.#syncPage();
  }

  execute(command: KeyboardCommand): boolean {
    if (!this.#enabled) return false;
    this.#syncPage();

    if (command === 'back') {
      this.window.history.back();
      return true;
    }

    if (this.#pageKind === 'feed') return this.#executeFeedCommand(command);
    if (this.#pageKind === 'post') return this.#executePostCommand(command);
    return false;
  }

  #executeFeedCommand(command: KeyboardCommand): boolean {
    if (command === 'next') return Boolean(this.feedSelection.move(1));
    if (command === 'previous') return Boolean(this.feedSelection.move(-1));

    const current = this.feedSelection.current ?? this.feedSelection.reconcile();
    if (!current) return false;

    if (command === 'upvote' || command === 'downvote') {
      return clickNativeControl(findActionControl(current, command));
    }
    if (command === 'open') {
      const link = findPostLink(current);
      if (!link) return false;
      this.#restoration.save(new URL(this.window.location.href), current);
      link.click();
      return true;
    }
    if (command === 'previous-image' || command === 'next-image') {
      return navigateGallery(current, command === 'previous-image' ? 'previous' : 'next');
    }
    return false;
  }

  #executePostCommand(command: KeyboardCommand): boolean {
    if (command === 'next') return Boolean(this.commentSelection.move(1));
    if (command === 'previous') return Boolean(this.commentSelection.move(-1));
    if (command === 'deselect') {
      const post = getPostPagePost(this.document);
      return post ? Boolean(this.commentSelection.select(post)) : false;
    }
    if (command === 'reply') {
      const current = this.commentSelection.current ?? this.commentSelection.reconcile();
      return current && !current.matches(POST_SELECTOR)
        ? clickNativeControl(findActionControl(current, 'reply'))
        : activatePostReplyControl(this.document);
    }

    if (command === 'previous-image' || command === 'next-image') {
      const current = this.commentSelection.current ?? this.commentSelection.reconcile();
      if (!current) {
        const post = getPostPagePost(this.document);
        return post
          ? navigateGallery(post, command === 'previous-image' ? 'previous' : 'next')
          : false;
      }
      if (current.matches(POST_SELECTOR)) {
        return navigateGallery(current, command === 'previous-image' ? 'previous' : 'next');
      }
      return setCommentExpanded(current, command === 'next-image');
    }

    const current = this.commentSelection.current ?? this.commentSelection.reconcile();
    if (!current) return false;

    if (command === 'collapse' || command === 'expand') {
      if (current.matches(POST_SELECTOR)) return false;
      setCommentExpanded(current, command === 'expand');
      return true;
    }
    if (command === 'upvote' || command === 'downvote') {
      return clickNativeControl(findActionControl(current, command));
    }
    return false;
  }

  #syncPage(): void {
    const nextPageKind = getRedditPageKind(new URL(this.window.location.href));
    if (nextPageKind !== this.#pageKind) {
      if (this.#pageKind === 'feed') this.feedSelection.clear();
      if (this.#pageKind === 'post') this.commentSelection.clear();
      this.#pageKind = nextPageKind;
    }

    if (!this.#enabled) return;
    if (this.#pageKind === 'feed') {
      if (!this.feedSelection.reconcile()) {
        const restored = this.#restoration.find(
          new URL(this.window.location.href),
          getFeedPosts(this.document),
        );
        if (restored) this.feedSelection.select(restored, { smooth: false });
      }
    } else if (this.#pageKind === 'post') {
      this.commentSelection.reconcile();
    }
  }

  readonly #onKeydown = (event: KeyboardEvent): void => {
    if (
      !this.#enabled ||
      shouldIgnoreKeyboardEvent(event, this.document, { respectDefaultPrevented: false })
    ) {
      return;
    }

    this.#syncPage();
    const command = commandForKey(event.key, this.#pageKind);
    if (!command || (event.repeat && !isAllowedRepeat(command))) return;

    if (this.execute(command)) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  readonly #onLocationChange = (): void => this.#syncPage();

  readonly #scheduleRefresh = (): void => {
    if (this.#refreshScheduled) return;
    this.#refreshScheduled = true;
    const refresh = () => {
      this.#refreshScheduled = false;
      this.#syncPage();
    };
    if (typeof this.window.requestAnimationFrame === 'function') {
      this.window.requestAnimationFrame(refresh);
    } else {
      this.window.setTimeout(refresh, 0);
    }
  };
}
