<script lang="ts">
  import { untrack } from 'svelte';
  import { fade } from 'svelte/transition';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';
  import type { SoftwareArchitecturalPrincipleItem } from '~/data/cms';

  interface Props {
    sectionId?: string;
    backgroundImageSrc?: string;
    heading: string;
    description: string;
    items: SoftwareArchitecturalPrincipleItem[];
  }

  let {
    sectionId,
    backgroundImageSrc = '',
    heading,
    description,
    items: principles,
  }: Props = $props();

  let activeIndex = $state(0);
  let autoplayTimer: ReturnType<typeof setTimeout>;
  let tabsContainer = $state<HTMLDivElement | null>(null);
  let areTabsHovered = $state(false);
  let areTabsFocused = $state(false);
  let isCardHovered = $state(false);
  let isCardFocused = $state(false);
  let isAutoplayPaused = $derived(
    areTabsHovered || areTabsFocused || isCardHovered || isCardFocused,
  );
  let remainingAutoplayTime = 6000;
  let autoplayStartedAt = 0;
  let isAutoplayTimerRunning = false;

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

  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    if (isAutoplayPaused || !principles.length) return;

    autoplayStartedAt = Date.now();
    isAutoplayTimerRunning = true;
    autoplayTimer = setTimeout(() => {
      isAutoplayTimerRunning = false;
      remainingAutoplayTime = 6000;
      activeIndex = (activeIndex + 1) % principles.length;
      scheduleAutoplay();
    }, remainingAutoplayTime);
  }

  function pauseAutoplay() {
    if (!isAutoplayTimerRunning) return;

    remainingAutoplayTime = Math.max(
      0,
      remainingAutoplayTime - (Date.now() - autoplayStartedAt),
    );
    clearTimeout(autoplayTimer);
    isAutoplayTimerRunning = false;
  }

  function resumeAutoplay() {
    if (!isAutoplayPaused) scheduleAutoplay();
  }

  function handleFocusOut(event: FocusEvent, region: 'tabs' | 'card') {
    const container = event.currentTarget as HTMLElement;
    if (container.contains(event.relatedTarget as Node | null)) return;

    if (region === 'tabs') {
      areTabsFocused = false;
    } else {
      isCardFocused = false;
    }
    resumeAutoplay();
  }

  $effect(() => {
    principles.length;
    untrack(() => {
      remainingAutoplayTime = 6000;
      scheduleAutoplay();
    });

    return () => {
      clearTimeout(autoplayTimer);
      isAutoplayTimerRunning = false;
    };
  });

  $effect(() => {
    scrollTabToActive(activeIndex);
  });

  $effect(() => {
    if (activeIndex >= principles.length) {
      activeIndex = 0;
    }
  });

  function selectTab(index: number) {
    activeIndex = index;
    remainingAutoplayTime = 6000;
    scheduleAutoplay();
  }
</script>

<section
  id={sectionId}
  class="relative overflow-hidden border-t border-base-content/10 bg-base-100 py-24"
>
  {#if backgroundImageSrc}
    <div class="pointer-events-none absolute inset-0 z-0 opacity-20">
      <img
        src={backgroundImageSrc}
        alt=""
        aria-hidden="true"
        class="h-full w-full object-cover object-center"
        style="filter: var(--filter-invert-dark)"
      />
    </div>
  {/if}

  <div class="relative z-10 container mx-auto px-6">
    <div class="mb-16 max-w-3xl text-left">
      <CmsRichTextSvelte
        value={heading}
        tag="h2"
        className="text-4xl font-extrabold tracking-tight text-base-content md:text-5xl"
      />
      <CmsRichTextSvelte
        value={description}
        tag="p"
        className="mt-4 text-lg font-medium text-base-content/70"
      />
    </div>

    {#if principles.length}
      <div class="relative w-full">
        <div
          bind:this={tabsContainer}
          role="group"
          aria-label="Architectural principles"
          onmouseenter={() => {
            areTabsHovered = true;
            pauseAutoplay();
          }}
          onmouseleave={() => {
            areTabsHovered = false;
            resumeAutoplay();
          }}
          onfocusin={() => {
            areTabsFocused = true;
            pauseAutoplay();
          }}
          onfocusout={(event) => handleFocusOut(event, 'tabs')}
          class="no-scrollbar relative flex w-full flex-nowrap gap-3 overflow-x-auto scroll-smooth pb-5 md:gap-4 lg:grid lg:grid-cols-5"
        >
          {#each principles as principle, i}
            <div class="relative shrink-0 w-[185px] md:w-[240px] lg:w-auto flex flex-col">
              <button
                aria-pressed={activeIndex === i}
                onclick={() => selectTab(i)}
                class="relative flex flex-1 min-h-[96px] w-full cursor-pointer items-center justify-center rounded-2xl border px-3.5 pt-8 pb-6 text-center transition-all duration-300 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary md:min-h-[108px] md:px-6 md:pt-10 md:pb-8
                  {activeIndex === i
                  ? 'border-primary bg-primary/5 dark:bg-primary/10 text-primary font-semibold shadow-md'
                  : 'border-base-content/10 bg-base-200/30 text-base-content/70 hover:bg-base-200/60 hover:border-base-content/20 hover:text-base-content'}"
              >
                <div
                  class="absolute top-0 right-0 left-0 h-[6px] overflow-hidden bg-primary/10"
                >
                  {#if activeIndex === i}
                    <div
                      class="h-full animate-progress bg-primary"
                      style="--duration: 6000ms; animation-play-state: {isAutoplayPaused
                        ? 'paused'
                        : 'running'};"
                    ></div>
                  {:else}
                    <div class="h-full bg-primary/30"></div>
                  {/if}
                </div>

                <CmsRichTextSvelte
                  value={principle.title}
                  className="text-sm leading-snug font-medium md:text-lg lg:text-xl"
                />
              </button>

              {#if activeIndex === i}
                <div
                  class="absolute top-full left-1/2 z-10 mt-[-1px] h-0 w-0 -translate-x-1/2 border-t-[12px] border-r-[14px] border-l-[14px] border-t-primary border-r-transparent border-l-transparent"
                ></div>
              {/if}
            </div>
          {/each}
        </div>

        <div
          role="region"
          aria-label="Architectural principle details"
          onmouseenter={() => {
            isCardHovered = true;
            pauseAutoplay();
          }}
          onmouseleave={() => {
            isCardHovered = false;
            resumeAutoplay();
          }}
          onfocusin={() => {
            isCardFocused = true;
            pauseAutoplay();
          }}
          onfocusout={(event) => handleFocusOut(event, 'card')}
          class="relative mt-2 flex min-h-[160px] items-center overflow-hidden rounded-3xl border border-base-content/10 bg-base-100 p-8 shadow-lg md:min-h-[140px] md:p-12 dark:bg-base-200/40"
        >
          <div
            class="pointer-events-none absolute top-0 right-0 bottom-0 w-1/3 overflow-hidden rounded-r-3xl opacity-25 dark:opacity-10"
          >
            <svg
              width="100%"
              height="100%"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="dot-grid-principles"
                  x="0"
                  y="0"
                  width="16"
                  height="16"
                  patternUnits="userSpaceOnUse"
                >
                  <circle
                    cx="2"
                    cy="2"
                    r="1.5"
                    fill="currentColor"
                    class="text-primary"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dot-grid-principles)" />
            </svg>
          </div>

          <div class="relative z-10 w-full pr-8">
            {#key activeIndex}
              <div
                in:fade={{ duration: 250 }}
                class="text-justify text-lg leading-relaxed font-normal text-base-content/85 md:text-xl"
              >
                <CmsRichTextSvelte value={principles[activeIndex]?.description} />
              </div>
            {/key}
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>
