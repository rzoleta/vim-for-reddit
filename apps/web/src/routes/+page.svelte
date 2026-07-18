<script lang="ts">
  import { track } from '@vercel/analytics';

  import chromeIconUrl from '$lib/assets/chrome.svg';
  import demoUrl from '$lib/assets/demo.mp4';
  import firefoxIconUrl from '$lib/assets/firefox.svg';
  import Footer from '$lib/Footer.svelte';
  import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '$lib/seo';
  import Wordmark from '$lib/Wordmark.svelte';

  const shortcuts = [
    { key: 'j', action: 'next' },
    { key: 'k', action: 'previous' },
    { key: 'u', action: 'upvote' },
    { key: 'd', action: 'downvote' },
    { key: 'c', action: 'comment' },
    { key: 'h', action: 'collapse' },
    { key: 'l', action: 'expand' },
    { key: 'gg', action: 'first' },
    { key: 'G', action: 'last' },
    { key: 'Enter', action: 'open' },
    { key: 'Backspace', action: 'back' },
  ];

  const title = 'Vim for Reddit — Vim keybindings for browsing Reddit';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': `${SITE_URL}/#software`,
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome, Firefox',
    isAccessibleForFree: true,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: [
      'Vim keyboard navigation for Reddit posts and comments',
      'Keyboard shortcuts for voting, replying, opening, and collapsing content',
      'Support for Chrome and Firefox',
    ],
  };
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={DEFAULT_DESCRIPTION} />
  <meta
    name="keywords"
    content="Vim for Reddit, Reddit keyboard shortcuts, Reddit Vim keybindings, keyboard navigation, Chrome extension, Firefox add-on"
  />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={DEFAULT_DESCRIPTION} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={DEFAULT_DESCRIPTION} />
  {@html `<script type="application/ld+json">${JSON.stringify(structuredData).replaceAll('<', '\\u003c')}<\/script>`}
</svelte:head>

<main class="relative flex min-h-[calc(100dvh-73px)] flex-col overflow-hidden">
  <header class="relative mx-auto flex w-full max-w-[90rem] items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
    <Wordmark />
    <span class="hidden rounded-full border border-black/10 bg-white/45 px-3 py-1.5 font-mono text-xs font-medium text-black/55 sm:block">Chrome · Firefox</span>
  </header>

  <section class="relative mx-auto flex w-full max-w-[90rem] flex-1 items-center px-6 pb-16 pt-8 sm:px-8 sm:pb-24 sm:pt-12 lg:pb-32 lg:pt-16">
    <div class="flex w-full flex-col gap-14">
      <div>
        <div>
          <h1 class="text-5xl font-black leading-[0.96] tracking-[-0.055em] text-balance sm:text-6xl lg:text-[4rem]">
            Use vim motions when browsing reddit
          </h1>
          <p class="mt-7 text-lg leading-8 text-black/60 sm:text-xl">
            Move through posts and comments, vote, open, collapse, and reply without reaching for your mouse.
          </p>

          <div class="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="https://chromewebstore.google.com/detail/vim-for-reddit/hdkbfdfibdlgomneegjbifjcemnjjoko?authuser=0&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              onclick={() => track('chrome_install_click')}
              class="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#171716] px-6 py-3.5 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4500]"
            >
              <img class="size-5 shrink-0" src={chromeIconUrl} alt="" aria-hidden="true" />
              Add to Chrome
              <span aria-hidden="true" class="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
            <a
              href="/"
              onclick={() => track('firefox_install_click')}
              class="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-black/15 bg-white/55 px-6 py-3.5 font-semibold text-[#171716] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-black/30 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4500]"
            >
              <img class="size-5 shrink-0" src={firefoxIconUrl} alt="" aria-hidden="true" />
              Add to Firefox
              <span aria-hidden="true" class="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
            </a>
          </div>
        </div>

        <div class="mt-12 flex flex-wrap gap-x-7 gap-y-3 font-mono text-xs text-black/45 sm:text-sm" aria-label="Keyboard shortcuts">
          {#each shortcuts as shortcut}
            <span><kbd class="mr-2 rounded-md border border-black/15 bg-white/60 px-2 py-1 text-black/70">{shortcut.key}</kbd>{shortcut.action}</span>
          {/each}
        </div>
      </div>

      <video
        class="aspect-video w-full object-cover"
        src={demoUrl}
        autoplay
        muted
        loop
        playsinline
        aria-label="Vim for Reddit keyboard navigation demo"
      ></video>
    </div>
  </section>
</main>

<Footer />
