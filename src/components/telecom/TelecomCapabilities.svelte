<script lang="ts">
  import { untrack } from 'svelte';
  import { slide, fly } from 'svelte/transition';
  import { CirclePlus, CircleMinus } from '@lucide/svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface CapabilityItem {
    title: string;
    desc: string;
  }

  interface CapabilityTab {
    id: string;
    label: string;
    shortLabel?: string;
    image: string;
    invertImageInDarkMode?: boolean;
    items: CapabilityItem[];
  }

  let { capabilities = [] }: { capabilities?: CapabilityTab[] } = $props();

  let activeTab = $state(
    untrack(() => (capabilities.length > 0 ? capabilities[0].id : '')),
  );
  let activeItemIndex = $state(0);
  let tabsContainer: HTMLElement | undefined = $state();
  let isAutoplayPaused = $state(false);

  let activeCapability = $derived(
    capabilities.find((t) => t.id === activeTab) || capabilities[0],
  );

  // -- Constants --
  const AUTOPLAY_INTERVAL_MS = 15000;
  let autoplayTimer: ReturnType<typeof setTimeout> | undefined;
  let autoplayStartedAt = 0;
  let autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;

  // -- Effects --
  $effect(() => {
    untrack(scheduleAutoplay);

    return clearAutoplayTimer;
  });

  // -- Handlers --
  function clearAutoplayTimer() {
    if (autoplayTimer === undefined) return;
    clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  }

  function scheduleAutoplay() {
    clearAutoplayTimer();
    if (isAutoplayPaused || capabilities.length < 2) return;

    autoplayStartedAt = Date.now();
    autoplayTimer = setTimeout(() => {
      const currentTabIndex = capabilities.findIndex((t) => t.id === activeTab);
      if (currentTabIndex === -1) return;

      const nextTabIndex = (currentTabIndex + 1) % capabilities.length;
      autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
      activeTab = capabilities[nextTabIndex].id;
      activeItemIndex = 0;
      scrollTabToActive(nextTabIndex);
      scheduleAutoplay();
    }, autoplayRemainingMs);
  }

  function pauseAutoplay() {
    if (isAutoplayPaused) return;
    isAutoplayPaused = true;

    if (autoplayTimer !== undefined) {
      autoplayRemainingMs = Math.max(
        0,
        autoplayRemainingMs - (Date.now() - autoplayStartedAt),
      );
      clearAutoplayTimer();
    }
  }

  function resumeAutoplay() {
    if (!isAutoplayPaused) return;
    isAutoplayPaused = false;
    scheduleAutoplay();
  }

  function resetAutoplay() {
    autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
    scheduleAutoplay();
  }

  function scrollTabToActive(index: number) {
    if (!tabsContainer) return;
    const tabs = tabsContainer.querySelectorAll<HTMLElement>('.tab-button');
    const targetTab = tabs[index];
    if (!targetTab) return;

    const tabRect = targetTab.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    const scrollLeft =
      tabsContainer.scrollLeft +
      (tabRect.left - containerRect.left) -
      (containerRect.width - tabRect.width) / 2;

    tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }
</script>

<div class="w-full" role="region" aria-label="Telecom Capabilities">
  <!-- Tabs Navigation -->
  <div
    class="relative mb-6 w-full rounded-2xl border border-base-content/10 bg-base-100/60 p-2 backdrop-blur-md"
    role="navigation"
    aria-label="Capability categories"
    onmouseenter={pauseAutoplay}
    onmouseleave={resumeAutoplay}
  >
    <div
      class="relative w-full overflow-x-auto overflow-y-hidden scroll-smooth"
      bind:this={tabsContainer}
    >
      <div class="flex w-max min-w-full flex-nowrap justify-start gap-2.5 px-1 pt-1 pb-2">
        {#each capabilities as tab, index}
          <button
            aria-pressed={activeTab === tab.id}
            class="tab-button relative min-w-[132px] flex-1 shrink-0 cursor-pointer select-none overflow-hidden rounded-lg px-4.5 py-2.5 text-center text-sm font-semibold transition-all duration-300 md:min-w-[148px]
              {activeTab === tab.id
              ? 'bg-primary text-primary-content shadow-md'
              : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'}"
            onclick={() => {
              const tabChanged = activeTab !== tab.id;
              activeTab = tab.id;
              activeItemIndex = 0;
              scrollTabToActive(index);
              if (tabChanged) resetAutoplay();
            }}
          >
            <CmsRichTextSvelte
              value={tab.shortLabel || tab.label}
              className="relative z-10"
            />
            {#if activeTab === tab.id}
              <span
                class="absolute bottom-0 left-0 h-[6px] bg-primary-content/85 animate-progress block"
                style="--duration: {AUTOPLAY_INTERVAL_MS}ms; animation-play-state: {isAutoplayPaused
                  ? 'paused'
                  : 'running'};"
              ></span>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content Container (Card Area) -->
  <div
    class="bg-base-100/50 backdrop-blur-md rounded-3xl border border-base-content/10 shadow-lg overflow-hidden p-6 md:p-10 lg:py-5 grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6"
    role="group"
    aria-label="Capability details"
    onmouseenter={pauseAutoplay}
    onmouseleave={resumeAutoplay}
  >
    {#if activeCapability}
      <CmsRichTextSvelte
        value={activeCapability.label}
        tag="h3"
        className="order-1 lg:col-span-2 text-2xl md:text-3xl font-medium text-base-content tracking-tight mb-2 md:mb-4 lg:mb-0"
      />
    {/if}

    <!-- Left: Accordion -->
    <div class="order-3 lg:order-2 flex flex-col gap-3">
      {#each activeCapability?.items || [] as item, index}
        <div
          role="button"
          tabindex="0"
          class="relative cursor-pointer overflow-hidden text-left w-full px-6 py-4 rounded-xl border transition-all duration-300 {activeItemIndex ===
          index
            ? 'bg-base-100 border-base-content/10 shadow-sm'
            : 'border-base-content/5 bg-transparent hover:bg-base-200/30 lg:py-3'}"
          onclick={() => (activeItemIndex = activeItemIndex === index ? -1 : index)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activeItemIndex = activeItemIndex === index ? -1 : index;
            }
          }}
        >
          <div class="relative z-10 flex justify-between items-center w-full">
            <CmsRichTextSvelte
              value={item.title}
              tag="h4"
              className="text-base md:text-lg pr-4 {activeItemIndex === index
                ? 'text-base-content font-medium'
                : 'text-base-content/80'}"
            />
            <div class="text-base-content/50 shrink-0">
              {#if activeItemIndex === index}
                <CircleMinus size={20} />
              {:else}
                <CirclePlus size={20} />
              {/if}
            </div>
          </div>
          {#if activeItemIndex === index}
            <div transition:slide={{ duration: 300 }} class="relative z-10 mt-2">
              <CmsRichTextSvelte
                value={item.desc}
                tag="p"
                className="text-base-content/60 text-sm pb-1"
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Right: Image -->
    <div
      class="order-2 lg:order-3 relative w-full aspect-square md:aspect-auto md:h-full min-h-[300px] rounded-2xl overflow-hidden flex items-center justify-center bg-base-100"
    >
      {#key activeTab}
        {#if activeCapability?.image}
          <img
            src={activeCapability.image}
            alt={activeCapability.label}
            class="w-full h-full object-contain object-center p-4 {activeCapability.invertImageInDarkMode
              ? 'filter-invert-dark'
              : ''}"
            in:fly={{ y: 10, duration: 400 }}
          />
        {/if}
      {/key}
    </div>
  </div>
</div>
