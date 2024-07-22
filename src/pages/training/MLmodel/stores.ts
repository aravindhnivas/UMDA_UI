import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

type ParamValue = string | number | boolean | null | { [key: string]: string };

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, { value: ParamValue; description: string }>;
    parameters: Record<string, { value: ParamValue; description: string }>;
}

export const model = localWritable('ml_model', 'ridge');

export const current_model = derived(model, $model => {
    return supervised_ml_models[$model] as CurrentModel;
});

export const get_params_from_current_model = (key: 'hyperparameters' | 'parameters', data: CurrentModel) => {
    let values = {} as Record<string, any>;
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

export const hyperparameters = writable<{ [name: string]: Record<string, any> }>({});
export const parameters = writable<{ [name: string]: Record<string, any> }>({});
export const fine_tuned_hyperparameters = writable<{ [name: string]: Record<string, any> }>({});
export const fine_tune_model = writable(false);
