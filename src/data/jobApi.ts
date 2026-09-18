import { jobs } from './cms';

export const JOB_LIST_ENDPOINT = jobs.api.jobListEndpoint;
export const JOB_DETAIL_ENDPOINT = jobs.api.jobDetailEndpoint;
export const APPLY_JOB_ENDPOINT = jobs.api.applyJobEndpoint;
export const NOTICE_PERIOD_DDL_ENDPOINT = jobs.api.noticePeriodDdlEndpoint;
export const TECHNICAL_SKILL_AUTOFILL_ENDPOINT = jobs.api.technicalSkillAutoFillEndpoint;
export const LOCATION_DDL_ENDPOINT = jobs.api.locationDdlEndpoint;
export const DEPARTMENT_DDL_ENDPOINT = jobs.api.departmentDdlEndpoint;
export const HIRING_STATUS_ENDPOINT = jobs.api.statusEndpoint;

const DEFAULT_PAGE_SIZE = 50;

export interface HiringApiJob {
  // Astro route props normalize IDs to strings even though the upstream API returns integers.
  jobId: string | number;
  jobCode?: string;
  department?: string;
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

export interface LocationOption {
  locationId: number;
  locationName: string;
}

export interface DepartmentOption {
  departmentId: number;
  departmentName: string;
}

export interface HiringApiEnvelope<TData> {
  success: boolean;
  data: TData;
  message?: string;
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

export interface FetchHiringJobsOptions {
  signal?: AbortSignal;
  pageNumber?: number;
  pageSize?: number;
  departmentIds?: Array<string | number>;
  locationIds?: Array<string | number>;
  /** When true (default), follows totalCount across pages. */
  fetchAllPages?: boolean;
}

export interface HiringJobsResult {
  jobs: HiringApiJob[];
  totalCount: number;
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

function isHiringApiJob(value: unknown): value is HiringApiJob {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HiringApiJob>;
  return candidate.jobId !== undefined;
}

function isOptionListResponse<T>(value: unknown): value is HiringApiEnvelope<T[]> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HiringApiEnvelope<T[]>>;
  return candidate.success === true && Array.isArray(candidate.data);
}

function joinIds(ids?: Array<string | number>): string {
  if (!ids?.length) return '';
  return ids.map(String).filter(Boolean).join(',');
}

function buildJobListUrl(options: FetchHiringJobsOptions): string {
  const url = new URL(JOB_LIST_ENDPOINT);
  url.searchParams.set('pageNumber', String(options.pageNumber ?? 1));
  url.searchParams.set('pageSize', String(options.pageSize ?? DEFAULT_PAGE_SIZE));

  const departmentIds = joinIds(options.departmentIds);
  const locationIds = joinIds(options.locationIds);

  if (departmentIds) url.searchParams.set('departmentIds', departmentIds);
  if (locationIds) url.searchParams.set('locationIds', locationIds);

  return url.toString();
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

/**
 * Converts a raw Hiring API job record into the smaller view model used by the
 * jobs listing table and its client-side filters.
 */
export function mapApiJobToListItem(job: HiringApiJob): JobListItem {
  return {
    id: normalizeJobId(job.jobId),
    role: job.title?.trim() || '',
    department: job.department?.trim() || 'Other',
    location: job.location?.trim() || 'Remote',
  };
}

/** Fetches a single JobList page and returns jobs + totalCount. */
export async function fetchHiringJobsPage(
  options: FetchHiringJobsOptions = {},
): Promise<HiringJobsResult> {
  const response = await fetch(buildJobListUrl(options), { signal: options.signal });

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

  return {
    jobs: result.data,
    totalCount: typeof result.totalCount === 'number' ? result.totalCount : result.data.length,
  };
}

/**
 * Fetches job list pages from the Hiring API. By default follows totalCount until
 * all matching jobs are loaded.
 */
export async function fetchHiringJobs(
  options: FetchHiringJobsOptions = {},
): Promise<HiringApiJob[]> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const fetchAllPages = options.fetchAllPages !== false;
  const firstPage = await fetchHiringJobsPage({
    ...options,
    pageNumber: options.pageNumber ?? 1,
    pageSize,
  });

  if (!fetchAllPages || firstPage.jobs.length >= firstPage.totalCount) {
    return firstPage.jobs;
  }

  const jobs = [...firstPage.jobs];
  let pageNumber = (options.pageNumber ?? 1) + 1;

  while (jobs.length < firstPage.totalCount) {
    const page = await fetchHiringJobsPage({
      ...options,
      pageNumber,
      pageSize,
    });

    if (page.jobs.length === 0) break;

    jobs.push(...page.jobs);
    pageNumber += 1;
  }

  return jobs;
}

/** Fetches a single job record from the Hiring detail endpoint. */
export async function fetchHiringJobDetail(
  jobId: string,
  options: { signal?: AbortSignal } = {},
): Promise<HiringApiJob> {
  const response = await fetch(`${JOB_DETAIL_ENDPOINT}/${jobId}`, {
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`JobDetail request failed with status ${response.status}`);
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) {
    throw new Error(
      `JobDetail request returned unexpected content-type: ${contentType || 'unknown'}`,
    );
  }

  const result = await response.json();
  if (isJobDetailResponse(result)) {
    return {
      ...result.data,
      jobId: normalizeJobId(result.data.jobId),
    };
  }

  if (isHiringApiJob(result)) {
    return {
      ...result,
      jobId: normalizeJobId(result.jobId),
    };
  }

  throw new Error('JobDetail response payload does not match any supported shape');
}

/** @deprecated Prefer fetchHiringJobDetail — kept for any remaining list-based lookups. */
export async function fetchHiringJobFromList(
  jobId: string,
  options: { signal?: AbortSignal } = {},
): Promise<HiringApiJob> {
  return fetchHiringJobDetail(jobId, options);
}

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

export function fetchLocations(
  options: { signal?: AbortSignal; departmentIds?: Array<string | number> } = {},
): Promise<LocationOption[]> {
  const url = new URL(LOCATION_DDL_ENDPOINT);
  const departmentIds = joinIds(options.departmentIds);
  if (departmentIds) url.searchParams.set('departmentIds', departmentIds);

  return fetchOptionList<LocationOption>(url.toString(), 'LocationDdl', options.signal);
}

export function fetchDepartments(
  options: { signal?: AbortSignal; locationIds?: Array<string | number> } = {},
): Promise<DepartmentOption[]> {
  const url = new URL(DEPARTMENT_DDL_ENDPOINT);
  const locationIds = joinIds(options.locationIds);
  if (locationIds) url.searchParams.set('locationIds', locationIds);

  return fetchOptionList<DepartmentOption>(
    url.toString(),
    'DepartmentDdl',
    options.signal,
  );
}

export async function checkHiringApiStatus(
  options: { signal?: AbortSignal } = {},
): Promise<boolean> {
  try {
    const response = await fetch(HIRING_STATUS_ENDPOINT, { signal: options.signal });
    if (!response.ok) return false;
    const result: unknown = await response.json();
    return (
      !!result &&
      typeof result === 'object' &&
      (result as { success?: boolean }).success === true
    );
  } catch {
    return false;
  }
}

/** Builds static job detail routes from the live Hiring API. */
export async function getJobStaticPaths(): Promise<JobStaticPath[]> {
  const apiJobs = await fetchHiringJobs({ pageSize: DEFAULT_PAGE_SIZE, fetchAllPages: true });
  return apiJobs.map(createStaticPath);
}
