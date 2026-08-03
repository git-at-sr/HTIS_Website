<script lang="ts">
  import {
    ChevronLeft,
    ChevronRight,
    ArrowUpRight,
    FileText,
    TrendingUp,
  } from '@lucide/svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';
  import type { SoftwareCaseStudyItem } from '~/data/cms';

  const { sectionId, heading = 'Strategic Case Studies & Technical Impact', items = [] } = $props<{
    sectionId?: string;
    heading?: string;
    items?: SoftwareCaseStudyItem[];
  }>();

  let scrollContainer = $state<HTMLDivElement | null>(null);

  function scroll(direction: 'left' | 'right') {
    if (!scrollContainer) return;

    const container = scrollContainer;
    const cards = Array.from(container.children) as HTMLElement[];
    if (cards.length === 0) return;

    const style = window.getComputedStyle(container);
    const paddingLeft = parseFloat(style.paddingLeft) || 0;

    // Calculate perfect snap position for each card using bounding rects (immune to offsetParent changes)
    const containerRect = container.getBoundingClientRect();
    const snapPositions = cards.map(
      (card) =>
        card.getBoundingClientRect().left -
        containerRect.left +
        container.scrollLeft -
        paddingLeft,
    );

    const currentScroll = container.scrollLeft;

    // Find the closest card index based on current scroll position
    let closestIndex = 0;
    let minDifference = Infinity;

    snapPositions.forEach((pos, index) => {
      const diff = Math.abs(pos - currentScroll);
      if (diff < minDifference) {
        minDifference = diff;
        closestIndex = index;
      }
    });

    // Handle edge cases near boundaries where fractional pixels or max scroll bounds apply
    const isAtEnd = currentScroll + container.clientWidth >= container.scrollWidth - 15;
    const isAtStart = currentScroll <= 15;

    let currentIndex = closestIndex;
    if (isAtEnd) {
      currentIndex = cards.length - 1;
    } else if (isAtStart) {
      currentIndex = 0;
    }

    const targetIndex =
      direction === 'left'
        ? Math.max(currentIndex - 1, 0)
        : Math.min(currentIndex + 1, cards.length - 1);

    container.scrollTo({
      left: snapPositions[targetIndex],
      behavior: 'smooth',
    });
  }
</script>

<section id={sectionId} class="relative overflow-hidden bg-base-200/50 py-24">
  <div class="container mx-auto px-6">
    <div
      class="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
    >
      <div class="max-w-3xl text-left">
        <CmsRichTextSvelte
          value={heading}
          tag="h2"
          className="text-4xl font-extrabold tracking-tight text-base-content md:text-5xl"
        />
      </div>

      <!-- Horizontal Controls -->
      <div class="flex gap-4">
        <button
          onclick={() => scroll('left')}
          aria-label="Previous Case Study"
          class="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-content hover:shadow-lg hover:shadow-primary/20 active:scale-95"
        >
          <ChevronLeft class="h-5 w-5" strokeWidth={2.5} />
        </button>
        <button
          onclick={() => scroll('right')}
          aria-label="Next Case Study"
          class="flex h-12 w-12 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary shadow-sm transition-all duration-300 hover:border-primary hover:bg-primary hover:text-primary-content hover:shadow-lg hover:shadow-primary/20 active:scale-95"
        >
          <ChevronRight class="h-5 w-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>

  <!-- Horizontal scrollable container -->
  <div
    bind:this={scrollContainer}
    class="case-studies-scroll-container no-scrollbar flex snap-x snap-mandatory gap-8 overflow-x-auto pb-8 scroll-smooth"
  >
    {#each items as study}
      {@const ctaUrl = study.ctaUrl ?? study.url}
      <div
        class="relative flex w-[90vw] flex-none snap-start flex-col items-center gap-8 overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 p-8 shadow-lg transition-all duration-300 hover:border-primary/20 hover:shadow-xl md:w-[780px] md:flex-row md:p-12"
      >
        {#if ctaUrl}
          <a
            href={ctaUrl}
            aria-label={`Explore ${study.title} Case Study`}
            class="absolute top-6 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-content md:top-8 md:right-8"
          >
            <ArrowUpRight class="h-5 w-5" strokeWidth={2.5} />
          </a>
        {/if}

        <div class="z-10 flex w-full flex-col items-start gap-6 text-left md:w-[55%]">
          <CmsRichTextSvelte
            value={study.title}
            tag="h3"
            className="font-sans text-xl leading-tight font-medium tracking-tight text-base-content uppercase md:text-2xl"
          />

          <div class="h-1 w-12 rounded-full bg-primary"></div>

          <div class="flex flex-col gap-2">
            <span
              class="font-mono flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase"
            >
              <FileText class="h-4 w-4" strokeWidth={2} />
              The Solution:
            </span>
            <CmsRichTextSvelte
              value={study.solution}
              tag="p"
              className="text-base leading-snug font-medium text-base-content md:text-lg"
            />
          </div>

          <div class="flex flex-col gap-2">
            <span
              class="font-mono flex items-center gap-2 text-xs font-black tracking-widest text-primary uppercase"
            >
              <TrendingUp class="h-4 w-4" strokeWidth={2} />
              The Impact:
            </span>
            <CmsRichTextSvelte
              value={study.impact}
              tag="p"
              className="text-justify text-sm leading-relaxed font-medium text-base-content/80 md:text-base"
            />
          </div>
        </div>

        <div
          class="relative flex w-full items-center justify-center overflow-hidden md:w-[45%]"
        >
          <div class="absolute z-0 h-48 w-48 rounded-full bg-primary/5 blur-2xl"></div>

          <img
            src={study.image}
            alt={study.title}
            class="z-10 h-[280px] w-auto object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105 md:h-[380px]"
            loading="lazy"
          />
        </div>
      </div>
    {/each}
  </div>
</section>
