import { current_post_analysis_files_directory } from '../stores';

export const ytransformation = writable<string>('None');
const y_data_distribution_savefilename = 'y_data_distribution';
export const savefilename = derived(ytransformation, $ytransformation => {
    if ($ytransformation == 'None') return `${y_data_distribution_savefilename}.json`;
    return `${y_data_distribution_savefilename}_for_${$ytransformation}_transformation.json`;
});
export const min_yvalue = writable<string>('');
export const max_yvalue = writable<string>('');
// const save_loc = await path.join(await $current_post_analysis_files_directory, 'y_data_distribution');
export const save_loc_for_ydistribution_data = derived(
    current_post_analysis_files_directory,
    async $current_post_analysis_files_directory => {
        const analysis_dir = await $current_post_analysis_files_directory;
        return await path.join(analysis_dir, 'y_data_distribution');
    },
);
