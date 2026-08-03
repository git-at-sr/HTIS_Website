<script lang="ts">
  import { fade } from 'svelte/transition';

  let { images = [] }: { images: string[] } = $props();

  let currentIndex = $state(0);
  let timer: ReturnType<typeof setInterval>;

  function nextSlide() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  $effect(() => {
    timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  });
</script>

<div class="absolute inset-0 overflow-hidden">
  {#each images as image, index}
    {#if index === currentIndex}
      <div class="absolute inset-0 z-0" transition:fade={{ duration: 1500 }}>
        <img
          src={image}
          alt=""
          aria-hidden="true"
          class="h-full w-full object-cover"
        />
      </div>
    {/if}
  {/each}
</div>
