import { installPostComposerBridge } from '../lib/page-bridge';

export default defineContentScript({
  matches: ['https://www.reddit.com/*', 'https://reddit.com/*'],
  excludeMatches: ['https://old.reddit.com/*'],
  runAt: 'document_idle',
  world: 'MAIN',
  main() {
    installPostComposerBridge(document);
  },
});
