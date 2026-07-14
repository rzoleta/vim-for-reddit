<script lang="ts">
  import LegalPage from '$lib/LegalPage.svelte';
</script>

<svelte:head>
  <title>Privacy — Vim for Reddit</title>
  <meta name="description" content="The Vim for Reddit privacy policy, in plain language." />
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
