import { jobs } from './cms';

export const JOB_LIST_ENDPOINT = jobs.api.jobListEndpoint;
export const JOB_DETAIL_ENDPOINT = jobs.api.jobDetailEndpoint;
export const APPLY_JOB_ENDPOINT = jobs.api.applyJobEndpoint;
export const NOTICE_PERIOD_DDL_ENDPOINT = jobs.api.noticePeriodDdlEndpoint;
export const TECHNICAL_SKILL_AUTOFILL_ENDPOINT = jobs.api.technicalSkillAutoFillEndpoint;

export interface HiringApiJob {
  // Astro route props normalize IDs to strings even though the upstream API returns integers.
  jobId: string | number;
  jobCode?: string;
  title?: string;
  requiredDateOfJoining?: string;
  vacancies?: number;
  location?: string;
  employmentType?: string;
  skills?: string;
  qualification?: string;
  ageLimit?: number;
  minExperience?: number;
  maxExperience?: number;
  minCtc?: string;
  maxCtc?: string;
  gender?: string;
  description?: string;
  jobDescriptionMarkdown?: string;
}

export interface JobListItem {
  id: string;
  role: string;
  department: string;
  location: string;
}

export interface NoticePeriodOption {
  id: number;
  noticePeriod: string;
}

export interface TechnicalSkillOption {
  id: number;
  technicalSkillName: string;
}

export interface HiringApiEnvelope<TData> {
  success: boolean;
  data: TData;
}

export interface JobApplicationPayload {
  jobId: number;
  name: string;
  dob: string;
  contact: string;
  email: string;
  address: string;
  previousCompany?: string;
  previousDesignation?: string;
  gender: string;
  socialMediaUrl?: string;
  resume: File;
  totalExperience?: number;
  currentCTC?: number;
  expectedCTC?: number;
  noticePeriodId?: number;
  skills: string[];
  willingToRelocate?: string;
}

type JobListResponse = HiringApiEnvelope<HiringApiJob[]> & {
  totalCount?: number;
};

type JobDetailResponse = HiringApiEnvelope<HiringApiJob>;

type JobStaticPath = {
  params: { id: string };
  props: { apiJob: HiringApiJob };
};

function normalizeJobId(jobId: HiringApiJob['jobId']): string {
  return String(jobId);
}

function createStaticPath(job: HiringApiJob): JobStaticPath {
  return {
    params: { id: normalizeJobId(job.jobId) },
    props: {
      apiJob: {
        ...job,
        jobId: normalizeJobId(job.jobId),
      },
    },
  };
}

function isJobListResponse(value: unknown): value is JobListResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<JobListResponse>;
  return candidate.success === true && Array.isArray(candidate.data);
}

function isJobDetailResponse(value: unknown): value is JobDetailResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<JobDetailResponse>;
  return (
    candidate.success === true && !!candidate.data && typeof candidate.data === 'object'
  );
}

function isOptionListResponse<T>(value: unknown): value is HiringApiEnvelope<T[]> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HiringApiEnvelope<T[]>>;
  return candidate.success === true && Array.isArray(candidate.data);
}

async function fetchOptionList<T>(
  endpoint: string,
  label: string,
  signal?: AbortSignal,
): Promise<T[]> {
  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`${label} request failed with status ${response.status}`);
  }

  const result: unknown = await response.json();
  if (!isOptionListResponse<T>(result)) {
    throw new Error(`${label} response does not match the documented shape`);
  }

  return result.data;
}

// function isHiringApiJob(value: unknown): value is HiringApiJob {
//   if (!value || typeof value !== 'object') {
//     return false;
//   }

//   const candidate = value as Partial<HiringApiJob>;
//   return candidate.jobId !== undefined;
// }

/**
 * Converts a raw Hiring API job record into the smaller view model used by the
 * jobs listing table and its client-side filters.
 */
export function mapApiJobToListItem(job: HiringApiJob): JobListItem {
  return {
    id: normalizeJobId(job.jobId),
    role: job.title?.trim() || '',
    department: job.skills?.trim() || 'Other',
    location: job.location?.trim() || 'Remote',
  };
}

/**
 * Fetches the job list from the Hiring API and validates the documented JSON
 * envelope before returning the raw job records.
 */
export async function fetchHiringJobs(
  options: { signal?: AbortSignal } = {},
): Promise<HiringApiJob[]> {
  const response = await fetch(JOB_LIST_ENDPOINT, { signal: options.signal });

  if (!response.ok) {
    throw new Error(`JobList request failed with status ${response.status}`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    throw new Error(
      `JobList request returned unexpected content-type: ${contentType || 'unknown'}`,
    );
  }

  const result = await response.json();
  if (!isJobListResponse(result)) {
    throw new Error(
      'JobList response payload does not match the documented success/data shape',
    );
  }

  return result.data;
}

/** Fetches the current job list and returns the record matching the route ID. */
export async function fetchHiringJobFromList(
  jobId: string,
  options: { signal?: AbortSignal } = {},
): Promise<HiringApiJob> {
  const apiJobs = await fetchHiringJobs(options);
  const job = apiJobs.find((candidate) => normalizeJobId(candidate.jobId) === jobId);

  if (!job) {
    throw new Error(`Job ${jobId} was not found in the current JobList response`);
  }

  return {
    ...job,
    jobId: normalizeJobId(job.jobId),
  };
}

/**
 * Fetches a single job record from the Hiring detail endpoint and accepts both
 * the documented success/data envelope and the live bare-object response shape.
 */
// export async function fetchHiringJobDetail(
//   jobId: string,
//   options: { signal?: AbortSignal } = {},
// ): Promise<HiringApiJob> {
//   const response = await fetch(`${JOB_DETAIL_ENDPOINT}/${jobId}`, {
//     signal: options.signal,
//   });

//   if (!response.ok) {
//     throw new Error(`JobDetail request failed with status ${response.status}`);
//   }

//   const contentType = (response.headers.get('content-type') || '').toLowerCase();
//   if (!contentType.includes('application/json')) {
//     throw new Error(
//       `JobDetail request returned unexpected content-type: ${contentType || 'unknown'}`,
//     );
//   }

//   const result = await response.json();
//   if (isJobDetailResponse(result)) {
//     return {
//       ...result.data,
//       jobId: normalizeJobId(result.data.jobId),
//     };
//   }

//   if (isHiringApiJob(result)) {
//     return {
//       ...result,
//       jobId: normalizeJobId(result.jobId),
//     };
//   }

//   throw new Error('JobDetail response payload does not match any supported shape');
// }

export function fetchNoticePeriods(
  options: { signal?: AbortSignal } = {},
): Promise<NoticePeriodOption[]> {
  return fetchOptionList<NoticePeriodOption>(
    NOTICE_PERIOD_DDL_ENDPOINT,
    'NoticePeriodDdl',
    options.signal,
  );
}

export function fetchTechnicalSkills(
  search: string,
  options: { signal?: AbortSignal } = {},
): Promise<TechnicalSkillOption[]> {
  const url = new URL(TECHNICAL_SKILL_AUTOFILL_ENDPOINT);
  url.searchParams.set('search', search);
  return fetchOptionList<TechnicalSkillOption>(
    url.toString(),
    'TechnicalSkillAutoFill',
    options.signal,
  );
}

/** Builds static job detail routes from the live Hiring API. */
export async function getJobStaticPaths(): Promise<JobStaticPath[]> {
  const apiJobs = await fetchHiringJobs();
  return apiJobs.map(createStaticPath);
}
