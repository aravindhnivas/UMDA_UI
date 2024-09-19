export const ytransformation = writable<string>('None');
const y_data_distribution_savefilename = 'y_data_distribution';
export const savefilename = derived(ytransformation, $ytransformation => {
    if ($ytransformation == 'None') return `${y_data_distribution_savefilename}.json`;
    return `${y_data_distribution_savefilename}_${$ytransformation}.json`;
});
export const min_yvalue = writable<string>('');
export const max_yvalue = writable<string>('');
