import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    minify: true,
    sourcemap: true,
    target: 'es2020',
  },
  {
    // <script> tag build: exposes window.Toastcraft
    entry: { toastcraft: 'src/index.ts' },
    format: ['iife'],
    globalName: 'Toastcraft',
    minify: true,
    target: 'es2020',
  },
]);
