import { training_file } from '../training_file/stores';

export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');

export const embedd_savefile_path = derived(
    [training_file, embedd_savefile],
    async ([$training_file, $embedd_savefile]) => {
        return await path.join(await path.dirname($training_file.filename), $embedd_savefile + '.npy');
    },
);

export const use_PCA = localWritable('use_PCA', false);

export const model_and_pipeline_files = localWritable<{
    [name: string]: {
        model_file: string;
        pipeline_file: string;
    };
}>('model_and_pipeline_files', {});
