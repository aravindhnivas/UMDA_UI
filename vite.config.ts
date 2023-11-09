import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import { presetUno } from 'unocss';
import { presetDaisy } from 'unocss-preset-daisy';
import extractorSvelte from '@unocss/extractor-svelte';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [
        UnoCSS({
            presets: [presetUno(), presetDaisy()],
            extractors: [extractorSvelte()],
        }),
        svelte(),
    ],

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
        port: 1420,
        strictPort: true,
    },
}));
