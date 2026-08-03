// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';
import alpinejs from '@astrojs/alpinejs';
import sitemap from '@astrojs/sitemap';
import yaml from 'js-yaml';

const yamlPlugin = {
  name: 'htis-yaml-loader',
  /**
   * @param {string} code
   * @param {string} id
   */
  transform(code, id) {
    if (!/\.ya?ml$/.test(id)) return null;

    return {
      code: `export default ${JSON.stringify(yaml.load(code))};`,
      map: null,
    };
  },
};

// https://astro.build/config
export default defineConfig({
  site: 'https://website.htistelecom.in',
  output: 'static',
  integrations: [svelte(), alpinejs(), sitemap()],
  vite: {
    plugins: [yamlPlugin, tailwindcss()],
    optimizeDeps: {
      include: ['cobe'],
    },
  },
});
