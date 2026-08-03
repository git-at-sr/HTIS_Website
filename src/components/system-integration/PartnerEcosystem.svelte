<script lang="ts">
  import { untrack } from 'svelte';
  import { fade } from 'svelte/transition';
  import { ChevronLeft, ChevronRight } from '@lucide/svelte';
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface Partner {
    name: string;
    logoSrc?: string;
  }

  interface EcosystemTab {
    iconName: string;
    title: string;
    subtitle: string;
    description?: string;
    partners: Partner[];
  }

  interface PartnerEcosystem {
    heading: string;
    description: string;
    tabs: EcosystemTab[];
  }

  let {
    partnerEcosystem,
  }: {
    partnerEcosystem: PartnerEcosystem;
  } = $props();

  const tabs = $derived(partnerEcosystem.tabs ?? []);
  const AUTOPLAY_INTERVAL_MS = 6000;

  let activeIndex = $state(0);
  let autoplayTimer: ReturnType<typeof setTimeout> | undefined;
  let autoplayStartedAt = 0;
  let autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
  let isAutoplayPaused = $state(false);
  let carouselContainer = $state<HTMLDivElement | null>(null);
  let tabsContainer = $state<HTMLDivElement | null>(null);
  let hasScrollableContent = $state(false);

  function updateScrollState() {
    if (!carouselContainer) {
      hasScrollableContent = false;
      return;
    }
    const { scrollWidth, clientWidth } = carouselContainer;
    const maxScroll = scrollWidth - clientWidth;
    hasScrollableContent = maxScroll > 0;
  }

  $effect(() => {
    if (!carouselContainer) {
      hasScrollableContent = false;
      return;
    }

    updateScrollState();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });
    resizeObserver.observe(carouselContainer);

    return () => {
      resizeObserver.disconnect();
    };
  });

  function scrollTabToActive(index: number) {
    if (!tabsContainer) return;
    const buttons = tabsContainer.querySelectorAll<HTMLButtonElement>('button');
    const targetButton = buttons[index];
    if (!targetButton) return;

    const btnRect = targetButton.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();

    const scrollLeft =
      tabsContainer.scrollLeft +
      (btnRect.left - containerRect.left) -
      (containerRect.width - btnRect.width) / 2;

    tabsContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }

  function clearAutoplayTimer() {
    if (autoplayTimer === undefined) return;
    clearTimeout(autoplayTimer);
    autoplayTimer = undefined;
  }

  function scheduleAutoplay() {
    clearAutoplayTimer();
    if (isAutoplayPaused || tabs.length < 2) return;

    autoplayStartedAt = Date.now();
    autoplayTimer = setTimeout(() => {
      activeIndex = (activeIndex + 1) % tabs.length;
      autoplayRemainingMs = AUTOPLAY_INTERVAL_MS;
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

  $effect(() => {
    untrack(scheduleAutoplay);
    return clearAutoplayTimer;
  });

  // Handle auto-scroll and carousel reset on activeIndex changes
  $effect(() => {
    scrollTabToActive(activeIndex);
    if (carouselContainer) {
      carouselContainer.scrollTo({ left: 0, behavior: 'instant' as ScrollBehavior });
    }
  });

  function selectTab(index: number) {
    activeIndex = index;
    resetAutoplay();
  }

  function scroll(direction: 'left' | 'right') {
    if (!carouselContainer) return;
    // Reset autoplay interval on interaction
    resetAutoplay();
    const cardWidth = carouselContainer.firstElementChild?.clientWidth || 200;
    const gap = 16; // gap-4 is 16px
    const scrollAmount =
      direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2;
    carouselContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
</script>

<div class="w-full">
  <div class="max-w-4xl mb-12 lg:mb-6">
    <CmsRichTextSvelte
      value={partnerEcosystem.heading}
      tag="h2"
      className="mb-6 text-3xl font-bold text-base-content md:text-4xl lg:text-5xl"
    />
    <CmsRichTextSvelte
      value={partnerEcosystem.description}
      tag="p"
      className="text-lg leading-relaxed text-base-content/70 md:text-xl"
    />
  </div>

  <!-- Unified Redesigned Card Container -->
  <div
    class="bg-base-100 dark:bg-base-200/40 border border-base-content/10 shadow-xl rounded-[2rem] p-6 md:p-10 md:py-6 relative"
    role="group"
    aria-label="Partner ecosystem"
    onmouseenter={pauseAutoplay}
    onmouseleave={resumeAutoplay}
  >
    <!-- Pills/Tabs at the top -->
    <div
      bind:this={tabsContainer}
      class="flex flex-nowrap gap-2.5 pb-6 border-b border-base-content/10 mb-8 overflow-x-auto no-scrollbar scroll-smooth w-full"
    >
      {#each tabs as tab, i}
        <button
          onclick={() => selectTab(i)}
          class="flex items-center gap-2 px-4.5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer border shrink-0 relative
            {activeIndex === i
            ? 'border-transparent shadow-md bg-primary text-primary-content'
            : 'bg-base-200/50 text-base-content/80 hover:bg-base-200 border-base-content/5'}"
        >
          <CmsIconSvelte name={tab.iconName} class="h-4 w-4 shrink-0" />
          <CmsRichTextSvelte value={tab.title} />

          {#if activeIndex === i}
            <!-- Progress bar loader effect -->
            <div
              class="absolute inset-0 overflow-hidden rounded-full pointer-events-none"
            >
              <div
                class="absolute bottom-0 left-0 h-1 bg-primary-content/85 animate-progress"
                style="--duration: {AUTOPLAY_INTERVAL_MS}ms; animation-play-state: {isAutoplayPaused
                  ? 'paused'
                  : 'running'};"
              ></div>
            </div>
            <!-- Downward pointing indicator arrow -->
            <div
              class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-primary z-10"
            ></div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Active Tab Content Area -->
    <div class="relative min-h-[220px]">
      {#key activeIndex}
        <div in:fade={{ duration: 300 }}>
          <!-- Subtitle and Description Row -->
          <div class="flex flex-col sm:flex-row items-start gap-5 md:gap-6 mb-8">
            <!-- Large Round Icon -->
            <div
              class="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary shrink-0 shadow-inner"
            >
              <CmsIconSvelte
                name={tabs[activeIndex]?.iconName}
                class="h-7 w-7 md:h-8 md:w-8"
              />
            </div>

            <!-- Title & Description -->
            <div class="flex-1">
              <CmsRichTextSvelte
                value={tabs[activeIndex].subtitle}
                tag="h3"
                className="mb-2 text-xl font-medium text-secondary md:text-2xl"
              />
              <div class="w-12 h-1 bg-primary rounded-full my-3"></div>
              <CmsRichTextSvelte
                value={tabs[activeIndex].description ||
                  'High-performance, secure and scalable solutions powered by industry-leading technology.'}
                tag="p"
                className="max-w-3xl text-base leading-relaxed text-base-content/75"
              />
            </div>
          </div>

          <!-- Partners Carousel -->
          <div class="relative flex items-center w-full mt-6">
            <!-- Left Navigation Button -->
            {#if hasScrollableContent}
              <button
                onclick={() => scroll('left')}
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all hover:bg-primary hover:text-primary-content active:scale-95 shadow-sm cursor-pointer mr-2 hover:shadow-md"
                aria-label="Previous partners"
                transition:fade={{ duration: 200 }}
              >
                <ChevronLeft class="h-5 w-5" />
              </button>
            {/if}

            <!-- Carousel track/viewport -->
            <div
              bind:this={carouselContainer}
              class="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex gap-4 py-2"
            >
              {#each tabs[activeIndex].partners as partner}
                <div
                  class="shrink-0 w-[170px] md:w-[180px] h-24 bg-base-100 dark:bg-[#CBD6CF] border border-base-content/10 rounded-2xl shadow-xs flex items-center justify-center p-2 transition-all duration-300 hover:border-primary/30 hover:shadow-md hover:scale-[1.02] group"
                >
                  {#if partner.logoSrc}
                    <img
                      src={partner.logoSrc}
                      alt={partner.name}
                      class="max-h-16 md:max-h-20 max-w-[92%] object-contain transition-all duration-300 opacity-90 group-hover:opacity-100"
                    />
                  {:else}
                    <CmsRichTextSvelte
                      value={partner.name}
                      tag="div"
                      className="px-2 text-center font-sans text-sm font-bold tracking-wider text-secondary/80 uppercase transition-colors group-hover:text-primary dark:text-base-content/70 md:text-base"
                    />
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Right Navigation Button -->
            {#if hasScrollableContent}
              <button
                onclick={() => scroll('right')}
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all hover:bg-primary hover:text-primary-content active:scale-95 shadow-sm cursor-pointer ml-2 hover:shadow-md"
                aria-label="Next partners"
                transition:fade={{ duration: 200 }}
              >
                <ChevronRight class="h-5 w-5" />
              </button>
            {/if}
          </div>
        </div>
      {/key}
    </div>
  </div>
</div>
