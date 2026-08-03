<script>
  import { ArrowRight } from '@lucide/svelte';
  import CmsIconSvelte from './CmsIconSvelte.svelte';
  import CmsRichTextSvelte from './CmsRichTextSvelte.svelte';

  let { services = [] } = $props();

  // Open 'telecom' by default on mobile
  let active = $state('telecom');
</script>

<div class="flex w-full flex-col bg-base-100 md:hidden">
  <!-- Radial Greenish Blur Background -->
  <div class="relative w-full overflow-hidden">
    <div
      class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
    >
      <div class="h-[150%] w-[150%] rounded-full bg-primary/20 blur-[80px]"></div>
    </div>

    <div class="relative z-10 flex flex-col">
      {#each services as service}
        <div
          class="flex flex-col border-b-2 border-solid border-base-content/30 bg-base-100/70 backdrop-blur-md transition-colors last:border-b-0 hover:bg-base-100/90"
        >
          <!-- Header Row -->
          <div class="flex w-full items-center justify-between p-6">
            <button
              class="m-0 flex-1 cursor-pointer appearance-none border-none bg-transparent p-0 text-left"
              onclick={() => {
                active = active === service.id ? 'collapsed' : service.id;
              }}
              aria-expanded={active === service.id}
            >
              <h3 class="m-0 text-2xl leading-tight font-bold text-base-content/80">
                <CmsRichTextSvelte value={service.titleHtml} />
              </h3>
            </button>

            <a
              href={service.href}
              class="ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary transition-transform duration-300 hover:bg-primary/20 {active ===
              service.id
                ? '-rotate-45'
                : 'rotate-0'}"
              aria-label="Go to page"
            >
              <ArrowRight class="h-5 w-5" />
            </a>
          </div>

          <!-- Accordion Content (Features Grid & Metrics Grid) -->
          <div
            class="flex flex-col overflow-hidden transition-all duration-500 ease-in-out {active ===
            service.id
              ? 'max-h-[1500px] opacity-100'
              : 'max-h-0 opacity-0'}"
            aria-hidden={active !== service.id}
          >
            <!-- Features Grid (6 items: 3 columns x 2 rows) -->
            <div class="grid grid-cols-3 border-t border-solid border-base-content/30 bg-base-100/10">
              {#each service.features as feature, idx}
                <div
                  class="flex flex-col items-center justify-center p-3 text-center bg-base-100/40 border-solid border-base-content/30 {idx % 3 !== 2 ? 'border-r' : ''} {idx < 3 ? 'border-b' : ''}"
                >
                  <div class="mb-2 text-primary">
                    <CmsIconSvelte name={feature.iconName} size={32} />
                  </div>
                  <span class="text-xs font-semibold leading-tight text-base-content/80"
                    ><CmsRichTextSvelte value={feature.label} /></span
                  >
                </div>
              {/each}
            </div>

            <!-- Metrics Grid (4 items: 2 columns x 2 rows) -->
            <div class="grid grid-cols-2 border-t border-solid border-base-content/30 bg-base-100/20">
              {#each service.metrics as metric, idx}
                <div
                  class="flex flex-col items-center justify-center py-5 px-4 text-center border-solid border-base-content/30 {idx % 2 !== 1 ? 'border-r' : ''} {idx < 2 ? 'border-b' : ''}"
                >
                  <span class="mb-1 text-2xl font-bold text-primary"><CmsRichTextSvelte value={metric.value} /></span>
                  <span class="text-xs font-semibold leading-tight text-base-content/80"
                    ><CmsRichTextSvelte value={metric.label} /></span
                  >
                </div>
              {/each}
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
