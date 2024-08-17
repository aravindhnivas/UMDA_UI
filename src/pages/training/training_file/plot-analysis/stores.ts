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
