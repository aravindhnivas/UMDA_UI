<script lang="ts">
    import {
        current_model,
        default_fine_tuned_values,
        default_param_values,
        experiment_id,
        fine_tuned_values,
        model,
        tune_parameters,
    } from './stores';
    import { set_default_fine_tuned_values } from './utils';

    const set_fine_tuned_values = (key: 'hyperparameters' | 'parameters') => {
        const cloned_obj = structuredClone($current_model[key]);

        Object.keys(cloned_obj).forEach(label => {
            const obj = cloned_obj[label];
            let fine_tune_options = '';
            if (isObject(obj.value)) {
                let opts = Object.keys(obj.value.options);
                if (opts.includes('float')) {
                    opts = opts.filter(f => f !== 'float');
                }
                fine_tune_options = opts.join(', ');
            } else if (obj.value === null) {
                fine_tune_options = 'null';
            } else if (isBoolean(obj.value)) {
                fine_tune_options = 'true, false';
            } else {
                fine_tune_options = obj.value.toString();
            }
            fine_tune_options = fine_tune_options.trim();
            // remove trailing comma
            if (fine_tune_options.endsWith(',')) fine_tune_options = fine_tune_options.slice(0, -1);
            $fine_tuned_values[$model][key][label] = {
                value: fine_tune_options,
                active: false,
                type: obj.type,
                scale: obj.type === 'string' ? null : 'linear',
            };
        });
    };
    let model_params_updated = {} as Record<MLModel, boolean>;

    const set_model_params = (model_name: MLModel) => {
        if (!model_name) return;
        if (!$current_model) return;

        console.warn('set_model_params', model_name);
        $experiment_id[$model] ??= 'normal';

        $tune_parameters[model_name] ??= structuredClone($default_param_values);
        $default_fine_tuned_values[model_name] ??= { hyperparameters: {}, parameters: {} };

        if (isEmpty($default_fine_tuned_values[model_name]?.hyperparameters || {})) {
            Object.keys($current_model.optuna_grid).forEach(okey => {
                const { type, low, high, step, options, log } = $current_model.optuna_grid[okey];

                let value: string;
                let scale: 'log' | 'linear' = 'linear';
                // console.warn('log', log);
                if (log) scale = 'log';

                if (type === 'string' && options) value = options?.join(', ');
                else if (type === 'bool') value = 'true, false';
                else {
                    value = `${low}, ${high}`;
                    if (step) value += `, ${step}`;
                }

                const hparams_keys = Object.keys($current_model.hyperparameters);
                const params_keys = Object.keys($current_model.parameters);
                if (hparams_keys.includes(okey)) {
                    $default_fine_tuned_values[model_name].hyperparameters[okey] = {
                        value,
                        type,
                        scale,
                        active: false,
                    };
                } else if (params_keys.includes(okey)) {
                    $default_fine_tuned_values[model_name].parameters[okey] = { value, type, scale, active: false };
                }
            });
        }

        $fine_tuned_values[model_name] ??= { hyperparameters: {}, parameters: {} };
        if (isEmpty($fine_tuned_values[model_name].hyperparameters)) {
            set_fine_tuned_values('hyperparameters');
            set_default_fine_tuned_values('hyperparameters');
        }
        if (isEmpty($fine_tuned_values[model_name].parameters)) {
            set_fine_tuned_values('parameters');
            set_default_fine_tuned_values('parameters');
        }
        model_params_updated[model_name] = true;
    };

    $: !model_params_updated?.[$model] && set_model_params($model);
</script>
