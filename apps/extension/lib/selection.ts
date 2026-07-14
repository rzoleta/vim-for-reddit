import { getStableElementKey } from './reddit-dom';

export const SELECTED_CLASS = 'vim-for-reddit-selected';
export const SELECTED_ATTRIBUTE = 'data-vim-for-reddit-selected';

type SelectionOptions = {
  scroll?: boolean;
  smooth?: boolean;
};

export class SelectionManager {
  #current: HTMLElement | null = null;
  #currentKey: string | null = null;

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
    if (this.#current !== element) this.#removeHighlight();

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
    if (this.current) return this.#current;
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
  }
}
