// uno.config.ts
import { defineConfig, presetIcons, presetUno } from 'unocss';
import { presetDaisy } from 'unocss-preset-daisy';
import extractorSvelte from '@unocss/extractor-svelte';
import transformerDirectives from '@unocss/transformer-directives'

export default defineConfig({
    presets: [
        presetIcons({
            scale: 1.5,
            extraProperties: {
                cursor: 'pointer',
            },
        }),
        presetUno(),
        presetDaisy(),
    ],
    transformers: [
        transformerDirectives(),
    ],
    extractors: [extractorSvelte()],
});
