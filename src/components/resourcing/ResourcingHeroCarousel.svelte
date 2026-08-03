<script lang="ts">
  import { fade } from 'svelte/transition';

  let { images = [] }: { images: string[] } = $props();

  let currentIndex = $state(0);
  let timer: ReturnType<typeof setInterval>;

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function setSlide(index: number) {
    currentIndex = index;
    resetTimer();
  }

  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 5000);
  }

  $effect(() => {
    timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  });
</script>

<div
  class="relative hidden min-h-[400px] w-full overflow-hidden rounded-4xl bg-base-200 lg:block lg:min-h-[600px] lg:w-1/2"
>
  {#each images as image, index}
    {#if index === currentIndex}
      <div class="absolute inset-0 z-0" transition:fade={{ duration: 500 }}>
        <img src={image} alt="" aria-hidden="true" class="h-full w-full object-cover" />
      </div>
    {/if}
  {/each}

  <!-- Pagination dots -->
  <div
    class="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-1.5"
  >
    {#each images as _, i}
      <button
        type="button"
        onclick={() => setSlide(i)}
        class="flex items-center justify-center p-2 transition-all duration-300"
        aria-label="Go to slide {i + 1}"
      >
        <span
          class="block rounded-full transition-all duration-300 {currentIndex === i
            ? 'h-2.5 w-2.5 bg-primary shadow-md'
            : 'h-2 w-2 bg-white/60 hover:bg-white'}"
        ></span>
      </button>
    {/each}
  </div>
</div>
