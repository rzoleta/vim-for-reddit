import { storage } from '#imports';

/**
 * Shared, persistent extension state. Content scripts can subscribe with
 * `enabledSetting.watch` so popup changes take effect without a page reload.
 */
export const enabledSetting = storage.defineItem<boolean>('local:enabled', {
  fallback: true,
});
