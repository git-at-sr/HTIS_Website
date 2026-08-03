<script lang="ts">
  import { fade } from 'svelte/transition';
  import type { TeamMember } from '~/data/cms';
  import CmsRichTextSvelte from './CmsRichTextSvelte.svelte';

  interface Props {
    sectionId?: string;
    team: TeamMember[];
    bgImageSrc: string;
    meetTeamImageSrc: string;
    heading?: string;
    description?: string;
    ctaTitle?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  }

  let {
    sectionId,
    team,
    bgImageSrc,
    meetTeamImageSrc,
    heading = 'The Visionary Core',
    description = 'Our leadership team brings together decades of experience in telecommunications, software engineering, and systems integration, guiding HTIS toward continuous innovation and excellence.',
    ctaTitle = 'Meet the Team',
    ctaLabel = 'Learn More',
    ctaUrl = '/about#team',
  }: Props = $props();
  let activeIndex = $state(0);

  function activateMeetTeamOnMobile() {
    if (window.matchMedia('(max-width: 767px)').matches) {
      activeIndex = team.length;
    }
  }
</script>

<section id={sectionId} class="relative w-full overflow-hidden pt-12 pb-24 md:pt-20">
  <!-- Background Image Layer -->
  <div class="absolute inset-0 z-0 bg-base-100">
    <img
      src={bgImageSrc}
      alt=""
      aria-hidden="true"
      class="h-full w-full object-cover opacity-70"
      style="filter: var(--filter-invert-dark)"
    />
    <div
      class="absolute inset-0 bg-linear-to-t from-base-200 via-base-100/60 to-base-100/20"
    ></div>
  </div>

  <div class="relative z-10 container mx-auto px-4 lg:px-8">
    <div class="mb-12 max-w-3xl">
      <h2 class="mb-6 text-4xl font-extrabold text-base-content md:text-5xl">
        <CmsRichTextSvelte value={heading} />
      </h2>
      <p class="text-lg font-medium text-base-content/80 md:text-xl leading-relaxed">
        <CmsRichTextSvelte value={description} />
      </p>
    </div>

    <!-- Horizontal Accordion Gallery -->
    <div
      class="team-gallery flex h-[24rem] w-full flex-row gap-1 overflow-hidden sm:h-[28rem] sm:gap-2 md:h-[32rem] md:gap-4"
    >
      {#each team as member, index}
        <div
          class="team-member-card relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] md:rounded-3xl {activeIndex ===
          index
            ? 'active bg-base-content/10 backdrop-blur-sm'
            : ''}"
          role="button"
          tabindex="0"
          onmouseenter={() => (activeIndex = index)}
          onfocus={() => (activeIndex = index)}
          onclick={() => (activeIndex = index)}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              activeIndex = index;
            }
          }}
        >
          <!-- Overlay Content -->
          <div
            class="card-content absolute inset-x-0 top-0 z-20 w-[260px] max-w-[90vw] p-4 pb-16 transition-opacity duration-700 ease-in-out sm:p-6 md:w-[320px] md:p-8 lg:w-[360px]"
          >
            <h3
              class="mb-1 text-xl leading-tight font-bold whitespace-nowrap text-primary drop-shadow-sm sm:text-2xl md:text-3xl"
            >
              <CmsRichTextSvelte value={member.name} />
            </h3>
            <p
              class="mb-2 text-xs font-bold tracking-wider whitespace-nowrap text-primary uppercase sm:text-sm md:mb-4 md:text-base"
            >
              <CmsRichTextSvelte value={member.role} />
            </p>
          </div>

          <!-- Description: below image on mobile, overlay on desktop -->
          {#if activeIndex === index}
            <div
              in:fade={{ duration: 300, delay: 150 }}
              class="team-desc absolute z-20 pointer-events-none text-center
                left-0 right-0 bottom-0 bg-base-200/85 dark:bg-base-300/85 backdrop-blur-sm px-3 py-2.5
                md:left-1/2 md:right-auto md:-translate-x-1/2 md:bottom-6 md:w-full md:max-w-[85%] md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none md:p-0"
            >
              <span
                class="text-base-content text-xs sm:text-sm font-semibold leading-relaxed
                  md:text-sm md:bg-base-100/60 md:dark:bg-base-200/60 md:px-2.5 md:py-1.5 md:rounded-md md:shadow-md md:leading-[1.8] md:inline md:box-decoration-clone"
              >
                <CmsRichTextSvelte value={member.desc} />
              </span>
            </div>
          {/if}

          <!-- Image Content -->
          <div
            class="team-img-wrap pointer-events-none absolute bottom-0 flex h-[80%] w-full items-end justify-center px-2 text-center md:h-[75%] lg:px-4"
          >
            <img
              src={member.img}
              alt={member.name}
              class="team-img h-full w-auto max-w-none origin-bottom object-contain transition-all duration-800 ease-[cubic-bezier(0.25,1,0.5,1)]"
            />
          </div>
        </div>
      {/each}

      <!-- Meet the Team Card -->
      <div
        class="team-member-card team-cta-card relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition-all duration-[800ms] ease-[cubic-bezier(0.25,1,0.5,1)] md:cursor-default md:rounded-3xl {activeIndex ===
        team.length
          ? 'active bg-primary/10 border-primary/30 backdrop-blur-sm'
          : 'bg-base-200/40 border border-base-content/10'}"
        role="button"
        tabindex="0"
        onmouseenter={activateMeetTeamOnMobile}
        onfocus={activateMeetTeamOnMobile}
        onclick={activateMeetTeamOnMobile}
        onkeydown={(e) => {
          if (
            window.matchMedia('(max-width: 767px)').matches &&
            (e.key === 'Enter' || e.key === ' ')
          ) {
            e.preventDefault();
            activeIndex = team.length;
          }
        }}
      >
        <!-- Background Image Layer -->
        <div
          class="absolute inset-0 z-0 transition-opacity duration-700 ease-in-out {activeIndex ===
          team.length
            ? 'opacity-60 dark:opacity-30'
            : 'opacity-20 dark:opacity-10'} pointer-events-none"
        >
          <img
            src={meetTeamImageSrc}
            alt=""
            class="h-full w-full object-cover filter grayscale contrast-115 scale-105"
          />
          <div
            class="absolute inset-0 bg-linear-to-t from-base-300/50 via-transparent to-transparent"
          ></div>
        </div>

        <!-- Overlay Content for Active State -->
        <div
          class="card-content absolute inset-x-0 top-0 z-20 w-[260px] max-w-[90vw] p-4 pb-16 transition-opacity duration-700 ease-in-out sm:p-6 md:w-[320px] md:p-8 lg:w-[360px] h-full flex flex-col justify-between"
        >
          <div>
            <h3
              class="mb-2 text-xl leading-tight font-bold text-primary drop-shadow-sm sm:text-2xl md:text-3xl"
            >
              <CmsRichTextSvelte value={ctaTitle} />
            </h3>
          </div>

          <div
            in:fade={{ duration: 300, delay: 150 }}
            class="mb-4 {activeIndex === team.length ? '' : 'hidden md:block'}"
          >
            <a
              href={ctaUrl}
              class="btn btn-primary pointer-events-auto rounded-full px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105 sm:px-6 sm:py-2.5 sm:text-sm"
            >
              <CmsRichTextSvelte value={ctaLabel} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="ml-1 inline-block h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </a>
          </div>
        </div>

        <!-- Inactive State Content (Vertical title/icon) -->
        <div
          class="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 transition-opacity duration-700 ease-in-out pointer-events-none {activeIndex ===
          team.length
            ? 'opacity-0'
            : 'opacity-100'}"
        >
          <!-- Styled Group/Arrow Icon -->
          <div
            class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-3 sm:mb-4 inactive-icon"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 sm:h-6 sm:w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <span
            class="text-[10px] sm:text-xs font-bold tracking-widest text-primary uppercase vertical-text"
          >
            <CmsRichTextSvelte value={ctaTitle} />
          </span>
        </div>
      </div>
    </div>
  </div>
</section>
