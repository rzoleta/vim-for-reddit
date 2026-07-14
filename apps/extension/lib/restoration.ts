import { getStableElementKey } from './reddit-dom';
import { normalizeFeedUrl } from './route';

const STORAGE_KEY = '__vim_for_reddit_feed_selection_v1__';
const MAX_AGE_MS = 12 * 60 * 60 * 1_000;

type RestorationRecord = {
  feedUrl: string;
  postKey: string;
  savedAt: number;
};

type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export class FeedRestorationStore {
  constructor(private readonly storage: SessionStorageLike) {}

  save(feedUrl: URL, post: HTMLElement): void {
    const postKey = getStableElementKey(post);
    if (!postKey) return;

    const record: RestorationRecord = {
      feedUrl: normalizeFeedUrl(feedUrl),
      postKey,
      savedAt: Date.now(),
    };

    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Reddit can restrict storage in hardened browser modes. Navigation still
      // works; only restoration is skipped in that case.
    }
  }

  find(feedUrl: URL, candidates: HTMLElement[]): HTMLElement | null {
    const record = this.#read();
    if (!record || record.feedUrl !== normalizeFeedUrl(feedUrl)) return null;
    return candidates.find((candidate) => getStableElementKey(candidate) === record.postKey) ?? null;
  }

  #read(): RestorationRecord | null {
    try {
      const raw = this.storage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<RestorationRecord>;
      if (
        typeof parsed.feedUrl !== 'string' ||
        typeof parsed.postKey !== 'string' ||
        typeof parsed.savedAt !== 'number'
      ) {
        this.storage.removeItem(STORAGE_KEY);
        return null;
      }
      if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
        this.storage.removeItem(STORAGE_KEY);
        return null;
      }
      return parsed as RestorationRecord;
    } catch {
      return null;
    }
  }
}
