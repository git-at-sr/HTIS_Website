<script lang="ts">
  import { fade } from 'svelte/transition';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface TelecomProcessStep {
    name: string;
    desc: string;
  }

  interface TelecomProcess {
    id: string;
    title: string;
    description: string;
    image: string;
    details: TelecomProcessStep[];
  }

  let {
    sectionId,
    heading = 'Telecom Processes —\nBlueprint to Reality.',
    processes = [],
  }: {
    sectionId?: string;
    heading?: string;
    processes?: TelecomProcess[];
  } = $props();

  let activeIndex = $state(0);
  let progressWidth = $state(0);
  let navElement = $state<HTMLElement | null>(null);
  let lastCircle = $state<HTMLDivElement | null>(null);
  let trackBottomOffset = $state(22);

  const AUTOPLAY_INTERVAL = 5000;
  let autoplayTimeout: ReturnType<typeof setTimeout> | undefined;
  let progressFrame: number | undefined;
  let autoplayStartedAt = 0;
  let autoplayRemaining = AUTOPLAY_INTERVAL;
  let isAutoplayPaused = false;

  const stopAutoplay = () => {
    if (autoplayTimeout) clearTimeout(autoplayTimeout);
    if (progressFrame !== undefined) cancelAnimationFrame(progressFrame);
    autoplayTimeout = undefined;
    progressFrame = undefined;
  };

  const startAutoplay = () => {
    if (processes.length === 0) return;

    autoplayStartedAt = performance.now();
    const progressAtStart =
      100 * (1 - autoplayRemaining / AUTOPLAY_INTERVAL);

    const updateProgress = (now: number) => {
      const elapsed = Math.min(now - autoplayStartedAt, autoplayRemaining);
      progressWidth = Math.min(
        100,
        progressAtStart + (elapsed / AUTOPLAY_INTERVAL) * 100,
      );

      if (elapsed < autoplayRemaining) {
        progressFrame = requestAnimationFrame(updateProgress);
      } else {
        progressFrame = undefined;
      }
    };

    progressFrame = requestAnimationFrame(updateProgress);

    autoplayTimeout = setTimeout(() => {
      activeIndex = (activeIndex + 1) % processes.length;
    }, autoplayRemaining);
  };

  const pauseAutoplay = () => {
    if (isAutoplayPaused) return;
    isAutoplayPaused = true;
    if (!autoplayTimeout) return;

    autoplayRemaining = Math.max(
      0,
      autoplayRemaining - (performance.now() - autoplayStartedAt),
    );
    stopAutoplay();
    progressWidth = 100 * (1 - autoplayRemaining / AUTOPLAY_INTERVAL);
  };

  const resumeAutoplay = () => {
    if (!isAutoplayPaused) return;
    isAutoplayPaused = false;
    if (autoplayTimeout || autoplayRemaining <= 0) return;
    startAutoplay();
  };

  /**
   * Autoplay timer: Automatically transitions to the next step every 5 seconds.
   * Re-runs and resets whenever `activeIndex` changes, while the hover handlers
   * pause and resume both the timeout and its visible progress indicator.
   */
  $effect(() => {
    activeIndex; // dependency to trigger reset

    stopAutoplay();
    autoplayRemaining = AUTOPLAY_INTERVAL;
    progressWidth = 0;
    if (!isAutoplayPaused) startAutoplay();

    return stopAutoplay;
  });

  /**
   * Shorten the timeline track on desktop so that it does not extend
   * below the final step's (07) circle. Since the last item aligns its circle
   * to the top (due to items-start layout), we dynamically compute the
   * offset from the bottom of the nav container to the center of the last circle.
   */
  $effect(() => {
    activeIndex; // dependency to recalculate when content height updates active tab

    const updateOffset = () => {
      if (navElement && lastCircle) {
        const navRect = navElement.getBoundingClientRect();
        const circleRect = lastCircle.getBoundingClientRect();
        trackBottomOffset = Math.max(
          0,
          navRect.bottom - circleRect.bottom + circleRect.height / 2,
        );
      }
    };

    // Use requestAnimationFrame to ensure the DOM has updated and rendered
    const frameId = requestAnimationFrame(updateOffset);

    window.addEventListener('resize', updateOffset);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateOffset);
    };
  });
</script>

<section id={sectionId} class="relative bg-base-100 pb-24 pt-24 md:pb-32 md:pt-32">
  <div class="container mx-auto px-6">
    <!-- Main Heading -->
    <CmsRichTextSvelte
      value={heading.replace(/\n/g, '<br class="md:hidden" />')}
      tag="h2"
      className="mb-10 text-center text-4xl leading-tight font-medium tracking-tight text-base-content md:mb-16 md:text-5xl lg:mb-7 max-w-5xl mx-auto"
    />

    <!-- Two Column Layout -->
    {#if processes.length > 0}
      <div class="flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch">
        <!-- Left: Vertical Stepper -->
        <div class="w-full lg:w-[336px] shrink-0">
          <nav
            bind:this={navElement}
            onmouseenter={pauseAutoplay}
            onmouseleave={resumeAutoplay}
            class="relative flex flex-row lg:flex-col justify-between gap-4 lg:gap-0 lg:h-full"
            aria-label="Process steps"
          >
            <!-- Timeline track (responsive: horizontal on mobile/tablet, vertical on desktop) -->
            <div
              class="absolute bg-base-300 pointer-events-none rounded-full
                   top-[18px] left-[18px] right-[18px] h-[2px]
                   lg:left-[1.125rem] lg:top-[22px] lg:bottom-[var(--track-bottom,22px)] lg:right-auto lg:w-[2px] lg:h-auto"
              style="--track-bottom: {trackBottomOffset}px;"
            >
              <!-- Timeline progress fill (Mobile: horizontal) -->
              <div
                class="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500 ease-out lg:hidden"
                style="width: {processes.length > 1
                  ? (activeIndex / (processes.length - 1)) * 100
                  : 100}%"
              ></div>
              <!-- Timeline progress fill (Desktop: vertical) -->
              <div
                class="absolute top-0 left-0 w-full bg-primary rounded-full transition-all duration-500 ease-out hidden lg:block"
                style="height: {processes.length > 1
                  ? (activeIndex / (processes.length - 1)) * 100
                  : 100}%"
              ></div>
            </div>

            {#each processes as process, i}
              <div
                onclick={() => (activeIndex = i)}
                onkeydown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    activeIndex = i;
                  }
                }}
                role="button"
                tabindex="0"
                class="group relative flex items-center lg:items-start gap-0 lg:gap-5 text-left w-auto lg:w-full cursor-pointer focus:outline-none"
                aria-current={activeIndex === i ? 'step' : undefined}
              >
                <!-- Number circle (outside the card) -->
                {#if i === processes.length - 1}
                  <div
                    bind:this={lastCircle}
                    class="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 lg:mt-1
                    {activeIndex === i
                      ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
                      : 'bg-base-100 text-base-content/50 border border-base-300 group-hover:border-primary/30'}"
                  >
                    {process.id}
                  </div>
                {:else}
                  <div
                    class="relative z-10 shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 lg:mt-1
                    {activeIndex === i
                      ? 'bg-primary text-primary-content shadow-md shadow-primary/25'
                      : 'bg-base-100 text-base-content/50 border border-base-300 group-hover:border-primary/30'}"
                  >
                    {process.id}
                  </div>
                {/if}

                <!-- Title Card (hidden on mobile/tablet, max-width of 280px on desktop to force 2 lines) -->
                <div
                  class="hidden lg:block relative grow max-w-[280px] py-3.5 px-5 rounded-xl transition-all duration-300 border overflow-hidden
                  {activeIndex === i
                    ? 'bg-primary/10 border-primary text-primary font-semibold shadow-sm'
                    : 'bg-base-100 border-base-content/10 text-base-content/75 hover:bg-base-200/50 hover:border-base-content/20'}"
                >
                  <CmsRichTextSvelte
                    value={process.title}
                    className="text-[0.94rem] leading-snug"
                  />

                  <!-- Autoplay progress bar on active step -->
                  {#if activeIndex === i}
                    <div
                      class="absolute bottom-0 left-0 right-0 overflow-hidden rounded-b-xl bg-transparent"
                      style="height: 2px;"
                    >
                      <div
                        style="
                        height: 100%;
                        background-color: var(--color-primary);
                        opacity: 0.4;
                        width: {progressWidth}%;
                      "
                      ></div>
                    </div>
                  {/if}
                </div>
              </div>
            {/each}
          </nav>
        </div>

        <!-- Right: Content Panel -->
        <div
          onmouseenter={pauseAutoplay}
          onmouseleave={resumeAutoplay}
          role="region"
          aria-label="Active process details"
          class="w-full lg:flex-1 bg-base-200/40 rounded-3xl p-6 md:p-8 lg:p-10 border border-base-content/5 shadow-sm"
        >
          {#key activeIndex}
            <div in:fade={{ duration: 350 }}>
              <!-- Header with badge -->
              <div class="flex items-center gap-3 mb-2">
                <span
                  class="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold"
                >
                  {processes[activeIndex].id}
                </span>
                <CmsRichTextSvelte
                  value={processes[activeIndex].title}
                  tag="h3"
                  className="text-xl md:text-2xl xl:text-[1.7rem] font-medium text-base-content leading-snug"
                />
              </div>

              <!-- Description -->
              <CmsRichTextSvelte
                value={processes[activeIndex].description}
                tag="p"
                className="text-base text-base-content font-light mb-6 lg:mb-8 text-center max-w-xl mx-auto leading-relaxed"
              />

              <!-- Process Image (Mobile only: positioned between description and details) -->
              <div
                class="w-full rounded-2xl overflow-hidden aspect-3/4 bg-base-300/30 mb-6 md:hidden"
              >
                {#key activeIndex}
                  <img
                    in:fade={{ duration: 500, delay: 100 }}
                    src={processes[activeIndex].image}
                    alt={processes[activeIndex].title}
                    class="h-full w-full object-cover object-center"
                  />
                {/key}
              </div>

              <!-- Details + Image Grid -->
              <div class="flex flex-col md:flex-row gap-6 lg:gap-8">
                <!-- Details -->
                <div class="flex-1 min-w-0">
                  <ul class="flex flex-col gap-4">
                    {#each processes[activeIndex].details as detail}
                      <li class="flex flex-col gap-0.5">
                        <CmsRichTextSvelte
                          value={detail.name}
                          tag="strong"
                          className="text-base font-semibold tracking-wide text-base-content/90"
                        />
                        <CmsRichTextSvelte
                          value={detail.desc}
                          className="text-base font-light leading-relaxed text-base-content"
                        />
                      </li>
                    {/each}
                  </ul>
                </div>

                <!-- Process Image (Desktop only: positioned side-by-side with details) -->
                <div
                  class="w-full md:w-[42%] shrink-0 rounded-2xl overflow-hidden aspect-3/4 bg-base-300/30 hidden md:block"
                >
                  {#key activeIndex}
                    <img
                      in:fade={{ duration: 500, delay: 100 }}
                      src={processes[activeIndex].image}
                      alt={processes[activeIndex].title}
                      class="h-full w-full object-cover object-center"
                    />
                  {/key}
                </div>
              </div>
            </div>
          {/key}
        </div>
      </div>
    {/if}
  </div>
</section>
