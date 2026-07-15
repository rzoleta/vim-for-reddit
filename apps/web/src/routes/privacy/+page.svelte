<script lang="ts">
  import LegalPage from '$lib/LegalPage.svelte';

  const title = 'Privacy policy — Vim for Reddit';
  const description = 'Read the Vim for Reddit privacy policy and learn how the browser extension handles your data.';
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
</svelte:head>

<LegalPage
  eyebrow="Plain-language policy"
  title="Privacy"
  intro="Vim for Reddit is designed to do its job without collecting information about you."
>
  <section>
    <h2 class="font-bold text-black">What we collect</h2>
    <p class="mt-2">Nothing. The extension does not collect, sell, or share your personal information. It has no analytics and does not create an account for you.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">What stays in your browser</h2>
    <p class="mt-2">Your enabled setting and temporary selection state are stored locally in your browser so the extension can work and restore your place. This information is not sent to us.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Where it runs</h2>
    <p class="mt-2">The extension runs only on Reddit pages where it adds keyboard controls. Your use of Reddit is still covered by Reddit's own privacy policy.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Changes</h2>
    <p class="mt-2">If the extension later needs to handle data differently, we will update this page before that change is released.</p>
  </section>
</LegalPage>
