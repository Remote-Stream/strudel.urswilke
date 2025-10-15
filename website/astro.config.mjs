import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import remarkToc from 'remark-toc';
import remarkFrontmatter from 'remark-frontmatter'; // اضافه برای front matter
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeUrls from 'rehype-urls';
import tailwind from '@astrojs/tailwind';
import AstroPWA from '@vite-pwa/astro';

const site = `https://remote-stream.github.io`; // آپدیت به GitHub Pages
const base = '/'; // برای Actions؛ اگر branch source، '/strudel.urswilke' بذار

// تابع absoluteAnchors (بدون تغییر، اما حالا const base '/' هست)
function absoluteAnchors() {
  return (tree, file) => {
    const chunks = file.history[0].split('/src/pages/');
    const path = chunks[chunks.length - 1].slice(0, -4); // برای .mdx؛ برای .astro -5
    return rehypeUrls((url) => {
      if (!url.href.startsWith('#')) {
        return;
      }
      const baseWithSlash = base.endsWith('/') ? base : base + '/';
      const absoluteUrl = baseWithSlash + path + url.href;
      return absoluteUrl;
    })(tree);
  };
}

const options = {
  remarkPlugins: [
    remarkFrontmatter, // اضافه برای پارس front matter
    remarkToc,
  ],
  rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'append' }], absoluteAnchors],
};

export default defineConfig({
  integrations: [
    preact(),
    react(),
    mdx(options),
    tailwind(),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,wav,mp3,ogg}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              [
                /^https:\/\/raw\.githubusercontent\.com\/.*/i,
                /^https:\/\/freesound\.org\/.*/i,
                /^https:\/\/cdn\.freesound\.org\/.*/i,
                /^https:\/\/shabda\.ndre\.gr\/.*/i,
              ].some((regex) => regex.test(url)),
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-samples',
              expiration: {
                maxEntries: 5000,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      manifest: {
        includeAssets: ['favicon.ico', 'icons/apple-icon-180.png', 'favicon.svg'],
        name: 'Strudel REPL',
        short_name: 'Strudel',
        description:
          'Strudel is a music live coding environment for the browser, porting the TidalCycles pattern language to JavaScript.',
        theme_color: '#222222',
        icons: [
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  site,
  base,
  vite: {
    ssr: {
      external: ['fraction.js'],
    },
  },
});
