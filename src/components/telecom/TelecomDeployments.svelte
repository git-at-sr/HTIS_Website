<script lang="ts">
  import { ArrowUpRight, ArrowRight } from '@lucide/svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface Deployment {
    title: string;
    badges: string[];
    description: string;
    href?: string;
  }

  let {
    sectionId,
    heading = 'Proven Network Deployments',
    description = '',
    href,
    deployments = [],
  }: {
    sectionId?: string;
    heading?: string;
    description?: string;
    href?: string;
    deployments?: Deployment[];
  } = $props();

  let count = $derived(deployments.length);

  /** Currently centered card index */
  let activeIndex = $state(0);

  /** Whether transition is animating (prevent rapid pagination clicks) */
  let isAnimating = $state(false);

  /** Pause autoplay while the pointer is over the cards */
  let isAutoplayPaused = $state(false);

  /** Card dimensions */
  const AUTOPLAY_INTERVAL = 3000;
  const CARD_W = 280; // px base card width
  const GAP = 24; // px gap between cards
  const SCALE_ACTIVE = 1.08;
  const SCALE_INACTIVE = 0.92;
  const SWIPE_THRESHOLD = 48;
  const SWIPE_AXIS_RATIO = 1.25;

  let swipeStartX: number | null = null;
  let swipeStartY: number | null = null;

  /** Modular wrap helper: always returns 0..count-1 */
  function mod(n: number, m: number): number {
    return ((n % m) + m) % m;
  }

  /**
   * Build an ordered array of indices centred on `activeIndex`.
   * For 5 cards we want positions: -2, -1, 0, +1, +2
   * For even counts the logic still works.
   */
  function getVisibleSlots(): { index: number; offset: number }[] {
    const half = Math.floor(count / 2);
    const slots: { index: number; offset: number }[] = [];
    for (let pos = -half; pos <= half; pos++) {
      // For even counts, skip the far-left duplicate
      if (count % 2 === 0 && pos === -half) continue;
      slots.push({
        index: mod(activeIndex + pos, count),
        offset: pos,
      });
    }
    return slots;
  }

  let slots = $derived(getVisibleSlots());

  function goTo(index: number) {
    if (count === 0 || isAnimating || index === activeIndex) return;
    isAnimating = true;
    activeIndex = index;
    setTimeout(() => (isAnimating = false), 500);
  }

  function next() {
    goTo(mod(activeIndex + 1, count));
  }

  function prev() {
    goTo(mod(activeIndex - 1, count));
  }

  function handleSwipeStart(event: PointerEvent) {
    if (event.pointerType !== 'touch') return;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
  }

  function handleSwipeEnd(event: PointerEvent) {
    if (event.pointerType !== 'touch' || swipeStartX === null || swipeStartY === null)
      return;

    const deltaX = event.clientX - swipeStartX;
    const deltaY = event.clientY - swipeStartY;
    swipeStartX = null;
    swipeStartY = null;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_AXIS_RATIO
    ) {
      return;
    }

    if (deltaX < 0) next();
    else prev();
  }

  function cancelSwipe() {
    swipeStartX = null;
    swipeStartY = null;
  }

  /**
   * Advance deployments in a continuous loop. Reading `activeIndex` resets the
   * full delay after autoplay or any manual card/dot/swipe navigation.
   */
  $effect(() => {
    activeIndex;

    if (count <= 1 || isAutoplayPaused) return;

    const autoplayTimeout = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => clearTimeout(autoplayTimeout);
  });
</script>

<section id={sectionId} class="relative overflow-hidden bg-base-100 pt-0 pb-24 md:py-24">
  <div class="container mx-auto px-6">
    <div class="mb-10">
      <div class="flex items-center justify-between gap-4 {description ? 'mb-6' : ''}">
        <CmsRichTextSvelte
          value={heading}
          tag="h2"
          className="text-4xl font-bold tracking-tight text-base-content md:text-5xl"
        />

        {#if href}
          <div class="flex shrink-0 items-center pl-4 md:pl-0">
            <a
              {href}
              class="group flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary shadow-sm transition-all hover:border-primary/30 hover:bg-primary/20 active:scale-95"
              aria-label="View all network deployments"
            >
              <ArrowRight
                class="h-6 w-6 transition-transform group-hover:translate-x-0.5"
              />
            </a>
          </div>
        {/if}
      </div>

      {#if description}
        <CmsRichTextSvelte
          value={description}
          tag="p"
          className="text-lg text-base-content/70 md:text-xl max-w-3xl"
        />
      {/if}
    </div>

    <!-- Carousel track -->
    {#if count > 0}
      <div
        class="carousel-viewport relative touch-pan-y"
        style="height: {CARD_W * 1.4}px;"
        role="region"
        aria-label="Network deployments carousel"
        onpointerdown={handleSwipeStart}
        onpointerup={handleSwipeEnd}
        onpointercancel={cancelSwipe}
        onmouseenter={() => (isAutoplayPaused = true)}
        onmouseleave={() => (isAutoplayPaused = false)}
      >
        {#each slots as slot (slot.index)}
          {@const isActive = slot.offset === 0}
          {@const scale = isActive ? SCALE_ACTIVE : SCALE_INACTIVE}
          {@const translateX = slot.offset * (CARD_W + GAP)}
          {@const zIndex = count - Math.abs(slot.offset)}
          {@const opacity = Math.abs(slot.offset) <= 1 ? 1 : 0.5}
          {@const project = deployments[slot.index]}

          <div
            class="carousel-card absolute left-1/2 top-1/2"
            style="
            width: {CARD_W}px;
            transform: translate(-50%, -50%) translateX({translateX}px) scale({scale});
            z-index: {zIndex};
            opacity: {opacity};
          "
          >
            <button
              type="button"
              onclick={() => goTo(slot.index)}
              class="flex w-full flex-col gap-5 rounded-2xl border p-6 pr-20 text-left cursor-pointer
              {isActive
                ? 'border-primary/30 bg-primary/5 shadow-xl shadow-primary/10 h-[340px]'
                : 'border-base-content/10 bg-base-100/50 hover:border-base-content/20 h-[300px]'}"
              aria-label="Select {project.title} deployment"
            >
              <CmsRichTextSvelte
                value={project.title}
                tag="h3"
                className="text-xl font-medium tracking-tight md:text-2xl"
              />
              <CmsRichTextSvelte
                value={project.description}
                tag="p"
                className="max-w-[200px] flex-1 text-base leading-relaxed text-base-content/70"
              />
              <div class="mt-auto flex max-w-[220px] flex-wrap gap-2">
                {#each project.badges as badge}
                  <span
                    class="px-2.5 py-1 text-[10px] font-semibold tracking-tight text-secondary bg-secondary/10 border border-secondary/20 dark:text-base-content dark:bg-primary/15 dark:border-primary/25 rounded-md uppercase transition-colors hover:bg-secondary/20 dark:hover:bg-primary/25"
                  >
                    <CmsRichTextSvelte value={badge} />
                  </span>
                {/each}
              </div>
            </button>
            <a
              href={project.href ?? href ?? '#'}
              aria-label="View {project.title} deployment"
              class="group absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary transition-all hover:bg-primary hover:text-primary-content hover:shadow-lg hover:shadow-primary/20 active:scale-95"
            >
              <ArrowUpRight
                class="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        {/each}
      </div>

      <!-- Pagination dots -->
      <div class="mt-8 flex items-center justify-center gap-1">
        {#each deployments as _, i}
          <button
            onclick={() => goTo(i)}
            class="flex items-center justify-center p-2 transition-all duration-300"
            aria-label="Go to deployment {i + 1}"
          >
            <span
              class="block rounded-full transition-all duration-300 {activeIndex === i
                ? 'h-2.5 w-2.5 bg-primary'
                : 'h-1.5 w-1.5 bg-primary/25 hover:bg-primary/50'}"
            ></span>
          </button>
        {/each}
      </div>
    {/if}
  </div>
</section>
