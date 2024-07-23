export const training_file = localWritable<{
    filename: string;
    filetype: 'csv' | 'parquet' | 'json' | 'hdf5';
    key: string;
}>('training_file', {
    filename: '',
    filetype: 'csv',
    key: 'data',
});
export const training_column_name_X = writable<string>('SMILES');
export const training_column_name_y = writable<string>('');
