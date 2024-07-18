import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

type ParamValue = string | number | boolean | null | {[key: string]: string};
interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, {value: ParamValue, description: string}>;
    parameters: Record<string, {value: ParamValue, description: string}>;
}

export const model = localWritable('ml_model', 'ridge');
export const current_model = derived(model, $model => {
    return supervised_ml_models[$model] as CurrentModel;
});

export const model_name = derived(current_model, $current_model => {
    return $current_model.name;
});

export const model_description = derived(current_model, $current_model => {
    return $current_model.description;
});

export const get_params_from_current_model = (key: 'hyperparameters' | 'parameters', data: CurrentModel) => {
    // const data: CurrentModel = get(current_model);

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

export const original_model_parameters = derived(current_model, $current_model => {
    const hyperparameters = get_params_from_current_model('hyperparameters', $current_model);
    const parameters = get_params_from_current_model('parameters', $current_model);
    return { hyperparameters, parameters };
})

export const values_stored = localWritable<{
    [key: string]: {
        hyperparameters: Record<string, any>;
        parameters: Record<string, any>;
    };
}>('ml_model_values', {});
