<script lang="ts">
  import Footer from './Footer.svelte';
  import Wordmark from './Wordmark.svelte';

  let {
    eyebrow,
    title,
    intro,
    children
  }: {
    eyebrow: string;
    title: string;
    intro: string;
    children: import('svelte').Snippet;
  } = $props();
</script>

<div class="flex min-h-dvh flex-col">
  <header class="mx-auto flex w-full max-w-4xl items-center px-6 py-6 sm:px-8 sm:py-8">
    <Wordmark />
  </header>

  <main class="mx-auto w-full max-w-4xl flex-1 px-6 pb-24 pt-14 sm:px-8 sm:pb-32 sm:pt-20">
    <p class="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-[#c73500]">{eyebrow}</p>
    <h1 class="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl">{title}</h1>
    <p class="mt-6 max-w-2xl text-lg leading-8 text-black/60">{intro}</p>

    <div class="mt-14 max-w-2xl space-y-10 border-t border-black/10 pt-10 text-base leading-7 text-black/65 sm:text-lg sm:leading-8">
      {@render children()}
    </div>
  </main>

  <Footer />
</div>
