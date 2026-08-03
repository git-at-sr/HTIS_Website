<script lang="ts">
  import JobApplyModal from '~/components/jobs/JobApplyModal.svelte';
  import { fetchHiringJobFromList, type HiringApiJob } from '~/data/jobApi';
  import { takeSelectedJob } from '~/utils/jobSelection';
  import { renderMarkdown } from '~/utils/markdown';

  let {
    jobId,
    initialJob,
  }: {
    jobId: string;
    initialJob: HiringApiJob;
  } = $props();

  let selectedJob = $state<HiringApiJob | null>(null);
  let descriptionHtml = $state('');
  let isReady = $state(false);
  let refreshError = $state<string | null>(null);

  let job = $derived(selectedJob ?? initialJob);
  let role = $derived(job.title?.trim() || 'Job opportunity');
  let location = $derived(job.location?.trim() || 'Remote');
  let department = $derived(job.skills?.trim() || 'Other');
  let experience = $derived.by(() => {
    if (job.minExperience != null && job.maxExperience != null) {
      return `${job.minExperience}-${job.maxExperience} Years of Experience`;
    }

    if (job.minExperience != null) {
      return `${job.minExperience}+ Years of Experience`;
    }

    return 'Experience not specified';
  });

  function getDescription(job: HiringApiJob): string {
    return job.jobDescriptionMarkdown?.trim() || job.description?.trim() || '';
  }

  function showJob(job: HiringApiJob) {
    selectedJob = job;
    descriptionHtml = renderMarkdown(getDescription(job));
  }

  $effect(() => {
    const transferredJob = takeSelectedJob(jobId);

    if (transferredJob) {
      showJob(transferredJob);
      isReady = true;
      return;
    }

    const controller = new AbortController();
    showJob(initialJob);
    isReady = true;

    void fetchHiringJobFromList(jobId, { signal: controller.signal })
      .then((liveJob) => {
        showJob(liveJob);
        refreshError = null;
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;

        refreshError =
          error instanceof Error ? error.message : 'Unable to refresh this job';
      });

    return () => controller.abort();
  });
</script>

<h1 class="mb-12 text-4xl font-bold text-base-content md:mb-16 md:text-5xl lg:text-6xl">
  {role}
</h1>

<div class="flex flex-col gap-12 lg:flex-row lg:gap-20">
  {#if isReady}
    <div class="cms-markdown job-markdown min-w-0 flex-1">
      {#if refreshError}
        <div class="alert alert-warning mb-6" role="status">
          <span>Live job details could not be refreshed. Showing the saved version.</span>
        </div>
      {/if}

      {#if descriptionHtml}
        {@html descriptionHtml}
      {:else}
        <p class="text-base-content/70">No job description is available yet.</p>
      {/if}
    </div>
  {:else}
    <div class="min-w-0 flex-1 space-y-5" aria-label="Loading job description">
      <div class="skeleton h-9 w-2/3"></div>
      <div class="skeleton h-4 w-full"></div>
      <div class="skeleton h-4 w-11/12"></div>
      <div class="skeleton h-4 w-4/5"></div>
    </div>
  {/if}

  <div class="shrink-0 lg:w-[380px]">
    <div class="sticky top-32 rounded-4xl bg-base-content/10 p-8 md:p-10">
      <div class="space-y-6">
        <div class="flex items-start justify-between gap-4 text-lg font-medium">
          <span class="shrink-0 text-base-content/70">Location:</span>
          <span class="text-right font-semibold text-base-content">{location}</span>
        </div>

        <div class="h-px w-full bg-base-content/20"></div>

        <div class="text-center text-xl font-bold text-base-content">
          {experience}
        </div>

        <div class="h-px w-full bg-base-content/20"></div>

        <div class="flex items-start justify-between gap-4 text-lg font-medium">
          <span class="shrink-0 text-base-content/70">Team:</span>
          <span class="text-right font-semibold text-base-content">{department}</span>
        </div>

        <div class="pt-4">
          <JobApplyModal {jobId} jobTitle={role} />
        </div>
      </div>
    </div>
  </div>
</div>
