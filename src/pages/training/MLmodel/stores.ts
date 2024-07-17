import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, any>;
    parameters: Record<string, any>;
}

export const model = localWritable('ml_model', '');

export const current_model = derived(model, $model => {
    return supervised_ml_models[$model] as CurrentModel;
});

export const get_params_from_current_model = (key: 'hyperparameters' | 'parameters') => {
    const data: CurrentModel = get(current_model);

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

// export const hyperparameters_values = derived(current_model, $current_model => {
//     return get_params_from_current_model('hyperparameters', $current_model);
// });

// export const parameters_values = derived(current_model, $current_model => {
//     return get_params_from_current_model('parameters', $current_model);
// });
