import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';

export async function optimizeImageSrc(src: ImageMetadata): Promise<string> {
  if (src.format === 'svg' || src.format === 'webp' || src.format === 'avif') {
    return src.src;
  }

  return (await getImage({ src, format: 'webp' })).src;
}

export function optimizeImageSrcs(sources: ImageMetadata[]): Promise<string[]> {
  return Promise.all(sources.map(optimizeImageSrc));
}
