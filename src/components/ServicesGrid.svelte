<script>
  import { ArrowRight } from '@lucide/svelte';
  import CmsIconSvelte from './CmsIconSvelte.svelte';
  import CmsRichTextSvelte from './CmsRichTextSvelte.svelte';

  let { services = [] } = $props();

  let active = $state('collapsed');
  let gridRef = $state();
  let activeTooltip = $state(null);

  // 5x5 geometric grid mapping - Perfect 4x4 Expanded Square
  const stateLayouts = {
    collapsed: {
      titles: {
        telecom: { c: 0, r: 0, cs: 2.5, rs: 2.5 },
        software: { c: 2.5, r: 0, cs: 2.5, rs: 2.5 },
        system: { c: 0, r: 2.5, cs: 2.5, rs: 2.5 },
        resourcing: { c: 2.5, r: 2.5, cs: 2.5, rs: 2.5 },
      },
      icons: Array(6).fill({ c: 2, r: 2 }),
      stats: Array(4).fill({ c: 2, r: 2 }),
    },
    telecom: {
      titles: {
        telecom: { c: 0, r: 0, cs: 3, rs: 2 },
        software: { c: 4, r: 0, cs: 1, rs: 4 },
        system: { c: 0, r: 4, cs: 3, rs: 1 },
        resourcing: { c: 3, r: 4, cs: 2, rs: 1 },
      },
      icons: [
        { c: 0, r: 2 },
        { c: 1, r: 2 },
        { c: 2, r: 2 },
        { c: 0, r: 3 },
        { c: 1, r: 3 },
        { c: 2, r: 3 },
      ],
      stats: [
        { c: 3, r: 0 },
        { c: 3, r: 1 },
        { c: 3, r: 2 },
        { c: 3, r: 3 },
      ],
    },
    resourcing: {
      titles: {
        telecom: { c: 0, r: 0, cs: 3, rs: 1 },
        software: { c: 3, r: 0, cs: 2, rs: 1 },
        system: { c: 0, r: 1, cs: 1, rs: 4 },
        resourcing: { c: 1, r: 1, cs: 3, rs: 2 },
      },
      icons: [
        { c: 1, r: 3 },
        { c: 2, r: 3 },
        { c: 3, r: 3 },
        { c: 1, r: 4 },
        { c: 2, r: 4 },
        { c: 3, r: 4 },
      ],
      stats: [
        { c: 4, r: 1 },
        { c: 4, r: 2 },
        { c: 4, r: 3 },
        { c: 4, r: 4 },
      ],
    },
    software: {
      titles: {
        telecom: { c: 0, r: 0, cs: 1, rs: 4 },
        software: { c: 1, r: 0, cs: 3, rs: 2 },
        system: { c: 0, r: 4, cs: 3, rs: 1 },
        resourcing: { c: 3, r: 4, cs: 2, rs: 1 },
      },
      icons: [
        { c: 1, r: 2 },
        { c: 2, r: 2 },
        { c: 3, r: 2 },
        { c: 1, r: 3 },
        { c: 2, r: 3 },
        { c: 3, r: 3 },
      ],
      stats: [
        { c: 4, r: 0 },
        { c: 4, r: 1 },
        { c: 4, r: 2 },
        { c: 4, r: 3 },
      ],
    },
    system: {
      titles: {
        telecom: { c: 0, r: 0, cs: 3, rs: 1 },
        software: { c: 3, r: 0, cs: 2, rs: 1 },
        system: { c: 0, r: 1, cs: 3, rs: 2 },
        resourcing: { c: 4, r: 1, cs: 1, rs: 4 },
      },
      icons: [
        { c: 0, r: 3 },
        { c: 1, r: 3 },
        { c: 2, r: 3 },
        { c: 0, r: 4 },
        { c: 1, r: 4 },
        { c: 2, r: 4 },
      ],
      stats: [
        { c: 3, r: 1 },
        { c: 3, r: 2 },
        { c: 3, r: 3 },
        { c: 3, r: 4 },
      ],
    },
  };

  const activeServiceLayouts = {
    telecom: { c: 0, r: 0, cs: 4, rs: 4 },
    software: { c: 1, r: 0, cs: 4, rs: 4 },
    system: { c: 0, r: 1, cs: 4, rs: 4 },
    resourcing: { c: 1, r: 1, cs: 4, rs: 4 },
  };

  const mobileOrder = {
    telecom: 'order-1',
    icons: 'order-2',
    stats: 'order-3',
    software: 'order-4',
    system: 'order-5',
    resourcing: 'order-6',
  };

  function getStyle(c, r, cs = 1, rs = 1) {
    return `--md-top: ${r * 20}%; --md-left: ${c * 20}%; --md-w: ${cs * 20}%; --md-h: ${rs * 20}%; --md-z: ${30 - c * 5 - r};`;
  }

  function getBorders(c, r, cs = 1, rs = 1, type = 'title', idx = 0) {
    let classes = 'border-base-content/30 border-solid ';

    // Mobile borders
    if (type === 'icon') {
      if (idx % 3 !== 2) classes += 'border-r-2 ';
      if (idx < 3) classes += 'border-b-2 ';
    } else if (type === 'stat') {
      if (idx < 3) classes += 'border-b-2 ';
    } else {
      classes += 'border-b-2 ';
    }

    // Desktop borders
    if (c + cs < 5) classes += 'md:border-r-2 ';
    else classes += 'md:border-r-0 ';

    if (r + rs < 5) classes += 'md:border-b-2 ';
    else classes += 'md:border-b-0 ';

    return classes;
  }

  $effect(() => {
    // Open by default on mobile, no observer needed
    if (window.innerWidth < 768) {
      if (active === 'collapsed') active = 'telecom';
      return;
    }

    if (!gridRef) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && active === 'collapsed') active = 'telecom';
      },
      { threshold: 0.9 },
    );
    observer.observe(gridRef);
    return () => observer.disconnect();
  });
</script>

<div
  bind:this={gridRef}
  class="relative hidden md:block w-full md:aspect-square bg-base-100 lg:w-[60%]"
>
  <!-- Radial Greenish Blur Background -->
  <div class="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
    <div
      class="w-full h-full md:w-[80%] md:h-[80%] rounded-full bg-primary/20 blur-[80px]"
    ></div>
  </div>
  {#each services as service}
    {@const pos = stateLayouts[active].titles[service.id]}
    <a
      href={service.href}
      class="grid-block flex cursor-pointer no-underline transition-all duration-700 ease-in-out hover:bg-base-100/90 hover:shadow-lg hover:outline-2 hover:-outline-offset-2 hover:outline-primary bg-base-100/70 backdrop-blur-md p-6 md:p-8 {mobileOrder[
        service.id
      ]} {getBorders(pos.c, pos.r, pos.cs, pos.rs, 'title', 0)} {active === service.id
        ? 'flex-row items-center justify-between text-left'
        : 'flex-col items-center justify-center text-center'}"
      style={getStyle(pos.c, pos.r, pos.cs, pos.rs)}
      onpointerenter={(e) => {
        // Preserve hover expansion for mouse users without letting touch devices
        // synthesize a hover that skips the first-tap-to-expand behavior.
        if (e.pointerType === 'mouse') active = service.id;
      }}
      onfocus={() => (active = service.id)}
      onclick={(e) => {
        if (active !== service.id) {
          e.preventDefault();
          active = service.id;
        }
      }}
    >
      <h3
        class="font-bold text-base-content/80 transition-all duration-700 {active ===
        service.id
          ? 'text-2xl md:text-3xl mt-0'
          : active === 'collapsed'
            ? 'text-2xl md:text-4xl mt-0'
            : 'text-xl mt-8 md:mt-4'}"
      >
        <CmsRichTextSvelte value={service.titleHtml} />
      </h3>

      <div
        class="{active === service.id
          ? 'relative shrink-0'
          : 'absolute top-4 right-4'} flex h-8 w-8 items-center justify-center rounded-full border border-primary bg-primary/10 text-primary transition-transform duration-700 {active ===
        service.id
          ? '-rotate-45'
          : 'rotate-0'}"
      >
        <ArrowRight class="w-4 h-4" />
      </div>
    </a>
  {/each}

  <!-- Icons Drawer -->
  <div class="relative w-full h-[250px] md:h-auto md:contents {mobileOrder.icons}">
    {#each services as service}
      <div
        aria-hidden={active !== service.id}
        class="absolute inset-0 grid grid-cols-3 grid-rows-2 md:static md:contents transition-opacity duration-700 {active ===
        service.id
          ? 'opacity-100 z-10 pointer-events-auto'
          : 'opacity-0 z-0 pointer-events-none md:opacity-100'}"
      >
        {#each service.features as feature, idx}
          {@const pos = stateLayouts[active].icons[idx]}
          <button
            type="button"
            onclick={(e) => {
              e.stopPropagation();
              activeTooltip =
                activeTooltip === `${service.id}-${idx}` ? null : `${service.id}-${idx}`;
            }}
            onmouseleave={() => {
              activeTooltip = null;
            }}
            onblur={() => {
              activeTooltip = null;
            }}
            class="grid-block tooltip tooltip-primary flex flex-col items-center justify-center p-2 lg:p-3 text-center bg-base-100/70 backdrop-blur-md hover:bg-primary/5 hover:outline-2 hover:-outline-offset-2 hover:outline-primary md:transition-all md:duration-700 ease-in-out {getBorders(
              pos.c,
              pos.r,
              1,
              1,
              'icon',
              idx,
            )} {active === service.id
              ? 'md:opacity-100 md:pointer-events-auto'
              : 'md:opacity-0 md:pointer-events-none'} {activeTooltip ===
            `${service.id}-${idx}`
              ? 'tooltip-open'
              : ''}"
            style={getStyle(pos.c, pos.r)}
            data-tip={feature.description}
          >
            <div class="mb-2 text-primary">
              <CmsIconSvelte name={feature.iconName} size={40} />
            </div>
            <span class="text-xs lg:text-sm font-semibold text-base-content/80"
              ><CmsRichTextSvelte value={feature.label} /></span
            >
          </button>
        {/each}
      </div>
    {/each}
  </div>

  <!-- Stats Box -->
  <div class="relative w-full h-[390px] md:h-auto md:contents {mobileOrder.stats}">
    {#each services as service}
      <div
        aria-hidden={active !== service.id}
        class="absolute inset-0 flex flex-col md:contents transition-opacity duration-700 {active ===
        service.id
          ? 'opacity-100 z-10 pointer-events-auto'
          : 'opacity-0 z-0 pointer-events-none md:opacity-100'}"
      >
        {#each service.metrics as metric, idx}
          {@const pos = stateLayouts[active].stats[idx]}
          <div
            class="grid-block flex flex-1 flex-col items-center justify-center space-y-1 p-2 lg:p-3 text-center bg-base-100/70 backdrop-blur-md hover:bg-primary/5 hover:outline-2 hover:-outline-offset-2 hover:outline-primary md:transition-all md:duration-700 ease-in-out {getBorders(
              pos.c,
              pos.r,
              pos.cs || 1,
              pos.rs || 1,
              'stat',
              idx,
            )} {active === service.id
              ? 'md:opacity-100 md:pointer-events-auto'
              : 'md:opacity-0 md:pointer-events-none'}"
            style={getStyle(pos.c, pos.r, pos.cs || 1, pos.rs || 1)}
          >
            <span class="text-2xl lg:text-3xl font-bold text-primary"><CmsRichTextSvelte value={metric.value} /></span
            >
            <span class="text-xs lg:text-sm font-semibold text-base-content/80"
              ><CmsRichTextSvelte value={metric.label} /></span
            >
          </div>
        {/each}
      </div>
    {/each}
  </div>

  {#if activeServiceLayouts[active]}
    {@const pos = activeServiceLayouts[active]}
    <div
      class="grid-block outline-2 -outline-offset-2 outline-primary pointer-events-none transition-all duration-700 ease-in-out"
      style="{getStyle(pos.c, pos.r, pos.cs, pos.rs)} --md-z: 35;"
    ></div>
  {/if}
</div>
