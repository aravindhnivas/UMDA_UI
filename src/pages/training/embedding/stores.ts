import { current_training_processed_data_directory } from '../training_file/plot-analysis/stores';

export const embeddings_computed = writable(false);
export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');
export const embedd_savefile_path = derived(
    [embedd_savefile, current_training_processed_data_directory],
    async ([$embedd_savefile, $current_training_processed_data_directory]) => {
        const training_dirname = await $current_training_processed_data_directory;
        const final_dirname = await path.join(training_dirname, 'embedded_vectors');
        const savefile = await path.join(final_dirname, `${$embedd_savefile}.npy`);
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
