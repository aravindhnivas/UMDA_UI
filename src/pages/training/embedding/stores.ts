import { use_filtered_data_for_training, load_training_file } from '../training_file/plot-analysis/stores';
import { training_file } from '../training_file/stores';
export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');

export const embedd_savefile_path = derived(
    [use_filtered_data_for_training, embedd_savefile],
    async ([$use_filtered_data_for_training, $embedd_savefile]) => {
        const fname = await load_training_file($use_filtered_data_for_training, get(training_file).filename);
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
