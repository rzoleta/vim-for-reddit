import { COMMENT_SELECTOR, getStableElementKey } from './reddit-dom';

export const SELECTED_CLASS = 'vim-for-reddit-selected';
export const SELECTED_ATTRIBUTE = 'data-vim-for-reddit-selected';
export const SELECTION_OVERLAY_CLASS = 'vim-for-reddit-selection-overlay';

const OVERLAY_POSITION_PROPERTIES = {
  top: '--vim-for-reddit-selection-top',
  left: '--vim-for-reddit-selection-left',
  width: '--vim-for-reddit-selection-width',
  height: '--vim-for-reddit-selection-height',
} as const;

type SelectionOptions = {
  scroll?: boolean;
  smooth?: boolean;
};

export class SelectionManager {
  #current: HTMLElement | null = null;
  #currentKey: string | null = null;
  #overlay: HTMLElement | null = null;
  #overlayCleanup: (() => void) | null = null;
  #updateOverlay: (() => void) | null = null;

  constructor(
    private readonly getCandidates: () => HTMLElement[],
    private readonly onSelected?: (element: HTMLElement) => void,
  ) {}

  get current(): HTMLElement | null {
    return this.#current?.isConnected ? this.#current : null;
  }

  get currentKey(): string | null {
    return this.#currentKey;
  }

  select(element: HTMLElement, options: SelectionOptions = {}): HTMLElement {
    const changed = this.#current !== element;
    if (changed) this.#removeHighlight();

    this.#current = element;
    this.#currentKey = getStableElementKey(element);
    element.classList.add(SELECTED_CLASS);
    element.setAttribute(SELECTED_ATTRIBUTE, 'true');

    if (options.scroll !== false && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({
        behavior: options.smooth === false ? 'auto' : 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }

    if (changed) this.#createNestedCommentOverlay(element);
    else this.#updateOverlay?.();

    this.onSelected?.(element);
    return element;
  }

  move(direction: 1 | -1): HTMLElement | null {
    const candidates = this.getCandidates();
    if (candidates.length === 0) return null;

    let index = this.#current ? candidates.indexOf(this.#current) : -1;
    if (index < 0 && this.#currentKey) {
      index = candidates.findIndex((candidate) => getStableElementKey(candidate) === this.#currentKey);
    }

    if (index < 0) return this.select(direction === 1 ? candidates[0] : candidates.at(-1)!);

    const nextIndex = Math.max(0, Math.min(candidates.length - 1, index + direction));
    return this.select(candidates[nextIndex]);
  }

  reconcile(): HTMLElement | null {
    if (this.current) {
      this.#updateOverlay?.();
      return this.#current;
    }
    if (!this.#currentKey) return null;

    const replacement = this.getCandidates().find(
      (candidate) => getStableElementKey(candidate) === this.#currentKey,
    );
    return replacement ? this.select(replacement, { scroll: false }) : null;
  }

  clear(): void {
    this.#removeHighlight();
    this.#current = null;
    this.#currentKey = null;
  }

  #removeHighlight(): void {
    this.#current?.classList.remove(SELECTED_CLASS);
    this.#current?.removeAttribute(SELECTED_ATTRIBUTE);
    this.#removeOverlay();
  }

  #createNestedCommentOverlay(element: HTMLElement): void {
    if (
      !element.matches(COMMENT_SELECTOR) ||
      !element.parentElement?.closest(COMMENT_SELECTOR)
    ) {
      return;
    }

    const document = element.ownerDocument;
    const view = document.defaultView;
    const overlay = document.createElement('div');
    overlay.className = SELECTION_OVERLAY_CLASS;
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.append(overlay);

    const update = () => {
      if (!element.isConnected) {
        overlay.hidden = true;
        return;
      }

      const rect = element.getBoundingClientRect();
      overlay.hidden = rect.width <= 0 || rect.height <= 0;
      overlay.style.setProperty(OVERLAY_POSITION_PROPERTIES.top, `${rect.top}px`);
      overlay.style.setProperty(OVERLAY_POSITION_PROPERTIES.left, `${rect.left}px`);
      overlay.style.setProperty(OVERLAY_POSITION_PROPERTIES.width, `${rect.width}px`);
      overlay.style.setProperty(OVERLAY_POSITION_PROPERTIES.height, `${rect.height}px`);
    };

    view?.addEventListener('scroll', update, true);
    view?.addEventListener('resize', update);
    const resizeObserver = view?.ResizeObserver ? new view.ResizeObserver(update) : null;
    resizeObserver?.observe(element);

    this.#overlay = overlay;
    this.#updateOverlay = update;
    this.#overlayCleanup = () => {
      view?.removeEventListener('scroll', update, true);
      view?.removeEventListener('resize', update);
      resizeObserver?.disconnect();
    };
    update();
  }

  #removeOverlay(): void {
    this.#overlayCleanup?.();
    this.#overlay?.remove();
    this.#overlay = null;
    this.#overlayCleanup = null;
    this.#updateOverlay = null;
  }
}
