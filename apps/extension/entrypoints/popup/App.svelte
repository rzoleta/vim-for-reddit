<script lang="ts">
  import { onMount } from 'svelte';
  import { enabledSetting } from '../../lib/settings';

  type Shortcut = {
    key: string;
    action: string;
  };

  const shortcuts: Shortcut[] = [
    { key: 'j', action: 'Next' },
    { key: 'k', action: 'Previous' },
    { key: 'u', action: 'Upvote' },
    { key: 'd', action: 'Downvote' },
    { key: 'c', action: 'Comment' },
    { key: 'gg', action: 'Go to top' },
    { key: 'G', action: 'Go to bottom' },
    { key: 'h', action: 'Previous image / hide comment' },
    { key: 'l', action: 'Next image / show comment' },
    { key: 'Enter', action: 'Open post' },
    { key: 'Backspace', action: 'Go back' },
  ];

  let enabled = $state(true);
  let ready = $state(false);

  onMount(() => {
    let mounted = true;

    void enabledSetting.getValue().then((value) => {
      if (mounted) {
        enabled = value;
        ready = true;
      }
    });

    const unwatch = enabledSetting.watch((value) => {
      if (mounted) {
        enabled = value;
      }
    });

    return () => {
      mounted = false;
      unwatch();
    };
  });

  async function toggleEnabled() {
    if (!ready) return;

    enabled = !enabled;
    await enabledSetting.setValue(enabled);
  }
</script>

<main class="w-80 overflow-hidden bg-stone-50">
  <header class="border-b border-stone-200 bg-white px-4 py-3.5">
    <div class="flex items-center gap-3">
      <img
        src="/icons/128.png"
        alt=""
        class="size-10 rounded-xl shadow-sm ring-1 ring-black/5"
      />
      <div class="min-w-0 flex-1">
        <h1 class="truncate text-[15px] font-semibold tracking-tight">Vim for Reddit</h1>
        <p
          class="mt-0.5 flex items-center gap-1.5 text-xs font-medium"
          class:text-emerald-700={enabled}
          class:text-stone-500={!enabled}
        >
          <span
            aria-hidden="true"
            class="size-1.5 rounded-full"
            class:bg-emerald-500={enabled}
            class:bg-stone-400={!enabled}
          ></span>
          {enabled ? 'Enabled on Reddit' : 'Disabled'}
        </p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={enabled ? 'Disable Vim for Reddit' : 'Enable Vim for Reddit'}
        title={enabled ? 'Disable extension' : 'Enable extension'}
        disabled={!ready}
        onclick={toggleEnabled}
        class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-stone-300 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60 data-[enabled=true]:bg-orange-600"
        data-enabled={enabled}
      >
        <span
          aria-hidden="true"
          class="pointer-events-none block size-5 translate-x-0.5 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform data-[enabled=true]:translate-x-5"
          data-enabled={enabled}
        ></span>
      </button>
    </div>

  </header>

  <div class="px-4 py-4">
    <dl class="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">
      {#each shortcuts as shortcut, index}
        <div
          class="flex min-h-8 items-center gap-3 px-2.5 py-1.5"
          class:border-b={index < shortcuts.length - 1}
          class:border-stone-100={index < shortcuts.length - 1}
        >
          <dt class="w-[4.75rem] shrink-0">
            <kbd
              class="inline-flex min-w-6 items-center justify-center rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold leading-4 text-stone-700 shadow-[0_1px_0_#d6d3d1]"
            >
              {shortcut.key}
            </kbd>
          </dt>
          <dd class="m-0 text-xs leading-4 text-stone-600">{shortcut.action}</dd>
        </div>
      {/each}
    </dl>
  </div>
</main>
