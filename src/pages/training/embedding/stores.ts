import { current_training_data_file } from '../training_file/plot-analysis/stores';

export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');

export const embedd_savefile_path = derived(
    [current_training_data_file, embedd_savefile],
    async ([$current_training_data_file, $embedd_savefile]) => {
        const fname = await $current_training_data_file;
        const dname = await path.dirname(fname);
        const savefile = await path.join(dname, $embedd_savefile + '.npy');
        return savefile;
    },
);

export const use_PCA = localWritable('use_PCA', false);

export const model_and_pipeline_files = localWritable<{
    [name: string]: {
        model_file: string;
        pipeline_file: string;
    };
}>('model_and_pipeline_files', {});
