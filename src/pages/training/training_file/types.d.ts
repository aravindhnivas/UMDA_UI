interface LoadedTrainingState {
    training_file: {
        filename: string;
        filetype: string;
        key: string;
    };
    training_column_name_X: string;
    training_column_name_y: string;
    training_column_name_index: string;
    index_column_valid: boolean;
    training_save_directory: string;
    loaded_df_columns: string[];
    auto_fetch_columns: boolean;
    use_filtered_data_for_training: boolean;
    filtered_dir: string;
}
