<script lang="ts">
  import { Search, ArrowUpRight, Info, ChevronDown } from '@lucide/svelte';
  import CmsIconSvelte from '~/components/CmsIconSvelte.svelte';
  import type { CaseStudyData, IndustryData } from '~/data/cms';

  type IndustryFilterOption = Pick<IndustryData, 'shortTitle' | 'title' | 'iconName'>;
  type CaseStudyListItem = Omit<CaseStudyData, 'thumbnailSrc'> & { thumbnailSrc: string };

  let {
    caseStudies,
    industries,
  }: { caseStudies: CaseStudyListItem[]; industries: IndustryFilterOption[] } = $props();

  const solutions = [
    'Telecom Services',
    'System Integration',
    'Software Development',
    'Resource Management',
  ];

  let draftSearch = $state('');
  let draftSolutions = $state<string[]>([]);
  let draftIndustries = $state<string[]>([]);

  let search = $state('');
  let selectedSolutions = $state<string[]>([]);
  let selectedIndustries = $state<string[]>([]);

  let solutionDetailsRef = $state<HTMLDetailsElement | null>(null);
  let industryTooltip = $state<{
    text: string;
    left: number;
    top: number;
  } | null>(null);

  function handleWindowClick(event: MouseEvent) {
    const target = event.target as Node;
    if (
      solutionDetailsRef &&
      solutionDetailsRef.hasAttribute('open') &&
      !solutionDetailsRef.contains(target)
    ) {
      solutionDetailsRef.removeAttribute('open');
    }
  }

  let hasFilters = $derived(
    draftSearch !== '' || draftSolutions.length > 0 || draftIndustries.length > 0,
  );

  function arraysEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    const setB = new Set(b);
    return a.every((item) => setB.has(item));
  }

  let hasChanges = $derived(
    draftSearch !== search ||
      !arraysEqual(draftSolutions, selectedSolutions) ||
      !arraysEqual(draftIndustries, selectedIndustries),
  );

  function applyFilters() {
    search = draftSearch;
    selectedSolutions = [...draftSolutions];
    selectedIndustries = [...draftIndustries];
  }

  function clearFilters() {
    draftSearch = '';
    draftSolutions = [];
    draftIndustries = [];
    applyFilters();
  }

  let filteredStudies = $derived(
    caseStudies.filter((study) => {
      const matchSearch =
        study.title.toLowerCase().includes(search.toLowerCase()) ||
        study.description.toLowerCase().includes(search.toLowerCase());
      const matchSolution =
        selectedSolutions.length > 0 ? selectedSolutions.includes(study.solution) : true;
      const matchIndustry =
        selectedIndustries.length > 0
          ? selectedIndustries.includes(study.industry)
          : true;
      return matchSearch && matchSolution && matchIndustry;
    }),
  );

  function toggleSolution(sol: string) {
    if (draftSolutions.includes(sol)) {
      draftSolutions = draftSolutions.filter((s) => s !== sol);
    } else {
      draftSolutions = [...draftSolutions, sol];
    }
  }

  function toggleIndustry(ind: string) {
    if (draftIndustries.includes(ind)) {
      draftIndustries = draftIndustries.filter((i) => i !== ind);
    } else {
      draftIndustries = [...draftIndustries, ind];
    }
  }

  function showIndustryTooltip(event: MouseEvent | FocusEvent, text: string) {
    const target = event.currentTarget;
    if (!(target instanceof HTMLElement)) return;

    const rect = target.getBoundingClientRect();
    const tooltipWidth = Math.min(256, window.innerWidth - 32);
    const preferredLeft = rect.right + 10;

    industryTooltip = {
      text,
      left: Math.min(Math.max(16, preferredLeft), window.innerWidth - tooltipWidth - 16),
      top: rect.top + rect.height / 2,
    };
  }

  function hideIndustryTooltip() {
    industryTooltip = null;
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div class="flex flex-col lg:flex-row gap-8 items-start">
  <!-- Filter Sidebar (Sticky on Desktop) -->
  <div
    class="card bg-base-100 border border-base-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-6 w-full lg:w-[320px] shrink-0 lg:sticky lg:top-28 h-fit rounded-3xl transition-all duration-300 overflow-visible! z-10"
  >
    <h2 class="text-xl font-bold mb-6 text-base-content tracking-tight">Filter</h2>

    <div class="mb-6 relative">
      <label
        for="search-input"
        class="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer z-10 flex items-center justify-center"
        aria-label="Search"
      >
        <Search class="w-4 h-4 text-base-content/40" />
      </label>
      <input
        id="search-input"
        type="text"
        placeholder="Search"
        bind:value={draftSearch}
        class="input input-bordered w-full pl-11 bg-base-100 rounded-xl focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
      />
    </div>

    <!-- Solution Dropdown (Multiselect) -->
    <details class="dropdown w-full mb-6" bind:this={solutionDetailsRef}>
      <summary
        class="btn btn-outline border-base-content/20 w-full justify-between font-normal bg-base-100 hover:bg-base-200 text-base-content/80 hover:border-base-content/20 rounded-xl transition-all duration-300 h-12 min-h-12 px-4"
      >
        <span class="truncate">
          {draftSolutions.length > 0
            ? `${draftSolutions.length} Selected`
            : 'Select Solution'}
        </span>
        <ChevronDown class="w-4 h-4 text-base-content/40 shrink-0" />
      </summary>
      <ul
        class="dropdown-content z-20 menu p-2 shadow bg-base-100 rounded-xl w-full mt-1 border border-base-200 max-h-60 overflow-y-auto block"
      >
        {#each solutions as sol}
          <li>
            <label
              class="label cursor-pointer justify-start gap-3 w-full py-2 hover:bg-base-200/50 rounded-lg"
            >
              <input
                type="checkbox"
                class="checkbox checkbox-primary checkbox-sm border-base-content/20 rounded focus:ring-primary focus:ring-offset-1 transition-all duration-200 shrink-0"
                checked={draftSolutions.includes(sol)}
                onchange={() => toggleSolution(sol)}
              />
              <span class="label-text text-sm font-medium text-base-content/80"
                >{sol}</span
              >
            </label>
          </li>
        {/each}
      </ul>
    </details>

    <div class="mb-8">
      <h3
        class="text-xs font-semibold text-base-content/50 mb-4 uppercase tracking-wider"
      >
        Industries
      </h3>
      <div
        class="flex max-h-50 flex-col gap-4 overflow-x-hidden overflow-y-auto pr-3"
        onscroll={hideIndustryTooltip}
      >
        {#each industries as ind}
          <div class="flex min-h-5 w-full min-w-0 items-center gap-3 text-left group">
            <label
              class="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
            >
              <input
                type="checkbox"
                checked={draftIndustries.includes(ind.shortTitle)}
                onchange={() => toggleIndustry(ind.shortTitle)}
                class="checkbox checkbox-primary checkbox-sm border-base-content/20 rounded focus:ring-primary focus:ring-offset-1 transition-all duration-200 shrink-0"
              />
              <CmsIconSvelte
                name={ind.iconName}
                class="w-4 h-4 text-base-content/70 group-hover:text-primary transition-colors shrink-0"
              />
              <span
                class="min-w-0 truncate text-sm font-medium text-base-content/80 transition-colors select-none group-hover:text-primary"
                >{ind.shortTitle}</span
              >
            </label>
            <button
              type="button"
              class="flex shrink-0 cursor-help items-center justify-center"
              aria-label={`About ${ind.shortTitle}`}
              aria-describedby="industry-filter-tooltip"
              onmouseenter={(event) => showIndustryTooltip(event, ind.title)}
              onfocus={(event) => showIndustryTooltip(event, ind.title)}
              onmouseleave={hideIndustryTooltip}
              onblur={hideIndustryTooltip}
              onclick={(event) => event.stopPropagation()}
            >
              <Info
                class="w-3.5 h-3.5 text-base-content/70 group-hover:text-primary/70 hover:text-primary! transition-colors cursor-help"
              />
            </button>
          </div>
        {/each}
      </div>
    </div>

    <div class="flex items-center justify-between gap-4">
      <button
        onclick={applyFilters}
        disabled={!hasChanges}
        class="btn w-fit px-6 rounded-lg font-semibold whitespace-nowrap transition-all duration-300 disabled:pointer-events-auto disabled:cursor-not-allowed {hasChanges
          ? 'btn-primary shadow-md shadow-primary/20 hover:shadow-primary/40 cursor-pointer'
          : 'bg-primary/10 text-primary/40 border-transparent shadow-none'}"
      >
        Apply Filter
      </button>
      <button
        onclick={clearFilters}
        disabled={!hasFilters}
        class="text-sm font-medium transition-colors whitespace-nowrap shrink-0 {hasFilters
          ? 'text-error hover:underline cursor-pointer'
          : 'text-error/40 cursor-not-allowed'}"
      >
        Clear Filter
      </button>
    </div>
  </div>

  <!-- Case Studies List -->
  <div class="flex-1 space-y-6 w-full">
    {#each filteredStudies as study (study.id)}
      <a
        href={`/case-study/${study.slug}`}
        class="card bg-base-100 border border-base-200/80 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-primary/20 transition-all duration-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row gap-6 group no-underline text-current"
      >
        <!-- Image Container -->
        <div
          class="w-full sm:w-[140px] lg:w-[160px] aspect-square shrink-0 rounded-xl overflow-hidden bg-base-200 relative"
        >
          <img
            src={study.thumbnailSrc}
            alt={study.title}
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 flex flex-col justify-center relative py-1 sm:pr-8">
          <!-- Top Right Icon -->
          <div class="hidden sm:flex absolute top-0 right-0">
            <div
              class="btn btn-circle btn-sm border border-secondary/50 bg-transparent text-secondary group-hover:opacity-100 group-hover:bg-secondary group-hover:border-secondary group-hover:text-secondary-content transition-all duration-300 transform group-hover:scale-110"
              aria-hidden="true"
            >
              <ArrowUpRight class="w-4 h-4" strokeWidth={3} />
            </div>
          </div>

          <h3
            class="text-xl font-bold text-base-content mb-2 group-hover:text-primary transition-colors line-clamp-2 pr-10 sm:pr-0"
          >
            {study.title}
          </h3>

          <p class="text-sm text-base-content/70 mb-4 leading-relaxed max-w-2xl">
            {study.description}
          </p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2 mt-auto">
            {#each study.tags as tag}
              <div
                class="px-3 py-1 text-xs font-semibold text-secondary bg-secondary/10 border border-secondary/20 dark:text-base-content dark:bg-primary/15 dark:border-primary/25 rounded-md transition-colors hover:bg-secondary/20 dark:hover:bg-primary/25"
              >
                {tag}
              </div>
            {/each}
          </div>
        </div>
      </a>
    {:else}
      <!-- Empty State -->
      <div
        class="py-16 px-6 text-center border-2 border-base-200 border-dashed rounded-3xl bg-base-100/50 flex flex-col items-center justify-center w-full"
      >
        <div class="bg-base-200/50 p-4 rounded-full mb-4">
          <Search class="w-8 h-8 text-base-content/40" />
        </div>
        <h3 class="text-lg font-bold text-base-content mb-2">No results found</h3>
        <p class="text-base-content/60 max-w-sm mb-6">
          We couldn't find any case studies matching your current filters. Try adjusting
          your search criteria.
        </p>
        <button
          onclick={clearFilters}
          class="btn btn-outline btn-primary rounded-full px-6"
        >
          Clear all filters
        </button>
      </div>
    {/each}
  </div>
</div>

{#if industryTooltip}
  <div
    id="industry-filter-tooltip"
    role="tooltip"
    class="pointer-events-none fixed z-[9999] max-w-64 -translate-y-1/2 rounded-md bg-neutral px-2.5 py-1.5 text-xs font-semibold leading-snug text-neutral-content shadow-lg"
    style={`left: ${industryTooltip.left}px; top: ${industryTooltip.top}px;`}
  >
    {industryTooltip.text}
  </div>
{/if}
