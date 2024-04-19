export const embedding = writable<Embedding>('mol2vec');
export const default_pretrained_modes = writable<{ [key: string]: boolean }>({
    mol2vec: false,
    VICGAE: false,
});

export const pretrained_model_location = writable<Record<Embedding, string>>({} as Record<Embedding, string>);
