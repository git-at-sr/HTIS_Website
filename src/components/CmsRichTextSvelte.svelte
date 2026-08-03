<script lang="ts">
  import { renderCmsInlineMarkdown } from '~/utils/cmsMarkdown';

  type CmsRichTextTag = 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'strong';

  let {
    value,
    tag = 'span',
    className,
    linkClassName,
  }: {
    value?: string | null;
    tag?: CmsRichTextTag;
    className?: string;
    linkClassName?: string;
  } = $props();

  const html = $derived(renderCmsInlineMarkdown(value, linkClassName));
</script>

<svelte:element this={tag} class={className}>
  {@html html}
</svelte:element>
