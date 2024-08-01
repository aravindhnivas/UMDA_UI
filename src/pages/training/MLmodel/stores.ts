import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

export const model = localWritable('ml_model', 'ridge');

export const current_model = derived(model, $model => {
    return supervised_ml_models[$model] as CurrentModel;
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
    let values = {} as Record<string, string | boolean | number | null>;
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

export const hyperparameters = writable<{ [name: string]: Record<string, string | boolean | number | null> }>({});
export const parameters = writable<{ [name: string]: Record<string, string | boolean | number | null> }>({});
export const fine_tuned_hyperparameters = writable<{ [name: string]: Record<string, string> }>({});
export const fine_tune_model = writable(false);
export const logYscale = writable(false);
export const scaleYdata = writable(true);

export const cross_validation = localWritable('cross_validation', true);
export const cv_fold = localWritable('cv_fold', 5);
export const bootstrap_nsamples = localWritable('bootstrap_nsamples', 800);
export const bootstrap = localWritable('bootstrap', false);
export const test_size = localWritable('test_size', 20);
export const noise_scale = localWritable('noise_scale', 0.5);
export const save_pretrained_model = localWritable('save_pretrained_model', true);

export const pre_trained_file_loc = localWritable('pre_trained_file_loc', '');
export const pre_trained_filename = localWritable('pre_trained_filename', '');

export const results = writable<Results | null>(null);
export const plot_data = writable<Partial<Plotly.PlotData>[]>([]);
