# Agent Instructions

- If the `bun` command is not found in `$PATH`, first run `command -v bun`.
- If still unresolved, check common install locations (for example `/opt/homebrew/bin/bun` on Apple Silicon macOS, `/usr/local/bin/bun`, or `~/.bun/bin/bun`).

## Project Stack & Tools

- This is an **Astro project** with **Alpine.js** integration.
- We use the **daisyUI** component library via Tailwind CSS.
- **Skill Requirement**: Prefer the `daisyui` skill when you need implementation details for daisyUI components.

## Component Architecture: `.astro` vs `.svelte`

### Use `.astro` when the component is:

- **Static / server-rendered** — no client-side JS needed (e.g. Footer, Articles, Footprint).
- **Simple scroll/resize listeners** — the JS just toggles classes based on `scrollY` or viewport size, with no internal state to track (e.g. Navbar sticky behavior).
- **CSS-driven interactivity** — hover effects, transitions, and animations that are fully handled by CSS pseudo-classes or Tailwind's `group-[.class]` variants (e.g. Services hover grid).
- **Simple timers with class toggling** — an interval that cycles classes on DOM elements with no user-driven state changes (e.g. Hero word carousel).

### Use `.svelte` (as an Astro island) when the component has:

- **Reactive state that drives the UI** — a variable like `activeIndex` that multiple parts of the template depend on (e.g. Team accordion, Journey carousel).
- **User input → state → DOM updates** — clicks, hovers, or keyboard events that change internal state, which in turn updates text, classes, or visibility across multiple elements.
- **Complex event listener management** — if the `.astro` version needs manual DOM queries (`querySelector`), idempotency guards (`data-init` flags), and cleanup for Astro View Transitions, Svelte eliminates all of that boilerplate.
- **Interactive animations** — animated sections that react to user input with fine-grained reactive updates (e.g. interactive demos, configurators, live counters driving animations).

### Rule of thumb

> If your `<script>` block in an `.astro` file is doing `querySelector` + manual class toggling + state tracking + cleanup guards, you should **prefer using Alpine.js** directly in the markup to keep it simple, clean, and declarative. If the state and interactivity are complex and require advanced reactive patterns, it should be a `.svelte` island instead.

### Svelte 5 Syntax & Features

- **Use Runes**: Always prefer modern Svelte 5 runes syntax (`$props`, `$state`, `$derived`, `$effect`) over the older Svelte 4 syntax (`export let`, `let x = 0`, `$: x = y`). Use the new event handler syntax (`onchange`, `onclick` instead of `on:change`, `on:click`).
- **Lifecycle Effects**: Always prefer the new `$effect` rune over `onMount` for handling side effects and component lifecycles.
- **Built-in Transitions**: For Svelte islands, leverage Svelte's built-in transition directives (e.g., `in:fade`, `out:slide`, from `svelte/transition`) for component-level interactive animations.

### Hydration directives

- Use `client:visible` for below-the-fold interactive components (preferred — lazy hydration).
- Use `client:load` only for above-the-fold components that must be interactive immediately.

### Data & images pattern

When converting to `.svelte`, import and process images in the **Astro parent** (to retain Astro's image optimization), then pass resolved URLs as props:

```astro
---
import Component from '../components/Component.svelte';
import img from '../assets/image.png';
---

<Component imgSrc={img.src} client:visible />
```

### Animations (non-component)

- **Visual-only animations** (scroll-triggered reveals, parallax, timeline sequences): Use **Astro + GSAP/Motion One** — no framework needed.
- **Stateful animations** (user-driven, complex internal state): Use a **Svelte island**.

### Styling in Svelte Components

**Never use `<style>` blocks in Svelte components.** Astro's `ClientRouter` (View Transitions) performs soft DOM swaps on navigation. When a user navigates away from a page, Svelte's scoped `<style>` tags are stripped from `<head>`. On back/forward navigation, the browser restores the cached HTML, but Svelte islands — especially those using `client:visible` (lazy hydration) — don't re-inject their scoped styles before the component becomes visible, causing FOUC (flash of unstyled content) or permanently broken styling.

**Use this priority order:**

1. **Tailwind utility classes** (preferred) — use built-in classes (`flex`, `rounded-2xl`, `transition-all`, etc.) directly in the component's `class=""` attribute. These are part of the global CSS bundle and always survive page transitions.

2. **`@utility` directives in `app.css`** — for simple reusable custom utilities that can't be expressed with existing Tailwind classes (e.g., `no-scrollbar`, `animate-progress`, `vertical-text`). Register them using `@utility name { ... }` in `app.css`. These become first-class Tailwind utilities (tree-shaken, usable in `class=""`).

3. **Plain global CSS in `app.css`** (last resort) — for styles that **cannot** be expressed as Tailwind classes or `@utility` directives:
   - Compound state selectors (`.parent.active .child`, `:not(.state) .target`)
   - Pseudo-elements with generated content (`::after { content: '' }`)
   - 3D transforms and `transform-style: preserve-3d`
   - CSS custom property-driven layouts (`var(--md-top)`)
   - Complex responsive `calc()` expressions across multiple breakpoints
   - `!important` overrides
   - `@keyframes` applied via JavaScript (`el.style.animation = 'name ...'`)

   When adding global CSS, add a section header comment explaining **which component uses it** and **why it can't be Tailwind-ified**.

### Vite Dev-Mode CSS & Astro View Transitions

In **development mode**, Tailwind CSS v4's Vite plugin (`@tailwindcss/vite`) injects utility classes on-demand via dynamic `<style>` tags in `<head>`. When Astro's `ClientRouter` performs a soft DOM swap during page navigation, these dynamically injected `<style>` tags can be **stripped or replaced** with the destination page's styles. On browser back/forward, the cached DOM is restored but the original page's dynamic CSS rules may be missing — causing broken responsive layouts (e.g., `lg:flex-col`, `lg:w-[336px]` not applied on desktop).

> **This is a dev-mode only issue.** Production builds bundle all CSS statically, so they are not affected.

**Fix pattern:** For layout-critical responsive properties in Svelte islands, duplicate them as plain CSS `@media` rules in `app.css` using a component-scoped class prefix (e.g., `.tp-layout`, `.tp-nav`). These rules are always present in the global CSS bundle and survive View Transitions:

```css
/* app.css — TelecomProcesses layout fallback */
@media (min-width: 1024px) {
  .tp-layout { flex-direction: row; gap: 2.5rem; }
  .tp-stepper { width: 336px; flex-shrink: 0; }
  .tp-nav { flex-direction: column; gap: 0; height: 100%; }
}
```

Keep the Tailwind utility classes on the elements too — they serve as the source of truth for the design and work correctly in production.
