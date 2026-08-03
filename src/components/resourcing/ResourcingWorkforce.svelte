<script lang="ts">
  import { untrack } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { ArrowRight, ChevronDown } from '@lucide/svelte';
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  type WorkforceTool = {
    iconName: string;
    name: string;
  };

  type WorkforceTab = {
    title: string;
    description: string;
    image: string;
    ctaLabel: string;
    ctaUrl: string;
    tools: WorkforceTool[];
  };

  type Workforce = {
    sectionId?: string;
    heading: string;
    tabs: WorkforceTab[];
  };

  const iconColors = [
    'text-purple-400',
    'text-orange-400',
    'text-blue-400',
    'text-teal-400',
    'text-indigo-400',
    'text-pink-400',
    'text-green-400',
    'text-yellow-400',
    'text-cyan-400',
    'text-red-400',
  ];

  let { workforce }: { workforce: Workforce } = $props();

  // --- Desktop state (autoplay tabs) ---
  const AUTOPLAY_INTERVAL_MS = 7000;
  let activeIndex = $state(0);
  let autoplayTimeout: ReturnType<typeof setTimeout>;
  let autoplayStartedAt = 0;
  let autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
  let isAutoplayPaused = $state(false);

  const tabs = $derived(workforce.tabs);
  const activeTab = $derived(tabs[activeIndex] ?? tabs[0]);

  // --- Mobile state (user-driven accordion, first open) ---
  let mobileOpenIndex = $state(0);

  function scheduleAutoplay() {
    clearTimeout(autoplayTimeout);

    if (isAutoplayPaused || tabs.length <= 1) {
      return;
    }

    autoplayStartedAt = Date.now();
    autoplayTimeout = setTimeout(() => {
      activeIndex = (activeIndex + 1) % tabs.length;
      autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
      scheduleAutoplay();
    }, autoplayRemainingMs);
  }

  function resetAutoplay() {
    autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
    scheduleAutoplay();
  }

  function pauseAutoplay() {
    if (isAutoplayPaused) return;

    isAutoplayPaused = true;
    autoplayRemainingMs = Math.max(
      0,
      autoplayRemainingMs - (Date.now() - autoplayStartedAt),
    );
    clearTimeout(autoplayTimeout);
  }

  function resumeAutoplay() {
    if (!isAutoplayPaused) return;

    isAutoplayPaused = false;
    scheduleAutoplay();
  }

  $effect(() => {
    const tabCount = tabs.length;

    untrack(() => {
      if (activeIndex >= tabCount) {
        activeIndex = 0;
      }

      resetAutoplay();
    });

    return () => {
      clearTimeout(autoplayTimeout);
    };
  });

  function selectTab(index: number) {
    activeIndex = index;
    resetAutoplay();
  }

  function toggleMobilePanel(index: number) {
    mobileOpenIndex = mobileOpenIndex === index ? -1 : index;
  }
</script>

<div class="rounded-[2.5rem] bg-[#2A4839] p-8 text-white shadow-2xl md:p-10">
  <h2 class="mb-10 text-3xl font-bold md:text-4xl lg:text-5xl">
    <CmsRichTextSvelte value={workforce.heading} />
  </h2>

  {#if tabs.length > 0 && activeTab}
    <!-- ===== DESKTOP: Tab layout (lg+) ===== -->
    <div class="hidden lg:block">
      <div
        class="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3"
        role="group"
        aria-label="Workforce tabs"
        onmouseenter={pauseAutoplay}
        onmouseleave={resumeAutoplay}
      >
        {#each tabs as tab, i}
          <button
            class="relative cursor-pointer overflow-hidden rounded-2xl border px-5 py-3 text-left transition-all duration-300 {activeIndex ===
            i
              ? 'border-white/30 bg-white/10 shadow-lg'
              : 'border-white/10 bg-transparent hover:border-white/20'}"
            onclick={() => selectTab(i)}
          >
            {#if activeIndex === i}
              <div
                class="animate-fill-bg absolute inset-y-0 left-0 bg-white/5"
                style="--duration: {AUTOPLAY_INTERVAL_MS}ms; animation-play-state: {isAutoplayPaused
                  ? 'paused'
                  : 'running'};"
              ></div>
              <div
                class="animate-fill-bg absolute bottom-0 left-0 h-1 bg-[#64D9A1]"
                style="--duration: {AUTOPLAY_INTERVAL_MS}ms; animation-play-state: {isAutoplayPaused
                  ? 'paused'
                  : 'running'};"
              ></div>
            {/if}
            <h3 class="text-xl leading-snug font-medium">
              <CmsRichTextSvelte value={tab.title} />
            </h3>
          </button>
        {/each}
      </div>

      <div
        class="relative aspect-video w-full overflow-hidden rounded-2xl bg-white/5 lg:aspect-[2.3/1]"
      >
        {#key activeIndex}
          <img
            src={activeTab.image}
            alt={activeTab.title}
            class="absolute inset-0 h-full w-full object-cover"
            transition:fade={{ duration: 700 }}
          />
        {/key}
      </div>

      <div
        class="relative z-10 mx-4 -mt-12 flex flex-col items-center justify-between gap-8 rounded-2xl border border-white/10 bg-black/60 p-6 shadow-2xl backdrop-blur-xl md:mx-6 md:-mt-20 lg:mx-8 lg:-mt-28 lg:flex-row lg:p-8"
        role="group"
        aria-label="Active workforce tab details"
        onmouseenter={pauseAutoplay}
        onmouseleave={resumeAutoplay}
      >
        <div class="lg:w-1/3">
          <h3 class="mb-4 text-lg leading-tight font-bold text-white md:text-xl">
            {#key activeIndex}
              <span class="inline-block" in:fade={{ duration: 300 }}>
                <CmsRichTextSvelte value={activeTab.description} />
              </span>
            {/key}
          </h3>
          <a
            href={activeTab.ctaUrl}
            class="flex items-center gap-2 font-medium text-[#64D9A1] transition-colors hover:text-[#4BBE8A]"
          >
            <CmsRichTextSvelte value={activeTab.ctaLabel} />
            <ArrowRight class="h-4 w-4" />
          </a>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-3 lg:w-2/3">
          {#key activeIndex}
            <div
              class="flex flex-wrap items-center justify-end gap-3"
              in:fade={{ duration: 300 }}
            >
              {#each activeTab.tools as tool, toolIndex}
                <div
                  class="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 bg-black/50 px-4 py-2.5 text-xs font-medium text-white/90 backdrop-blur-md transition-colors hover:bg-white/10 md:text-sm"
                >
                  <CmsIconSvelte
                    name={tool.iconName}
                    size={16}
                    class={iconColors[toolIndex % iconColors.length]}
                  />
                  <CmsRichTextSvelte value={tool.name} />
                </div>
              {/each}
            </div>
          {/key}
        </div>
      </div>
    </div>

    <!-- ===== MOBILE: Accordion layout (<lg) ===== -->
    <div class="flex flex-col gap-3 lg:hidden">
      {#each tabs as tab, i}
        {@const isOpen = mobileOpenIndex === i}
        <div
          class="overflow-hidden rounded-2xl border transition-colors duration-300 {isOpen
            ? 'border-white/30 bg-white/10'
            : 'border-white/10 bg-transparent'}"
        >
          <!-- Accordion header -->
          <button
            class="flex w-full cursor-pointer items-center justify-between p-5 text-left"
            onclick={() => toggleMobilePanel(i)}
          >
            <h3 class="text-xl font-semibold"><CmsRichTextSvelte value={tab.title} /></h3>
            <ChevronDown
              size={22}
              class="shrink-0 transition-transform duration-300 {isOpen
                ? 'rotate-180'
                : ''}"
            />
          </button>

          <!-- Accordion body -->
          {#if isOpen}
            <div
              class="flex flex-col gap-5 px-5 pb-6"
              transition:slide={{ duration: 300 }}
            >
              <!-- Tab image -->
              <div
                class="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5"
              >
                <img src={tab.image} alt={tab.title} class="h-full w-full object-cover" />
              </div>

              <!-- Description overlay box -->
              <div
                class="rounded-xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl"
              >
                <p class="mb-3 text-base leading-snug font-bold text-white">
                  <CmsRichTextSvelte value={tab.description} />
                </p>
                <a
                  href={tab.ctaUrl}
                  class="flex items-center gap-2 text-sm font-medium text-[#64D9A1] transition-colors hover:text-[#4BBE8A]"
                >
                  <CmsRichTextSvelte value={tab.ctaLabel} />
                  <ArrowRight class="h-4 w-4" />
                </a>
              </div>

              <!-- Badges: 2-row horizontal scroll -->
              <div class="rw-mobile-badges -mx-1 px-1 py-1">
                {#each tab.tools as tool, toolIndex}
                  <div
                    class="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-black/50 px-3.5 py-2 text-xs font-medium text-white/90 backdrop-blur-md"
                  >
                    <CmsIconSvelte
                      name={tool.iconName}
                      size={14}
                      class={iconColors[toolIndex % iconColors.length]}
                    />
                    <CmsRichTextSvelte value={tool.name} />
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
