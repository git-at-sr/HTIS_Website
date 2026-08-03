<script lang="ts">
  import { untrack } from 'svelte';
  import { slide, fly, fade } from 'svelte/transition';
  import { CirclePlus, CircleMinus, ArrowUpRight } from '@lucide/svelte';
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';
  import type { SoftwarePortfolioTab } from '~/data/cms';

  let {
    capabilities = [],
  }: {
    capabilities?: SoftwarePortfolioTab[];
  } = $props();

  let activeTab = $state(
    untrack(() => (capabilities.length > 0 ? capabilities[0].id : '')),
  );
  let activeItemIndex = $state(0);
  let hoveredItemIndex = $state<number | null>(null);
  let progress = $state(0);

  let isAutoplayPaused = $derived(hoveredItemIndex === activeItemIndex);

  // Derive the active tab object
  let currentTabObj = $derived(
    capabilities.find((t) => t.id === activeTab) || capabilities[0],
  );

  let currentItem = $derived(currentTabObj?.items[activeItemIndex]);

  // Derive the active image from the active CMS item.
  let currentImage = $derived(currentItem?.image || '');

  const AUTOPLAY_INTERVAL_MS = 7000;
  const STEP_TIME_MS = 50;

  // Autoplay Effect: Cycles ONLY the accordion items in the active tab every 7 seconds
  $effect(() => {
    activeTab;
    activeItemIndex;

    progress = 0;
    let elapsed = 0;
    let lastTick = Date.now();

    const intervalId = setInterval(() => {
      const now = Date.now();

      if (isAutoplayPaused) {
        lastTick = now;
        return;
      }

      elapsed += now - lastTick;
      lastTick = now;
      progress = Math.min((elapsed / AUTOPLAY_INTERVAL_MS) * 100, 100);
      if (elapsed >= AUTOPLAY_INTERVAL_MS) {
        // Reset elapsed time and progress immediately before updating activeItemIndex.
        // Because Svelte 5 schedules effect teardowns asynchronously, there might be a
        // tiny delay before this interval is cleared. Resetting here prevents additional
        // ticks of the interval from firing and causing rapid index cycling in the interim.
        elapsed = 0;
        progress = 0;
        if (currentTabObj && currentTabObj.items.length > 1) {
          activeItemIndex = (activeItemIndex + 1) % currentTabObj.items.length;
        }
      }
    }, STEP_TIME_MS);

    return () => clearInterval(intervalId);
  });

  // Handle Tab Switch
  function selectTab(tabId: string) {
    activeTab = tabId;
    activeItemIndex = 0; // Reset active item index on tab swap
    hoveredItemIndex = null;
  }
</script>

<div class="w-full" role="region" aria-label="Software Portfolio">
  <!-- Tabs Navigation -->
  <div
    class="w-full flex flex-col sm:flex-row justify-center items-stretch gap-2 bg-base-100/60 backdrop-blur-md rounded-2xl border border-base-content/10 p-2 mb-6"
  >
    {#each capabilities as tab}
      <button
        class="flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 text-base md:text-xl text-center cursor-pointer select-none
          {activeTab === tab.id
          ? 'bg-primary text-primary-content shadow-lg shadow-primary/20 scale-[1.02]'
          : 'text-base-content/70 hover:text-base-content hover:bg-base-200/50'}"
        onclick={() => selectTab(tab.id)}
      >
        <span class="flex items-center justify-center gap-2">
          <CmsIconSvelte name={tab.iconName} size={18} />
          <CmsRichTextSvelte value={tab.shortLabel || tab.label} />
        </span>
      </button>
    {/each}
  </div>

  <!-- Content Container (Card Area) -->
  <div
    class="bg-base-100/60 backdrop-blur-md rounded-3xl border border-base-content/10 shadow-xl overflow-hidden p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-x-16 lg:gap-y-6"
  >
    <!-- Left Details Header/Desc: 7 cols -->
    <div class="lg:col-span-7">
      <CmsRichTextSvelte
        value={currentTabObj?.label}
        tag="h3"
        className="mb-4 text-2xl font-medium text-base-content md:text-3xl"
      />
      <CmsRichTextSvelte
        value={currentTabObj?.description}
        tag="p"
        className="text-sm leading-relaxed text-base-content/70 md:text-base"
      />
    </div>

    <!-- Right Showcase Image: 5 cols (Desktop side column span, Mobile center order) -->
    <div
      class="lg:col-span-5 lg:row-span-2 lg:col-start-8 lg:row-start-1 flex items-center justify-center"
    >
      <div
        class="relative w-full aspect-square sm:aspect-4/3 lg:aspect-auto lg:h-[500px] flex items-center justify-center"
      >
        <!-- Overlay decorative blur behind mockups -->
        <div
          class="absolute w-[200px] h-[200px] rounded-full bg-primary/20 blur-3xl -top-10 -right-10"
        ></div>
        <div
          class="absolute w-[180px] h-[180px] rounded-full bg-secondary/15 blur-3xl -bottom-10 -left-10"
        ></div>

        <div class="relative z-10 w-full h-full flex items-center justify-center">
          {#key activeTab + '-' + activeItemIndex}
            {#if currentImage}
              <div
                class="w-full h-full flex items-center justify-center"
                in:fly={{ y: 20, duration: 400, delay: 100 }}
                out:fade={{ duration: 200 }}
              >
                <!-- Render standard frame depending on horizontal/vertical style or just sleek rounded shadow wrapper -->
                <img
                  src={currentImage}
                  alt={currentTabObj?.items[activeItemIndex]?.title || ''}
                  class="max-h-full max-w-full object-contain drop-shadow-xl transform hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            {/if}
          {/key}
        </div>
      </div>
    </div>

    <!-- Left Details Accordion List: 7 cols -->
    <div class="lg:col-span-7 flex flex-col gap-4">
      {#each currentTabObj?.items || [] as item, index}
        <button
          class="relative overflow-hidden text-left w-full px-6 py-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none
            {activeItemIndex === index
            ? 'bg-base-100 border-primary/30 shadow-md ring-1 ring-primary/20'
            : 'border-base-content/5 bg-transparent hover:bg-base-200/30'}"
          onclick={() => (activeItemIndex = index)}
          onmouseenter={() => (hoveredItemIndex = index)}
          onmouseleave={() => {
            if (hoveredItemIndex === index) hoveredItemIndex = null;
          }}
        >
          <div class="relative z-10 flex justify-between items-center w-full">
            <div class="flex items-center gap-3">
              <span
                class="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                {activeItemIndex === index
                  ? 'bg-primary text-primary-content'
                  : 'bg-base-200 text-base-content/50'}"
              >
                {index + 1}
              </span>
              <CmsRichTextSvelte
                value={item.title}
                tag="h4"
                className="pr-4 text-base font-bold transition-colors md:text-lg
                  {activeItemIndex === index ? 'text-primary' : 'text-base-content/85'}"
              />
            </div>
            <div class="text-base-content/40 shrink-0">
              {#if activeItemIndex === index}
                <CircleMinus size={20} class="text-primary" />
              {:else}
                <CirclePlus size={20} class="hover:text-base-content" />
              {/if}
            </div>
          </div>

          {#if activeItemIndex === index}
            <div transition:slide={{ duration: 300 }} class="relative z-10 mt-3 pl-9">
              <div class="pb-1 text-sm leading-relaxed text-base-content/75 md:text-base">
                <CmsRichTextSvelte value={item.desc} />
                {#if item.ctaUrl}
                  <a
                    href={item.ctaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="ml-1.5 inline-flex items-center gap-0.5 align-baseline font-semibold text-primary hover:underline"
                    onclick={(e) => e.stopPropagation()}
                  >
                    <CmsRichTextSvelte value={item.ctaLabel || 'Know more'} />
                    <ArrowUpRight size={14} class="translate-y-[1px]" />
                  </a>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Integrated Bottom Progress Loader -->
          {#if activeItemIndex === index}
            <div
              class="absolute bottom-0 left-0 h-[4px] bg-primary transition-[width] duration-75 ease-linear"
              style="width: {progress}%"
            ></div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
</div>
