<script lang="ts">
  import { onMount } from 'svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  interface TelecomMetric {
    target: number;
    showDecimalAnimation?: boolean;
    unit?: string;
    suffix?: string;
    label: string;
    subLabel?: string;
  }

  const defaultMetrics: TelecomMetric[] = [
    {
      target: 1.2,
      showDecimalAnimation: true,
      unit: 'M',
      suffix: '+',
      label: 'Sites Deployed',
      subLabel: '',
    },
    {
      target: 250,
      showDecimalAnimation: false,
      unit: 'K',
      suffix: '+',
      label: 'Routers Deployed',
      subLabel: '',
    },
    {
      target: 16,
      showDecimalAnimation: false,
      unit: '',
      suffix: '+',
      label: 'Telecom Circles (India)',
      subLabel: '',
    },
    {
      target: 8,
      showDecimalAnimation: false,
      unit: '',
      suffix: '+',
      label: 'Countries Served',
      subLabel: 'India, Bangladesh, Nepal, Sri Lanka, South Africa, UK, Nigeria, CAR',
    },
    {
      target: 3,
      showDecimalAnimation: false,
      unit: '',
      suffix: '/4',
      label: 'Major Indian Operators Served',
      subLabel: '',
    },
  ];

  let { metrics = defaultMetrics }: { metrics?: TelecomMetric[] } = $props();

  let currentValues = $state<number[]>([]);
  let sectionRef: HTMLElement;
  let isVisible = false;

  $effect(() => {
    if (!isVisible && currentValues.length !== metrics.length) {
      currentValues = metrics.map(() => 0);
    }
  });

  onMount(() => {
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

<div
  bind:this={sectionRef}
  class="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5 lg:gap-6"
>
  {#each metrics as metric, i}
    <div class="flex flex-col gap-2">
      <span class="text-5xl md:text-6xl font-bold text-primary">
        <CmsRichTextSvelte value={String(currentValues[i] ?? 0)} /><CmsRichTextSvelte
          value={metric.unit}
        /><span
          class={metric.suffix === '/4'
            ? 'text-4xl md:text-5xl font-light text-primary/60'
            : 'text-4xl md:text-5xl font-light'}
          ><CmsRichTextSvelte value={metric.suffix} /></span
        >
      </span>
      {#if metric.subLabel}
        <div class="flex flex-col">
          <CmsRichTextSvelte
            value={metric.label}
            className="font-medium text-base-content/70"
          />
          <CmsRichTextSvelte
            value={metric.subLabel}
            className="mt-1 text-xs leading-relaxed text-base-content"
          />
        </div>
      {:else}
        <CmsRichTextSvelte
          value={metric.label}
          className="font-medium text-base-content/70"
        />
      {/if}
    </div>
  {/each}
</div>
