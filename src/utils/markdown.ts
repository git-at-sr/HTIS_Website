import { marked } from 'marked';
import DOMPurify from 'dompurify';

const allowedTags = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'p',
  'br',
  'hr',
  'ul',
  'ol',
  'li',
  'strong',
  'em',
  'del',
  'blockquote',
  'a',
  'code',
  'pre',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'img',
];

/**
 * Converts API-provided Markdown to a small, sanitized HTML subset in the
 * browser.
 *
 * Sanitizing is required because Svelte's `{@html}` deliberately renders its
 * input without escaping it.
 */
export function renderMarkdown(value: string | null | undefined): string {
  if (!value?.trim()) return '';

  const html = marked.parse(value, {
    async: false,
    gfm: true,
  });

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'src', 'alt', 'width', 'height', 'align'],
  });

  const document = new DOMParser().parseFromString(sanitizedHtml, 'text/html');
  document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
    if (/^https?:\/\//i.test(link.href)) {
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
  });

  return document.body.innerHTML;
}
