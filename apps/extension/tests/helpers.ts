import { vi } from 'vitest';

export function setDocument(markup: string): void {
  document.body.innerHTML = markup;
}

export function element<T extends HTMLElement = HTMLElement>(selector: string): T {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`Missing fixture element: ${selector}`);
  return found;
}

export function createStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => [...values.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => values.delete(key)),
    setItem: vi.fn((key: string, value: string) => values.set(key, String(value))),
  };
}

export function makeControllerWindow(href: string): Window & {
  location: Location & { href: string };
  history: History & { back: ReturnType<typeof vi.fn> };
} {
  const back = vi.fn();
  const location = { href } as Location & { href: string };
  const fakeWindow = {
    location,
    history: { back },
    sessionStorage: createStorage(),
    MutationObserver: window.MutationObserver,
    requestAnimationFrame: vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }),
    setTimeout: window.setTimeout.bind(window),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  return fakeWindow as unknown as Window & {
    location: Location & { href: string };
    history: History & { back: ReturnType<typeof vi.fn> };
  };
}
