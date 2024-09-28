import { current_post_analysis_files_directory } from '../stores';

export const ytransformation = writable<string>('None');

export const y_data_distribution_savefilename = writable<string>('y_data_distribution');
export const savefilename = derived(
    [ytransformation, y_data_distribution_savefilename],
    ([$ytransformation, $y_data_distribution_savefilename]) => {
        if ($ytransformation == 'None') return `${$y_data_distribution_savefilename}.json`;
        return `${$y_data_distribution_savefilename}_for_${$ytransformation}_transformation.json`;
    },
);

export const min_yvalue = writable<string>('');
export const max_yvalue = writable<string>('');

export const save_loc_for_ydistribution_data = derived(
    [current_post_analysis_files_directory, y_data_distribution_savefilename],
    async ([$current_post_analysis_files_directory, $y_data_distribution_savefilename]) => {
        const analysis_dir = await $current_post_analysis_files_directory;
        return await path.join(analysis_dir, $y_data_distribution_savefilename);
    },
);
