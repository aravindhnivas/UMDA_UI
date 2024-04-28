export const embeddings = ['mol2vec', 'mol2vec_PCA', 'VICGAE'];
export const embedding = writable<Embedding>('mol2vec');
export const default_pretrained_modes = writable<{ [key: string]: boolean }>({
    mol2vec: false,
    mol2vec_PCA: false,
    VICGAE: false,
});

export const pretrained_model_location = writable_store<Record<Embedding, string>>(
    'pretrained_model_location',
    {} as Record<Embedding, string>,
);
