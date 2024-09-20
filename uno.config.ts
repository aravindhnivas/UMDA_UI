// uno.config.ts
import { defineConfig, presetUno } from 'unocss';
import { presetDaisy } from 'unocss-preset-daisy';
import extractorSvelte from '@unocss/extractor-svelte';
import transformerDirectives from '@unocss/transformer-directives';

export default defineConfig({
    presets: [presetUno(), presetDaisy()],
    transformers: [transformerDirectives()],
    extractors: [extractorSvelte()],
});
