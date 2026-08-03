<script lang="ts">
  import CmsRichTextSvelte from './CmsRichTextSvelte.svelte';
  import type { Milestone } from '~/data/cms';

  interface Props {
    sectionId?: string;
    /** List of chronological milestones to display in the journey */
    milestones: Milestone[];
    title?: string;
    subtitle?: string;
  }

  let {
    sectionId,
    milestones,
    title = 'Our [Journey]{color=primary}',
    subtitle = 'A timeline of innovation, milestones, and achievements that shaped our path forward.',
  }: Props = $props();

  // -- Constants & Derived --
  const AUTOPLAY_INTERVAL_MS = 4000;
  let N = $derived(milestones.length);
  // Calculate exact angle and radius multiplier to form a perfect closed circle
  let thetaVal = $derived(360 / N);
  let rMultiplier = $derived(1 / (2 * Math.tan(Math.PI / N)));

  // -- State --
  let activeIndex = $state(0);
  let rotationIndex = $state(0);
  let isAutoplayPaused = $state(false);
  let timelineContainer: HTMLElement | undefined = $state();

  // -- Effects --
  // Automatically advance to the next slide.
  $effect(() => {
    activeIndex;
    if (isAutoplayPaused || milestones.length < 2) return;

    const intervalId = setInterval(nextSlide, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(intervalId);
  });

  // -- Handlers --
  /** Moves to the next slide, wrapping around to the start */
  function nextSlide() {
    goToSlide((activeIndex + 1) % milestones.length);
  }

  /** Navigates to a specific slide and ensures the timeline scrolls to it */
  function goToSlide(index: number) {
    // Calculate the shortest path on the circle to avoid backward spinning
    let currentMod = ((rotationIndex % N) + N) % N;
    let diff = index - currentMod;

    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;

    rotationIndex += diff;
    activeIndex = index;
    scrollTimelineToActive(index);
  }

  /** Smoothly scrolls the horizontal timeline so the active node is centered */
  function scrollTimelineToActive(index: number) {
    if (!timelineContainer) return;

    // Target specific timeline nodes by class to avoid selecting the 3D film frames
    const nodes = timelineContainer.querySelectorAll<HTMLElement>('.timeline-node');
    const targetNode = nodes[index];
    if (!targetNode) return;

    const nodeRect = targetNode.getBoundingClientRect();
    const containerRect = timelineContainer.getBoundingClientRect();

    // Calculate exact scroll position to center the target node
    const scrollLeft =
      timelineContainer.scrollLeft +
      (nodeRect.left - containerRect.left) -
      (containerRect.width - nodeRect.width) / 2;

    timelineContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }
</script>

<section
  class="relative w-full overflow-hidden bg-base-100 px-4 py-12 md:py-16 transition-colors duration-500"
  id={sectionId}
>
  <div class="relative z-10 mx-auto flex max-w-6xl flex-col items-center">
    <!-- Title Area -->
    <div class="mb-8 text-center md:mb-14">
      <h2 class="text-5xl font-extrabold tracking-tight text-base-content md:text-7xl">
        <CmsRichTextSvelte value={title} />
      </h2>
      <p
        class="mx-auto mt-4 max-w-2xl text-base font-medium text-base-content/80 md:text-xl"
      >
        <CmsRichTextSvelte value={subtitle} />
      </p>
    </div>

    <!-- 3D Film Strip Carousel -->
    <div
      class="carousel-container relative mt-4 md:mt-2 w-full"
      style="--theta: {thetaVal}deg; --r-mult: {rMultiplier};"
      role="group"
      aria-label="Journey filmstrip carousel"
      onmouseenter={() => (isAutoplayPaused = true)}
      onmouseleave={() => (isAutoplayPaused = false)}
    >
      <!-- Glow behind the center active item -->
      <div class="glow-effect"></div>

      <div
        class="carousel-scene"
        style="transform: translateZ(calc(var(--r) * -1)) rotateY(calc({rotationIndex} * var(--theta) * -1));"
      >
        {#each milestones as milestone, index}
          {@const rawDist = Math.abs(activeIndex - index)}
          {@const distance = rawDist > N / 2 ? N - rawDist : rawDist}
          <!-- Fade items slightly in the back of the circle -->
          {@const opacity = 1 - (distance / (N / 2)) * 0.7}

          <button
            class="film-frame {activeIndex === index ? 'active' : ''}"
            style="
              --index: {index}; 
              opacity: {opacity};
              pointer-events: {distance <= N / 3 ? 'auto' : 'none'};
            "
            onclick={() => goToSlide(index)}
            aria-label={`View milestone for ${milestone.year}`}
            aria-current={activeIndex === index ? 'true' : undefined}
          >
            <!-- Top Perforations -->
            <div class="film-border top"></div>

            <!-- Image -->
            <div class="film-content">
              <img
                src={milestone.imageSrc}
                alt={milestone.title}
                class="film-image"
                loading={index < 3 ? 'eager' : 'lazy'}
              />
              <div class="film-overlay"></div>
            </div>

            <!-- Bottom Perforations -->
            <div class="film-border bottom"></div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Active Milestone Info -->
    <div
      class="mt-8 flex h-[140px] flex-col items-center justify-end text-center md:mt-4 md:h-[110px]"
    >
      {#key activeIndex}
        <div class="animate-fade-in-up flex flex-col items-center px-4">
          <h2 class="text-4xl font-extrabold text-primary md:text-5xl">
            <CmsRichTextSvelte value={milestones[activeIndex].year} />
          </h2>
          <h3 class="mt-2 text-xl font-bold text-base-content md:mt-1 md:text-2xl">
            <CmsRichTextSvelte value={milestones[activeIndex].title} />
          </h3>
          <p
            class="mx-auto mt-3 max-w-xl text-sm font-medium leading-relaxed text-base-content/80 md:mt-2 md:text-base"
          >
            <CmsRichTextSvelte value={milestones[activeIndex].description} />
          </p>
        </div>
      {/key}

      <!-- Vertical Connecting Line to Timeline -->
      <div class="mt-6 h-10 w-[2px] rounded-full bg-primary/40 md:mt-4 md:h-5"></div>
    </div>

    <!-- Timeline Navigation -->
    <div
      class="relative mt-2 md:mt-0 w-full max-w-4xl px-2 md:px-4"
      role="group"
      aria-label="Journey timeline navigation"
      onmouseenter={() => (isAutoplayPaused = true)}
      onmouseleave={() => (isAutoplayPaused = false)}
    >
      <div class="no-scrollbar overflow-x-auto pb-0 pt-0" bind:this={timelineContainer}>
        <div class="relative flex w-max min-w-full items-start justify-between">
          <!-- Horizontal Connecting Line -->
          <div
            class="absolute left-0 right-0 top-5 z-0 h-[2px] -translate-y-1/2 bg-primary/20"
          ></div>

          {#each milestones as milestone, index}
            <button
              class="timeline-node group relative z-10 flex w-20 shrink-0 cursor-pointer flex-col items-center md:w-24"
              type="button"
              aria-current={activeIndex === index ? 'step' : undefined}
              onclick={() => goToSlide(index)}
            >
              <!-- Node Dot -->
              <div class="relative flex h-10 w-10 items-center justify-center">
                {#if activeIndex === index}
                  <div
                    class="h-4 w-4 rounded-full border-[3px] border-primary bg-base-100 shadow-[0_0_12px_rgba(42,69,61,0.4)]"
                  ></div>
                {:else}
                  <div
                    class="h-2.5 w-2.5 rounded-full bg-primary/20 transition-colors group-hover:bg-primary/50"
                  ></div>
                {/if}
              </div>

              <!-- Node Text -->
              <div
                class="mt-2 text-center transition-all duration-300 {activeIndex === index
                  ? 'opacity-100'
                  : 'opacity-40 group-hover:opacity-70'}"
              >
                <div
                  class="text-sm font-extrabold text-base-content {activeIndex === index
                    ? 'scale-110 transform'
                    : ''} transition-transform"
                >
                  <CmsRichTextSvelte value={milestone.year} />
                </div>
                <div
                  class="mt-0.5 hidden text-[10px] font-bold text-base-content/70 md:line-clamp-2 md:text-xs"
                >
                  <CmsRichTextSvelte value={milestone.title} />
                </div>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
