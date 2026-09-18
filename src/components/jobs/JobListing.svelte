<script lang="ts">
  import { Search, ChevronDown, ChevronLeft, ChevronRight } from '@lucide/svelte';
  import {
    checkHiringApiStatus,
    fetchDepartments,
    fetchHiringJobsPage,
    fetchLocations,
    mapApiJobToListItem,
    type DepartmentOption,
    type HiringApiJob,
    type JobListItem,
    type LocationOption,
  } from '~/data/jobApi';
  import { storeSelectedJob } from '~/utils/jobSelection';

  type JobListRow = JobListItem & { apiJob: HiringApiJob };

  const PAGE_SIZE = 10;

  let jobs = $state<JobListRow[]>([]);
  let totalCount = $state(0);
  let currentPage = $state(1);
  let departments = $state<DepartmentOption[]>([]);
  let locations = $state<LocationOption[]>([]);
  let isLoading = $state(true);
  let isLoadingDepartments = $state(true);
  let isLoadingLocations = $state(true);
  let error = $state<string | null>(null);

  let searchQuery = $state('');
  let selectedDepartmentIds = $state<number[]>([]);
  let selectedLocationIds = $state<number[]>([]);

  let deptDetailsRef = $state<HTMLDetailsElement | null>(null);
  let locDetailsRef = $state<HTMLDetailsElement | null>(null);

  function sameIdSet(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const set = new Set(a);
    return b.every((id) => set.has(id));
  }

  async function fetchJobs(signal: AbortSignal, pageNumber: number) {
    isLoading = true;
    try {
      const result = await fetchHiringJobsPage({
        signal,
        pageNumber,
        pageSize: PAGE_SIZE,
        departmentIds: selectedDepartmentIds,
        locationIds: selectedLocationIds,
        fetchAllPages: false,
      });
      jobs = result.jobs.map((apiJob) => ({
        ...mapApiJobToListItem(apiJob),
        apiJob,
      }));
      totalCount = result.totalCount;
      error = null;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      const apiUp = await checkHiringApiStatus({ signal }).catch(() => false);
      error = apiUp
        ? err instanceof Error
          ? err.message
          : 'An error occurred while fetching jobs'
        : 'Hiring API is currently unavailable. Please try again later.';
    } finally {
      isLoading = false;
    }
  }

  // Locations depend on selected departments (LocationDdl?departmentIds=)
  $effect(() => {
    const departmentIds = selectedDepartmentIds;
    const controller = new AbortController();
    isLoadingLocations = true;

    void (async () => {
      try {
        const locOptions = await fetchLocations({
          signal: controller.signal,
          departmentIds,
        });
        if (controller.signal.aborted) return;

        locations = locOptions;
        const validIds = new Set(locOptions.map((item) => Number(item.locationId)));
        const nextSelected = selectedLocationIds.filter((id) => validIds.has(id));
        if (!sameIdSet(nextSelected, selectedLocationIds)) {
          selectedLocationIds = nextSelected;
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Unable to load locations:', err);
      } finally {
        if (!controller.signal.aborted) isLoadingLocations = false;
      }
    })();

    return () => controller.abort();
  });

  // Departments depend on selected locations (DepartmentDdl?locationIds=)
  $effect(() => {
    const locationIds = selectedLocationIds;
    const controller = new AbortController();
    isLoadingDepartments = true;

    void (async () => {
      try {
        const deptOptions = await fetchDepartments({
          signal: controller.signal,
          locationIds,
        });
        if (controller.signal.aborted) return;

        departments = deptOptions;
        const validIds = new Set(deptOptions.map((item) => Number(item.departmentId)));
        const nextSelected = selectedDepartmentIds.filter((id) => validIds.has(id));
        if (!sameIdSet(nextSelected, selectedDepartmentIds)) {
          selectedDepartmentIds = nextSelected;
        }
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        console.error('Unable to load departments:', err);
      } finally {
        if (!controller.signal.aborted) isLoadingDepartments = false;
      }
    })();

    return () => controller.abort();
  });

  // Reset to first page whenever department/location filters change.
  $effect(() => {
    selectedDepartmentIds;
    selectedLocationIds;
    currentPage = 1;
  });

  $effect(() => {
    const page = currentPage;
    selectedDepartmentIds;
    selectedLocationIds;

    const controller = new AbortController();
    void fetchJobs(controller.signal, page);
    return () => controller.abort();
  });

  function handleWindowClick(event: MouseEvent) {
    const target = event.target as Node;
    if (
      deptDetailsRef &&
      deptDetailsRef.hasAttribute('open') &&
      !deptDetailsRef.contains(target)
    ) {
      deptDetailsRef.removeAttribute('open');
    }
    if (
      locDetailsRef &&
      locDetailsRef.hasAttribute('open') &&
      !locDetailsRef.contains(target)
    ) {
      locDetailsRef.removeAttribute('open');
    }
  }

  function openDepartmentDropdown() {
    locDetailsRef?.removeAttribute('open');
  }

  function openLocationDropdown() {
    deptDetailsRef?.removeAttribute('open');
  }

  function stopMenuEvent(event: Event) {
    event.stopPropagation();
  }

  let filteredJobs = $derived(
    jobs.filter((job) => {
      return (
        searchQuery === '' || job.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }),
  );

  let totalPages = $derived(Math.max(1, Math.ceil(totalCount / PAGE_SIZE)));

  let pageNumbers = $derived.by(() => {
    const pages: number[] = [];
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, end - windowSize + 1);
    for (let page = start; page <= end; page++) pages.push(page);
    return pages;
  });

  let hasFilters = $derived(
    searchQuery !== '' ||
      selectedDepartmentIds.length > 0 ||
      selectedLocationIds.length > 0,
  );

  function clearFilters() {
    searchQuery = '';
    selectedDepartmentIds = [];
    selectedLocationIds = [];
    currentPage = 1;
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    currentPage = page;
  }

  function toggleDepartment(event: Event, departmentId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (selectedDepartmentIds.includes(departmentId)) {
      selectedDepartmentIds = selectedDepartmentIds.filter((id) => id !== departmentId);
    } else {
      selectedDepartmentIds = [...selectedDepartmentIds, departmentId];
    }
  }

  function toggleLocation(event: Event, locationId: number) {
    event.preventDefault();
    event.stopPropagation();
    if (selectedLocationIds.includes(locationId)) {
      selectedLocationIds = selectedLocationIds.filter((id) => id !== locationId);
    } else {
      selectedLocationIds = [...selectedLocationIds, locationId];
    }
  }

  function rememberSelectedJob(job: JobListRow) {
    storeSelectedJob(job.apiJob);
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div>
  <!-- Filters: high stacking context so menus sit above stretched row links -->
  <div class="relative z-30 flex flex-col md:flex-row gap-4 mb-4">
    <div class="relative flex-1">
      <Search
        class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/50 pointer-events-none z-10"
      />
      <input
        type="text"
        placeholder="Search For Job"
        class="input input-bordered w-full pl-12 bg-base-100 border-base-300 focus:outline-none focus:border-primary"
        bind:value={searchQuery}
      />
    </div>

    <!-- Department Dropdown -->
    <details
      class="dropdown flex-1"
      bind:this={deptDetailsRef}
      ontoggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) openDepartmentDropdown();
      }}
    >
      <summary
        class="btn btn-outline border-base-300 w-full justify-between font-normal bg-base-100 hover:bg-base-200 text-base-content/70 hover:border-base-300"
      >
        <span class="truncate">
          {selectedDepartmentIds.length > 0
            ? `${selectedDepartmentIds.length} Selected`
            : isLoadingDepartments
              ? 'Loading departments...'
              : 'Department'}
        </span>
        <ChevronDown class="h-4 w-4 shrink-0" />
      </summary>
      <ul
        class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-full mt-1 border border-base-200 max-h-60 overflow-y-auto block"
        role="listbox"
        aria-label="Departments"
        onclick={stopMenuEvent}
        onmousedown={stopMenuEvent}
        onpointerdown={stopMenuEvent}
      >
        {#if departments.length === 0}
          <li class="px-3 py-2 text-sm text-base-content/60">No departments available</li>
        {:else}
          {#each departments as dept (dept.departmentId)}
            <li>
              <label
                class="label cursor-pointer justify-start gap-3 w-full"
                onmousedown={stopMenuEvent}
                onclick={(event) =>
                  toggleDepartment(event, Number(dept.departmentId))}
              >
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary pointer-events-none"
                  checked={selectedDepartmentIds.includes(Number(dept.departmentId))}
                  tabindex="-1"
                  readonly
                />
                <span class="label-text">{dept.departmentName}</span>
              </label>
            </li>
          {/each}
        {/if}
      </ul>
    </details>

    <!-- Location Dropdown -->
    <details
      class="dropdown flex-1"
      bind:this={locDetailsRef}
      ontoggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) openLocationDropdown();
      }}
    >
      <summary
        class="btn btn-outline border-base-300 w-full justify-between font-normal bg-base-100 hover:bg-base-200 text-base-content/70 hover:border-base-300"
      >
        <span class="truncate">
          {selectedLocationIds.length > 0
            ? `${selectedLocationIds.length} Selected`
            : isLoadingLocations
              ? 'Loading locations...'
              : 'Location'}
        </span>
        <ChevronDown class="h-4 w-4 shrink-0" />
      </summary>
      <ul
        class="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-full mt-1 border border-base-200 max-h-60 overflow-y-auto block"
        role="listbox"
        aria-label="Locations"
        onclick={stopMenuEvent}
        onmousedown={stopMenuEvent}
        onpointerdown={stopMenuEvent}
      >
        {#if locations.length === 0}
          <li class="px-3 py-2 text-sm text-base-content/60">No locations available</li>
        {:else}
          {#each locations as loc (loc.locationId)}
            <li>
              <label
                class="label cursor-pointer justify-start gap-3 w-full"
                onmousedown={stopMenuEvent}
                onclick={(event) => toggleLocation(event, Number(loc.locationId))}
              >
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm checkbox-primary pointer-events-none"
                  checked={selectedLocationIds.includes(Number(loc.locationId))}
                  tabindex="-1"
                  readonly
                />
                <span class="label-text">{loc.locationName}</span>
              </label>
            </li>
          {/each}
        {/if}
      </ul>
    </details>
  </div>

  <div class="mb-8">
    <button
      class={`text-sm font-medium transition-colors ${hasFilters ? 'text-error hover:underline cursor-pointer' : 'text-error/40 cursor-not-allowed'}`}
      disabled={!hasFilters}
      onclick={clearFilters}
    >
      Clear Filter
    </button>
  </div>

  {#if isLoading}
    <div
      class="flex flex-col items-center justify-center p-20 gap-4 bg-base-100 rounded-box border border-base-200 shadow-sm"
    >
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="text-base-content/60 font-medium">Loading opportunities...</p>
    </div>
  {:else if error}
    <div class="alert alert-error shadow-sm mb-8">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="stroke-current shrink-0 h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        ><path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
        /></svg
      >
      <span>{error}</span>
    </div>
  {:else}
    <!-- Jobs Table: keep below filter dropdowns -->
    <div class="relative z-0 overflow-x-auto">
      <table class="table w-full">
        <thead>
          <tr>
            <th class="font-bold text-base-content text-base bg-transparent">Role</th>
            <th class="font-bold text-base-content text-base bg-transparent"
              >Department</th
            >
            <th class="font-bold text-base-content text-base bg-transparent">Location</th>
          </tr>
        </thead>
        <tbody class="bg-base-100 rounded-box shadow-sm border border-base-200">
          {#if filteredJobs.length === 0}
            <tr>
              <td colspan="3" class="p-8 text-center text-base-content/60">
                No jobs found matching your criteria.
              </td>
            </tr>
          {:else}
            {#each filteredJobs as job, index (job.id)}
              <tr
                class={`relative transition-colors hover:bg-base-200/50 ${index % 2 !== 0 ? 'bg-base-200/30' : 'bg-base-100'}`}
              >
                <td class="font-bold text-primary py-5">
                  <a
                    href={`/jobs/${job.id}`}
                    class="row-link hover:underline"
                    aria-label={`${job.role} — ${job.department}, ${job.location}`}
                    onclick={() => rememberSelectedJob(job)}
                    >{job.role}</a
                  >
                </td>
                <td class="text-base-content py-5">{job.department}</td>
                <td class="text-base-content py-5">{job.location}</td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    {#if totalCount > PAGE_SIZE}
      <div class="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p class="text-sm text-base-content/60">
          Showing {(currentPage - 1) * PAGE_SIZE + (filteredJobs.length > 0 ? 1 : 0)}–{(currentPage - 1) * PAGE_SIZE + filteredJobs.length}
          of {totalCount}
        </p>
        <div class="join">
          <button
            type="button"
            class="btn btn-sm join-item"
            disabled={currentPage <= 1}
            aria-label="Previous page"
            onclick={() => goToPage(currentPage - 1)}
          >
            <ChevronLeft class="h-4 w-4" />
          </button>
          {#each pageNumbers as page (page)}
            <button
              type="button"
              class={`btn btn-sm join-item ${page === currentPage ? 'btn-primary' : ''}`}
              aria-current={page === currentPage ? 'page' : undefined}
              onclick={() => goToPage(page)}
            >
              {page}
            </button>
          {/each}
          <button
            type="button"
            class="btn btn-sm join-item"
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            onclick={() => goToPage(currentPage + 1)}
          >
            <ChevronRight class="h-4 w-4" />
          </button>
        </div>
      </div>
    {/if}
  {/if}
</div>
