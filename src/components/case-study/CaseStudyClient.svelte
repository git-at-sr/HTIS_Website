<script lang="ts">
  import { fade } from 'svelte/transition';
  import { ChevronLeft, ChevronRight, ArrowUpRight } from '@lucide/svelte';

  interface LogoItem {
    name: string;
    logoSrc?: string;
  }

  interface StatItem {
    value: string;
    label: string;
  }

  interface CaseStudy {
    title: string;
    eyebrow: string;
    description: string;
    image?: string;
    url?: string;
    stats: StatItem[];
  }

  interface Testimonial {
    quote: string;
    name: string;
    title: string;
  }

  interface Props {
    title: string;
    description: string;
    clientLogos: LogoItem[];
    caseStudies: CaseStudy[];
    testimonials: Testimonial[];
  }

  let {
    title,
    description,
    clientLogos = [],
    caseStudies = [],
    testimonials = [],
  }: Props = $props();

  // Logo Carousel States
  let logosScrollContainer = $state<HTMLDivElement | null>(null);
  let logoScrollWidth = $state(0);
  let logoClientWidth = $state(0);
  let logoScrollLeft = $state(0);

  function updateLogoScroll() {
    if (logosScrollContainer) {
      logoScrollLeft = logosScrollContainer.scrollLeft;
      logoScrollWidth = logosScrollContainer.scrollWidth;
      logoClientWidth = logosScrollContainer.clientWidth;
    }
  }

  function scrollLogos(direction: 'left' | 'right') {
    if (!logosScrollContainer) return;
    const cardWidth = logosScrollContainer.firstElementChild?.clientWidth || 200;
    const gap = 16; // gap-4 is 16px
    const scrollAmount =
      direction === 'left' ? -(cardWidth + gap) * 2 : (cardWidth + gap) * 2;
    logosScrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }

  // Case Study States
  let activeCaseStudyIndex = $state(0);

  function nextCaseStudy() {
    if (caseStudies.length > 0) {
      activeCaseStudyIndex = (activeCaseStudyIndex + 1) % caseStudies.length;
    }
  }

  function prevCaseStudy() {
    if (caseStudies.length > 0) {
      activeCaseStudyIndex = (activeCaseStudyIndex - 1 + caseStudies.length) % caseStudies.length;
    }
  }

  // Testimonial States
  let activeTestimonialIndex = $state(0);
  let testimonialInterval: ReturnType<typeof setInterval>;

  function startTestimonialAutoplay() {
    stopTestimonialAutoplay();
    testimonialInterval = setInterval(() => {
      if (testimonials.length > 0) {
        activeTestimonialIndex = (activeTestimonialIndex + 1) % testimonials.length;
      }
    }, 7000);
  }

  function stopTestimonialAutoplay() {
    if (testimonialInterval) clearInterval(testimonialInterval);
  }

  function selectTestimonial(index: number) {
    activeTestimonialIndex = index;
    startTestimonialAutoplay();
  }

  function nextTestimonial() {
    if (testimonials.length > 0) {
      selectTestimonial((activeTestimonialIndex + 1) % testimonials.length);
    }
  }

  function prevTestimonial() {
    if (testimonials.length > 0) {
      selectTestimonial(
        (activeTestimonialIndex - 1 + testimonials.length) % testimonials.length,
      );
    }
  }

  const SWIPE_THRESHOLD = 48;
  const SWIPE_AXIS_RATIO = 1.25;
  let swipeStartX: number | null = null;
  let swipeStartY: number | null = null;
  let swipeTarget: 'case-study' | 'testimonial' | null = null;
  let caseStudySwiped = false;

  function handleSwipeStart(event: PointerEvent, target: 'case-study' | 'testimonial') {
    if (event.pointerType !== 'touch' || !window.matchMedia('(max-width: 767px)').matches) return;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
    swipeTarget = target;
  }

  function handleSwipeEnd(event: PointerEvent) {
    if (event.pointerType !== 'touch' || swipeStartX === null || swipeStartY === null) return;

    const deltaX = event.clientX - swipeStartX;
    const deltaY = event.clientY - swipeStartY;
    const target = swipeTarget;
    cancelSwipe();

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_AXIS_RATIO
    ) return;

    if (target === 'case-study') {
      caseStudySwiped = true;
      if (deltaX < 0) nextCaseStudy();
      else prevCaseStudy();
    } else if (target === 'testimonial') {
      if (deltaX < 0) nextTestimonial();
      else prevTestimonial();
    }
  }

  function cancelSwipe() {
    swipeStartX = null;
    swipeStartY = null;
    swipeTarget = null;
  }

  function handleCaseStudyClick(event: MouseEvent) {
    if (!caseStudySwiped) return;
    event.preventDefault();
    caseStudySwiped = false;
  }

  // Lifecycles and Autoplay setup
  $effect(() => {
    if (logosScrollContainer) {
      updateLogoScroll();
      const observer = new ResizeObserver(() => updateLogoScroll());
      observer.observe(logosScrollContainer);
      return () => observer.disconnect();
    }
  });

  $effect(() => {
    startTestimonialAutoplay();
    return () => {
      stopTestimonialAutoplay();
    };
  });
</script>

<div class="w-full">
  <!-- Logo Section -->
  <div class="mb-16">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl text-center">
        {title}
      </h2>
      <p class="mt-3 text-sm leading-relaxed text-base-content/75 md:text-base max-w-2xl mx-auto text-center">
        {description}
      </p>
    </div>

    <div class="relative flex items-center w-full py-4 border-y border-base-content/10 bg-base-100/30 backdrop-blur-md rounded-2xl px-14">
      <!-- Left Navigation Button -->
      {#if logoScrollLeft > 10}
        <button
          onclick={() => scrollLogos('left')}
          class="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-success/20 bg-success/5 text-success transition-all hover:bg-success hover:text-success-content active:scale-95 shadow-sm cursor-pointer hover:shadow-md"
          aria-label="Previous logos"
          transition:fade={{ duration: 200 }}
        >
          <ChevronLeft class="h-5 w-5" />
        </button>
      {/if}

      <div
        bind:this={logosScrollContainer}
        onscroll={updateLogoScroll}
        class="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
      >
        {#each clientLogos as logo, idx}
          <div class="snap-center shrink-0 w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/6 flex items-center justify-center px-4 py-2 border-r border-base-content/10 last:border-r-0 h-16">
            {#if logo.logoSrc}
              <img src={logo.logoSrc} alt={logo.name} class="max-h-12 max-w-[85%] object-contain opacity-90 dark:opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-300" />
            {:else}
              <span class="text-base font-extrabold text-base-content/60 tracking-wider uppercase select-none hover:text-primary transition-colors">{logo.name}</span>
            {/if}
          </div>
        {/each}
      </div>

      <!-- Right Navigation Button -->
      {#if logoScrollLeft + logoClientWidth < logoScrollWidth - 10}
        <button
          onclick={() => scrollLogos('right')}
          class="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-success/20 bg-success/5 text-success transition-all hover:bg-success hover:text-success-content active:scale-95 shadow-sm cursor-pointer hover:shadow-md"
          aria-label="Next logos"
          transition:fade={{ duration: 200 }}
        >
          <ChevronRight class="h-5 w-5" />
        </button>
      {/if}
    </div>
  </div>

  <!-- Cards Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
    <!-- Component 2: Case Study Slider Card -->
    <div class="lg:col-span-3 flex flex-col h-full">
      {#if caseStudies.length > 0}
        {@const current = caseStudies[activeCaseStudyIndex]}
        <a 
          href={current.url || '#'}
          class="bg-success/5 border border-success/15 dark:border-success/10 rounded-4xl p-6 md:p-8 relative flex flex-col justify-between flex-1 min-h-[380px] shadow-xs group/card hover:border-success/30 hover:shadow-md transition-all duration-300 cursor-pointer select-none text-base-content hover:no-underline touch-pan-y"
          onclick={handleCaseStudyClick}
          onpointerdown={(event) => handleSwipeStart(event, 'case-study')}
          onpointerup={handleSwipeEnd}
          onpointercancel={cancelSwipe}
        >
          <!-- Top Right Action Arrow Icon (cosmetic) -->
          <div
            class="absolute top-6 right-6 flex h-10 w-10 items-center justify-center rounded-full border border-success/20 bg-success/10 text-success transition-all duration-300 group-hover/card:bg-success group-hover/card:text-success-content group-hover/card:scale-105 active:scale-95 shadow-xs"
          >
            <ArrowUpRight class="h-5 w-5" />
          </div>

          <div>
            <!-- Eyebrow Pill -->
            <div class="mb-5 inline-flex items-center rounded-full border border-success/20 bg-success/10 px-3.5 py-1 text-xs font-bold tracking-wide text-success uppercase">
              {current.eyebrow}
            </div>

            <!-- Content Area with optional image -->
            <div class="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_9rem] md:grid-rows-[auto_1fr] md:gap-x-6 md:gap-y-3">
              {#key activeCaseStudyIndex}
                <h3 in:fade={{ duration: 250 }} class="max-w-lg text-left text-2xl font-bold tracking-tight text-base-content md:col-start-1 md:row-start-1 md:text-3xl">
                  {current.title}
                </h3>
              {/key}

              {#if current.image}
                <div class="flex max-h-32 w-full items-center justify-center md:col-start-2 md:row-span-2 md:row-start-1 md:w-36 md:shrink-0 md:self-start">
                  <img 
                    src={current.image} 
                    alt={current.title} 
                    class="max-h-28 object-contain drop-shadow-md opacity-85 group-card-hover:opacity-100 transition-opacity duration-300" 
                    style="filter: hue-rotate(90deg);"
                  />
                </div>
              {/if}

              {#key activeCaseStudyIndex}
                <p in:fade={{ duration: 250 }} class="max-w-xl text-left text-sm leading-relaxed text-base-content/75 md:col-start-1 md:row-start-2 md:text-base">
                  {current.description}
                </p>
              {/key}
            </div>
          </div>

          <!-- Bottom Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-success/15 mt-8">
            {#each current.stats as stat}
              <div class="flex flex-col border-r border-success/10 last:border-r-0 pr-2">
                {#key activeCaseStudyIndex}
                  <span in:fade={{ duration: 250 }} class="text-2xl font-extrabold text-success tracking-tight">
                    {stat.value}
                  </span>
                {/key}
                <span class="text-xs font-bold text-base-content/60 uppercase mt-0.5 leading-tight select-none">
                  {stat.label}
                </span>
              </div>
            {/each}
          </div>
        </a>
      {/if}

      <!-- Case Study Navigation Controls -->
      {#if caseStudies.length > 1}
        <div class="flex items-center justify-center gap-4 mt-6">
          <button
            onclick={prevCaseStudy}
            class="flex h-9 w-9 items-center justify-center rounded-full border border-success/20 bg-success/5 text-success transition-all hover:bg-success hover:text-success-content active:scale-95 cursor-pointer"
            aria-label="Previous Case Study"
          >
            <ChevronLeft class="h-4.5 w-4.5" />
          </button>
          <div class="flex gap-1.5">
            {#each caseStudies as _, i}
              <button
                onclick={() => { activeCaseStudyIndex = i; }}
                class="h-2 w-2 rounded-full transition-all duration-300 cursor-pointer {activeCaseStudyIndex === i ? 'bg-success w-4' : 'bg-base-content/20 hover:bg-base-content/40'}"
                aria-label="Go to case study slide {i + 1}"
              ></button>
            {/each}
          </div>
          <button
            onclick={nextCaseStudy}
            class="flex h-9 w-9 items-center justify-center rounded-full border border-success/20 bg-success/5 text-success transition-all hover:bg-success hover:text-success-content active:scale-95 cursor-pointer"
            aria-label="Next Case Study"
          >
            <ChevronRight class="h-4.5 w-4.5" />
          </button>
        </div>
      {/if}
    </div>

    <!-- Component 3: Testimonial Slider Card -->
    <div class="lg:col-span-2 flex flex-col h-full">
      {#if testimonials.length > 0}
        {@const currentT = testimonials[activeTestimonialIndex]}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
          class="bg-base-100 border border-base-content/10 rounded-4xl p-6 md:p-8 relative flex flex-col justify-between flex-1 min-h-[380px] shadow-xs hover:shadow-md transition-all duration-300 touch-pan-y"
          onmouseenter={stopTestimonialAutoplay}
          onmouseleave={startTestimonialAutoplay}
          onpointerdown={(event) => handleSwipeStart(event, 'testimonial')}
          onpointerup={handleSwipeEnd}
          onpointercancel={cancelSwipe}
        >
          <!-- Green SVG Quotation Icon top right -->
          <div class="absolute top-6 right-8 text-success/20 pointer-events-none select-none">
            <svg class="h-16 w-16 fill-current opacity-30" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
            </svg>
          </div>

          <!-- Quote Block -->
          <div class="flex-1 flex flex-col justify-center overflow-hidden my-4 min-h-[160px]">
            {#key activeTestimonialIndex}
              <div 
                in:fade={{ duration: 250 }} 
                class="overflow-y-auto pr-6 max-h-[180px] scrollbar-thin"
              >
                <blockquote class="text-base md:text-lg leading-relaxed text-base-content/85 italic font-medium text-left">
                  “{currentT.quote}”
                </blockquote>
              </div>
            {/key}
          </div>

          <!-- Author Info Section -->
          <div class="border-t border-base-content/10 pt-6 mt-6">
            {#key activeTestimonialIndex}
              <div in:fade={{ duration: 250 }}>
                <cite class="text-lg font-bold text-base-content not-italic block text-left">{currentT.name}</cite>
                <span class="text-sm font-semibold text-base-content/60 mt-0.5 block text-left">{currentT.title}</span>
              </div>
            {/key}
          </div>
        </div>
      {/if}

      <!-- Testimonial Navigation Controls -->
      {#if testimonials.length > 1}
        <div class="flex items-center justify-center gap-1.5 mt-6 h-9">
          {#each testimonials as _, i}
            <button
              onclick={() => selectTestimonial(i)}
              class="h-2 w-2 rounded-full transition-all duration-300 cursor-pointer {activeTestimonialIndex === i ? 'bg-success w-4' : 'bg-base-content/20 hover:bg-base-content/40'}"
              aria-label="Go to testimonial slide {i + 1}"
            ></button>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
