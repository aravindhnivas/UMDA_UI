export const training_file = localWritable<{
    filename: string;
    filetype: 'csv' | 'parquet' | 'json' | 'hdf5';
    key: string;
}>('training_file', {
    filename: '',
    filetype: 'csv',
    key: 'data',
});
export const training_column_name_index = writable<string>('INDEX');
export const index_column_valid = writable<boolean>(false);
export const training_column_name_X = writable<string>('SMILES');
export const training_column_name_y = writable<string>('');

export const load_analysis_dir = derived([training_file], async ([$training_file]) => {
    const filedir = await path.dirname($training_file.filename);
    const filename = await path.basename($training_file.filename);
    const analysis_dir = await path.join(filedir, filename.replace('.csv', '') + '_analysis');
    return analysis_dir;
});

export const molecule_analysis_file = derived([load_analysis_dir], async ([$load_analysis_dir]) => {
    const analysis_file = await path.join(await $load_analysis_dir, 'molecule_analysis_results.csv');
    return analysis_file;
});
