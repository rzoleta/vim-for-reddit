<script lang="ts">
  import ChromeIcon from '$lib/ChromeIcon.svelte';
  import FirefoxIcon from '$lib/FirefoxIcon.svelte';
  import Footer from '$lib/Footer.svelte';
  import Wordmark from '$lib/Wordmark.svelte';
</script>

<svelte:head>
  <title>Vim for Reddit — Browse Reddit from the keyboard</title>
  <meta property="og:title" content="Vim for Reddit" />
  <meta property="og:description" content="Use vim motions when browsing reddit." />
  <meta property="og:type" content="website" />
  <meta name="twitter:card" content="summary" />
</svelte:head>

<main class="relative flex min-h-[calc(100dvh-73px)] flex-col overflow-hidden">
  <div class="pointer-events-none absolute inset-0" aria-hidden="true">
    <div class="absolute -right-24 top-28 size-72 rounded-full border border-[#ff4500]/15 sm:right-[8%] sm:size-96"></div>
    <div class="absolute -right-6 top-52 size-40 rounded-full bg-[#ff4500]/8 sm:right-[15%] sm:size-56"></div>
    <div class="absolute bottom-10 left-[8%] font-mono text-8xl font-black text-black/[0.025] sm:text-[12rem]">jk</div>
  </div>

  <header class="relative mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-8 sm:py-8">
    <Wordmark />
    <span class="hidden rounded-full border border-black/10 bg-white/45 px-3 py-1.5 font-mono text-xs font-medium text-black/55 sm:block">Chrome · Firefox</span>
  </header>

  <section class="relative mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-16 sm:px-8 sm:py-24 lg:py-32">
    <div class="max-w-4xl">
      <p class="mb-6 flex items-center gap-3 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#c73500] sm:text-sm">
        <span class="h-px w-8 bg-[#ff4500]"></span>
        Keyboard-first browsing
      </p>
      <h1 class="max-w-4xl text-5xl font-black leading-[0.96] tracking-[-0.055em] text-balance sm:text-7xl lg:text-[6.5rem]">
        Use vim motions when browsing reddit
      </h1>
      <p class="mt-7 max-w-xl text-lg leading-8 text-black/60 sm:text-xl">
        Move through posts and comments, vote, open, collapse, and reply without reaching for your mouse.
      </p>

      <div class="mt-10 flex flex-col gap-3 sm:flex-row">
        <a
          href="/"
          class="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#171716] px-6 py-3.5 font-semibold text-white shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4500]"
        >
          <ChromeIcon />
          Download for Chrome
          <span aria-hidden="true" class="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
        <a
          href="/"
          class="group inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-black/15 bg-white/55 px-6 py-3.5 font-semibold text-[#171716] backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-black/30 hover:bg-white/85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff4500]"
        >
          <FirefoxIcon />
          Download for Firefox
          <span aria-hidden="true" class="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>

      <div class="mt-12 flex flex-wrap gap-x-7 gap-y-3 font-mono text-xs text-black/45 sm:text-sm" aria-label="Example keyboard shortcuts">
        <span><kbd class="mr-2 rounded-md border border-black/15 bg-white/60 px-2 py-1 text-black/70">j</kbd>next</span>
        <span><kbd class="mr-2 rounded-md border border-black/15 bg-white/60 px-2 py-1 text-black/70">k</kbd>previous</span>
        <span><kbd class="mr-2 rounded-md border border-black/15 bg-white/60 px-2 py-1 text-black/70">u</kbd>upvote</span>
      </div>
    </div>
  </section>
</main>

<Footer />
