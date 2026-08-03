<script lang="ts">
  import {
    Calendar,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    X,
  } from '@lucide/svelte';
  import { tick } from 'svelte';
  import CmsRichTextSvelte from '~/components/CmsRichTextSvelte.svelte';

  type ItemType = 'award' | 'certificate';

  interface AwardItem {
    id: number;
    type: ItemType;
    title: string;
    slug?: string;
    organization: string;
    date: string;
    thumbnailSrc: string;
    images: Array<{
      src: string;
      alt: string;
    }>;
  }

  let {
    items = [],
    gallerySectionId,
  }: {
    items: AwardItem[];
    gallerySectionId: string;
  } = $props();

  let activeTab = $state<'all' | 'award' | 'certificate'>('all');
  let startIndex = $state(0);
  let animKey = $state(0);
  let animDirection = $state<'down' | 'up'>('down');
  let gridEl = $state<HTMLDivElement>();
  let selectedItem = $state<AwardItem | null>(null);
  let selectedImageIndex = $state(0);
  let dialogEl = $state<HTMLDialogElement>();
  let initialPopupHandled = false;

  $effect(() => {
    if (initialPopupHandled) return;
    initialPopupHandled = true;

    const popupSlug = new URLSearchParams(window.location.search).get('popup');
    if (!popupSlug) return;

    const item = items.find((candidate) => candidate.slug === popupSlug);
    if (item) openItem(item);
  });

  $effect(() => {
    animKey;
    tick().then(() => {
      if (!gridEl) return;
      gridEl.style.animation = 'none';
      void gridEl.offsetWidth;
      const name = animDirection === 'down' ? 'slideDown' : 'slideUp';
      gridEl.style.animation = `${name} 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    });
  });

  $effect(() => {
    if (selectedItem) {
      dialogEl?.showModal();
    } else {
      dialogEl?.close();
    }
  });

  const filteredItems = $derived(
    activeTab === 'all' ? items : items.filter((item) => item.type === activeTab),
  );

  const visibleItems = $derived.by(() => {
    const res = [];
    const len = filteredItems.length;

    for (let i = 0; i < 6; i++) {
      if (len > 0) {
        res.push(filteredItems[(startIndex + i) % len]);
      }
    }
    return res;
  });

  function handleTabChange(tab: 'all' | 'award' | 'certificate') {
    activeTab = tab;
    startIndex = 0;
    animDirection = 'down';
    animKey++;
  }

  async function scrollToGalleryTop() {
    if (!gallerySectionId || !window.matchMedia('(max-width: 767px)').matches) return;

    await tick();
    document
      .getElementById(gallerySectionId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function goUp() {
    if (filteredItems.length === 0) return;
    animDirection = 'up';
    startIndex = (startIndex - 3 + filteredItems.length) % filteredItems.length;
    animKey++;
    void scrollToGalleryTop();
  }

  function goDown() {
    if (filteredItems.length === 0) return;
    animDirection = 'down';
    startIndex = (startIndex + 3) % filteredItems.length;
    animKey++;
    void scrollToGalleryTop();
  }

  function openItem(item: AwardItem) {
    selectedItem = item;
    selectedImageIndex = 0;
  }

  function closeItem() {
    selectedItem = null;
    selectedImageIndex = 0;
  }

  function showPreviousImage() {
    if (!selectedItem?.images.length) return;
    selectedImageIndex =
      (selectedImageIndex - 1 + selectedItem.images.length) % selectedItem.images.length;
  }

  function showNextImage() {
    if (!selectedItem?.images.length) return;
    selectedImageIndex = (selectedImageIndex + 1) % selectedItem.images.length;
  }

  function handleDialogKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPreviousImage();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showNextImage();
    }
  }
</script>

<div class="mx-auto flex max-w-6xl flex-col gap-3">
  <div class="flex border-b border-base-300">
    <button
      class="relative cursor-pointer px-6 py-2.5 text-sm font-semibold transition-colors sm:px-8 {activeTab ===
      'all'
        ? 'text-primary'
        : 'text-base-content/60 hover:text-base-content'}"
      onclick={() => handleTabChange('all')}
    >
      All
      {#if activeTab === 'all'}
        <div class="absolute right-0 bottom-[-1px] left-0 h-0.5 bg-primary"></div>
      {/if}
    </button>
    <button
      class="relative cursor-pointer px-6 py-2.5 text-sm font-semibold transition-colors sm:px-8 {activeTab ===
      'award'
        ? 'text-primary'
        : 'text-base-content/60 hover:text-base-content'}"
      onclick={() => handleTabChange('award')}
    >
      Awards
      {#if activeTab === 'award'}
        <div class="absolute right-0 bottom-[-1px] left-0 h-0.5 bg-primary"></div>
      {/if}
    </button>
    <button
      class="relative cursor-pointer px-6 py-2.5 text-sm font-semibold transition-colors sm:px-8 {activeTab ===
      'certificate'
        ? 'text-primary'
        : 'text-base-content/60 hover:text-base-content'}"
      onclick={() => handleTabChange('certificate')}
    >
      Certificates
      {#if activeTab === 'certificate'}
        <div class="absolute right-0 bottom-[-1px] left-0 h-0.5 bg-primary"></div>
      {/if}
    </button>
  </div>

  <div
    bind:this={gridEl}
    class="grid grid-cols-1 gap-x-5 gap-y-3 md:grid-cols-2 lg:grid-cols-3"
  >
    {#each visibleItems as item}
      <button
        class="flex w-full cursor-pointer flex-col overflow-hidden rounded-lg border border-base-200 bg-base-100 text-left shadow-xs outline-hidden transition-all duration-300 hover:border-primary/20 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        onclick={() => openItem(item)}
        aria-haspopup="dialog"
      >
        <div class="w-full p-2 pb-0">
          <img
            src={item.thumbnailSrc}
            alt={item.title}
            class="aspect-16/10 w-full rounded-md bg-base-200/30 object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        </div>
        <div class="flex flex-1 flex-col justify-between px-3 pt-2.5 pb-2.5">
          <div>
            <CmsRichTextSvelte
              value={item.title}
              tag="h3"
              className="line-clamp-2 text-sm leading-snug font-bold text-base-content"
            />
            <CmsRichTextSvelte
              value={item.organization}
              tag="p"
              className="mt-0.5 text-xs font-semibold text-primary"
            />
          </div>
          <div class="mt-2 flex items-center text-xs font-medium text-base-content/50">
            <Calendar size={13} class="mr-1.5" />
            <CmsRichTextSvelte value={item.date} />
          </div>
        </div>
      </button>
    {/each}
  </div>

  <div class="flex items-center justify-between rounded-lg bg-base-200/60 p-2">
    <button
      class="btn btn-circle btn-sm cursor-pointer border-none bg-primary/20 text-primary hover:bg-primary/30"
      onclick={goUp}
      aria-label="Go up a row"
    >
      <ChevronUp size={18} />
    </button>

    <div class="flex items-center gap-4">
      <span class="text-sm font-medium text-base-content/60">load more</span>
      <button
        class="btn btn-circle btn-sm btn-primary cursor-pointer border-none text-primary-content hover:bg-primary/90"
        onclick={goDown}
        aria-label="Go down a row"
      >
        <ChevronDown size={18} />
      </button>
    </div>
  </div>
</div>

<dialog
  bind:this={dialogEl}
  class="modal"
  onclose={closeItem}
  onkeydown={handleDialogKeydown}
>
  {#if selectedItem}
    <div
      class="modal-box relative flex max-w-5xl flex-col items-center justify-center overflow-hidden border border-base-300 bg-base-100 p-0 shadow-2xl"
    >
      <button
        class="btn btn-circle btn-sm btn-ghost absolute top-3 right-3 z-50 cursor-pointer text-base-content hover:bg-base-300/40"
        onclick={closeItem}
        aria-label="Close modal"
      >
        <X size={18} />
      </button>

      <div
        class="relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden bg-black/5 p-4 md:max-h-[75vh]"
      >
        {#if selectedItem.images.length > 1}
          <button
            class="btn btn-circle btn-sm absolute top-1/2 left-3 z-40 -translate-y-1/2 border-none bg-base-100/90 text-base-content shadow-md hover:bg-base-100"
            onclick={showPreviousImage}
            aria-label="Previous photo"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            class="btn btn-circle btn-sm absolute top-1/2 right-3 z-40 -translate-y-1/2 border-none bg-base-100/90 text-base-content shadow-md hover:bg-base-100"
            onclick={showNextImage}
            aria-label="Next photo"
          >
            <ChevronRight size={20} />
          </button>
        {/if}

        <img
          src={selectedItem.images[selectedImageIndex]?.src}
          alt={selectedItem.images[selectedImageIndex]?.alt}
          class="max-h-[65vh] max-w-full rounded-md object-contain shadow-md md:max-h-[70vh]"
        />
      </div>

      <div class="w-full border-t border-base-200 bg-base-200/70 p-4 text-left">
        <span
          class="badge badge-primary badge-outline mb-2 text-[10px] font-semibold tracking-wider uppercase"
        >
          <CmsRichTextSvelte value={selectedItem.type} />
        </span>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CmsRichTextSvelte
              value={selectedItem.title}
              tag="h3"
              className="text-base leading-snug font-bold text-base-content"
            />
            <CmsRichTextSvelte
              value={selectedItem.organization}
              tag="p"
              className="mt-1 text-xs font-semibold text-primary"
            />
          </div>
          {#if selectedItem.images.length > 1}
            <p class="text-xs font-medium text-base-content/50">
              {selectedImageIndex + 1} / {selectedItem.images.length}
            </p>
          {/if}
        </div>
        <div class="mt-3 flex items-center text-xs font-medium text-base-content/60">
          <Calendar size={14} class="mr-2" />
          <CmsRichTextSvelte value={selectedItem.date} />
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop bg-black/60 backdrop-blur-xs">
      <button onclick={closeItem}>close</button>
    </form>
  {/if}
</dialog>
