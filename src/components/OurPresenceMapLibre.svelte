<script lang="ts">
  import { Globe, Mail, MapPin, MapPinned, Phone } from '@lucide/svelte';
  import type * as MapLibreType from 'maplibre-gl';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';
  import indiaClaimedBoundary from '~/assets/maps/india-claimed-boundary.json';
  import { renderCmsInlineMarkdown } from '~/utils/cmsMarkdown';

  interface Location {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    lat: number;
    lng: number;
    isHQ?: boolean;
    mapUrl?: string;
  }

  interface Props {
    sectionId?: string;
    title: string;
    description: string;
    globalTabLabel: string;
    indiaTabLabel: string;
    globalLocations: Location[];
    indiaOffices: Location[];
  }

  let { sectionId, title, description, globalTabLabel, indiaTabLabel, globalLocations, indiaOffices }: Props = $props();
  let mapContainer = $state<HTMLDivElement | null>(null);
  let map: MapLibreType.Map | null = null;
  let ML: typeof MapLibreType | null = null;
  let activeTab = $state<'global' | 'india'>('global');
  let selectedLocation = $state<Location | null>(null);
  let markers: { loc: Location; marker: MapLibreType.Marker; popup: MapLibreType.Popup }[] = [];
  let pinnedPopup: MapLibreType.Popup | null = null;

  const styleUrl = 'https://tiles.openfreemap.org/styles/bright';
  const indiaSource = 'india-claimed-boundary';

  // Bounding boxes ([west, south], [east, north]) per tab. fitBounds derives
  // the zoom/center from the container size, so the full region stays visible
  // on mobile and desktop alike.
  const globalBounds: MapLibreType.LngLatBoundsLike = [[-20, -36], [97.5, 60]]; // Europe, Africa & India
  const indiaBounds: MapLibreType.LngLatBoundsLike = [[68, 6], [97.5, 37]]; // whole of India

  function fitActiveView(animate = true) {
    if (!map) return;
    const isMobile = mapContainer ? mapContainer.clientWidth < 640 : false;
    map.fitBounds(activeTab === 'global' ? globalBounds : indiaBounds, {
      padding: isMobile ? 12 : 40,
      duration: animate ? 800 : 0,
    });
  }

  $effect(() => {
    if (!mapContainer) return;
    let destroyed = false;

    const initialize = async () => {
      const imported = await import('maplibre-gl');
      if (destroyed) return;
      ML = imported;
      map = new ML.Map({
        container: mapContainer!,
        style: styleUrl,
        bounds: activeTab === 'global' ? globalBounds : indiaBounds,
        fitBoundsOptions: { padding: mapContainer!.clientWidth < 640 ? 12 : 40 },
        minZoom: 1,
        maxZoom: 18,
        attributionControl: false,
      });
      map.addControl(new ML.NavigationControl({ showCompass: false }), 'top-left');
      map.addControl(new ML.AttributionControl({ compact: true }));
      map.on('load', () => {
        hideAdministrativeBoundaries();
        addIndiaOverlay();
        renderMarkers();
      });
    };

    initialize();
    return () => {
      destroyed = true;
      map?.remove();
      map = null;
      ML = null;
      markers = [];
    };
  });

  $effect(() => {
    const currentTab = activeTab;
    if (currentTab && map?.loaded() && ML) renderMarkers();
  });

  function hideAdministrativeBoundaries() {
    if (!map) return;
    for (const layer of map.getStyle().layers ?? []) {
      const sourceLayer = 'source-layer' in layer ? layer['source-layer'] : '';
      if (/boundary|admin/i.test(`${layer.id} ${sourceLayer ?? ''}`)) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    }
  }

  function addIndiaOverlay() {
    if (!map || map.getSource(indiaSource)) return;
    map.addSource(indiaSource, {
      type: 'geojson',
      data: indiaClaimedBoundary as MapLibreType.GeoJSONSourceSpecification['data'],
    });
    map.addLayer({ id: 'india-presence-fill', type: 'fill', source: indiaSource, paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.07 } });
    map.addLayer({ id: 'india-presence-outline', type: 'line', source: indiaSource, paint: { 'line-color': '#15803d', 'line-width': 1.8 } });
    updateIndiaOverlay();
  }

  function updateIndiaOverlay() {
    if (!map) return;
    const visibility = activeTab === 'india' ? 'visible' : 'none';
    for (const id of ['india-presence-fill', 'india-presence-outline']) {
      if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', visibility);
    }
  }

  function closePopups() {
    markers.forEach(({ popup }) => popup.remove());
    pinnedPopup = null;
  }

  function switchTab(tab: 'global' | 'india') {
    if (tab === activeTab) return;
    closePopups();
    selectedLocation = null;
    activeTab = tab;
  }

  const hqPinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF4500" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff" stroke="none"/></svg>`;

  function markerElement(loc: Location) {
    const element = document.createElement('button');
    element.type = 'button';
    element.className = `presence-map-marker${loc.isHQ ? ' presence-map-marker-hq' : ''}`;
    element.setAttribute('aria-label', `${loc.name} map marker`);
    if (loc.isHQ) element.innerHTML = hqPinSvg;
    return element;
  }

  function renderMarkers() {
    if (!map || !ML) return;
    closePopups();
    markers.forEach(({ marker }) => marker.remove());
    markers = [];
    updateIndiaOverlay();

    const locations = activeTab === 'global' ? globalLocations : indiaOffices;
    for (const loc of locations) {
      const popup = new ML.Popup({ offset: loc.isHQ ? 40 : 18, closeButton: false, maxWidth: '320px' })
        .setLngLat([loc.lng, loc.lat])
        .setHTML(`
        <div class="presence-popup-content">
          <div class="presence-popup-title"><span>${renderCmsInlineMarkdown(loc.name)}</span>${loc.isHQ ? '<span class="presence-popup-badge">HQ</span>' : ''}</div>
          <div>${renderCmsInlineMarkdown(loc.address)}</div>
          ${loc.phone ? `<div><strong>Phone:</strong> ${renderCmsInlineMarkdown(loc.phone)}</div>` : ''}
          ${loc.email ? `<div><strong>Email:</strong> ${renderCmsInlineMarkdown(loc.email)}</div>` : ''}
        </div>`);
      // Keep local state in sync when MapLibre closes the popup itself
      // (e.g. tap-to-dismiss on the map), otherwise pinnedPopup goes stale
      // and the marker's hover/click handlers stop responding.
      popup.on('close', () => {
        if (pinnedPopup === popup) {
          pinnedPopup = null;
          selectedLocation = null;
        }
      });
      const marker = new ML.Marker({ element: markerElement(loc), anchor: loc.isHQ ? 'bottom' : 'center' })
        .setLngLat([loc.lng, loc.lat])
        .addTo(map);
      const element = marker.getElement();

      element.addEventListener('mouseenter', () => {
        if (pinnedPopup !== popup) popup.addTo(map!);
      });
      element.addEventListener('mouseleave', () => {
        if (pinnedPopup !== popup) popup.remove();
      });
      element.addEventListener('click', () => {
        const shouldClose = pinnedPopup === popup;
        // closePopups() fires each popup's 'close' handler, which clears
        // selectedLocation/pinnedPopup — so set them afterwards, not before.
        closePopups();
        if (!shouldClose) {
          selectedLocation = loc;
          pinnedPopup = popup;
          popup.addTo(map!);
        }
        map?.flyTo({ center: [loc.lng, loc.lat], zoom: activeTab === 'global' ? 4 : 7, duration: 800 });
      });
      markers.push({ loc, marker, popup });
    }

    fitActiveView();
  }

  function selectLocation(loc: Location) {
    closePopups();
    selectedLocation = loc;
    map?.flyTo({ center: [loc.lng, loc.lat], zoom: activeTab === 'global' ? 4 : 7, duration: 800 });
    const match = markers.find(({ loc: item }) => item.name === loc.name);
    if (match && map) {
      pinnedPopup = match.popup;
      match.popup.addTo(map);
    }
  }
</script>

<section id={sectionId} class="relative overflow-hidden bg-base-200/20 py-16 md:py-24">
  <div class="container mx-auto px-6">
    <div class="mb-12 text-center">
      <CmsRichTextSvelte value={title} tag="h2" className="text-3xl font-extrabold tracking-tight text-base-content md:text-4xl" />
      <div class="mx-auto mt-4 h-1.5 w-20 rounded-full bg-primary"></div>
      <CmsRichTextSvelte value={description} tag="p" className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-base-content/85 md:text-lg" />
    </div>

    <div class="grid grid-cols-1 overflow-hidden rounded-3xl border border-base-200/60 bg-base-100 shadow-md lg:grid-cols-12">
      <div class="flex flex-col border-b border-base-200/60 lg:col-span-4 lg:border-r lg:border-b-0">
        <div class="grid grid-cols-2 border-b border-base-200/50 bg-base-200/35 p-2">
          <button type="button" class="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all {activeTab === 'global' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/75'}" onclick={() => switchTab('global')}>
            <Globe class="h-4 w-4" /><CmsRichTextSvelte value={globalTabLabel} />
          </button>
          <button type="button" class="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all {activeTab === 'india' ? 'bg-base-100 text-primary shadow-sm' : 'text-base-content/75'}" onclick={() => switchTab('india')}>
            <MapPin class="h-4 w-4" /><CmsRichTextSvelte value={indiaTabLabel} />
          </button>
        </div>

        <div class="max-h-[350px] flex-1 space-y-2 overflow-y-auto p-4 lg:max-h-[520px]">
          {#each activeTab === 'global' ? globalLocations : indiaOffices as loc}
            <div role="button" tabindex="0" class="group relative flex w-full cursor-pointer flex-col gap-2.5 rounded-2xl border p-4 text-left transition-all hover:border-primary/20 hover:bg-base-200/40 {selectedLocation?.name === loc.name ? 'border-primary/30 bg-primary/5' : 'border-base-200/60'}" onclick={() => selectLocation(loc)} onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectLocation(loc); } }}>
              {#if loc.mapUrl}
                <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation()} class="absolute right-2.5 bottom-2.5 flex h-10 w-10 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10" aria-label="Open {loc.name} in Google Maps">
                  <MapPinned class="h-5.5 w-5.5" />
                </a>
              {/if}
              {#if loc.isHQ}<span class="badge badge-primary badge-sm absolute top-4 right-4 text-[10px] font-bold">HQ</span>{/if}
              <span class="text-base font-bold text-base-content transition-colors group-hover:text-primary md:text-lg {loc.isHQ ? 'pr-10' : ''}"><CmsRichTextSvelte value={loc.name} /></span>
              <div class="flex items-start gap-2 text-sm font-medium leading-relaxed text-base-content/90"><MapPin class="mt-0.5 h-4 w-4 shrink-0 text-base-content/50" /><CmsRichTextSvelte value={loc.address} tag="p" className="line-clamp-2" /></div>
              {#if loc.phone || loc.email}
                <div class="mt-1 grid gap-1.5 border-t border-base-200/50 pt-2 {loc.mapUrl ? 'pr-12' : ''}">
                  {#if loc.phone}<div class="flex items-center gap-2 text-xs text-base-content/85"><Phone class="h-3.5 w-3.5" /><CmsRichTextSvelte value={loc.phone} /></div>{/if}
                  {#if loc.email}<div class="flex items-center gap-2 text-xs text-base-content/85"><Mail class="h-3.5 w-3.5" /><CmsRichTextSvelte value={loc.email} /></div>{/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="relative flex min-h-[400px] flex-col lg:col-span-8 lg:min-h-[580px]">
        <div bind:this={mapContainer} class="min-h-[400px] w-full flex-1 lg:min-h-[580px]"></div>
      </div>
    </div>
  </div>
</section>
