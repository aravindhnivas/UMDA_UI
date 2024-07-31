import { training_file } from '../training_file/stores';

export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = writable<Embedding>('mol2vec');
export const embedd_savefile = writable<string>('');

export const default_pretrained_modes = writable<{ [key: string]: boolean }>({
    mol2vec: false,
    mol2vec_PCA: false,
    VICGAE: false,
});

export const embedd_savefile_path = derived(
    [training_file, embedd_savefile],
    async ([$training_file, $embedd_savefile]) => {
        return await path.join(await path.dirname($training_file.filename), $embedd_savefile + '.npy');
    },
);

export const use_PCA = localWritable('use_PCA', false);
