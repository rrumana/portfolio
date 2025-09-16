import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: './src',
  publicDir: './public',
  output: 'static',
  outDir: '../static/dist',
  trailingSlash: 'never',
  integrations: [],
});
