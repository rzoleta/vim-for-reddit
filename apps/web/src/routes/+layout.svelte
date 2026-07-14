<script lang="ts">
  import type { Snippet } from 'svelte';

  import '../app.css';

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <meta
    name="description"
    content="Navigate posts and comments on Reddit with familiar Vim keyboard motions."
  />
</svelte:head>

<div class="min-h-dvh bg-[#f6f3ec] font-sans text-[#171716] antialiased selection:bg-[#ff4500] selection:text-white">
  {@render children()}
</div>
