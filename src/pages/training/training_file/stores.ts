export const training_file = localWritable<{
    filename: string;
    filetype: 'csv' | 'parquet' | 'json' | 'hdf5';
    key: string;
}>('training_file', {
    filename: '',
    filetype: 'csv',
    key: 'data',
});
export const training_state_loaded = writable<boolean>(false);
export const loaded_df_columns = writable<string[]>([]);
export const training_save_directory = derived([training_file], ([$training_file]) => {
    return $training_file.filename.split('.')[0] + '_processed_data';
});

export const training_column_name_index = writable<string>('INDEX');
export const index_column_valid = writable<boolean>(false);

export const training_column_name_X = writable<string>('SMILES');
export const training_column_name_y = writable<string>('');

export const load_analysis_dir = derived([training_save_directory], async ([$training_save_directory]) => {
    const analysis_dir = await path.join($training_save_directory, 'analysis_data');
    return analysis_dir;
});
