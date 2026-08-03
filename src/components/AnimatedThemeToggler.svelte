<script lang="ts">
  import { tick } from 'svelte';
  import { Sun, Moon } from '@lucide/svelte';

  let {
    duration = 400,
    className = '',
    ...restProps
  } = $props<{ duration?: number; className?: string; [key: string]: any }>();

  let isDark = $state(false);
  let buttonRef: HTMLButtonElement;

  const LIGHT_THEME = 'htis-theme';
  const DARK_THEME = 'htis-theme-dark';
  const STORAGE_KEY = 'theme';

  $effect(() => {
    const updateTheme = () => {
      isDark = document.documentElement.getAttribute('data-theme') === DARK_THEME;
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  });

  function toggleTheme() {
    if (!buttonRef) return;

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    const { top, left, width, height } = buttonRef.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const applyTheme = async () => {
      const newTheme = !isDark;
      isDark = newTheme;
      const themeValue = newTheme ? DARK_THEME : LIGHT_THEME;
      document.documentElement.setAttribute('data-theme', themeValue);
      try {
        sessionStorage.setItem(STORAGE_KEY, themeValue);
      } catch (e) {
        console.error('SessionStorage access failed:', e);
        // Storage is blocked or restricted
      }
      await tick();
    };

    if (typeof document.startViewTransition !== 'function') {
      applyTheme();
      return;
    }

    const root = document.documentElement;
    root.dataset.magicuiThemeVt = 'active';
    root.style.setProperty('--magicui-theme-toggle-vt-duration', `${duration}ms`);

    const cleanup = () => {
      delete root.dataset.magicuiThemeVt;
      root.style.removeProperty('--magicui-theme-toggle-vt-duration');
    };

    const transition = document.startViewTransition(async () => {
      await applyTheme();
    });

    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup);
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${maxRadius}px at ${x}px ${y}px)`,
      ];

      ready.then(() => {
        document.documentElement.animate(
          {
            clipPath,
          },
          {
            duration,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    }
  }
</script>

<button
  type="button"
  bind:this={buttonRef}
  onclick={toggleTheme}
  aria-pressed={isDark}
  class={className}
  {...restProps}
>
  {#if isDark}
    <Sun class="h-5 w-5" size={20} />
  {:else}
    <Moon class="h-5 w-5" size={20} />
  {/if}
  <span class="sr-only">Toggle theme</span>
</button>
