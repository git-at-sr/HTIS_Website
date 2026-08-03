declare module '*.yml' {
  const data: unknown;
  export default data;
}

declare module '*.yaml' {
  const data: unknown;
  export default data;
}

declare module '*.JPG' {
  const src: import('astro').ImageMetadata;
  export default src;
}

declare module '*.JPEG' {
  const src: import('astro').ImageMetadata;
  export default src;
}

declare module '*.PNG' {
  const src: import('astro').ImageMetadata;
  export default src;
}

declare module '*.WEBP' {
  const src: import('astro').ImageMetadata;
  export default src;
}

declare module '*.SVG' {
  const src: import('astro').ImageMetadata;
  export default src;
}

declare module 'js-yaml' {
  export function load(input: string): unknown;
}
