import { load_analysis_dir, training_file } from '../stores';

export const filtered_dir = writable('default');
export const use_filtered_data_for_training = writable(false);

export const current_post_analysis_files_directory = derived(
    [load_analysis_dir, filtered_dir],
    async ([$load_analysis_dir, $filtered_dir]) => {
        const original_analysis_dir = await $load_analysis_dir;
        if ($filtered_dir === 'default') {
            return original_analysis_dir;
        }

        const dir = await path.join(
            original_analysis_dir,
            'filtered',
            $filtered_dir + '_processed_data',
            'analysis_data',
        );
        return dir;
    },
);

export const current_training_data_file = derived(
    [use_filtered_data_for_training, training_file, filtered_dir],
    async ([$use_filtered_data_for_training, $training_file, $filtered_dir]) => {
        if (!$use_filtered_data_for_training || $filtered_dir === 'default') return $training_file.filename;
        const original_analysis_dir = await get(load_analysis_dir);
        const training_data_file = await path.join(original_analysis_dir, 'filtered', $filtered_dir + '.csv');
        return training_data_file;
    },
);

export const current_training_processed_data_directory = derived(
    [current_training_data_file],
    async ([$current_training_data_file]) => {
        const current_training_file = await $current_training_data_file;
        const training_directory = await path.join(current_training_file.split('.')[0] + '_processed_data');
        return training_directory;
    },
);

export const current_analysis_file = derived(
    current_post_analysis_files_directory,
    async $current_post_analysis_files_directory => {
        return await path.join(await $current_post_analysis_files_directory, 'molecule_analysis_results.csv');
    },
);

export const post_analysis_files = localWritable('post_analysis_files', {
    size_distribution: '',
    structural_distribution: '',
    elemental_distribution: '',
});

export const atoms_bin_size = localWritable('atoms_bin_size', 10);
export const active_tab = localWritable<AnalysisItemsType>('training_file_plot_active_tab_item', 'size_distribution');

export const sizeDistributionFilter = writable<{
    min_atomic_number: {
        value: number;
        lock: boolean;
    };
    max_atomic_number: {
        value: number;
        lock: boolean;
    };
    count_threshold: {
        value: number;
        lock: boolean;
    };
}>({
    min_atomic_number: {
        value: 0,
        lock: true,
    },
    max_atomic_number: {
        value: 0,
        lock: true,
    },
    count_threshold: {
        value: 0,
        lock: true,
    },
});

export const structuralDistributionFilter = writable<{
    filter_structures: string[];
}>({
    filter_structures: [],
});

export const elementalDistributionFilter = writable<{
    filter_elements: string[];
    count_threshold: {
        value: number;
        lock: boolean;
    };
}>({
    filter_elements: [],
    count_threshold: {
        value: 0,
        lock: true,
    },
});
