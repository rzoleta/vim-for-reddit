export const ACTIVATE_POST_COMPOSER_EVENT = 'vim-for-reddit:activate-post-composer';
export const COMMENT_COMPOSER_HOST_SELECTOR = 'comment-composer-host';

export function installPostComposerBridge(document: Document): () => void {
  const activateComposer = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !target.matches(COMMENT_COMPOSER_HOST_SELECTOR)) {
      return;
    }

    target.focus();
  };

  document.addEventListener(ACTIVATE_POST_COMPOSER_EVENT, activateComposer, true);
  return () => document.removeEventListener(ACTIVATE_POST_COMPOSER_EVENT, activateComposer, true);
}
