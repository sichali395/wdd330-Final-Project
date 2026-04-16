import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        minify: 'esbuild',  // Use esbuild instead of terser (no extra dependency)
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    publicDir: 'public'
});