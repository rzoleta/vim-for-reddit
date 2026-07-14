# Vim for Reddit

Use familiar Vim motions to browse posts and comments on the current Reddit website.

![Vim for Reddit icon](./icon-128.png)

## Shortcuts

### Feed

| Key | Action |
| --- | --- |
| `j` | Select next post |
| `k` | Select previous post |
| `u` | Upvote current post |
| `d` | Downvote current post |
| `Enter` | Open current post |

### Post and comments

| Key | Action |
| --- | --- |
| `j` | Select next comment |
| `k` | Select previous comment |
| `h` | Collapse current comment |
| `l` | Select the first reply to the current comment |
| `u` | Upvote current comment |
| `d` | Downvote current comment |
| `c` | Reply to the current comment, or the post when no comment is selected |
| `Esc` | Deselect the current comment |

`Backspace` goes back to the previous page and restores the selected feed post. Shortcuts are ignored while focus is in an input, editor, or other editable control.

## Apps

- `apps/extension`: WXT Manifest V3 extension for Chrome and Firefox, with a Svelte popup and Tailwind CSS.
- `apps/web`: SvelteKit marketing site with Tailwind CSS and the Vercel adapter.

The extension runs only on `reddit.com` and `www.reddit.com`. It does not run on `old.reddit.com`, collect analytics, or transmit user data. The enabled preference is stored with the browser extension storage API; feed restoration is kept in tab-scoped session storage.

## Development

Requirements: Node.js 20.19 or newer and pnpm 10.

```sh
pnpm install
pnpm dev:extension
pnpm dev:extension:firefox
pnpm dev:web
```

Run all checks and create production builds:

```sh
pnpm check
pnpm test
pnpm build
pnpm zip
```

WXT writes unpacked browser builds and store-ready ZIP files to `apps/extension/.output`. The website uses `@sveltejs/adapter-vercel` and can be deployed from `apps/web`.
