export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = writable<Embedding>('mol2vec');
export const embedd_savefile = writable<string>('');

export const default_pretrained_modes = writable<{ [key: string]: boolean }>({
    mol2vec: false,
    mol2vec_PCA: false,
    VICGAE: false,
});
