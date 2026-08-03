<script lang="ts">
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface ResourcingMetric {
    target: number;
    showDecimalAnimation?: boolean;
    unit?: string;
    suffix?: string;
    label: string;
    subLabel?: string;
  }

  const defaultMetrics: ResourcingMetric[] = [
    { target: 1200, suffix: '+', label: 'Sites Deployed' },
    { target: 98, suffix: '%', label: 'On-Time Delivery' },
    { target: 3, suffix: 'x', label: 'Faster Rollouts' },
    { target: 54, suffix: '+', label: 'Industries Served' },
  ];

  let {
    sectionId,
    heading = 'Built to Execute. Scaled to Deliver.',
    metrics = defaultMetrics,
  }: {
    sectionId?: string;
    heading?: string;
    metrics?: ResourcingMetric[];
  } = $props();

  let currentValues = $state<number[]>([]);
  let sectionRef: HTMLElement | undefined = $state();
  let isVisible = $state(false);

  $effect(() => {
    if (!isVisible && currentValues.length !== metrics.length) {
      currentValues = metrics.map(() => 0);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isVisible) {
          isVisible = true;
          animateValues();
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef) {
      observer.observe(sectionRef);
    }

    return () => {
      if (sectionRef) observer.unobserve(sectionRef);
    };
  });

  function animateValues() {
    currentValues = metrics.map(() => 0);

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      currentValues = metrics.map((m) => {
        const val = m.target * easeOutQuart;
        return m.showDecimalAnimation
          ? Number(Math.min(val, m.target).toFixed(1))
          : Math.min(Math.floor(val), m.target);
      });

      if (step >= steps) {
        clearInterval(timer);
        currentValues = metrics.map((m) => m.target);
      }
    }, interval);
  }
</script>

<section id={sectionId} bind:this={sectionRef} class="pt-0 pb-16">
  <div class="mb-12">
    <h2
      class="text-4xl leading-tight font-bold whitespace-pre-line text-base-content md:text-5xl"
    >
      <CmsRichTextSvelte value={heading} />
    </h2>
  </div>

  <div
    class="grid grid-cols-2 gap-8 border-b border-base-content/10 pb-12 md:grid-cols-4"
  >
    {#each metrics as metric, i}
      <div class="flex flex-col gap-2">
        <div class="flex items-baseline text-primary">
          <span class="text-5xl font-bold md:text-6xl"
            ><CmsRichTextSvelte value={String(currentValues[i] ?? 0)} /><CmsRichTextSvelte
              value={metric.unit}
            /><span class="text-4xl font-light md:text-5xl"
              ><CmsRichTextSvelte value={metric.suffix} /></span
            ></span
          >
        </div>
        <span class="text-sm font-medium text-base-content/70 md:text-base">
          <CmsRichTextSvelte value={metric.label} />
        </span>
        {#if metric.subLabel}
          <span class="text-xs leading-relaxed text-base-content/60">
            <CmsRichTextSvelte value={metric.subLabel} />
          </span>
        {/if}
      </div>
    {/each}
  </div>
</section>
