import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

export const model = localWritable('ml_model', '');

export const current_model = derived(model, $model => {
    return supervised_ml_models[$model] as {
        name: string;
        description: string;
        hyperparameters: Record<string, any>;
        parameters: Record<string, any>;
    };
});

export const get_params_from_current_model = (key: 'hyperparameters' | 'parameters') => {
    const data = get(current_model);
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
