import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVATE_POST_COMPOSER_EVENT,
  installPostComposerBridge,
} from '../lib/page-bridge';
import { element, setDocument } from './helpers';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('Reddit page-world bridge', () => {
  it('focuses only a post composer host that requests activation', () => {
    setDocument(`
      <comment-composer-host id="composer"></comment-composer-host>
      <button id="unrelated"></button>
    `);
    const composerFocus = vi.fn();
    const unrelatedFocus = vi.fn();
    element('#composer').focus = composerFocus;
    element('#unrelated').focus = unrelatedFocus;
    const removeBridge = installPostComposerBridge(document);

    element('#unrelated').dispatchEvent(
      new Event(ACTIVATE_POST_COMPOSER_EVENT, { bubbles: true }),
    );
    element('#composer').dispatchEvent(
      new Event(ACTIVATE_POST_COMPOSER_EVENT, { bubbles: true }),
    );

    expect(unrelatedFocus).not.toHaveBeenCalled();
    expect(composerFocus).toHaveBeenCalledOnce();
    removeBridge();
  });
});
