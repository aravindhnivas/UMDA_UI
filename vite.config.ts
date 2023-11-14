import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
import { presetUno, presetIcons } from 'unocss';
import { presetDaisy } from 'unocss-preset-daisy';
import extractorSvelte from '@unocss/extractor-svelte';
import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [
        UnoCSS({
            presets: [
                presetIcons({
                    scale: 2,
                    extraProperties: {
                        cursor: 'pointer',
                    },
                }),
                presetUno(),
                presetDaisy(),
            ],
            extractors: [extractorSvelte()],
        }),
        svelte(),
        AutoImport({
            imports: ['svelte', 'svelte/store', 'svelte/transition'],
            dts: './src/auto-imports.d.ts',
        }),
    ],

    resolve: {
        alias: {
            $lib: path.resolve('./src/lib'),
            $utils: path.resolve('./src/utils'),
        },
    },

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
