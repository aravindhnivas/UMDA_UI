import { molecule_analysis_filename } from '../stores';

export const filtered_dir = writable('default');

export const original_post_analysis_files_directory = derived(
    molecule_analysis_filename,
    async $molecule_analysis_filename => {
        const dir = await path.dirname($molecule_analysis_filename);
        return dir;
    },
);

export const current_post_analysis_files_directory = derived(
    [molecule_analysis_filename, filtered_dir],
    async ([$molecule_analysis_filename, $filtered_dir]) => {
        if ($filtered_dir === 'default') {
            const dir = await path.dirname($molecule_analysis_filename);
            return dir;
        }
        const original_analysis_dir = await path.dirname($molecule_analysis_filename);
        const original_analysis_dirname = await path.basename(original_analysis_dir);
        const dir = await path.join(
            original_analysis_dir,
            'filtered',
            $filtered_dir,
            original_analysis_dirname.replace('_analysis', `_${$filtered_dir.toLocaleLowerCase()}_filtered_analysis`),
        );
        return dir;
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
