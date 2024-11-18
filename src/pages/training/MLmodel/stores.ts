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
        return optuna_file;
    },
);

export const estimator = writable({
    load: false,
    file: '',
});

export const cleanlab = writable<{ active: boolean; model: MLModel }>({
    active: false,
    model: 'xgboost',
});

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

export const get_default_param_values = (model: MLModel) => {
    const get_current_model = structuredClone(supervised_ml_models[model]);
    const hyperparameters = get_params_from_current_model('hyperparameters', get_current_model);
    const parameters = get_params_from_current_model('parameters', get_current_model);
    return { hyperparameters, parameters };
};

export const default_fine_tuned_values = writable<FineTunedValues>({} as FineTunedValues);
export const fine_tuned_values = writable<FineTunedValues>(structuredClone(default_values_for_models));

export const tune_parameters = writable({} as ModelTuneParameters);

export const fine_tune_model = writable(false);
export const ncols_ml_model_panel = localWritable('ncols_ml_model_panel', 3);

export const optuna_resume_study = writable({
    id: '',
    resume: false,
});

export const cross_validation = writable(true);
export const cv_fold = writable(5);
export const halving_factor = writable(3);
export const optuna_n_trials = writable(100);
export const optuna_n_warmup_steps = writable(10);
export const randomzied_gridsearch_niter = writable(10);
export const bootstrap_nsamples = writable(800);
export const bootstrap = writable(false);
export const test_size = writable(20);
export const grid_search_method = writable('Optuna');
export const noise_percentage = writable(0.5);
export const save_pretrained_model = writable(true);
export const parallel_computation = writable(true);
export const learning_curve = writable({
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
export const experiment_id = writable({} as Record<MLModel, string>);
export const default_parameter_mode = localWritable('default_parameter_mode', true);
export const skip_invalid_y_values = localWritable('skip_invalid_y_values', false);
export const analyse_shapley_values = localWritable('analyse_shapley_values', false);
export const seed = localWritable('seed', {
    lock: false,
    value: 42,
});
export const overwrite_model = localWritable('overwrite_model', false);
// export const pre_trained_filename = localWritable('pre_trained_filename', '');
export const pre_trained_filename = derived(
    [model, embedd_savefile, default_parameter_mode, fine_tune_model, grid_search_method, experiment_id, cleanlab],
    ([
        $model,
        $embedd_savefile,
        $default_parameter_mode,
        $fine_tune_model,
        $grid_search_method,
        $experiment_id,
        $cleanlab,
    ]) => {
        let name = `${$model}_${$embedd_savefile}_pretrained_model`;
        if ($default_parameter_mode) name += '_default';
        else if ($fine_tune_model) name += `_${$grid_search_method}`;
        else name += `_${$experiment_id[$model]}`;
        // const $cleanlab = get(cleanlab);
        if ($cleanlab.active) {
            name += `_cleaned_${$cleanlab.model}`;
        }
        return name;
    },
);

export const current_pretrained_dir = derived(
    [
        current_training_processed_data_directory,
        model,
        embedd_savefile,
        default_parameter_mode,
        fine_tune_model,
        grid_search_method,
        experiment_id,
        cleanlab,
    ],
    async ([
        $current_training_processed_data_directory,
        $model,
        $embedd_savefile,
        $default_parameter_mode,
        $fine_tune_model,
        $grid_search_method,
        $experiment_id,
        $cleanlab,
    ]) => {
        let dir = await path.join(
            await $current_training_processed_data_directory,
            'pretrained_models',
            $model,
            $embedd_savefile,
        );

        if ($default_parameter_mode) {
            dir = await path.join(dir, 'default');
        } else if ($fine_tune_model) {
            dir = await path.join(dir, $grid_search_method);
        } else {
            dir = await path.join(dir, $experiment_id[$model]);
        }
        // const $cleanlab = get(cleanlab);
        if ($cleanlab.active) {
            dir += `_cleaned_${$cleanlab.model}`;
        }
        return dir;
    },
);

export const current_pretrained_file = derived(
    [current_pretrained_dir, pre_trained_filename],
    async ([$current_pretrained_dir, $pre_trained_filename]) => {
        const dir = await $current_pretrained_dir;
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
