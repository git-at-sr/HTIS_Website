const CMS_LINK_BASE_CLASS =
  'font-semibold underline underline-offset-4 decoration-current transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current';
const CMS_LINK_DEFAULT_COLOR_CLASS = 'text-primary hover:text-secondary';
const CMS_SAFE_COLOR_TOKENS = new Set([
  'base-100',
  'base-200',
  'base-300',
  'base-content',
  'primary',
  'primary-content',
  'secondary',
  'secondary-content',
  'accent',
  'accent-content',
  'neutral',
  'neutral-content',
  'info',
  'info-content',
  'success',
  'success-content',
  'warning',
  'warning-content',
  'error',
  'error-content',
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Preserves CMS-authored soft-hyphen hints while escaping ordinary text.
 *
 * The entity must be converted before `escapeHtml`; otherwise `&shy;` becomes
 * `&amp;shy;` and is displayed literally. The resulting U+00AD character is
 * invisible unless the browser wraps the word at that position.
 *
 * Example: `Tele&shy;communications` -> `Tele\u00ADcommunications`
 */
function escapeCmsText(value: string): string {
  return escapeHtml(value.replace(/&shy;/gi, '\u00ad'));
}

/**
 * Escapes arbitrary HTML while preserving the supported CMS line-break forms.
 * A quoted `class` is allowed for responsive breaks such as
 * `<br class="hidden md:block" />`; other attributes remain escaped as text.
 */
function escapeHtmlWithLineBreaks(value: string): string {
  const lineBreakPattern = /<br(?:\s+class\s*=\s*(?:"([^"]*)"|'([^']*)'))?\s*\/?\s*>/gi;
  let rendered = '';
  let lastIndex = 0;

  for (const match of value.matchAll(lineBreakPattern)) {
    const matchIndex = match.index ?? 0;
    const className = match[1] ?? match[2];

    rendered += escapeCmsText(value.slice(lastIndex, matchIndex));
    rendered += className === undefined
      ? '<br />'
      : `<br class="${escapeHtml(className)}" />`;
    lastIndex = matchIndex + match[0].length;
  }

  rendered += escapeCmsText(value.slice(lastIndex));
  return rendered;
}

function getSafeHref(href: string): string | null {
  const trimmedHref = href.trim();

  if (
    trimmedHref.startsWith('/') ||
    trimmedHref.startsWith('#') ||
    trimmedHref.startsWith('./') ||
    trimmedHref.startsWith('../')
  ) {
    return trimmedHref;
  }

  try {
    const url = new URL(trimmedHref);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)
      ? trimmedHref
      : null;
  } catch {
    return null;
  }
}

function getSafeColorValue(color: string): string | null {
  const trimmedColor = color.trim().toLowerCase();

  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(trimmedColor)) {
    return trimmedColor;
  }

  return CMS_SAFE_COLOR_TOKENS.has(trimmedColor) ? `var(--color-${trimmedColor})` : null;
}

/**
 * Renders inline markdown for CMS content, supporting links, color formatting,
 * and HTML-style line breaks. All other HTML remains escaped.
 *
 * Supported syntax:
 * - Links: [Link text](URL)
 * - Color formatting: [Text]{color=ColorValue}
 * - Line breaks: `<br>`, `<br/>`, `<br />`, with an optional quoted `class` attribute
 * - Soft hyphens: `&shy;`
 *
 * Examples:
 * [Click here](https://example.com)
 * [Hello world]{color=primary}
 * [Readable label]{color=primary-content}
 * [Still hex]{color=#ff4500}
 */
export function renderCmsInlineMarkdown(
  value: string | null | undefined,
  linkClassName = '',
): string {
  if (!value) return '';

  const inlinePattern =
    /\[([^\]\n]+)\]\(([^)\s]+)\)|\[([^\]\n]+)\]\{color\s*=\s*([^}\s]+)\}/g;
  const linkClass = `${CMS_LINK_BASE_CLASS} ${
    linkClassName || CMS_LINK_DEFAULT_COLOR_CLASS
  }`;
  let rendered = '';
  let lastIndex = 0;

  for (const match of value.matchAll(inlinePattern)) {
    const [rawMatch, linkLabel, href, colorLabel, color] = match;
    const matchIndex = match.index ?? 0;

    rendered += escapeHtmlWithLineBreaks(value.slice(lastIndex, matchIndex));

    if (href) {
      const safeHref = getSafeHref(href);

      if (!safeHref) {
        rendered += escapeHtmlWithLineBreaks(rawMatch);
        lastIndex = matchIndex + rawMatch.length;
        continue;
      }

      const isExternal = /^https?:\/\//i.test(safeHref);
      const externalAttributes = isExternal
        ? ' target="_blank" rel="noopener noreferrer"'
        : '';

      rendered += `<a href="${escapeHtml(safeHref)}" class="${escapeHtml(linkClass)}"${externalAttributes}>${escapeHtmlWithLineBreaks(linkLabel)}</a>`;
    } else {
      const safeColor = getSafeColorValue(color);

      if (!safeColor) {
        rendered += escapeHtmlWithLineBreaks(rawMatch);
        lastIndex = matchIndex + rawMatch.length;
        continue;
      }

      rendered += `<span style="color: ${escapeHtml(safeColor)}">${escapeHtmlWithLineBreaks(colorLabel)}</span>`;
    }

    lastIndex = matchIndex + rawMatch.length;
  }

  rendered += escapeHtmlWithLineBreaks(value.slice(lastIndex));
  return rendered;
}
