<script lang="ts">
  import LegalPage from '$lib/LegalPage.svelte';
</script>

<svelte:head>
  <title>Terms of use — Vim for Reddit</title>
  <meta name="description" content="The Vim for Reddit terms of use, in plain language." />
</svelte:head>

<LegalPage
  eyebrow="The short version"
  title="Terms of use"
  intro="By using Vim for Reddit, you agree to these simple terms."
>
  <section>
    <h2 class="font-bold text-black">Use it responsibly</h2>
    <p class="mt-2">You are responsible for what you do on Reddit, including votes, comments, and replies made while using the extension. Follow Reddit's rules and applicable laws.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Provided as-is</h2>
    <p class="mt-2">The extension is provided without warranties. Reddit can change its website at any time, which may temporarily break some or all keyboard controls.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Independent project</h2>
    <p class="mt-2">Vim for Reddit is an independent project. It is not affiliated with, sponsored by, or endorsed by Reddit.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Changes</h2>
    <p class="mt-2">We may update these terms as the extension evolves. Continuing to use it after an update means you accept the revised terms.</p>
  </section>
</LegalPage>
