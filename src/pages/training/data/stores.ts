export const embedding = writable<Embedding>('mol2vec');
export const default_pretrained_modes = writable<{ [key: string]: boolean }>({
    mol2vec: false,
    VICGAE: true,
});
