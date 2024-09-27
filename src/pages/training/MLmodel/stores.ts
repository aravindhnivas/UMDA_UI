import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
import { current_training_processed_data_directory } from '../training_file/plot-analysis/stores';

export const model_names = Object.keys(supervised_ml_models) as MLModel[];
export const model = localWritable<MLModel>('ml_model', 'ridge');

if (!model_names.includes(get(model))) {
    model.set('ridge');
}
export const current_model = derived(model, $model => {
    return supervised_ml_models[$model];
});

export const locally_saved_dict_all_params_lock_status = localWritable<Record<string, boolean>>(
    'locally_saved_dict_all_params_lock_status',
    {},
);

const default_values_for_models = {
    linear_regression: { parameters: {}, hyperparameters: {} },
    ridge: { parameters: {}, hyperparameters: {} },
    svr: { parameters: {}, hyperparameters: {} },
    knn: { parameters: {}, hyperparameters: {} },
    rfr: { parameters: {}, hyperparameters: {} },
    gbr: { parameters: {}, hyperparameters: {} },
    gpr: { parameters: {}, hyperparameters: {} },
    xgboost: { parameters: {}, hyperparameters: {} },
    catboost: { parameters: {}, hyperparameters: {} },
    lgbm: { parameters: {}, hyperparameters: {} },
} as const;

export const all_params_lock_status = writable<MLParamsLockStatus>(structuredClone(default_values_for_models));
// export const finetune_params_lock_status = writable<MLParamsLockStatus>(structuredClone(default_values_for_models));

export const variable_type = derived(current_model, $current_model => {
    if (!$current_model) return {};
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
export const fine_tuned_values = writable<FineTunedValues>(structuredClone(default_values_for_models));

export const fine_tune_model = writable(false);

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
export const learning_curve = localWritable('learning_curve', {
    active: false,
    train_sizes: '0.1, 1.0, 10',
});
export const n_jobs = localWritable('n_jobs', -2);
export const backends: ParallelComputationBackend[] = ['loky', 'threading', 'multiprocessing', 'dask'];
export const parallel_computation_backend = localWritable<ParallelComputationBackend>(
    'parallel_processing_backend',
    'threading',
);
export const results = writable<Record<MLModel[number], Results | null>>({});
export const plot_data = writable<Record<MLModel[number], Partial<Plotly.PlotData>[]>>({});

export const default_parameter_mode = localWritable('default_parameter_mode', true);
export const skip_invalid_y_values = localWritable('skip_invalid_y_values', false);
export const pre_trained_filename = localWritable('pre_trained_filename', '');
export const current_pretrained_file = derived(
    [current_training_processed_data_directory, pre_trained_filename],
    async ([$current_training_processed_data_directory, $pre_trained_filename]) => {
        const dir = await path.join(await $current_training_processed_data_directory, 'pretrained_models');
        return await path.join(dir, $pre_trained_filename.trim());
    },
);
export const include_training_file_in_plot = localWritable('include_training_file_in_plot', true);

export const available_transformations = [
    'None',
    'log1p',
    'sqrt',
    'square',
    'exp',
    'reciprocal',
    'boxcox',
    'yeo_johnson',
];
export const available_scalers = [
    'None',
    'StandardScaler',
    'MinMaxScaler',
    'MaxAbsScaler',
    'RobustScaler',
    'QuantileTransformer',
    'PowerTransformer',
];
export const ytransformation = localWritable('ytransformation', 'None');
export const yscaling = localWritable('yscaling', 'StandardScaler');
export const inverse_transform = localWritable('inverse_transform', true);
export const inverse_scaling = localWritable('inverse_scaling', true);
