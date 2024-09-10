// import { current_training_data_file } from '../training_file/plot-analysis/stores';
import { training_save_directory } from '../training_file/stores';
export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');

export const embedd_savefile_path = derived(
    [training_save_directory, embedd_savefile],
    async ([$training_save_directory, $embedd_savefile]) => {
        const final_dirname = await path.join($training_save_directory, 'embedded_vectors');
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
