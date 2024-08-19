import { training_file } from '../stores';

export const post_analysis_files_directory = derived(training_file, async $training_file => {
    const dir = await path.dirname($training_file.filename);
    const name = await path.basename($training_file.filename);
    const folder = await path.join(dir, name.split('.')[0] + '_analysis');
    return folder;
});

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
