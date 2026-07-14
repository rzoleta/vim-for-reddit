import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'wxt';

export default defineConfig({
  manifestVersion: 3,
  modules: ['@wxt-dev/module-svelte', '@wxt-dev/auto-icons'],
  manifest: ({ browser }) => ({
    name: 'Vim for Reddit',
    description: 'Use Vim motions to browse posts and comments on Reddit.',
    permissions: ['storage'],
    action: {
      default_title: 'Vim for Reddit',
    },
    browser_specific_settings:
      browser === 'firefox'
        ? {
            gecko: {
              id: 'vim-for-reddit@vimforreddit.dev',
              data_collection_permissions: {
                required: ['none'],
              },
            },
          }
        : undefined,
  }),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
