import supervised_ml_models from '$lib/config/ml_model/ml_models_parameters';
import { training_save_directory, training_file } from '../training_file/stores';
import { current_training_processed_data_directory } from '../training_file/plot-analysis/stores';
import { embedd_savefile } from '../embedding/stores';

export const optuna_storage_file = derived(
    [training_save_directory, training_file],
    async ([$training_save_directory, $training_file]) => {
        if (!$training_file) return '';
        const basename = await path.basename($training_file.filename, `.${$training_file.filetype}`);
        const optuna_file = await path.join($training_save_directory, 'optuna', `optuna_${basename}.db`);
        // if (!(await fs.exists(optuna_file))) {
        //     const dir = await path.dirname(optuna_file);
        //     await fs.createDir(dir, { recursive: true });
        // }
        return optuna_file;
    },
);

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

    let obj: Record<string, string> = {};
    Object.keys({ ...hyperparameters, ...parameters }).forEach(key => {
        obj[key] = hyperparameters[key]?.type || parameters[key]?.type;
    });
    return obj;
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

export const default_fine_tuned_values = writable<FineTunedValues>({} as FineTunedValues);
export const fine_tuned_values = writable<FineTunedValues>(structuredClone(default_values_for_models));

// export const hyperparameters = writable<ParametersArgs>({});
// export const parameters = writable<ParametersArgs>({});
export const tune_parameters = writable({} as ModelTuneParameters);

export const fine_tune_model = writable(false);
export const ncols_ml_model_panel = localWritable('ncols_ml_model_panel', 3);

export const optuna_resume_study = writable({
    id: '',
    resume: false,
});

export const cross_validation = localWritable('cross_validation', true);
export const cv_fold = localWritable('cv_fold', 5);
export const halving_factor = localWritable('halving_factor', 3);
export const optuna_n_trials = localWritable('optuna_n_trials', 100);
export const optuna_n_warmup_steps = localWritable('optuna_n_warmup_steps', 10);
export const randomzied_gridsearch_niter = localWritable<number>('randomzied_gridsearch_niter', 10);
export const bootstrap_nsamples = localWritable<number>('bootstrap_nsamples', 800);
export const bootstrap = localWritable('bootstrap', false);
export const test_size = localWritable('test_size', 20);
export const grid_search_method = localWritable('grid_search_method', 'Optuna');
export const noise_percentage = localWritable('noise_percentage', 0.5);
export const save_pretrained_model = localWritable('save_pretrained_model', true);
export const parallel_computation = localWritable('parallel_computation', true);
export const learning_curve = localWritable('learning_curve', {
    active: false,
    train_sizes: '0.1, 1.0, 10',
});
export const ensemble_regressors = localWritable<{
    active: boolean;
    regressors: string[];
}>('ensemble_regressors', {
    active: false,
    regressors: [],
});
export const n_jobs = localWritable('n_jobs', -2);
export const backends: ParallelComputationBackend[] = ['loky', 'threading', 'multiprocessing', 'dask'];
export const parallel_computation_backend = localWritable<ParallelComputationBackend>(
    'parallel_processing_backend',
    'threading',
);
export const results = writable<Record<MLModel, MLResults>>({} as Record<MLModel, MLResults>);
export const plot_data = writable<Record<MLModel, Partial<Plotly.PlotData>[]>>(
    {} as Record<MLModel, Partial<Plotly.PlotData>[]>,
);

export const default_parameter_mode = localWritable('default_parameter_mode', true);
export const skip_invalid_y_values = localWritable('skip_invalid_y_values', false);
export const analyse_shapley_values = localWritable('analyse_shapley_values', false);
export const pre_trained_filename = localWritable('pre_trained_filename', '');
export const current_pretrained_file = derived(
    [current_training_processed_data_directory, pre_trained_filename, model, embedd_savefile],
    async ([$current_training_processed_data_directory, $pre_trained_filename, $model, $embedd_savefile]) => {
        const dir = await path.join(
            await $current_training_processed_data_directory,
            'pretrained_models',
            $model,
            $embedd_savefile,
        );
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
