<script lang="ts">
  import { Search, ChevronDown } from '@lucide/svelte';
  import {
    fetchHiringJobs,
    mapApiJobToListItem,
    type HiringApiJob,
    type JobListItem,
  } from '~/data/jobApi';
  import { storeSelectedJob } from '~/utils/jobSelection';

  type JobListRow = JobListItem & { apiJob: HiringApiJob };

  let jobs = $state<JobListRow[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  async function fetchJobs(signal: AbortSignal) {
    try {
      const apiJobs = await fetchHiringJobs({ signal });
      jobs = apiJobs.map((apiJob) => ({
        ...mapApiJobToListItem(apiJob),
        apiJob,
      }));
      error = null;
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }

      error =
        err instanceof Error ? err.message : 'An error occurred while fetching jobs';
    } finally {
      isLoading = false;
    }
  }

  $effect(() => {
    const controller = new AbortController();
    void fetchJobs(controller.signal);

    return () => {
      controller.abort();
    };
  });

  let searchQuery = $state('');
  let selectedDepartments = $state<string[]>([]);
  let selectedLocations = $state<string[]>([]);

  let deptDetailsRef = $state<HTMLDetailsElement | null>(null);
  let locDetailsRef = $state<HTMLDetailsElement | null>(null);

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

  let filteredJobs = $derived(
    jobs.filter((job) => {
      const matchSearch =
        searchQuery === '' || job.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDept =
        selectedDepartments.length === 0 || selectedDepartments.includes(job.department);
      const matchLoc =
        selectedLocations.length === 0 || selectedLocations.includes(job.location);
      return matchSearch && matchDept && matchLoc;
    }),
  );

  let hasFilters = $derived(
    searchQuery !== '' || selectedDepartments.length > 0 || selectedLocations.length > 0,
  );

  function clearFilters() {
    searchQuery = '';
    selectedDepartments = [];
    selectedLocations = [];
  }

  let departments = $derived([...new Set(jobs.map((j) => j.department))]);
  let locations = $derived([...new Set(jobs.map((j) => j.location))]);

  function toggleDepartment(dept: string) {
    if (selectedDepartments.includes(dept)) {
      selectedDepartments = selectedDepartments.filter((d) => d !== dept);
    } else {
      selectedDepartments = [...selectedDepartments, dept];
    }
  }

  function toggleLocation(loc: string) {
    if (selectedLocations.includes(loc)) {
      selectedLocations = selectedLocations.filter((l) => l !== loc);
    } else {
      selectedLocations = [...selectedLocations, loc];
    }
  }

  function rememberSelectedJob(job: JobListRow) {
    storeSelectedJob(job.apiJob);
  }
</script>

<svelte:window onclick={handleWindowClick} />

<div>
  <!-- Filters -->
  <div class="flex flex-col md:flex-row gap-4 mb-4">
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
    <details class="dropdown flex-1" bind:this={deptDetailsRef}>
      <summary
        class="btn btn-outline border-base-300 w-full justify-between font-normal bg-base-100 hover:bg-base-200 text-base-content/70 hover:border-base-300"
      >
        <span class="truncate">
          {selectedDepartments.length > 0
            ? `${selectedDepartments.length} Selected`
            : 'Department'}
        </span>
        <ChevronDown class="h-4 w-4 shrink-0" />
      </summary>
      <ul
        class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-full mt-1 border border-base-200 max-h-60 overflow-y-auto block"
      >
        {#each departments as dept}
          <li>
            <label class="label cursor-pointer justify-start gap-3 w-full">
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                checked={selectedDepartments.includes(dept)}
                onchange={() => toggleDepartment(dept)}
              />
              <span class="label-text">{dept}</span>
            </label>
          </li>
        {/each}
      </ul>
    </details>

    <!-- Location Dropdown -->
    <details class="dropdown flex-1" bind:this={locDetailsRef}>
      <summary
        class="btn btn-outline border-base-300 w-full justify-between font-normal bg-base-100 hover:bg-base-200 text-base-content/70 hover:border-base-300"
      >
        <span class="truncate">
          {selectedLocations.length > 0
            ? `${selectedLocations.length} Selected`
            : 'Location'}
        </span>
        <ChevronDown class="h-4 w-4 shrink-0" />
      </summary>
      <ul
        class="dropdown-content z-1 menu p-2 shadow bg-base-100 rounded-box w-full mt-1 border border-base-200 max-h-60 overflow-y-auto block"
      >
        {#each locations as loc}
          <li>
            <label class="label cursor-pointer justify-start gap-3 w-full">
              <input
                type="checkbox"
                class="checkbox checkbox-sm checkbox-primary"
                checked={selectedLocations.includes(loc)}
                onchange={() => toggleLocation(loc)}
              />
              <span class="label-text">{loc}</span>
            </label>
          </li>
        {/each}
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
    <!-- Jobs Table -->
    <div class="overflow-x-auto">
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
            {#each filteredJobs as job, index}
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
  {/if}
</div>
