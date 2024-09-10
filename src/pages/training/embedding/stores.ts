import { training_save_directory } from '../training_file/stores';
import {
    current_training_data_file,
    use_filtered_data_for_training,
    filtered_dir,
} from '../training_file/plot-analysis/stores';

export const embeddings = ['mol2vec', 'VICGAE'];
export const embedding = localWritable<Embedding>('embedding', 'mol2vec');
export const embedd_savefile = writable<string>('');

export const embedd_savefile_path = derived(
    [
        training_save_directory,
        embedd_savefile,
        current_training_data_file,
        use_filtered_data_for_training,
        // filtered_dir,
    ],
    async ([
        $training_save_directory,
        $embedd_savefile,
        $current_training_data_file,
        $use_filtered_data_for_training,
        // $filtered_dir,
    ]) => {
        let final_dirname: string = '';
        if (!$use_filtered_data_for_training) {
            final_dirname = await path.join($training_save_directory, 'embedded_vectors');
        } else {
            const training_dirname = await path.dirname(await $current_training_data_file);
            final_dirname = await path.join(training_dirname, 'embedded_vectors');
        }
        const savefile = await path.join(final_dirname, `${$embedd_savefile}.npy`);
        console.warn({ embedd_savefile_path: savefile });
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
