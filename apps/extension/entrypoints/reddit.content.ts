import '../assets/content.css';
import { RedditController } from '../lib/controller';
import { enabledSetting } from '../lib/settings';

export default defineContentScript({
  matches: ['https://www.reddit.com/*', 'https://reddit.com/*'],
  excludeMatches: ['https://old.reddit.com/*'],
  runAt: 'document_idle',
  async main(ctx) {
    const controller = new RedditController(document, window);
    controller.start();

    try {
      controller.setEnabled(await enabledSetting.getValue());
    } catch {
      controller.setEnabled(true);
    }

    const unwatch = enabledSetting.watch((enabled) => controller.setEnabled(enabled));
    ctx.onInvalidated(() => {
      unwatch();
      controller.stop();
    });
  },
});
