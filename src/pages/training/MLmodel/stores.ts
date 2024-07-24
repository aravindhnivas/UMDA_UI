import supervised_ml_models from '$lib/config/supervised_ml_models.yml';

type ParamValue = string | number | boolean | null | { [key: string]: string };

interface CurrentModel {
    name: string;
    description: string;
    hyperparameters: Record<string, { value: ParamValue; description: string; fine_tune: string; type: string }>;
    parameters: Record<string, { value: ParamValue; description: string; type: string }>;
}

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
    const hyperparameters = get_params_from_current_model(
        'hyperparameters',
        $current_model,
    ) as CurrentModel['hyperparameters'];
    const parameters = get_params_from_current_model('parameters', $current_model) as CurrentModel['parameters'];
    return { hyperparameters, parameters };
});

export const hyperparameters = writable<{ [name: string]: CurrentModel['hyperparameters'] }>({});
export const parameters = writable<{ [name: string]: CurrentModel['parameters'] }>({});
export const fine_tuned_hyperparameters = writable<{ [name: string]: Record<string, string> }>({});
export const fine_tune_model = writable(false);
