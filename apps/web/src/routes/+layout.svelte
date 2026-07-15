<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';

  import { canonicalUrl, SITE_NAME, SITE_URL } from '$lib/seo';
  import '../app.css';

  let { children }: { children: Snippet } = $props();

  const canonical = $derived(canonicalUrl(page.url.pathname));
</script>

<svelte:head>
  <meta name="application-name" content={SITE_NAME} />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <meta name="googlebot" content="index, follow" />
  <link rel="canonical" href={canonical} />

  <meta property="og:site_name" content={SITE_NAME} />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:url" content={canonical} />
  <meta property="og:image" content={`${SITE_URL}/favicon.png`} />
  <meta property="og:image:width" content="128" />
  <meta property="og:image:height" content="128" />
  <meta property="og:image:alt" content="Vim for Reddit logo" />

  <meta name="twitter:card" content="summary" />
  <meta name="twitter:image" content={`${SITE_URL}/favicon.png`} />
  <meta name="twitter:image:alt" content="Vim for Reddit logo" />
</svelte:head>

<div class="min-h-dvh bg-[#f6f3ec] font-sans text-[#171716] antialiased selection:bg-[#ff4500] selection:text-white">
  {@render children()}
</div>
