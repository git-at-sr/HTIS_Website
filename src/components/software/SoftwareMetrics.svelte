<script lang="ts">
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface SoftwareMetric {
    target: number;
    showDecimalAnimation?: boolean;
    unit?: string;
    suffix?: string;
    label: string;
    subLabel?: string;
  }

  const defaultMetrics: SoftwareMetric[] = [
    { target: 3000, unit: '', suffix: '+', label: 'Daily Active Users' },
    {
      target: 99.9,
      unit: '',
      suffix: '%',
      label: 'SLA Uptime',
      showDecimalAnimation: true,
    },
    { target: 18, unit: '', suffix: '', label: 'Core Software Engineers' },
    { target: 150, unit: '', suffix: '+', label: 'Production Deployments' },
  ];

  let { metrics = defaultMetrics }: { metrics?: SoftwareMetric[] } = $props();

  let currentValues = $state<number[]>([]);
  let sectionRef: HTMLElement | undefined = $state();
  let isVisible = $state(false);

  $effect(() => {
    if (!isVisible && currentValues.length !== metrics.length) {
      currentValues = metrics.map(() => 0);
    }
  });

  $effect(() => {
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

<div bind:this={sectionRef} class="grid grid-cols-2 md:grid-cols-4 gap-8">
  {#each metrics as metric, i}
    <div class="flex flex-col gap-2">
      <div class="flex items-baseline text-primary">
        <span class="text-5xl md:text-6xl font-bold"
          >{#if metric.target >= 1000 && currentValues[i] >= 1000}{currentValues[
              i
            ].toLocaleString()}{:else}{currentValues[i]}{/if}<span
            class="text-4xl md:text-5xl font-light"><CmsRichTextSvelte
              value={metric.unit}
            /><CmsRichTextSvelte value={metric.suffix} /></span
          ></span
        >
      </div>
      <CmsRichTextSvelte
        value={metric.label}
        className="text-sm font-medium text-base-content/70 md:text-base"
      />
      {#if metric.subLabel}
        <CmsRichTextSvelte
          value={metric.subLabel}
          className="text-xs leading-relaxed text-base-content/60"
        />
      {/if}
    </div>
  {/each}
</div>
