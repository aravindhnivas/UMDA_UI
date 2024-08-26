import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
export const model_names = Object.keys(supervised_ml_models) as MLModel[];
export const model = localWritable<MLModel>('ml_model', 'ridge');

export const current_model = derived(model, $model => {
    return supervised_ml_models[$model];
});

export const variable_type = derived(current_model, $current_model => {
    const hyperparameters = $current_model.hyperparameters;
    const parameters = $current_model.parameters;
    return Object.keys({ ...hyperparameters, ...parameters }).reduce(
        (acc, key) => {
            const type = hyperparameters[key]?.type || parameters[key]?.type;
            acc[key] = type;
            return acc;
        },
        {} as Record<string, string>,
    );
});

export const get_params_from_current_model = (key: 'hyperparameters' | 'parameters', data: CurrentModel) => {
    let values = {} as ParametersArgs[number];
    Object.keys(data[key]).forEach(label => {
        if (!data) return;
        const { value } = data[key][label];

        if (typeof value === 'object' && value) {
            values[label] = value.default;
        } else {
            values[label] = value;
        }
    });
    return values;
};

export const default_param_values = derived(current_model, $current_model => {
    const hyperparameters = get_params_from_current_model('hyperparameters', $current_model);
    const parameters = get_params_from_current_model('parameters', $current_model);
    return { hyperparameters, parameters };
});

export const hyperparameters = writable<ParametersArgs>({});
export const parameters = writable<ParametersArgs>({});
export const fine_tuned_hyperparameters = writable<{ [name: string]: Record<string, string> }>({});
export const fine_tune_model = writable(false);
export const logYscale = writable(false);
export const scaleYdata = writable(true);

export const cross_validation = localWritable('cross_validation', true);
export const cv_fold = localWritable('cv_fold', 5);
export const halving_factor = localWritable('halving_factor', 3);
export const randomzied_gridsearch_niter = localWritable<number>('randomzied_gridsearch_niter', 10);
export const bootstrap_nsamples = localWritable<number>('bootstrap_nsamples', 800);
export const bootstrap = localWritable('bootstrap', false);
export const test_size = localWritable('test_size', 20);
export const grid_search_method = localWritable('grid_search_method', 'RandomizedSearchCV');
export const noise_percentage = localWritable('noise_percentage', 0.5);
export const save_pretrained_model = localWritable('save_pretrained_model', true);
export const parallel_computation = localWritable('parallel_computation', true);
export const n_jobs = localWritable('n_jobs', -2);
export const backends: ParallelComputationBackend[] = ['loky', 'threading', 'multiprocessing', 'dask'];
// export const backends: ParallelComputationBackend[] = ['threading', 'dask'];
export const parallel_computation_backend = localWritable<ParallelComputationBackend>(
    'parallel_processing_backend',
    'threading',
);

export const pre_trained_file_loc = localWritable('pre_trained_file_loc', '');
export const pre_trained_filename = localWritable('pre_trained_filename', '');

export const results = writable<Record<MLModel[number], Results | null>>({});
export const plot_data = writable<Record<MLModel[number], Partial<Plotly.PlotData>[]>>({});
export const default_parameter_mode = localWritable('default_parameter_mode', true);
export const current_save_filekey = writable<string>('');

export const pre_trained_filename_unique = derived(
    [current_save_filekey, pre_trained_filename],
    ([$current_save_filekey, $pre_trained_filename]) => {
        return $pre_trained_filename.split('.pkl')[0] + `_${$current_save_filekey}_`;
    },
);
