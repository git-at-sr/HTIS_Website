import type { HiringApiJob } from '~/data/jobApi';

const JOB_STORAGE_PREFIX = 'htis:selected-job:';

function getStorageKey(jobId: string): string {
  return `${JOB_STORAGE_PREFIX}${jobId}`;
}

export function storeSelectedJob(job: HiringApiJob): void {
  try {
    sessionStorage.setItem(getStorageKey(String(job.jobId)), JSON.stringify(job));
  } catch (error) {
    console.error('Unable to store the selected job for navigation:', error);
  }
}

export function takeSelectedJob(jobId: string): HiringApiJob | null {
  try {
    const storageKey = getStorageKey(jobId);
    const storedJob = sessionStorage.getItem(storageKey);
    if (!storedJob) return null;

    // The stored record is a one-navigation handoff from the jobs listing.
    // Consuming it ensures a later direct visit still refreshes from the API.
    sessionStorage.removeItem(storageKey);

    const job = JSON.parse(storedJob) as Partial<HiringApiJob>;
    return String(job.jobId) === jobId ? (job as HiringApiJob) : null;
  } catch (error) {
    console.error('Unable to read the selected job after navigation:', error);
    return null;
  }
}
