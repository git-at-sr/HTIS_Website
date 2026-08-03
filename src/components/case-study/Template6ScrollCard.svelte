<script lang="ts">
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface ScrollCardItem {
    iconName?: string;
    title: string;
    text?: string;
  }

  let {
    items = [],
    ariaLabel = 'Scrollable cards',
    eyebrow,
    title,
    description,
    eyebrowClass = 'text-primary',
    linkClassName,
  }: {
    items?: ScrollCardItem[];
    ariaLabel?: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    eyebrowClass?: string;
    linkClassName?: string;
  } = $props();

  const MIN_CARD_W = 240;
  const MAX_CARD_W = 320;
  const MIN_CARD_H = 300;
  const MAX_CARD_H = 340;
  const MIN_CARD_SCALE = 0.92;
  const MAX_CARD_SCALE = 1.08;
  const GAP = 24;
  const MIN_STICKY_TOP = 96;
  const DESKTOP_BREAKPOINT = 1024;

  let sectionEl = $state<HTMLElement>();
  let stickyEl = $state<HTMLElement>();
  let stageEl = $state<HTMLElement>();
  let viewportWidth = $state(0);
  let stickyHeight = $state(360);
  let stickyTop = $state(MIN_STICKY_TOP);
  let progress = $state(0);
  let isMeasured = $state(false);

  let count = $derived(items.length);
  let cardWidth = $derived(
    Math.round(Math.min(MAX_CARD_W, Math.max(MIN_CARD_W, viewportWidth * 0.72))),
  );
  let travel = $derived(Math.max(0, (count - 1) * (cardWidth + GAP)));
  let sectionHeight = $derived(isMeasured ? `${stickyHeight + travel}px` : 'auto');
  let trackX = $derived(
    isMeasured ? viewportWidth / 2 - cardWidth / 2 - progress * travel : 0,
  );
  let currentCardPosition = $derived(progress * Math.max(0, count - 1));
  let activeIndex = $derived(count <= 1 ? 0 : Math.round(progress * (count - 1)));

  function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
  }

  function lerp(start: number, end: number, amount: number) {
    return start + (end - start) * amount;
  }

  function smoothstep(value: number) {
    return value * value * (3 - 2 * value);
  }

  function getCardFocus(cardIndex: number) {
    return smoothstep(clamp(1 - Math.abs(currentCardPosition - cardIndex), 0, 1));
  }

  function measure() {
    viewportWidth = stageEl?.clientWidth ?? 0;
    stickyHeight = stickyEl?.offsetHeight ?? stickyHeight;
    stickyTop =
      window.innerWidth >= DESKTOP_BREAKPOINT
        ? Math.max(MIN_STICKY_TOP, Math.round((window.innerHeight - stickyHeight) / 2))
        : MIN_STICKY_TOP;
    isMeasured = Boolean(stageEl && stickyEl);
  }

  function updateProgress() {
    if (!sectionEl) return;

    const rect = sectionEl.getBoundingClientRect();
    progress = travel > 0 ? clamp((stickyTop - rect.top) / travel, 0, 1) : 0;
  }

  $effect(() => {
    measure();
    updateProgress();

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', updateProgress, { passive: true });

    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', updateProgress);
    };
  });
</script>

{#if count > 0}
  <div
    bind:this={sectionEl}
    class="t6-scroll-section relative -mx-6 md:mx-0"
    style:height={sectionHeight}
    role="region"
    aria-label={ariaLabel}
  >
    <div
      bind:this={stickyEl}
      class="{isMeasured ? 'sticky' : 'relative'} overflow-hidden pt-2 pb-8"
      style:top={isMeasured ? `${stickyTop}px` : undefined}
    >
      <div
        class="mx-auto mb-6 flex max-w-4xl flex-col items-center gap-4 px-6 text-center"
      >
        {#if eyebrow}
          <CmsRichTextSvelte
            tag="div"
            value={eyebrow}
            className={`text-xs font-bold tracking-widest uppercase md:text-sm ${eyebrowClass}`}
            {linkClassName}
          />
        {/if}

        {#if title}
          <CmsRichTextSvelte
            tag="h2"
            value={title}
            className="max-w-3xl text-3xl font-extrabold tracking-tight text-base-content md:text-4xl"
            {linkClassName}
          />
        {/if}

        {#if description}
          <CmsRichTextSvelte
            tag="p"
            value={description}
            className="max-w-3xl text-sm leading-relaxed text-base-content/75 md:text-base"
            {linkClassName}
          />
        {/if}
      </div>

      <div bind:this={stageEl} class="relative w-full overflow-hidden pt-6 pb-4">
        <div
          class="t6-scroll-track flex items-center gap-6 will-change-transform {isMeasured
            ? ''
            : 'overflow-x-auto px-6'}"
          style:transform={`translate3d(${trackX}px, 0, 0)`}
        >
          {#each items as card, cardIndex}
            {@const isActive = activeIndex === cardIndex}
            {@const cardFocus = getCardFocus(cardIndex)}
            {@const cardHeight = Math.round(lerp(MIN_CARD_H, MAX_CARD_H, cardFocus))}
            {@const cardScale = lerp(MIN_CARD_SCALE, MAX_CARD_SCALE, cardFocus)}
            {@const glowOpacity = lerp(0, 0.14, cardFocus)}
            {@const borderMix = Math.round(lerp(8, 30, cardFocus))}
            {@const bgMix = Math.round(lerp(0, 5, cardFocus))}
            {@const glowMix = Math.round(glowOpacity * 100)}
            <article
              class="group relative flex shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl border p-7 text-center transition-[height,transform,border-color,background-color,box-shadow] duration-100 md:p-8"
              style:width={`${cardWidth}px`}
              style:height={`${cardHeight}px`}
              style:transform={`scale(${cardScale})`}
              style:z-index={Math.round(10 + cardFocus * 10)}
              style:border-color={`color-mix(in oklch, var(--color-primary) ${borderMix}%, transparent)`}
              style:background-color={`color-mix(in oklch, var(--color-primary) ${bgMix}%, var(--color-base-100))`}
              style:box-shadow={`0 22px 60px -24px color-mix(in oklch, var(--color-primary) ${glowMix}%, transparent)`}
              aria-current={isActive ? 'true' : undefined}
            >
              <div class="flex h-full flex-col items-center justify-center gap-5">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm transition-transform duration-300 {isActive
                    ? 'scale-105'
                    : 'group-hover:scale-105'}"
                >
                  <CmsIconSvelte name={card.iconName ?? 'ShieldCheck'} class="h-7 w-7" />
                </div>

                {#if card.title}
                  <CmsRichTextSvelte
                    tag="h3"
                    value={card.title}
                    className="max-w-[15rem] text-xl font-medium tracking-tight text-base-content md:text-2xl"
                    {linkClassName}
                  />
                {/if}

                {#if card.text}
                  <CmsRichTextSvelte
                    tag="p"
                    value={card.text}
                    className="max-w-[15rem] text-sm leading-relaxed text-base-content/70 md:text-base"
                    {linkClassName}
                  />
                {/if}
              </div>
            </article>
          {/each}
        </div>

        <div class="mt-8 flex items-center justify-center gap-1">
          {#each items as _, cardIndex}
            <span
              class="block rounded-full transition-all duration-300 {activeIndex ===
              cardIndex
                ? 'h-2.5 w-2.5 bg-primary'
                : 'h-1.5 w-1.5 bg-primary/25'}"
              aria-hidden="true"
            ></span>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}
