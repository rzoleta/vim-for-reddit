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
  intro="Vim for Reddit processes only the information it needs on your device and does not send your data to us."
>
  <section>
    <h2 class="font-bold text-black">Summary</h2>
    <p class="mt-2">Vim for Reddit has no accounts, analytics, advertising, or developer-operated servers. We do not receive, sell, or share your personal information, browsing activity, or Reddit content. Information handled by the extension stays in your browser and is used only to provide its Vim-style keyboard controls.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Information processed on your device</h2>
    <p class="mt-2">While you browse Reddit, the extension reads the current page's URL and page structure to find posts, comments, galleries, and Reddit's native controls. It uses that information in your browser to move the selection, highlight content, and carry out keyboard-initiated actions such as opening a post, voting, or replying. The extension does not transmit or retain a copy of the page's content.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Information stored locally</h2>
    <p class="mt-2">The extension stores one enabled or disabled preference in the browser's extension storage so your choice persists between browser sessions. This preference remains until you change it, clear the extension's data, or uninstall the extension.</p>
    <p class="mt-2">To restore your place after opening a post and going back, the extension may also store the Reddit feed URL, an identifier for the selected post, and the time of the selection in that Reddit tab's session storage. This temporary record expires after 12 hours and is removed the next time the extension reads an expired record. Closing the tab also allows the browser to clear its session storage.</p>
    <p class="mt-2">None of this locally stored information is sent to us or to another third party by the extension.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Permissions and site access</h2>
    <p class="mt-2">The extension uses the browser's storage permission only for the enabled preference. It runs only on <span class="font-mono text-[0.9em] text-black/80">reddit.com</span> and <span class="font-mono text-[0.9em] text-black/80">www.reddit.com</span>, where site access is required to add keyboard navigation and interact with Reddit's existing controls. It does not run on other websites.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Reddit and third parties</h2>
    <p class="mt-2">When you use a shortcut to vote, open a post, comment, or reply, the extension activates Reddit's native interface. Reddit processes those actions under its own terms and privacy policy. Vim for Reddit does not receive your Reddit credentials, votes, comments, or replies, and it does not add analytics, advertising, or other third-party tracking.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Your choices</h2>
    <p class="mt-2">You can stop the keyboard controls at any time with the extension's enabled toggle. You can remove the saved preference by clearing the extension's data or uninstalling it. You can remove temporary selection state by closing the Reddit tab.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Changes</h2>
    <p class="mt-2">If the extension's data practices change, we will update this policy and prominently disclose the change before the new practice begins. The effective date below will reflect the latest revision.</p>
  </section>

  <section>
    <h2 class="font-bold text-black">Contact</h2>
    <p class="mt-2">For privacy questions, open an issue in the <a class="font-medium text-black underline decoration-black/25 underline-offset-4 transition-colors hover:decoration-black" href="https://github.com/rzoleta/vim-for-reddit/issues">Vim for Reddit GitHub repository</a>. GitHub issues are public, so please do not include sensitive personal information.</p>
  </section>

  <p class="font-mono text-sm text-black/45">Effective July 16, 2026</p>
</LegalPage>
