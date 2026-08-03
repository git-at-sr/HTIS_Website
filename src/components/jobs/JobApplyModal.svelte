<script lang="ts">
  import {
    APPLY_JOB_ENDPOINT,
    fetchNoticePeriods,
    fetchTechnicalSkills,
    type JobApplicationPayload,
    type NoticePeriodOption,
    type TechnicalSkillOption,
  } from '~/data/jobApi';

  type Props = {
    jobId: string;
    jobTitle: string;
  };

  let { jobId, jobTitle }: Props = $props();

  // Dialog element binding
  let modalRef = $state<HTMLDialogElement | null>(null);

  // Form Fields
  let name = $state('');
  let dob = $state('');
  let contact = $state('');
  let email = $state('');
  let address = $state('');
  let previousCompany = $state('');
  let previousDesignation = $state('');
  let gender = $state('');
  let socialMediaUrl = $state('');
  let resumeFile = $state<File | null>(null);
  let totalExperience = $state<number | undefined>(undefined);
  let currentCTC = $state<number | undefined>(undefined);
  let expectedCTC = $state<number | undefined>(undefined);
  let noticePeriodId = $state<number | undefined>(undefined);
  let selectedSkills = $state<string[]>([]);
  let skillSearch = $state('');
  let willingToRelocate = $state<'' | 'Y' | 'N'>('');

  // API-backed field options
  let noticePeriods = $state<NoticePeriodOption[]>([]);
  let isLoadingNoticePeriods = $state(false);
  let noticePeriodsError = $state<string | null>(null);
  let skillSuggestions = $state<TechnicalSkillOption[]>([]);
  let isLoadingSkillSuggestions = $state(false);
  let skillSuggestionsError = $state<string | null>(null);
  let isSkillDropdownOpen = $state(false);
  let activeSkillIndex = $state(-1);
  let visibleSkillSuggestions = $derived(
    skillSuggestions.filter(
      (suggestion) =>
        !selectedSkills.some(
          (skill) =>
            skill.toLocaleLowerCase() ===
            suggestion.technicalSkillName.toLocaleLowerCase(),
        ),
    ),
  );
  let canAddCustomSkill = $derived(
    !isLoadingSkillSuggestions &&
      !!skillSearch.trim() &&
      !skillSuggestions.some(
        (suggestion) =>
          suggestion.technicalSkillName.toLocaleLowerCase() ===
          skillSearch.trim().toLocaleLowerCase(),
      ) &&
      !selectedSkills.some(
        (skill) => skill.toLocaleLowerCase() === skillSearch.trim().toLocaleLowerCase(),
      ),
  );
  let activeSkillOptionId = $derived(getSkillOptionId(activeSkillIndex));

  // Status & UI state
  let isSubmitting = $state(false);
  let isSuccess = $state(false);
  let errorMessage = $state<string | null>(null);
  let validationErrors = $state<Record<string, string>>({});

  $effect(() => {
    const query = skillSearch.trim();
    if (!query) {
      skillSuggestions = [];
      skillSuggestionsError = null;
      isLoadingSkillSuggestions = false;
      return;
    }

    const controller = new AbortController();
    isLoadingSkillSuggestions = true;
    skillSuggestionsError = null;

    const timeoutId = window.setTimeout(async () => {
      try {
        skillSuggestions = await fetchTechnicalSkills(query, {
          signal: controller.signal,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        skillSuggestions = [];
        skillSuggestionsError =
          'Suggestions are unavailable. You can add a custom skill.';
      } finally {
        if (!controller.signal.aborted) isLoadingSkillSuggestions = false;
      }
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  });

  $effect(() => {
    visibleSkillSuggestions;
    canAddCustomSkill;
    activeSkillIndex = -1;
  });

  async function loadNoticePeriods() {
    if (isLoadingNoticePeriods || noticePeriods.length > 0) return;

    isLoadingNoticePeriods = true;
    noticePeriodsError = null;
    try {
      noticePeriods = await fetchNoticePeriods();
    } catch (error) {
      console.error('Error loading notice periods:', error);
      noticePeriodsError = 'Unable to load notice periods.';
    } finally {
      isLoadingNoticePeriods = false;
    }
  }

  function addSkill(skillName: string) {
    const normalizedSkill = skillName.trim();
    if (
      !normalizedSkill ||
      selectedSkills.some(
        (skill) => skill.toLocaleLowerCase() === normalizedSkill.toLocaleLowerCase(),
      )
    ) {
      return;
    }

    selectedSkills = [...selectedSkills, normalizedSkill];
    skillSearch = '';
    skillSuggestions = [];
    activeSkillIndex = -1;
    validationErrors.skills = '';
  }

  function removeSkill(skillToRemove: string) {
    selectedSkills = selectedSkills.filter((skill) => skill !== skillToRemove);
  }

  function getSkillOptionId(index: number): string | undefined {
    if (index < 0) return undefined;
    if (index < visibleSkillSuggestions.length) {
      return `skill-option-${visibleSkillSuggestions[index].id}`;
    }
    if (canAddCustomSkill && index === visibleSkillSuggestions.length) {
      return 'skill-option-custom';
    }
    return undefined;
  }

  function getNavigableSkills(): string[] {
    const skills = visibleSkillSuggestions.map(
      (suggestion) => suggestion.technicalSkillName,
    );
    if (canAddCustomSkill) skills.push(skillSearch.trim());
    return skills;
  }

  function activateSkillOption(index: number) {
    activeSkillIndex = index;
    const optionId = getSkillOptionId(index);
    if (!optionId) return;

    window.requestAnimationFrame(() => {
      document.getElementById(optionId)?.scrollIntoView({ block: 'nearest' });
    });
  }

  function handleSkillKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isSkillDropdownOpen = false;
      activeSkillIndex = -1;
      return;
    }

    const navigableSkills = getNavigableSkills();

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      isSkillDropdownOpen = true;
      if (navigableSkills.length === 0) return;
      activateSkillOption((activeSkillIndex + 1) % navigableSkills.length);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      isSkillDropdownOpen = true;
      if (navigableSkills.length === 0) return;
      activateSkillOption(
        activeSkillIndex <= 0 ? navigableSkills.length - 1 : activeSkillIndex - 1,
      );
      return;
    }

    if (event.key !== 'Enter' && event.key !== ',') return;

    event.preventDefault();
    const query = skillSearch.trim();
    if (!query || isLoadingSkillSuggestions) return;

    if (activeSkillIndex >= 0 && navigableSkills[activeSkillIndex]) {
      addSkill(navigableSkills[activeSkillIndex]);
      return;
    }

    const exactSuggestion = skillSuggestions.find(
      (suggestion) =>
        suggestion.technicalSkillName.toLocaleLowerCase() === query.toLocaleLowerCase(),
    );
    addSkill(exactSuggestion?.technicalSkillName ?? query);
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      resumeFile = input.files[0];
      if (validationErrors.resume) {
        validationErrors.resume = '';
      }
    }
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = 'Full name is required';
    if (!dob) errors.dob = 'Date of birth is required';

    if (!contact) {
      errors.contact = 'Contact number is required';
    } else if (!/^[0-9]{10}$/.test(contact)) {
      errors.contact = 'Contact number must be exactly 10 digits';
    }

    if (!email) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address format';
    }

    if (!address.trim()) errors.address = 'Address is required';
    if (!gender) errors.gender = 'Gender is required';
    if (totalExperience !== undefined && totalExperience < 0)
      errors.totalExperience = 'Total experience cannot be negative';
    if (currentCTC !== undefined && currentCTC < 0)
      errors.currentCTC = 'Current CTC cannot be negative';
    if (expectedCTC !== undefined && expectedCTC < 0)
      errors.expectedCTC = 'Expected CTC cannot be negative';
    if (noticePeriodId !== undefined && !Number.isInteger(noticePeriodId))
      errors.noticePeriodId = 'Notice period ID must be a whole number';
    if (selectedSkills.length === 0) errors.skills = 'At least one skill is required';

    if (socialMediaUrl) {
      try {
        new URL(socialMediaUrl);
      } catch (_) {
        errors.socialMediaUrl =
          'Please enter a valid URL (e.g. https://linkedin.com/in/username)';
      }
    }

    if (!resumeFile) {
      errors.resume = 'Resume / CV file is required';
    } else {
      const maxSizeBytes = 10 * 1024 * 1024; // 10MB
      if (resumeFile.size > maxSizeBytes) {
        const fileSizeMB = (resumeFile.size / (1024 * 1024)).toFixed(2);
        errors.resume = `File size exceeds the 10MB limit (your file is ${fileSizeMB}MB)`;
      }
    }

    validationErrors = errors;
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    errorMessage = null;

    if (!validate()) return;

    isSubmitting = true;

    try {
      if (!resumeFile) {
        throw new Error('Resume / CV file is required');
      }

      const payload: JobApplicationPayload = {
        jobId: Number.parseInt(jobId, 10),
        name: name.trim(),
        dob: new Date(dob).toISOString(),
        contact,
        email,
        address: address.trim(),
        previousCompany: previousCompany.trim() || undefined,
        previousDesignation: previousDesignation.trim() || undefined,
        gender,
        socialMediaUrl: socialMediaUrl.trim() || undefined,
        resume: resumeFile,
        totalExperience,
        currentCTC,
        expectedCTC,
        noticePeriodId,
        skills: selectedSkills,
        willingToRelocate: willingToRelocate || 'N',
      };

      const formData = new FormData();
      formData.append('jobId', payload.jobId.toString());
      formData.append('name', payload.name);
      formData.append('dob', payload.dob);
      formData.append('contact', payload.contact);
      formData.append('email', payload.email);
      formData.append('address', payload.address);
      if (payload.previousCompany)
        formData.append('previousCompany', payload.previousCompany);
      if (payload.previousDesignation)
        formData.append('previousDesignation', payload.previousDesignation);
      formData.append('gender', payload.gender);
      if (payload.socialMediaUrl)
        formData.append('socialMediaUrl', payload.socialMediaUrl);
      formData.append('resume', payload.resume);
      if (payload.totalExperience !== undefined)
        formData.append('totalExperience', payload.totalExperience.toString());
      if (payload.currentCTC !== undefined)
        formData.append('currentCTC', payload.currentCTC.toString());
      if (payload.expectedCTC !== undefined)
        formData.append('expectedCTC', payload.expectedCTC.toString());
      if (payload.noticePeriodId !== undefined)
        formData.append('noticePeriodId', payload.noticePeriodId.toString());
      payload.skills.forEach((skill) => formData.append('skills', skill));
      if (payload.willingToRelocate)
        formData.append('willingToRelocate', payload.willingToRelocate);

      const response = await fetch(APPLY_JOB_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Server responded with an error');
      }

      const result = await response.json();
      if (result.success) {
        isSuccess = true;
      } else {
        throw new Error(result.message || 'Failed to submit application');
      }
    } catch (err: any) {
      console.error('Error applying for job:', err);
      errorMessage =
        err.message ||
        'An error occurred while submitting your application. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function openModal() {
    isSuccess = false;
    errorMessage = null;
    validationErrors = {};
    // Reset fields
    name = '';
    dob = '';
    contact = '';
    email = '';
    address = '';
    previousCompany = '';
    previousDesignation = '';
    gender = '';
    socialMediaUrl = '';
    resumeFile = null;
    totalExperience = undefined;
    currentCTC = undefined;
    expectedCTC = undefined;
    noticePeriodId = undefined;
    selectedSkills = [];
    skillSearch = '';
    skillSuggestions = [];
    skillSuggestionsError = null;
    isSkillDropdownOpen = false;
    activeSkillIndex = -1;
    willingToRelocate = '';
    void loadNoticePeriods();
    modalRef?.showModal();
  }

  function closeModal() {
    modalRef?.close();
  }
</script>

<div>
  <!-- Trigger Button -->
  <button
    onclick={openModal}
    class="btn w-full rounded-lg border-none bg-primary text-base tracking-wide text-primary-content shadow-md hover:bg-primary/95 transition-all duration-300 transform hover:scale-[1.01]"
  >
    Apply for this role &rarr;
  </button>

  <!-- DaisyUI Modal Dialog -->
  <dialog
    bind:this={modalRef}
    class="modal modal-bottom sm:modal-middle"
    oncancel={(e) => e.preventDefault()}
  >
    <div
      class="modal-box max-w-2xl bg-base-100 border border-base-200 shadow-2xl p-6 md:p-8 rounded-box transition-all"
    >
      <!-- Close button on top right -->
      <button
        onclick={closeModal}
        class="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
        aria-label="Close dialog"
      >
        ✕
      </button>

      {#if isSuccess}
        <!-- Success State View -->
        <div class="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div
            class="w-20 h-20 bg-success/10 text-success rounded-full flex items-center justify-center mb-6 animate-bounce"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-10 w-10 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-base-content mb-2">
            Application Submitted!
          </h3>
          <p class="text-base-content/70 max-w-md mb-8">
            Thank you for applying for the <strong>{jobTitle}</strong> position. Our recruiting
            team will review your application and contact you soon.
          </p>
          <button onclick={closeModal} class="btn btn-primary rounded-full px-8">
            Back to Careers
          </button>
        </div>
      {:else}
        <!-- Application Form View -->
        <div class="mb-6">
          <h3 class="text-2xl font-extrabold text-base-content">Apply for Role</h3>
          <p class="text-sm text-base-content/60 mt-1">{jobTitle}</p>
        </div>

        {#if errorMessage}
          <div class="alert alert-error shadow-sm mb-6 flex items-start">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="stroke-current shrink-0 h-6 w-6 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div class="text-sm">{errorMessage}</div>
          </div>
        {/if}

        <form onsubmit={handleSubmit} class="space-y-5">
          <!-- Two-column grid for fields -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Full Name -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Full Name</legend
              >
              <input
                type="text"
                placeholder="John Doe"
                class="input input-bordered w-full bg-base-100 {validationErrors.name
                  ? 'input-error'
                  : ''}"
                bind:value={name}
                disabled={isSubmitting}
                required
              />
              {#if validationErrors.name}
                <span class="text-xs text-error mt-1">{validationErrors.name}</span>
              {/if}
            </fieldset>

            <!-- Email Address -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Email Address</legend
              >
              <input
                type="email"
                placeholder="john.doe@example.com"
                class="input input-bordered w-full bg-base-100 {validationErrors.email
                  ? 'input-error'
                  : ''}"
                bind:value={email}
                disabled={isSubmitting}
                required
              />
              {#if validationErrors.email}
                <span class="text-xs text-error mt-1">{validationErrors.email}</span>
              {/if}
            </fieldset>

            <!-- Contact Number -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Contact Number</legend
              >
              <input
                type="tel"
                placeholder="9876543210"
                class="input input-bordered w-full bg-base-100 {validationErrors.contact
                  ? 'input-error'
                  : ''}"
                bind:value={contact}
                disabled={isSubmitting}
                required
              />
              {#if validationErrors.contact}
                <span class="text-xs text-error mt-1">{validationErrors.contact}</span>
              {/if}
            </fieldset>

            <!-- Date of Birth -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Date of Birth</legend
              >
              <input
                type="date"
                class="input input-bordered w-full bg-base-100 {validationErrors.dob
                  ? 'input-error'
                  : ''}"
                bind:value={dob}
                disabled={isSubmitting}
                required
              />
              {#if validationErrors.dob}
                <span class="text-xs text-error mt-1">{validationErrors.dob}</span>
              {/if}
            </fieldset>

            <!-- Gender -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Gender</legend
              >
              <select
                class="select select-bordered w-full bg-base-100 {validationErrors.gender
                  ? 'select-error'
                  : ''}"
                bind:value={gender}
                disabled={isSubmitting}
                required
              >
                <option value="" disabled>Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {#if validationErrors.gender}
                <span class="text-xs text-error mt-1">{validationErrors.gender}</span>
              {/if}
            </fieldset>

            <!-- Social Media / LinkedIn URL -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >LinkedIn / Portfolio URL</legend
              >
              <input
                type="url"
                placeholder="https://linkedin.com/in/username"
                class="input input-bordered w-full bg-base-100 {validationErrors.socialMediaUrl
                  ? 'input-error'
                  : ''}"
                bind:value={socialMediaUrl}
                disabled={isSubmitting}
              />
              {#if validationErrors.socialMediaUrl}
                <span class="text-xs text-error mt-1"
                  >{validationErrors.socialMediaUrl}</span
                >
              {/if}
            </fieldset>

            <!-- Previous Company -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Previous Company</legend
              >
              <input
                type="text"
                placeholder="Acme Inc."
                class="input input-bordered w-full bg-base-100 {validationErrors.previousCompany
                  ? 'input-error'
                  : ''}"
                bind:value={previousCompany}
                disabled={isSubmitting}
              />
              {#if validationErrors.previousCompany}
                <span class="text-xs text-error mt-1"
                  >{validationErrors.previousCompany}</span
                >
              {/if}
            </fieldset>

            <!-- Previous Designation -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Previous Designation</legend
              >
              <input
                type="text"
                placeholder="Software Engineer"
                class="input input-bordered w-full bg-base-100 {validationErrors.previousDesignation
                  ? 'input-error'
                  : ''}"
                bind:value={previousDesignation}
                disabled={isSubmitting}
              />
              {#if validationErrors.previousDesignation}
                <span class="text-xs text-error mt-1"
                  >{validationErrors.previousDesignation}</span
                >
              {/if}
            </fieldset>

            <!-- Total Experience -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Total Experience</legend
              >
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="e.g. 5.5"
                class="input input-bordered w-full bg-base-100 {validationErrors.totalExperience
                  ? 'input-error'
                  : ''}"
                bind:value={totalExperience}
                disabled={isSubmitting}
              />
              {#if validationErrors.totalExperience}
                <span class="text-xs text-error mt-1"
                  >{validationErrors.totalExperience}</span
                >
              {/if}
            </fieldset>

            <!-- Notice Period -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Notice Period</legend
              >
              <select
                class="select select-bordered w-full bg-base-100 {validationErrors.noticePeriodId
                  ? 'select-error'
                  : ''}"
                bind:value={noticePeriodId}
                disabled={isSubmitting || isLoadingNoticePeriods}
              >
                <option value={undefined}>
                  {isLoadingNoticePeriods
                    ? 'Loading notice periods...'
                    : 'Select notice period'}
                </option>
                {#each noticePeriods as period (period.id)}
                  <option value={period.id}>{period.noticePeriod}</option>
                {/each}
              </select>
              {#if noticePeriodsError}
                <span class="text-xs text-error mt-1">{noticePeriodsError}</span>
              {/if}
              {#if validationErrors.noticePeriodId}
                <span class="text-xs text-error mt-1"
                  >{validationErrors.noticePeriodId}</span
                >
              {/if}
            </fieldset>

            <!-- Current CTC -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Current CTC</legend
              >
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter current CTC"
                class="input input-bordered w-full bg-base-100 {validationErrors.currentCTC
                  ? 'input-error'
                  : ''}"
                bind:value={currentCTC}
                disabled={isSubmitting}
              />
              {#if validationErrors.currentCTC}
                <span class="text-xs text-error mt-1">{validationErrors.currentCTC}</span>
              {/if}
            </fieldset>

            <!-- Expected CTC -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Expected CTC</legend
              >
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter expected CTC"
                class="input input-bordered w-full bg-base-100 {validationErrors.expectedCTC
                  ? 'input-error'
                  : ''}"
                bind:value={expectedCTC}
                disabled={isSubmitting}
              />
              {#if validationErrors.expectedCTC}
                <span class="text-xs text-error mt-1">{validationErrors.expectedCTC}</span
                >
              {/if}
            </fieldset>

            <!-- Willing to Relocate -->
            <fieldset class="fieldset w-full">
              <legend class="fieldset-legend font-semibold text-base-content/80"
                >Willing to Relocate</legend
              >
              <select
                class="select select-bordered w-full bg-base-100"
                bind:value={willingToRelocate}
                disabled={isSubmitting}
              >
                <option value="">Select an option</option>
                <option value="Y">Yes</option>
                <option value="N">No</option>
              </select>
            </fieldset>
          </div>

          <!-- Skills (Span full width) -->
          <fieldset class="fieldset w-full">
            <legend class="fieldset-legend font-semibold text-base-content/80"
              >Skills</legend
            >
            <div class="relative">
              <div
                class="input input-bordered h-auto min-h-10 w-full flex-wrap gap-2 bg-base-100 py-2 {validationErrors.skills
                  ? 'input-error'
                  : ''}"
              >
                {#each selectedSkills as skill (skill)}
                  <span class="badge badge-primary gap-1 py-3">
                    {skill}
                    <button
                      type="button"
                      class="btn btn-ghost btn-circle btn-xs h-4 min-h-4 w-4"
                      aria-label={`Remove ${skill}`}
                      onclick={() => removeSkill(skill)}
                      disabled={isSubmitting}
                    >
                      &times;
                    </button>
                  </span>
                {/each}
                <input
                  type="text"
                  placeholder={selectedSkills.length
                    ? 'Add another skill'
                    : 'Search skills'}
                  class="min-w-40 flex-1 border-0 bg-transparent p-0 outline-none"
                  bind:value={skillSearch}
                  onfocus={() => (isSkillDropdownOpen = true)}
                  onblur={() => {
                    isSkillDropdownOpen = false;
                    activeSkillIndex = -1;
                  }}
                  onkeydown={handleSkillKeydown}
                  disabled={isSubmitting}
                  autocomplete="off"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls="skill-suggestions"
                  aria-label="Search or add a skill"
                  aria-expanded={isSkillDropdownOpen && !!skillSearch.trim()}
                  aria-activedescendant={activeSkillOptionId}
                />
                {#if isLoadingSkillSuggestions}
                  <span class="loading loading-spinner loading-xs text-base-content/50"
                  ></span>
                {/if}
              </div>

              {#if isSkillDropdownOpen && skillSearch.trim()}
                <div
                  id="skill-suggestions"
                  role="listbox"
                  class="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-box border border-base-300 bg-base-100 p-1 shadow-lg"
                >
                  {#each visibleSkillSuggestions as suggestion, index (suggestion.id)}
                    <button
                      id={`skill-option-${suggestion.id}`}
                      type="button"
                      role="option"
                      aria-selected={activeSkillIndex === index}
                      class="btn btn-ghost btn-sm h-auto min-h-9 w-full justify-start px-3 py-2 font-normal {activeSkillIndex ===
                      index
                        ? 'bg-base-200'
                        : ''}"
                      onmousedown={(event) => event.preventDefault()}
                      onmouseenter={() => (activeSkillIndex = index)}
                      onclick={() => addSkill(suggestion.technicalSkillName)}
                    >
                      {suggestion.technicalSkillName}
                    </button>
                  {/each}

                  {#if canAddCustomSkill}
                    <button
                      id="skill-option-custom"
                      type="button"
                      role="option"
                      aria-selected={activeSkillIndex === visibleSkillSuggestions.length}
                      class="btn btn-ghost btn-sm h-auto min-h-9 w-full justify-start px-3 py-2 text-primary {activeSkillIndex ===
                      visibleSkillSuggestions.length
                        ? 'bg-base-200'
                        : ''}"
                      onmousedown={(event) => event.preventDefault()}
                      onmouseenter={() =>
                        (activeSkillIndex = visibleSkillSuggestions.length)}
                      onclick={() => addSkill(skillSearch)}
                    >
                      Add &ldquo;{skillSearch.trim()}&rdquo;
                    </button>
                  {/if}

                  {#if skillSuggestionsError}
                    <p class="px-3 py-2 text-xs text-error">{skillSuggestionsError}</p>
                  {:else if !isLoadingSkillSuggestions && visibleSkillSuggestions.length === 0 && !canAddCustomSkill}
                    <p class="px-3 py-2 text-xs text-base-content/60">
                      No more matching skills.
                    </p>
                  {/if}
                </div>
              {/if}
            </div>
            <p class="fieldset-label text-base-content/50 mt-1">
              Select a suggestion or type a custom skill and press Enter.
            </p>
            {#if validationErrors.skills}
              <span class="text-xs text-error mt-1">{validationErrors.skills}</span>
            {/if}
          </fieldset>

          <!-- Full Address (Span full width) -->
          <fieldset class="fieldset w-full">
            <legend class="fieldset-legend font-semibold text-base-content/80"
              >Full Address</legend
            >
            <textarea
              placeholder="Your complete address..."
              class="textarea textarea-bordered w-full bg-base-100 h-20 {validationErrors.address
                ? 'textarea-error'
                : ''}"
              bind:value={address}
              disabled={isSubmitting}
              required
            ></textarea>
            {#if validationErrors.address}
              <span class="text-xs text-error mt-1">{validationErrors.address}</span>
            {/if}
          </fieldset>

          <!-- Resume Upload (Span full width) -->
          <fieldset class="fieldset w-full">
            <legend class="fieldset-legend font-semibold text-base-content/80"
              >Resume / CV (PDF or Word)</legend
            >
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              class="file-input file-input-bordered w-full bg-base-100 {validationErrors.resume
                ? 'file-input-error'
                : ''}"
              onchange={handleFileChange}
              disabled={isSubmitting}
              required
            />
            <p class="fieldset-label text-base-content/50 mt-1">
              Accepted formats: PDF, DOC, DOCX. Max size 10MB.
            </p>
            {#if validationErrors.resume}
              <span class="text-xs text-error mt-1">{validationErrors.resume}</span>
            {/if}
          </fieldset>

          <!-- Form Actions -->
          <div class="modal-action flex justify-end gap-3 pt-4 border-t border-base-200">
            <button
              type="button"
              onclick={closeModal}
              class="btn btn-ghost rounded-full px-6"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary rounded-full px-8 min-w-[140px]"
              disabled={isSubmitting}
            >
              {#if isSubmitting}
                <span class="loading loading-spinner loading-xs"></span>
                Submitting
              {:else}
                Submit Application
              {/if}
            </button>
          </div>
        </form>
      {/if}
    </div>
  </dialog>
</div>
