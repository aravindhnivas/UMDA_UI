import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import UnoCSS from 'unocss/vite';
// import { presetUno, presetIcons } from 'unocss';

import path from 'path';
import AutoImport from 'unplugin-auto-import/vite';

// https://vitejs.dev/config/
export default defineConfig(async () => ({
    plugins: [
        UnoCSS(),
        svelte(),
        AutoImport({
            imports: [
                'svelte',
                'svelte/store',
                'svelte/transition',
                {
                    axios: [
                        ['default', 'axios'], // import { default as axios } from 'axios',
                    ],
                    '@zmotivat0r/o0': ['oO'],
                    '@tauri-apps/api/os': ['platform'],
                    '@tauri-apps/api': ['fs', 'path', 'dialog', 'shell', 'invoke'],
                    'svelte-sonner': ['toast', 'Toaster'],
                },
            ],
            dts: './src/auto-imports.d.ts',
        }),
    ],

    resolve: {
        alias: {
            $lib: path.resolve('./src/lib/'),
            $pages: path.resolve('./src/pages/'),
            $utils: path.resolve('./src/utils/'),
            $settings: path.resolve('./src/pages/settings/'),
            $components: path.resolve('./src/lib/components/'),
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
