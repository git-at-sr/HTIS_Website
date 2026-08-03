<script lang="ts">
  import { slide } from 'svelte/transition';
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface PillarCard {
    iconName: string;
    title: string;
    description: string;
    content: string;
    column: 'left' | 'center' | 'right';
  }

  let { centerImageSrc, cards }: { centerImageSrc: string; cards: PillarCard[] } =
    $props();

  const pillars = $derived(cards);

  let activeIndex = $state(0);
  let hoveredIndex = $state<number | null>(null);
  const AUTOPLAY_INTERVAL = 7000;
  const isAutoplayPaused = $derived(hoveredIndex === activeIndex);

  // The order in which pillars should autoplay to create a U-shape loop.
  const autoplaySequence = $derived(
    [0, 1, 2, 3, 6, 5, 4].filter((index) => index < pillars.length),
  );

  const advanceAutoplay = (completedIndex: number) => {
    // Ignore stale animation events from a card that is no longer active.
    if (completedIndex !== activeIndex || isAutoplayPaused) return;

    const currentSeqIndex = autoplaySequence.indexOf(completedIndex);
    const nextSeqIndex = (currentSeqIndex + 1) % autoplaySequence.length;
    activeIndex = autoplaySequence[nextSeqIndex];
  };

  const leftPillars = $derived(pillars.filter((p) => p.column === 'left'));
  const centerPillars = $derived(pillars.filter((p) => p.column === 'center'));
  const rightPillars = $derived(pillars.filter((p) => p.column === 'right'));

  const getIconPosition = (index: number) => {
    const positions = [
      'top: 15%; left: 15%;',
      'top: 45%; left: 0%;',
      'top: 75%; left: 15%;',
      'top: 85%; left: 50%; transform: translateX(-50%);',
      'top: 15%; right: 15%;',
      'top: 45%; right: 0%;',
      'top: 75%; right: 15%;',
    ];
    return positions[index] ?? 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
  };
</script>

{#snippet pillarCard(pillar: (typeof pillars)[0])}
  {@const globalIndex = pillars.indexOf(pillar)}
  <div class="relative w-full pt-4 lg:pt-0">
    <!-- Overlapping icon button on mobile view -->
    <div class="pointer-events-none absolute -top-1 left-6 z-20 lg:hidden">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full border shadow-md transition-all duration-300 {activeIndex ===
        globalIndex
          ? 'border-primary bg-base-100 text-primary'
          : 'border-base-content/15 bg-base-100 text-base-content/60'}"
      >
        <CmsIconSvelte name={pillar.iconName} class="h-5 w-5" strokeWidth={2.5} />
      </div>
    </div>

    <button
      class="relative flex w-full flex-col items-start gap-3 cursor-pointer overflow-hidden rounded-2xl border pt-8 pb-6 px-6 lg:p-6 text-left shadow-sm backdrop-blur-md transition-all duration-300 {activeIndex ===
      globalIndex
        ? 'border-primary/30 bg-primary/5 scale-[1.02] shadow-md'
        : 'border-base-content/20 bg-base-content/2 hover:bg-base-300/60'}"
      onclick={() => (activeIndex = globalIndex)}
      onmouseenter={() => (hoveredIndex = globalIndex)}
      onmouseleave={() => {
        if (hoveredIndex === globalIndex) hoveredIndex = null;
      }}
    >
      <div class="flex-1 w-full overflow-hidden">
        <CmsRichTextSvelte
          value={pillar.title}
          tag="h3"
          className="mb-2 text-2xl font-medium transition-colors {activeIndex === globalIndex
            ? 'text-primary'
            : 'text-base-content/90'}"
        />
        <CmsRichTextSvelte
          value={pillar.description}
          tag="p"
          className="text-base font-medium transition-colors {activeIndex === globalIndex
            ? 'text-base-content/90'
            : 'text-base-content/70'}"
        />
        {#if activeIndex === globalIndex}
          <div transition:slide={{ duration: 300 }}>
            <div class="mt-4 border-t border-base-content/10 pt-4">
              <CmsRichTextSvelte
                value={pillar.content}
                tag="p"
                className="text-sm leading-relaxed text-base-content"
              />
            </div>
          </div>
        {/if}

        {#if activeIndex === globalIndex}
          <div
            class="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-2xl bg-transparent"
          >
            <div
              class="h-full animate-progress bg-primary/40"
              style="--duration: {AUTOPLAY_INTERVAL}ms; animation-play-state: {isAutoplayPaused
                ? 'paused'
                : 'running'};"
              onanimationend={() => advanceAutoplay(globalIndex)}
            ></div>
          </div>
        {/if}
      </div>
    </button>
  </div>
{/snippet}

<div class="lg:min-h-[770px]">
  <!-- Mobile-only image (right after the title, before cards start) -->
  <div class="relative my-8 flex w-full items-center justify-center lg:hidden">
    <img
      src={centerImageSrc}
      alt="Strategic Pillars"
      class="pointer-events-none max-h-[400px] w-full scale-110 object-contain drop-shadow-2xl"
      style="-webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%); mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%); filter: var(--filter-invert-dark)"
    />
  </div>

  <div
    class="flex flex-col items-center justify-between gap-8 lg:flex-row lg:items-stretch"
  >
    <div class="flex w-full flex-col justify-center gap-6 lg:w-1/3">
      {#each leftPillars as pillar}
        {@render pillarCard(pillar)}
      {/each}
    </div>

    <div class="flex w-full flex-col items-center justify-center gap-8 lg:w-1/3">
      <!-- Desktop-only image container: hidden on mobile -->
      <div class="relative hidden w-full items-center justify-center lg:flex">
        <img
          src={centerImageSrc}
          alt="Strategic Pillars"
          class="pointer-events-none max-h-[600px] w-full scale-125 object-contain drop-shadow-2xl lg:scale-150"
          style="-webkit-mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%); mask-image: radial-gradient(ellipse at 50% 50%, black 30%, transparent 70%); filter: var(--filter-invert-dark)"
        />
        {#each pillars as pillar, i}
          <button
            class="absolute z-10 flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border shadow-sm transition-all duration-300 md:h-14 md:w-14 {activeIndex ===
            i
              ? 'border-primary bg-base-100 text-primary scale-110 shadow-lg shadow-primary/25'
              : 'border-base-content/15 bg-base-100 text-base-content/60 hover:scale-105 hover:bg-base-200 hover:text-base-content/90'}"
            style={getIconPosition(i)}
            onclick={() => (activeIndex = i)}
            aria-label={pillar.title}
          >
            {#if activeIndex === i}
              <div class="pointer-events-none absolute inset-0 bg-primary/15"></div>
            {/if}
            <CmsIconSvelte
              name={pillar.iconName}
              class="relative z-10 h-5 w-5 md:h-6 md:w-6"
              strokeWidth={2.5}
            />
          </button>
        {/each}
      </div>
      {#each centerPillars as pillar}
        {@render pillarCard(pillar)}
      {/each}
    </div>

    <div class="flex w-full flex-col justify-center gap-6 lg:w-1/3">
      {#each rightPillars as pillar}
        {@render pillarCard(pillar)}
      {/each}
    </div>
  </div>
</div>
