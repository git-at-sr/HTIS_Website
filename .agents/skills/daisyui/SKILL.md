---
name: daisyui
description: "How to build UI with daisyUI 5 and Tailwind CSS 4. Use this skill whenever the user asks to create, modify, or style HTML/UI components, build pages or layouts, add forms, navigation, modals, cards, or any visual element in a project that uses daisyUI. Also use it when the user mentions Tailwind CSS styling in this project, asks about themes or colors, or wants responsive design — even if they don't explicitly say 'daisyUI'."
---

# daisyUI 5 — Practical Usage Skill

This skill covers how to effectively build UIs with daisyUI 5 on Tailwind CSS 4. The full component reference lives in `llms.txt` at the project root (loaded automatically). This skill focuses on **how to think about building** with daisyUI — workflow, patterns, and avoiding common mistakes.

## Setup Verification

Before writing any daisyUI code, confirm the project has the right setup:

1. CSS file imports Tailwind CSS 4 and the daisyUI plugin:
   ```css
   @import 'tailwindcss';
   @plugin "daisyui";
   ```
2. No `tailwind.config.js` — Tailwind CSS 4 doesn't use it
3. daisyUI 5 is installed (`npm i -D daisyui@latest`)

If the project doesn't have this, set it up first.

## Core Mental Model

daisyUI works at two layers:

- **Component classes** (`btn`, `card`, `modal`, etc.) — give semantic meaning and base styling
- **Tailwind utilities** (`px-4`, `flex`, `grid`, `text-lg`, etc.) — customize layout, spacing, sizing

The workflow: pick the right daisyUI component class, add modifier/style/size classes from that component, then layer on Tailwind utilities for anything custom.

### Class Name Categories

Every daisyUI class falls into one of these roles:

- **component** — the base class, always required (e.g. `btn`, `card`)
- **part** — a child element within a component (e.g. `card-body`, `card-title`)
- **style** — visual variant (e.g. `btn-outline`, `btn-ghost`)
- **color** — semantic color (e.g. `btn-primary`, `alert-error`)
- **size** — size variant (e.g. `btn-sm`, `btn-lg`)
- **modifier** — behavioral/layout change (e.g. `btn-circle`, `collapse-arrow`)
- **placement/direction** — positioning (e.g. `dropdown-end`, `divider-horizontal`)

Combine one from each category as needed: `btn btn-primary btn-outline btn-lg`

## Color System

This is the most important concept to internalize. daisyUI uses **semantic colors** that change with the theme.

### Use daisyUI colors, not Tailwind colors

```html
<!-- WRONG: hardcoded color breaks in dark themes -->
<p class="text-gray-800">Text</p>
<div class="bg-white">Box</div>

<!-- RIGHT: semantic colors adapt to any theme -->
<p class="text-base-content">Text</p>
<div class="bg-base-100">Box</div>
```

The key color pairs:
| Background | Text on it |
|---|---|
| `bg-base-100` / `bg-base-200` / `bg-base-300` | `text-base-content` |
| `bg-primary` | `text-primary-content` |
| `bg-secondary` | `text-secondary-content` |
| `bg-accent` | `text-accent-content` |
| `bg-neutral` | `text-neutral-content` |

Rules of thumb:

- Use `base-*` colors for the bulk of the page
- Use `primary` for the most important interactive elements (main CTA buttons, active states)
- Use `secondary`/`accent` sparingly for visual variety
- Never use `dark:` prefix — daisyUI themes handle dark mode automatically
- Never use Tailwind color names (like `text-gray-800`) for text because it won't adapt to dark themes

### Elevation with base colors

Use `base-100` → `base-200` → `base-300` to create visual depth:

```html
<div class="bg-base-200 p-4">
  <!-- slightly elevated surface -->
  <div class="bg-base-100 p-4 rounded-lg">
    <!-- card on the surface -->
    Content here
  </div>
</div>
```

## Responsive Design

Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) for layout:

```html
<!-- Stack on mobile, side-by-side on desktop -->
<div class="flex flex-col lg:flex-row gap-4">
  <div class="lg:w-1/3">Sidebar</div>
  <div class="lg:w-2/3">Main content</div>
</div>
```

Many daisyUI components have responsive-friendly patterns:

- `sm:card-horizontal` — card image beside text on wider screens
- `lg:drawer-open` — sidebar always visible on large screens
- `sm:alert-horizontal` — horizontal alert on wider screens
- `sm:footer-horizontal` — horizontal footer columns
- `lg:menu-horizontal` — horizontal menu on large screens

## Common Page Layout Patterns

### Full page with navbar, content, footer

```html
<div class="min-h-screen flex flex-col">
  <div class="navbar bg-base-200">
    <div class="navbar-start">
      <a class="text-xl font-bold">Logo</a>
    </div>
    <div class="navbar-end">
      <a class="btn btn-ghost">Link</a>
    </div>
  </div>

  <main class="flex-1 container mx-auto p-4">
    <!-- Page content -->
  </main>

  <footer class="footer sm:footer-horizontal bg-base-200 p-10">
    <nav>
      <h6 class="footer-title">Company</h6>
      <a class="link link-hover">About</a>
    </nav>
  </footer>
</div>
```

### Sidebar layout with drawer

```html
<div class="drawer lg:drawer-open">
  <input id="main-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <!-- ALL page content goes here: navbar, main, footer -->
    <div class="navbar bg-base-200 lg:hidden">
      <label for="main-drawer" class="btn btn-ghost">☰</label>
    </div>
    <main class="p-4">Content</main>
  </div>
  <div class="drawer-side">
    <label
      for="main-drawer"
      aria-label="close sidebar"
      class="drawer-overlay"
    ></label>
    <ul class="menu bg-base-200 min-h-full w-80 p-4">
      <li><a>Menu Item 1</a></li>
      <li><a>Menu Item 2</a></li>
    </ul>
  </div>
</div>
```

Important: when using `drawer`, **everything** must live inside `drawer-content`. Don't put navbars or footers outside the drawer structure.

## Form Patterns

### Fieldset with validation

```html
<fieldset class="fieldset">
  <legend class="fieldset-legend">Email</legend>
  <input
    type="email"
    class="input validator"
    required
    placeholder="you@example.com"
  />
  <p class="validator-hint">Please enter a valid email</p>
</fieldset>
```

### Floating labels

```html
<label class="floating-label">
  <input type="text" placeholder="Username" class="input" />
  <span>Username</span>
</label>
```

### Input with icon/label inside

```html
<label class="input">
  <span class="label">$</span>
  <input type="number" placeholder="Amount" />
</label>
```

## Modal Pattern

Prefer the HTML `<dialog>` approach:

```html
<button onclick="my_modal.showModal()" class="btn">Open</button>
<dialog id="my_modal" class="modal">
  <div class="modal-box">
    <h3 class="text-lg font-bold">Title</h3>
    <p class="py-4">Content here</p>
    <div class="modal-action">
      <form method="dialog">
        <button class="btn">Close</button>
      </form>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

## Common Mistakes to Avoid

1. **Using `dark:` prefix** — daisyUI themes handle this. Never write `dark:bg-gray-900`.

2. **Hardcoded colors** — `text-gray-700` won't work on dark themes. Use `text-base-content` or component-specific content colors.

3. **Adding `bg-base-100 text-base-content` to `<body>`** — unnecessary unless there's a specific reason.

4. **Using `tailwind.config.js`** — Tailwind CSS 4 doesn't use it. Config goes in the CSS file.

5. **Forcing with `!` too early** — try rearranging class order or using a different daisyUI modifier before resorting to `bg-red-500!`.

6. **Content outside drawer** — when using `drawer`, all page content (navbar, footer, main) must be inside `drawer-content`.

7. **Missing `overflow-x-auto` on tables** — always wrap `<table class="table">` in `<div class="overflow-x-auto">`.

8. **Forgetting hover-3d needs 9 children** — the first child is content, the other 8 are empty `<div>`s for hover zones.

## Component Selection Guide

| Need                  | Component                                        |
| --------------------- | ------------------------------------------------ |
| Page-level navigation | `navbar`                                         |
| Sidebar navigation    | `drawer` + `menu`                                |
| Mobile bottom nav     | `dock`                                           |
| Show/hide content     | `collapse` or `accordion` (radio-based collapse) |
| User feedback message | `alert`                                          |
| Popup dialog          | `modal` (use `<dialog>`)                         |
| Context menu          | `dropdown`                                       |
| Data in rows          | `table` or `list`                                |
| Key metrics           | `stats` + `stat`                                 |
| Multi-step process    | `steps`                                          |
| Image gallery         | `carousel` or `hover-gallery`                    |
| Loading state         | `loading` or `skeleton`                          |
| Form grouping         | `fieldset`                                       |
| Notifications         | `toast` + `alert`                                |
| Toggle switch         | `toggle`                                         |
| Star rating           | `rating`                                         |

## Theming

### Switch themes at runtime

Add `data-theme="theme-name"` to the `<html>` element:

```html
<html data-theme="dark"></html>
```

### Use `theme-controller` for user theme switching

```html
<input type="checkbox" value="dark" class="toggle theme-controller" />
```

### Custom theme

Add a custom theme block in your CSS file after the daisyUI plugin:

```css
@import 'tailwindcss';
@plugin "daisyui";
@plugin "daisyui/theme" {
  name: 'mytheme';
  default: true;
  prefersdark: false;
  color-scheme: light;
  --color-base-100: oklch(98% 0.02 240);
  --color-base-200: oklch(95% 0.03 240);
  --color-base-300: oklch(92% 0.04 240);
  --color-base-content: oklch(20% 0.05 240);
  --color-primary: oklch(55% 0.3 240);
  --color-primary-content: oklch(98% 0.01 240);
  --color-secondary: oklch(70% 0.25 200);
  --color-secondary-content: oklch(98% 0.01 200);
  --color-accent: oklch(65% 0.25 160);
  --color-accent-content: oklch(98% 0.01 160);
  --color-neutral: oklch(50% 0.05 240);
  --color-neutral-content: oklch(98% 0.01 240);
  --color-info: oklch(70% 0.2 220);
  --color-info-content: oklch(98% 0.01 220);
  --color-success: oklch(65% 0.25 140);
  --color-success-content: oklch(98% 0.01 140);
  --color-warning: oklch(80% 0.25 80);
  --color-warning-content: oklch(20% 0.05 80);
  --color-error: oklch(65% 0.3 30);
  --color-error-content: oklch(98% 0.01 30);
  --radius-selector: 1rem;
  --radius-field: 0.25rem;
  --radius-box: 0.5rem;
  --size-selector: 0.25rem;
  --size-field: 0.25rem;
  --border: 1px;
  --depth: 1;
  --noise: 0;
}
```

All CSS variables are required. Use https://daisyui.com/theme-generator/ for visual theme creation.

## Design Principles (from Refactoring UI)

- Use visual hierarchy: larger/bolder for important elements, smaller/lighter for secondary
- Limit your choices: pick 2-3 font sizes, a consistent spacing scale
- Use `primary` color sparingly — for the one thing you want users to notice
- Use whitespace generously; don't crowd elements
- Placeholder images: use `https://picsum.photos/{width}/{height}`
- Don't add custom fonts unless the design specifically calls for it

## Specificity Override (Last Resort)

If a Tailwind utility doesn't override a daisyUI style due to CSS specificity, append `!`:

```html
<button class="btn bg-red-500!">Force red background</button>
```

Only use this when other approaches (choosing the right daisyUI modifier, restructuring classes) don't work.
